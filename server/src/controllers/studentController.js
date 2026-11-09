import {
  StudentProfile,
  Attendance,
  Timetable,
  StudyMaterial,
  Assignment,
  Submission,
  Announcement,
  Event,
  Complaint,
  Notification,
  Mark,
  SkillEnrollment,
} from '../models/index.js';
import { getStudentAttendanceSummary } from '../services/attendanceService.js';

export const getDashboardSummary = async (req, res, next) => {
  try {
    const studentId = req.user._id;
    const institutionId = req.user.institution;

    const profile = await StudentProfile.findOne({ user: studentId })
      .populate('department', 'name code')
      .populate('classSection', 'name semester');

    const attendanceSummary = await getStudentAttendanceSummary(studentId, institutionId);

    // Active announcements
    const announcements = await Announcement.find({ institution: institutionId })
      .sort({ createdAt: -1 })
      .limit(4);

    // Upcoming events
    const upcomingEvents = await Event.find({ institution: institutionId, startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(3);

    // Pending assignments
    let pendingAssignments = [];
    if (profile?.classSection) {
      const allClassAssignments = await Assignment.find({
        classSection: profile.classSection,
        deadline: { $gte: new Date() },
      }).populate('subject', 'name code');

      const mySubmissions = await Submission.find({ student: studentId });
      const submittedAssignmentIds = mySubmissions.map((s) => s.assignment.toString());

      pendingAssignments = allClassAssignments.filter(
        (a) => !submittedAssignmentIds.includes(a._id.toString())
      );
    }

    // Unread notifications
    const unreadNotifications = await Notification.countDocuments({
      recipient: studentId,
      isRead: false,
    });

    // Skill Exchange enrollments count
    const activeSkillsCount = await SkillEnrollment.countDocuments({
      learner: studentId,
      status: 'active',
    });

    return res.status(200).json({
      success: true,
      data: {
        profile,
        attendance: attendanceSummary,
        announcements,
        upcomingEvents,
        pendingAssignments,
        unreadNotifications,
        activeSkillsCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceDetails = async (req, res, next) => {
  try {
    const summary = await getStudentAttendanceSummary(req.user._id, req.user.institution);
    return res.status(200).json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

export const getTimetable = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id }).populate('department', 'name code');
    if (!profile || !profile.classSection) {
      return res.status(200).json({ success: true, data: [], profile });
    }

    const timetable = await Timetable.find({
      institution: req.user.institution,
      classSection: profile.classSection,
    })
      .populate('subject', 'name code credits type')
      .populate('faculty', 'name avatar email')
      .populate('classSection', 'name semester roomNumber')
      .sort({ dayOfWeek: 1, periodNumber: 1 });

    return res.status(200).json({
      success: true,
      data: timetable,
      profile: {
        department: profile.department,
        semester: profile.semester,
        course: profile.course,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getStudyMaterials = async (req, res, next) => {
  try {
    const { subjectId, unitCategory } = req.query;
    const profile = await StudentProfile.findOne({ user: req.user._id });

    const query = { institution: req.user.institution };
    if (profile?.classSection) query.classSection = profile.classSection;
    if (subjectId) query.subject = subjectId;
    if (unitCategory) query.unitCategory = unitCategory;

    const materials = await StudyMaterial.find(query)
      .populate('subject', 'name code')
      .populate('faculty', 'name')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: materials });
  } catch (error) {
    next(error);
  }
};

export const getAssignments = async (req, res, next) => {
  try {
    const profile = await StudentProfile.findOne({ user: req.user._id });
    if (!profile?.classSection) {
      return res.status(200).json({ success: true, data: [] });
    }

    const assignments = await Assignment.find({ classSection: profile.classSection })
      .populate('subject', 'name code')
      .populate('faculty', 'name')
      .sort({ deadline: 1 });

    const submissions = await Submission.find({ student: req.user._id });
    const submissionMap = {};
    submissions.forEach((s) => {
      submissionMap[s.assignment.toString()] = s;
    });

    const result = assignments.map((a) => {
      const sub = submissionMap[a._id.toString()];
      return {
        ...a.toObject(),
        submission: sub || null,
        isSubmitted: !!sub,
        isGraded: sub?.status === 'graded',
        grade: sub?.marksAwarded,
      };
    });

    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { submissionText, fileUrl } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    let finalFileUrl = fileUrl || '';
    if (req.file) {
      finalFileUrl = `/uploads/${req.file.filename}`;
    }

    const isLate = new Date() > new Date(assignment.deadline);

    const submission = await Submission.findOneAndUpdate(
      { assignment: assignmentId, student: req.user._id },
      {
        assignment: assignmentId,
        student: req.user._id,
        institution: req.user.institution,
        fileUrl: finalFileUrl,
        submissionText: submissionText || '',
        submittedAt: new Date(),
        status: isLate ? 'late' : 'submitted',
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: isLate ? 'Assignment submitted (marked Late).' : 'Assignment submitted successfully.',
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};

export const submitComplaint = async (req, res, next) => {
  try {
    const { title, description, category, isAnonymous } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required.' });
    }

    const complaint = await Complaint.create({
      institution: req.user.institution,
      submittedBy: req.user._id,
      title,
      description,
      category: category || 'Academic',
      isAnonymous: !!isAnonymous,
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Your grievance has been submitted securely.',
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ submittedBy: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    next(error);
  }
};

export const getMyResults = async (req, res, next) => {
  try {
    const marks = await Mark.find({ student: req.user._id })
      .populate('exam', 'name type semester')
      .populate('subject', 'name code credits')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: marks });
  } catch (error) {
    next(error);
  }
};
