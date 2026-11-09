import {
  User,
  Institution,
  Department,
  StudentProfile,
  FacultyProfile,
  Announcement,
  Event,
  Complaint,
  Approval,
  AuditLog,
  Message,
} from '../models/index.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;

    const [
      totalStudents,
      totalFaculty,
      totalDepartments,
      activeAnnouncements,
      upcomingEvents,
      pendingApprovals,
      complaints,
    ] = await Promise.all([
      User.countDocuments({ institution: institutionId, role: 'student' }),
      User.countDocuments({ institution: institutionId, role: 'faculty' }),
      Department.countDocuments({ institution: institutionId }),
      Announcement.countDocuments({ institution: institutionId }),
      Event.countDocuments({ institution: institutionId, startDate: { $gte: new Date() } }),
      Approval.countDocuments({ institution: institutionId, status: 'Pending' }),
      Complaint.find({ institution: institutionId }),
    ]);

    const complaintSummary = {
      total: complaints.length,
      pending: complaints.filter((c) => c.status === 'Pending').length,
      inProgress: complaints.filter((c) => c.status === 'In Progress').length,
      resolved: complaints.filter((c) => c.status === 'Resolved').length,
    };

    const recentAnnouncements = await Announcement.find({ institution: institutionId })
      .populate('author', 'name role')
      .populate('targetDepartment', 'name code')
      .sort({ createdAt: -1 })
      .limit(5);

    const nextEvents = await Event.find({ institution: institutionId })
      .sort({ startDate: 1 })
      .limit(5);

    // Department breakdown
    const departments = await Department.find({ institution: institutionId });
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const studentCount = await StudentProfile.countDocuments({
          institution: institutionId,
          department: dept._id,
        });
        const facultyCount = await FacultyProfile.countDocuments({
          institution: institutionId,
          department: dept._id,
        });
        return {
          _id: dept._id,
          name: dept.name,
          code: dept.code,
          hodName: dept.hodName,
          students: studentCount,
          faculty: facultyCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          totalStudents,
          totalFaculty,
          totalDepartments,
          activeAnnouncements,
          upcomingEvents,
          pendingApprovals,
          complaintSummary,
        },
        departmentStats,
        recentAnnouncements,
        nextEvents,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudents = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const { search = '', department = '', semester = '' } = req.query;

    const query = { institution: institutionId };
    if (department) query.department = department;
    if (semester) query.semester = Number(semester);

    const profiles = await StudentProfile.find(query)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code')
      .sort({ createdAt: -1 });

    const filtered = profiles.filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.user?.name?.toLowerCase().includes(s) ||
        p.user?.email?.toLowerCase().includes(s) ||
        p.rollNumber?.toLowerCase().includes(s)
      );
    });

    return res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyList = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const { search = '', department = '' } = req.query;

    const query = { institution: institutionId };
    if (department) query.department = department;

    const profiles = await FacultyProfile.find(query)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code')
      .populate('assignedSubjects', 'name code')
      .sort({ createdAt: -1 });

    const filtered = profiles.filter((p) => {
      if (!search) return true;
      const s = search.toLowerCase();
      return (
        p.user?.name?.toLowerCase().includes(s) ||
        p.user?.email?.toLowerCase().includes(s) ||
        p.employeeId?.toLowerCase().includes(s) ||
        p.designation?.toLowerCase().includes(s)
      );
    });

    return res.status(200).json({
      success: true,
      data: filtered,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await User.findOne({ _id: userId, institution: req.user.institution });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found in this institution.' });
    }

    user.isActive = !user.isActive;
    await user.save();

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: user.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED',
      targetResource: 'User',
      targetId: user._id.toString(),
      details: { email: user.email, role: user.role, isActive: user.isActive },
    });

    return res.status(200).json({
      success: true,
      message: `User '${user.name}' has been ${user.isActive ? 'activated' : 'deactivated'}.`,
      data: { isActive: user.isActive },
    });
  } catch (error) {
    next(error);
  }
};

