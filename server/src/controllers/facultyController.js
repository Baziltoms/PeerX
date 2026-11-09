import {
  Timetable,
  AttendanceSession,
  Attendance,
  ClassSection,
  Subject,
  StudyMaterial,
  Assignment,
  Submission,
  Exam,
  Mark,
  StudentProfile,
  User,
  Department,
  FacultyProfile,
} from '../models/index.js';
import { verifyAndSubmitAttendance } from '../services/attendanceService.js';

export const getDashboard = async (req, res, next) => {
  try {
    const facultyId = req.user._id;
    const institutionId = req.user.institution;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const todayClasses = await Timetable.find({
      institution: institutionId,
      faculty: facultyId,
      dayOfWeek: today,
    })
      .populate('subject', 'name code')
      .populate('classSection', 'name semester')
      .sort({ periodNumber: 1 });

    const totalMaterials = await StudyMaterial.countDocuments({ faculty: facultyId });
    const totalAssignments = await Assignment.countDocuments({ faculty: facultyId });

    // Check today's marked sessions
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const markedToday = await AttendanceSession.find({
      faculty: facultyId,
      date: startOfDay,
    });

    const pendingAttendanceCount = Math.max(0, todayClasses.length - markedToday.length);

    return res.status(200).json({
      success: true,
      data: {
        todayClasses,
        stats: {
          classesToday: todayClasses.length,
          pendingAttendance: pendingAttendanceCount,
          totalMaterials,
          totalAssignments,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getTodaySchedule = async (req, res, next) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];

    const schedule = await Timetable.find({
      faculty: req.user._id,
      institution: req.user.institution,
      dayOfWeek: today,
    })
      .populate('subject', 'name code credits')
      .populate('classSection', 'name semester roomNumber')
      .sort({ periodNumber: 1 });

    return res.status(200).json({ success: true, data: schedule });
  } catch (error) {
    next(error);
  }
};

export const getStudentsForAttendance = async (req, res, next) => {
  try {
    const { classSectionId, subjectId, periodNumber, date } = req.query;

    if (!classSectionId) {
      return res.status(400).json({ success: false, message: 'classSectionId is required.' });
    }

    const profiles = await StudentProfile.find({
      institution: req.user.institution,
      classSection: classSectionId,
    })
      .populate('user', 'name email avatar')
      .sort({ rollNumber: 1 });

    // Check if session already recorded
    let existingSession = null;
    let existingRecords = {};

    if (subjectId && periodNumber && date) {
      const sessionDate = new Date(date);
      sessionDate.setHours(0, 0, 0, 0);

      existingSession = await AttendanceSession.findOne({
        institution: req.user.institution,
        classSection: classSectionId,
        subject: subjectId,
        periodNumber: Number(periodNumber),
        date: sessionDate,
      });

      if (existingSession) {
        const records = await Attendance.find({ session: existingSession._id });
        records.forEach((r) => {
          existingRecords[r.student.toString()] = r.status;
        });
      }
    }

    const studentList = profiles.map((p) => ({
      studentId: p.user?._id,
      name: p.user?.name,
      rollNumber: p.rollNumber,
      avatar: p.user?.avatar,
      currentStatus: existingRecords[p.user?._id?.toString()] || 'Present',
    }));

    return res.status(200).json({
      success: true,
      data: {
        students: studentList,
        existingSession,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const submitAttendance = async (req, res, next) => {
  try {
    const { classSectionId, subjectId, periodNumber, date, attendanceRecords, topicCovered } = req.body;

    if (!classSectionId || !subjectId || !periodNumber || !date || !attendanceRecords) {
      return res.status(400).json({
        success: false,
        message: 'classSectionId, subjectId, periodNumber, date, and attendanceRecords are required.',
      });
    }

    const session = await verifyAndSubmitAttendance({
      facultyId: req.user._id,
      institutionId: req.user.institution,
      classSectionId,
      subjectId,
      periodNumber,
      date,
      attendanceRecords,
      topicCovered,
    });

    return res.status(200).json({
      success: true,
      message: 'Attendance saved successfully.',
      data: session,
    });
  } catch (error) {
    // 403 when timetable authorization chain fails
    if (error.message.includes('Unauthorized') || error.message.includes('not assigned')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

export const getAttendanceHistory = async (req, res, next) => {
  try {
    const sessions = await AttendanceSession.find({
      faculty: req.user._id,
      institution: req.user.institution,
    })
      .populate('subject', 'name code')
      .populate('classSection', 'name')
      .sort({ date: -1, periodNumber: -1 })
      .limit(30);

    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    next(error);
  }
};

export const uploadStudyMaterial = async (req, res, next) => {
  try {
    const { subjectId, classSectionId, title, description, materialType, fileUrl, unitCategory } = req.body;

    if (!subjectId || !classSectionId || !title || !unitCategory) {
      return res.status(400).json({
        success: false,
        message: 'subjectId, classSectionId, title, and unitCategory are required.',
      });
    }

    let finalFileUrl = fileUrl;
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    const material = await StudyMaterial.create({
      institution: req.user.institution,
      faculty: req.user._id,
      subject: subjectId,
      classSection: classSectionId,
      title,
      description: description || '',
      materialType: materialType || 'PDF',
      fileUrl: finalFileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
      unitCategory,
    });

    return res.status(201).json({
      success: true,
      message: 'Study material uploaded successfully.',
      data: material,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyMaterials = async (req, res, next) => {
  try {
    const materials = await StudyMaterial.find({ faculty: req.user._id })
      .populate('subject', 'name code')
      .populate('classSection', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: materials });
  } catch (error) {
    next(error);
  }
};

export const createAssignment = async (req, res, next) => {
  try {
    const { subjectId, classSectionId, title, description, instructions, deadline, maxMarks } = req.body;

    if (!subjectId || !classSectionId || !title || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Subject, classSection, title, and deadline are required.',
      });
    }

    const assignment = await Assignment.create({
      institution: req.user.institution,
      faculty: req.user._id,
      subject: subjectId,
      classSection: classSectionId,
      title,
      description: description || '',
      instructions: instructions || '',
      deadline: new Date(deadline),
      maxMarks: maxMarks || 100,
    });

    return res.status(201).json({
      success: true,
      message: 'Assignment created successfully.',
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyAssignments = async (req, res, next) => {
  try {
    const assignments = await Assignment.find({ faculty: req.user._id })
      .populate('subject', 'name code')
      .populate('classSection', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: assignments });
  } catch (error) {
    next(error);
  }
};

export const getSubmissionsForAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignment: assignmentId })
      .populate('student', 'name email avatar')
      .sort({ submittedAt: -1 });

    return res.status(200).json({ success: true, data: submissions });
  } catch (error) {
    next(error);
  }
};

export const gradeSubmission = async (req, res, next) => {
  try {
    const { submissionId } = req.params;
    const { marksAwarded, feedback } = req.body;

    const submission = await Submission.findById(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found.' });
    }

    submission.marksAwarded = Number(marksAwarded);
    submission.feedback = feedback || '';
    submission.status = 'graded';
    submission.gradedBy = req.user._id;
    submission.gradedAt = new Date();
    await submission.save();

    return res.status(200).json({
      success: true,
      message: 'Submission graded successfully.',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyAssignedClasses = async (req, res, next) => {
  try {
    const timetable = await Timetable.find({ faculty: req.user._id, institution: req.user.institution })
      .populate('subject', 'name code')
      .populate('classSection', 'name semester');

    const subjectsMap = {};
    const classesMap = {};

    timetable.forEach((t) => {
      if (t.subject) subjectsMap[t.subject._id.toString()] = t.subject;
      if (t.classSection) classesMap[t.classSection._id.toString()] = t.classSection;
    });

    return res.status(200).json({
      success: true,
      data: {
        subjects: Object.values(subjectsMap),
        classSections: Object.values(classesMap),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getHodTimetableData = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const department = await Department.findOne({
      institution: institutionId,
      $or: [{ hodUser: req.user._id }, { hodName: req.user.name }],
    });

    const isHod = Boolean(req.user.isHod || department);

    // Check if user is an FA for any class sections
    const faClasses = await ClassSection.find({
      institution: institutionId,
      facultyAdvisor: req.user._id,
    }).populate('facultyAdvisor', 'name email avatar');

    const isFa = faClasses.length > 0 || Boolean(req.user.isFa);

    if (!isHod && !isFa) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Timetable management is restricted to Faculty Advisors (for class scheduling) and HOD (for department overview).',
      });
    }

    if (isHod) {
      const deptId = department ? department._id : null;
      const queryDept = deptId ? { department: deptId } : {};

      const [classSections, subjects, facultyProfiles, timetableEntries] = await Promise.all([
        ClassSection.find({ institution: institutionId, ...queryDept })
          .populate('facultyAdvisor', 'name email avatar')
          .sort({ semester: 1, name: 1 }),
        Subject.find({ institution: institutionId, ...queryDept }).sort({ semester: 1, name: 1 }),
        FacultyProfile.find({ institution: institutionId, ...queryDept })
          .populate('user', 'name email avatar isFa isHod')
          .sort({ createdAt: -1 }),
        Timetable.find({ institution: institutionId, ...(deptId ? { department: deptId } : {}) })
          .populate('faculty', 'name email')
          .populate('subject', 'name code type')
          .populate('classSection', 'name semester roomNumber')
          .sort({ periodNumber: 1 }),
      ]);

      const facultyMembers = facultyProfiles.map((fp) => ({
        _id: fp.user?._id || fp._id,
        name: fp.user?.name || 'Faculty Member',
        email: fp.user?.email || '',
        employeeId: fp.employeeId,
        designation: fp.designation,
        isFa: fp.user?.isFa || fp.isFa || false,
        isHod: fp.user?.isHod || fp.isHod || false,
      }));

      return res.status(200).json({
        success: true,
        data: {
          department,
          classSections,
          subjects,
          facultyMembers,
          timetableEntries,
          isHod: true,
          isFa,
          editableClassIds: faClasses.map((c) => c._id.toString()),
          roleMode: 'HOD',
        },
      });
    }

    // For FA (Faculty Advisor)
    const targetDeptId = faClasses[0]?.department;
    const [deptDoc, subjects, facultyProfiles, timetableEntries] = await Promise.all([
      Department.findById(targetDeptId),
      Subject.find({ institution: institutionId, department: targetDeptId }).sort({ semester: 1, name: 1 }),
      FacultyProfile.find({ institution: institutionId, department: targetDeptId })
        .populate('user', 'name email avatar isFa isHod')
        .sort({ createdAt: -1 }),
      Timetable.find({
        institution: institutionId,
        classSection: { $in: faClasses.map((c) => c._id) },
      })
        .populate('faculty', 'name email')
        .populate('subject', 'name code type')
        .populate('classSection', 'name semester roomNumber')
        .sort({ periodNumber: 1 }),
    ]);

    const facultyMembers = facultyProfiles.map((fp) => ({
      _id: fp.user?._id || fp._id,
      name: fp.user?.name || 'Faculty Member',
      email: fp.user?.email || '',
      employeeId: fp.employeeId,
      designation: fp.designation,
      isFa: fp.user?.isFa || fp.isFa || false,
      isHod: fp.user?.isHod || fp.isHod || false,
    }));

    return res.status(200).json({
      success: true,
      data: {
        department: deptDoc,
        classSections: faClasses,
        subjects,
        facultyMembers,
        timetableEntries,
        isHod: false,
        isFa: true,
        editableClassIds: faClasses.map((c) => c._id.toString()),
        roleMode: 'FA',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const assignFacultyAdvisor = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const { classSectionId, facultyId } = req.body;

    if (!classSectionId || !facultyId) {
      return res.status(400).json({
        success: false,
        message: 'Class section ID and faculty ID are required.',
      });
    }

    // Verify caller is HOD
    const department = await Department.findOne({
      institution: institutionId,
      $or: [{ hodUser: req.user._id }, { hodName: req.user.name }],
    });

    if (!req.user.isHod && !department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the HOD can assign a Faculty Advisor (FA).',
      });
    }

    const classSection = await ClassSection.findOne({
      _id: classSectionId,
      institution: institutionId,
    });

    if (!classSection) {
      return res.status(404).json({ success: false, message: 'Class section not found.' });
    }

    const facultyUser = await User.findOne({
      _id: facultyId,
      institution: institutionId,
      role: 'faculty',
    });

    if (!facultyUser) {
      return res.status(404).json({ success: false, message: 'Faculty member not found.' });
    }

    const prevFaId = classSection.facultyAdvisor;

    // Assign new FA
    classSection.facultyAdvisor = facultyUser._id;
    await classSection.save();

    // Mark user as FA
    await User.findByIdAndUpdate(facultyUser._id, { isFa: true });
    await FacultyProfile.findOneAndUpdate(
      { user: facultyUser._id },
      { isFa: true, $addToSet: { advisorClasses: classSection._id } }
    );

    // If previous FA was assigned and is different, check if they advise any other classes
    if (prevFaId && prevFaId.toString() !== facultyUser._id.toString()) {
      const remainingClasses = await ClassSection.countDocuments({
        institution: institutionId,
        facultyAdvisor: prevFaId,
        _id: { $ne: classSectionId },
      });
      if (remainingClasses === 0) {
        await User.findByIdAndUpdate(prevFaId, { isFa: false });
        await FacultyProfile.findOneAndUpdate(
          { user: prevFaId },
          { isFa: false, $pull: { advisorClasses: classSectionId } }
        );
      } else {
        await FacultyProfile.findOneAndUpdate(
          { user: prevFaId },
          { $pull: { advisorClasses: classSectionId } }
        );
      }
    }

    const updated = await ClassSection.findById(classSection._id).populate('facultyAdvisor', 'name email avatar');

    return res.status(200).json({
      success: true,
      message: `'${facultyUser.name}' has been assigned as Faculty Advisor (FA) for ${classSection.name}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const unassignFacultyAdvisor = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const { classSectionId } = req.body;

    if (!classSectionId) {
      return res.status(400).json({ success: false, message: 'Class section ID is required.' });
    }

    const department = await Department.findOne({
      institution: institutionId,
      $or: [{ hodUser: req.user._id }, { hodName: req.user.name }],
    });

    if (!req.user.isHod && !department) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the HOD can unassign a Faculty Advisor (FA).',
      });
    }

    const classSection = await ClassSection.findOne({
      _id: classSectionId,
      institution: institutionId,
    });

    if (!classSection) {
      return res.status(404).json({ success: false, message: 'Class section not found.' });
    }

    const prevFaId = classSection.facultyAdvisor;
    classSection.facultyAdvisor = null;
    await classSection.save();

    if (prevFaId) {
      const remainingClasses = await ClassSection.countDocuments({
        institution: institutionId,
        facultyAdvisor: prevFaId,
      });
      if (remainingClasses === 0) {
        await User.findByIdAndUpdate(prevFaId, { isFa: false });
        await FacultyProfile.findOneAndUpdate(
          { user: prevFaId },
          { isFa: false, $pull: { advisorClasses: classSectionId } }
        );
      } else {
        await FacultyProfile.findOneAndUpdate(
          { user: prevFaId },
          { $pull: { advisorClasses: classSectionId } }
        );
      }
    }

    const updated = await ClassSection.findById(classSection._id);

    return res.status(200).json({
      success: true,
      message: `Faculty Advisor unassigned from ${classSection.name}.`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

export const saveTimetableEntry = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const {
      entryId,
      classSectionId,
      dayOfWeek,
      periodNumber,
      startTime,
      endTime,
      subjectId,
      facultyId,
      roomNumber,
      sessionType = 'Lecture',
    } = req.body;

    if (!classSectionId || !dayOfWeek || !periodNumber || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Class section, day of week, period number, start time, and end time are required.',
      });
    }

    if (sessionType !== 'Break' && (!subjectId || !facultyId)) {
      return res.status(400).json({
        success: false,
        message: 'Subject and faculty are required for non-break sessions.',
      });
    }

    const classSection = await ClassSection.findById(classSectionId).populate('facultyAdvisor', 'name email');
    if (!classSection) {
      return res.status(404).json({ success: false, message: 'Class Section not found.' });
    }

    // Strict FA Authorization: Only the designated FA can schedule timetable for their class
    const isClassFa = classSection.facultyAdvisor && classSection.facultyAdvisor._id.toString() === req.user._id.toString();

    if (!isClassFa) {
      const faName = classSection.facultyAdvisor?.name;
      return res.status(403).json({
        success: false,
        message: faName
          ? `Access denied. Only the assigned Faculty Advisor (${faName}) can schedule or modify the timetable for ${classSection.name}.`
          : `Access denied. No Faculty Advisor (FA) is assigned to ${classSection.name} yet. The HOD must first assign a Faculty Advisor for this class to schedule its timetable.`,
      });
    }

    const roomToUse = roomNumber || classSection.roomNumber || 'Hall 101';

    // ---------------- CONFLICT CHECKING ----------------
    if (sessionType !== 'Break') {
      // 1. Faculty Conflict: Same faculty assigned to two classes at the same time slot
      const facultyConflict = await Timetable.findOne({
        _id: { $ne: entryId },
        institution: institutionId,
        faculty: facultyId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        sessionType: { $ne: 'Break' },
      }).populate('classSection', 'name').populate('faculty', 'name');

      if (facultyConflict) {
        return res.status(400).json({
          success: false,
          message: `FACULTY CONFLICT: Faculty member '${facultyConflict.faculty?.name || 'Selected Faculty'}' is already assigned to class '${facultyConflict.classSection?.name || 'another section'}' on ${dayOfWeek} at Period ${periodNumber} (${startTime} - ${endTime}).`,
        });
      }

      // 2. Class Conflict: Same class section cannot have two subjects at the same time slot
      const classConflict = await Timetable.findOne({
        _id: { $ne: entryId },
        institution: institutionId,
        classSection: classSectionId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
      }).populate('subject', 'name');

      if (classConflict) {
        return res.status(400).json({
          success: false,
          message: `CLASS CONFLICT: Class section '${classSection.name}' already has session '${classConflict.subject?.name || 'another session'}' assigned on ${dayOfWeek} at Period ${periodNumber}.`,
        });
      }

      // 3. Room Conflict: Same room cannot be assigned to two classes at the same time slot
      const roomConflict = await Timetable.findOne({
        _id: { $ne: entryId },
        institution: institutionId,
        roomNumber: roomToUse.trim(),
        dayOfWeek,
        periodNumber: Number(periodNumber),
        sessionType: { $ne: 'Break' },
      }).populate('classSection', 'name');

      if (roomConflict) {
        return res.status(400).json({
          success: false,
          message: `ROOM CONFLICT: Room '${roomToUse}' is already booked for class '${roomConflict.classSection?.name}' on ${dayOfWeek} at Period ${periodNumber}.`,
        });
      }
    }

    let entry;
    if (entryId) {
      entry = await Timetable.findByIdAndUpdate(
        entryId,
        {
          institution: institutionId,
          department: classSection.department,
          classSection: classSectionId,
          dayOfWeek,
          periodNumber: Number(periodNumber),
          startTime,
          endTime,
          subject: sessionType === 'Break' ? null : subjectId,
          faculty: sessionType === 'Break' ? null : facultyId,
          roomNumber: roomToUse,
          sessionType,
        },
        { new: true }
      )
        .populate('faculty', 'name email')
        .populate('subject', 'name code')
        .populate('classSection', 'name semester');
    } else {
      entry = await Timetable.create({
        institution: institutionId,
        department: classSection.department,
        classSection: classSectionId,
        dayOfWeek,
        periodNumber: Number(periodNumber),
        startTime,
        endTime,
        subject: sessionType === 'Break' ? null : subjectId,
        faculty: sessionType === 'Break' ? null : facultyId,
        roomNumber: roomToUse,
        sessionType,
        isPublished: false,
      });

      entry = await Timetable.findById(entry._id)
        .populate('faculty', 'name email')
        .populate('subject', 'name code')
        .populate('classSection', 'name semester');
    }

    return res.status(200).json({
      success: true,
      message: 'Timetable session updated successfully without conflicts.',
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

export const publishTimetable = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const { classSectionId } = req.body;

    if (!classSectionId) {
      return res.status(400).json({
        success: false,
        message: 'classSectionId is required to publish a class timetable.',
      });
    }

    const classSection = await ClassSection.findById(classSectionId).populate('facultyAdvisor', 'name');
    if (!classSection) {
      return res.status(404).json({ success: false, message: 'Class section not found.' });
    }

    // Strict FA Authorization: Only assigned FA can publish timetable for this class
    const isClassFa = classSection.facultyAdvisor && classSection.facultyAdvisor._id.toString() === req.user._id.toString();
    if (!isClassFa) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Only the assigned Faculty Advisor (FA) can publish the timetable for ${classSection.name}.`,
      });
    }

    const query = { institution: institutionId, classSection: classSectionId };
    await Timetable.updateMany(query, { isPublished: true });

    return res.status(200).json({
      success: true,
      message: `Weekly timetable for ${classSection.name} published successfully! All slots are now live for students.`,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTimetableEntry = async (req, res, next) => {
  try {
    const { entryId } = req.params;
    const entry = await Timetable.findById(entryId);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Timetable entry not found.' });
    }

    const classSection = await ClassSection.findById(entry.classSection).populate('facultyAdvisor', 'name');
    const isClassFa = classSection?.facultyAdvisor && classSection.facultyAdvisor._id.toString() === req.user._id.toString();

    if (!isClassFa) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only the assigned Faculty Advisor (FA) can remove timetable sessions for this class.',
      });
    }

    await Timetable.findByIdAndDelete(entryId);

    return res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

export const getFacultyWeeklySchedule = async (req, res, next) => {
  try {
    const institutionId = req.user.institution;
    const facultyId = req.user._id;

    // Fetch all timetable allocations for this faculty across all days
    const allocations = await Timetable.find({
      faculty: facultyId,
      institution: institutionId,
    })
      .populate('subject', 'name code credits type')
      .populate('classSection', 'name semester roomNumber facultyAdvisor')
      .populate('department', 'name code')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    // Check if faculty is an FA for any classes
    const faClasses = await ClassSection.find({
      institution: institutionId,
      facultyAdvisor: facultyId,
    }).populate('department', 'name code');

    // Also check if HOD
    const isHod = Boolean(
      req.user.isHod ||
      (await Department.findOne({
        institution: institutionId,
        $or: [{ hodUser: facultyId }, { hodName: req.user.name }],
      }))
    );

    return res.status(200).json({
      success: true,
      data: {
        allocations,
        isFa: faClasses.length > 0 || Boolean(req.user.isFa),
        isHod,
        faClasses,
      },
    });
  } catch (error) {
    next(error);
  }
};