export const getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find({ institution: req.user.institution })
      .populate('hodUser', 'name email avatar isHod')
      .sort({ name: 1 });
    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const assignHod = async (req, res, next) => {
  try {
    const { departmentId, facultyUserId } = req.body;
    const institutionId = req.user.institution;

    if (!departmentId || !facultyUserId) {
      return res.status(400).json({ success: false, message: 'Department ID and Faculty User ID are required.' });
    }

    const department = await Department.findOne({ _id: departmentId, institution: institutionId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found in your institution.' });
    }

    const facultyUser = await User.findOne({ _id: facultyUserId, institution: institutionId, role: 'faculty' });
    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    // Unassign previous HOD for this department (if any)
    if (department.hodUser) {
      await User.findByIdAndUpdate(department.hodUser, { isHod: false });
      await FacultyProfile.findOneAndUpdate({ user: department.hodUser }, { isHod: false });
    }

    // Assign new HOD
    department.hodUser = facultyUser._id;
    department.hodName = facultyUser.name;
    await department.save();

    facultyUser.isHod = true;
    await facultyUser.save();

    await FacultyProfile.findOneAndUpdate(
      { user: facultyUser._id },
      { isHod: true, department: departmentId }
    );

    await AuditLog.create({
      institution: institutionId,
      performedBy: req.user._id,
      action: 'HOD_ASSIGNED',
      targetResource: 'Department',
      targetId: department._id.toString(),
      details: { departmentName: department.name, hodName: facultyUser.name, hodEmail: facultyUser.email },
    });

    const updatedDepartment = await Department.findById(department._id).populate('hodUser', 'name email avatar isHod');

    return res.status(200).json({
      success: true,
      message: `'${facultyUser.name}' has been successfully assigned as the HOD for ${department.name}.`,
      data: updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, code, hodName, description, facultyUserId } = req.body;
    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Department name and code are required.' });
    }

    const codeUpper = code.toUpperCase().trim();
    const existing = await Department.findOne({
      institution: req.user.institution,
      code: codeUpper,
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `Department with code '${codeUpper}' already exists.`,
      });
    }

    let assignedFacultyUser = null;
    if (facultyUserId) {
      assignedFacultyUser = await User.findOne({
        _id: facultyUserId,
        institution: req.user.institution,
        role: 'faculty',
      });
    }

    const dept = await Department.create({
      institution: req.user.institution,
      name: name.trim(),
      code: codeUpper,
      hodName: assignedFacultyUser ? assignedFacultyUser.name : (hodName || ''),
      hodUser: assignedFacultyUser ? assignedFacultyUser._id : null,
      description: description || '',
    });

    if (assignedFacultyUser) {
      assignedFacultyUser.isHod = true;
      await assignedFacultyUser.save();
      await FacultyProfile.findOneAndUpdate(
        { user: assignedFacultyUser._id },
        { isHod: true, department: dept._id }
      );
    }

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'DEPARTMENT_CREATED',
      targetResource: 'Department',
      targetId: dept._id.toString(),
      details: { name: dept.name, code: dept.code, hodName: dept.hodName },
    });

    const populatedDept = await Department.findById(dept._id).populate('hodUser', 'name email avatar isHod');

    return res.status(201).json({ success: true, message: 'Department created successfully.', data: populatedDept });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code, description, facultyUserId } = req.body;
    const institutionId = req.user.institution;

    const department = await Department.findOne({ _id: id, institution: institutionId });
    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found in your institution.' });
    }

    // Check code uniqueness if code is changed
    if (code && code.toUpperCase().trim() !== department.code) {
      const codeUpper = code.toUpperCase().trim();
      const existing = await Department.findOne({
        institution: institutionId,
        code: codeUpper,
        _id: { $ne: department._id },
      });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: `Department with code '${codeUpper}' already exists.`,
        });
      }
      department.code = codeUpper;
    }

    if (name) {
      department.name = name.trim();
    }

    if (description !== undefined) {
      department.description = description.trim();
    }

    // Handle HOD assignment / update if facultyUserId is provided in the request
    if (facultyUserId !== undefined) {
      if (!facultyUserId || facultyUserId === '') {
        // Unassign existing HOD if any
        if (department.hodUser) {
          await User.findByIdAndUpdate(department.hodUser, { isHod: false });
          await FacultyProfile.findOneAndUpdate({ user: department.hodUser }, { isHod: false });
          department.hodUser = null;
          department.hodName = '';
        }
      } else {
        const facultyUser = await User.findOne({
          _id: facultyUserId,
          institution: institutionId,
          role: 'faculty',
        });
        if (!facultyUser) {
          return res.status(404).json({ success: false, message: 'Selected faculty member not found.' });
        }

        // If different from previous HOD, unassign previous HOD
        if (department.hodUser && department.hodUser.toString() !== facultyUser._id.toString()) {
          await User.findByIdAndUpdate(department.hodUser, { isHod: false });
          await FacultyProfile.findOneAndUpdate({ user: department.hodUser }, { isHod: false });
        }

        department.hodUser = facultyUser._id;
        department.hodName = facultyUser.name;

        facultyUser.isHod = true;
        await facultyUser.save();

        await FacultyProfile.findOneAndUpdate(
          { user: facultyUser._id },
          { isHod: true, department: department._id }
        );

        await AuditLog.create({
          institution: institutionId,
          performedBy: req.user._id,
          action: 'HOD_ASSIGNED',
          targetResource: 'Department',
          targetId: department._id.toString(),
          details: { departmentName: department.name, hodName: facultyUser.name, hodEmail: facultyUser.email },
        });
      }
    }

    await department.save();

    await AuditLog.create({
      institution: institutionId,
      performedBy: req.user._id,
      action: 'DEPARTMENT_UPDATED',
      targetResource: 'Department',
      targetId: department._id.toString(),
      details: { name: department.name, code: department.code, hodName: department.hodName },
    });

    const updatedDepartment = await Department.findById(department._id).populate('hodUser', 'name email avatar isHod');

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully.',
      data: updatedDepartment,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const institutionId = req.user.institution;

    const dept = await Department.findOne({ _id: id, institution: institutionId });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found in your institution.' });
    }

    // Check if any students or faculty are affiliated with this department
    const studentCount = await StudentProfile.countDocuments({ department: dept._id });
    const facultyCount = await FacultyProfile.countDocuments({ department: dept._id });

    if (studentCount > 0 || facultyCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department '${dept.name}'. It is currently assigned to ${studentCount} student(s) and ${facultyCount} faculty member(s). Reassign them first.`,
      });
    }

    // If HOD was assigned, unset isHod flag
    if (dept.hodUser) {
      await User.findByIdAndUpdate(dept.hodUser, { isHod: false });
      await FacultyProfile.findOneAndUpdate({ user: dept.hodUser }, { isHod: false });
    }

    await Department.findByIdAndDelete(dept._id);

    await AuditLog.create({
      institution: institutionId,
      performedBy: req.user._id,
      action: 'DEPARTMENT_DELETED',
      targetResource: 'Department',
      targetId: dept._id.toString(),
      details: { departmentName: dept.name, departmentCode: dept.code },
    });

    return res.status(200).json({
      success: true,
      message: `Department '${dept.name}' deleted successfully.`,
    });
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, priority = 'Medium', targetAudience = ['all'], targetDepartment, isPinned } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required.' });
    }

    const announcement = await Announcement.create({
      institution: req.user.institution,
      author: req.user._id,
      title,
      content,
      priority,
      targetAudience,
      targetDepartment: targetDepartment || null,
      isPinned: !!isPinned,
    });

    return res.status(201).json({
      success: true,
      message: 'Announcement published successfully.',
      data: announcement,
    });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const { title, description, category, startDate, endDate, venue, targetAudience, registrationLink } = req.body;

    if (!title || !startDate || !endDate || !venue) {
      return res.status(400).json({ success: false, message: 'Title, start/end dates, and venue are required.' });
    }

    const event = await Event.create({
      institution: req.user.institution,
      organizer: req.user._id,
      title,
      description: description || '',
      category: category || 'Academic',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      venue,
      targetAudience: targetAudience || ['all'],
      registrationLink: registrationLink || '',
    });

    return res.status(201).json({ success: true, message: 'Event scheduled successfully.', data: event });
  } catch (error) {
    next(error);
  }
};

export const getComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ institution: req.user.institution })
      .populate('submittedBy', 'name email role avatar')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const updateComplaintStatus = async (req, res, next) => {
  try {
    const { complaintId } = req.params;
    const { status, resolutionNotes, assignedTo } = req.body;

    const complaint = await Complaint.findOne({ _id: complaintId, institution: req.user.institution });
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found.' });
    }

    if (status) complaint.status = status;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    if (assignedTo) complaint.assignedTo = assignedTo;
    if (status === 'Resolved') complaint.resolvedAt = new Date();

    await complaint.save();

    return res.status(200).json({ success: true, message: 'Complaint updated.', data: complaint });
  } catch (error) {
    next(error);
  }
};

export const getApprovals = async (req, res, next) => {
  try {
    const approvals = await Approval.find({ institution: req.user.institution })
      .populate('requestedBy', 'name email role')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    next(error);
  }
};

export const reviewApproval = async (req, res, next) => {
  try {
    const { approvalId } = req.params;
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: "Status must be 'Approved' or 'Rejected'." });
    }

    const approval = await Approval.findOne({ _id: approvalId, institution: req.user.institution });
    if (!approval) {
      return res.status(404).json({ success: false, message: 'Approval request not found.' });
    }

    approval.status = status;
    approval.remarks = remarks || '';
    approval.reviewedBy = req.user._id;
    approval.reviewedAt = new Date();
    await approval.save();

    return res.status(200).json({ success: true, message: `Request has been ${status.toLowerCase()}.`, data: approval });
  } catch (error) {
    next(error);
  }
};

export const getCommunicationAnalytics = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const announcementsCount = await Announcement.countDocuments({ institution: institutionId });
    const eventsCount = await Event.countDocuments({ institution: institutionId });
    const complaintsCount = await Complaint.countDocuments({ institution: institutionId });
    const auditCount = await AuditLog.countDocuments({ institution: institutionId });

    return res.status(200).json({
      success: true,
      data: {
        announcementsCount,
        eventsCount,
        complaintsCount,
        auditCount,
        chartData: [
          { month: 'Jan', announcements: 8, events: 3, complaints: 4 },
          { month: 'Feb', announcements: 12, events: 5, complaints: 7 },
          { month: 'Mar', announcements: 15, events: 6, complaints: 3 },
          { month: 'Apr', announcements: 10, events: 4, complaints: 2 },
          { month: 'May', announcements: 18, events: 8, complaints: 5 },
          { month: 'Jun', announcements: 14, events: 6, complaints: 3 },
        ],
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// STUDENT CRUD CONTROLLERS
// ==========================================

export const createStudent = async (req, res, next) => {
  try {
    const {
      name,
      email,
      temporaryPassword = 'Student@123',
      departmentId,
      rollNumber,
      course,
      semester,
      graduationYear,
      cgpa,
    } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and department are required.',
      });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account with email '${emailTrimmed}' already exists.`,
      });
    }

    const finalRollNumber = (rollNumber || `MCA-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim();
    const existingRoll = await StudentProfile.findOne({
      institution: req.user.institution,
      rollNumber: finalRollNumber,
    });
    if (existingRoll) {
      return res.status(409).json({
        success: false,
        message: `A student with roll number '${finalRollNumber}' already exists in your institution.`,
      });
    }

    const passwordHash = await User.hashPassword(temporaryPassword);
    const newUser = await User.create({
      name: name.trim(),
      email: emailTrimmed,
      passwordHash,
      role: 'student',
      institution: req.user.institution,
      isActive: true,
    });

    const profile = await StudentProfile.create({
      user: newUser._id,
      institution: req.user.institution,
      rollNumber: finalRollNumber,
      department: departmentId,
      course: course || 'Master of Computer Applications (MCA)',
      semester: semester ? Number(semester) : 4,
      graduationYear: graduationYear ? Number(graduationYear) : 2026,
      cgpa: cgpa !== undefined && cgpa !== '' ? Number(cgpa) : 0,
      isPublicForRecruitment: true,
    });

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'PROVISION_STUDENT',
      targetResource: 'StudentProfile',
      targetId: newUser._id.toString(),
      details: { email: emailTrimmed, name: newUser.name, rollNumber: finalRollNumber },
    });

    const populatedProfile = await StudentProfile.findById(profile._id)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Student provisioned successfully.',
      data: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      departmentId,
      rollNumber,
      course,
      semester,
      graduationYear,
      cgpa,
      isActive,
    } = req.body;

    const profile = await StudentProfile.findOne({
      $or: [{ _id: id }, { user: id }],
      institution: req.user.institution,
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found in your institution.' });
    }

    const user = await User.findById(profile.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated user account not found.' });
    }

    // Update email if provided and changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailLower = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: emailLower,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `The email '${emailLower}' is already registered to another account.`,
        });
      }
      user.email = emailLower;
    }

    // Update password if provided
    let passwordUpdated = false;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }
      user.passwordHash = await User.hashPassword(password);
      passwordUpdated = true;
    }

    if (name) user.name = name.trim();
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    await user.save();

    // Update roll number if provided and changed
    if (rollNumber) {
      const formattedRoll = rollNumber.toUpperCase().trim();
      if (formattedRoll !== profile.rollNumber) {
        const existingRoll = await StudentProfile.findOne({
          institution: req.user.institution,
          rollNumber: formattedRoll,
          _id: { $ne: profile._id },
        });
        if (existingRoll) {
          return res.status(409).json({
            success: false,
            message: `Roll number '${formattedRoll}' is already assigned to another student in your institution.`,
          });
        }
        profile.rollNumber = formattedRoll;
      }
    }

    if (departmentId) profile.department = departmentId;
    if (course !== undefined) profile.course = course;
    if (semester !== undefined && semester !== '') profile.semester = Number(semester);
    if (graduationYear !== undefined && graduationYear !== '') profile.graduationYear = Number(graduationYear);
    if (cgpa !== undefined && cgpa !== '') profile.cgpa = Number(cgpa);

    await profile.save();

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'STUDENT_UPDATED',
      targetResource: 'StudentProfile',
      targetId: profile._id.toString(),
      details: {
        name: user.name,
        email: user.email,
        passwordUpdated,
        rollNumber: profile.rollNumber,
      },
    });

    const updatedProfile = await StudentProfile.findById(profile._id)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code');

    return res.status(200).json({
      success: true,
      message: `Student '${user.name}' updated successfully.${passwordUpdated ? ' Password has also been updated.' : ''}`,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await StudentProfile.findOne({
      $or: [{ _id: id }, { user: id }],
      institution: req.user.institution,
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Student profile not found in your institution.' });
    }

    const user = await User.findById(profile.user);
    const studentName = user ? user.name : 'Student';
    const studentEmail = user ? user.email : '';
    const userId = profile.user;

    await StudentProfile.findByIdAndDelete(profile._id);
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'STUDENT_DELETED',
      targetResource: 'StudentProfile',
      targetId: profile._id.toString(),
      details: {
        name: studentName,
        email: studentEmail,
        rollNumber: profile.rollNumber,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Student '${studentName}' (${profile.rollNumber}) has been permanently removed.`,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// FACULTY CRUD CONTROLLERS
// ==========================================

export const createFaculty = async (req, res, next) => {
  try {
    const {
      name,
      email,
      temporaryPassword = 'Faculty@123',
      departmentId,
      employeeId,
      designation,
      qualification,
      experienceYears,
    } = req.body;

    if (!name || !email || !departmentId) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and department are required.',
      });
    }

    const emailTrimmed = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: emailTrimmed });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: `An account with email '${emailTrimmed}' already exists.`,
      });
    }

    const finalEmployeeId = (employeeId || `FAC-${Math.floor(100 + Math.random() * 900)}`).toUpperCase().trim();
    const existingEmp = await FacultyProfile.findOne({
      institution: req.user.institution,
      employeeId: finalEmployeeId,
    });
    if (existingEmp) {
      return res.status(409).json({
        success: false,
        message: `A faculty member with employee ID '${finalEmployeeId}' already exists in your institution.`,
      });
    }

    const passwordHash = await User.hashPassword(temporaryPassword);
    const newUser = await User.create({
      name: name.trim(),
      email: emailTrimmed,
      passwordHash,
      role: 'faculty',
      institution: req.user.institution,
      isActive: true,
    });

    const profile = await FacultyProfile.create({
      user: newUser._id,
      institution: req.user.institution,
      employeeId: finalEmployeeId,
      department: departmentId,
      designation: designation || 'Assistant Professor',
      qualification: qualification || 'M.Tech / Ph.D.',
      experienceYears: experienceYears !== undefined && experienceYears !== '' ? Number(experienceYears) : 0,
    });

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'PROVISION_FACULTY',
      targetResource: 'FacultyProfile',
      targetId: newUser._id.toString(),
      details: { email: emailTrimmed, name: newUser.name, employeeId: finalEmployeeId },
    });

    const populatedProfile = await FacultyProfile.findById(profile._id)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code');

    return res.status(201).json({
      success: true,
      message: 'Faculty member provisioned successfully.',
      data: populatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      password,
      departmentId,
      employeeId,
      designation,
      qualification,
      experienceYears,
      isActive,
    } = req.body;

    const profile = await FacultyProfile.findOne({
      $or: [{ _id: id }, { user: id }],
      institution: req.user.institution,
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found in your institution.' });
    }

    const user = await User.findById(profile.user);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Associated user account not found.' });
    }

    // Update email if provided and changed
    if (email && email.toLowerCase().trim() !== user.email) {
      const emailLower = email.toLowerCase().trim();
      const existingUser = await User.findOne({
        email: emailLower,
        _id: { $ne: user._id },
      });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: `The email '${emailLower}' is already registered to another account.`,
        });
      }
      user.email = emailLower;
    }

    // Update password if provided
    let passwordUpdated = false;
    if (password && password.trim() !== '') {
      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'Password must be at least 6 characters long.',
        });
      }
      user.passwordHash = await User.hashPassword(password);
      passwordUpdated = true;
    }

    if (name) user.name = name.trim();
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    await user.save();

    // Update employeeId if provided and changed
    if (employeeId) {
      const formattedEmp = employeeId.toUpperCase().trim();
      if (formattedEmp !== profile.employeeId) {
        const existingEmp = await FacultyProfile.findOne({
          institution: req.user.institution,
          employeeId: formattedEmp,
          _id: { $ne: profile._id },
        });
        if (existingEmp) {
          return res.status(409).json({
            success: false,
            message: `Employee ID '${formattedEmp}' is already assigned to another faculty member.`,
          });
        }
        profile.employeeId = formattedEmp;
      }
    }

    if (departmentId) profile.department = departmentId;
    if (designation !== undefined) profile.designation = designation;
    if (qualification !== undefined) profile.qualification = qualification;
    if (experienceYears !== undefined && experienceYears !== '') profile.experienceYears = Number(experienceYears);

    await profile.save();

    // Update Department.hodName if this faculty is currently assigned as HOD
    if (name) {
      await Department.updateMany(
        { hodUser: user._id, institution: req.user.institution },
        { hodName: user.name }
      );
    }

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'FACULTY_UPDATED',
      targetResource: 'FacultyProfile',
      targetId: profile._id.toString(),
      details: {
        name: user.name,
        email: user.email,
        passwordUpdated,
        employeeId: profile.employeeId,
      },
    });

    const updatedProfile = await FacultyProfile.findById(profile._id)
      .populate('user', 'name email avatar isActive lastLogin')
      .populate('department', 'name code');

    return res.status(200).json({
      success: true,
      message: `Faculty member '${user.name}' updated successfully.${passwordUpdated ? ' Password has also been updated.' : ''}`,
      data: updatedProfile,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteFaculty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const profile = await FacultyProfile.findOne({
      $or: [{ _id: id }, { user: id }],
      institution: req.user.institution,
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Faculty profile not found in your institution.' });
    }

    const user = await User.findById(profile.user);
    const facultyName = user ? user.name : 'Faculty';
    const facultyEmail = user ? user.email : '';
    const userId = profile.user;

    // If faculty is currently HOD for any department, unset HOD assignment
    if (userId) {
      await Department.updateMany(
        { hodUser: userId, institution: req.user.institution },
        { hodUser: null, hodName: '' }
      );
    }

    await FacultyProfile.findByIdAndDelete(profile._id);
    if (userId) {
      await User.findByIdAndDelete(userId);
    }

    await AuditLog.create({
      institution: req.user.institution,
      performedBy: req.user._id,
      action: 'FACULTY_DELETED',
      targetResource: 'FacultyProfile',
      targetId: profile._id.toString(),
      details: {
        name: facultyName,
        email: facultyEmail,
        employeeId: profile.employeeId,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Faculty member '${facultyName}' (${profile.employeeId}) has been permanently removed.`,
    });
  } catch (error) {
    next(error);
  }
};

