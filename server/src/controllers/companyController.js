import {
  StudentProfile,
  User,
  Institution,
  Requirement,
  Opportunity,
  CandidateShortlist,
  RecruitmentApplication,
  Achievement,
} from '../models/index.js';
import { calculateCandidateMatchScore } from '../services/matchScoreService.js';

export const getDashboardStats = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    const [eligibleStudentsCount, totalShortlisted, activeOpportunities, institutionsCount] =
      await Promise.all([
        StudentProfile.countDocuments({ isPublicForRecruitment: true }),
        CandidateShortlist.countDocuments({ company: companyId }),
        Opportunity.countDocuments({ company: companyId, status: 'Active' }),
        Institution.countDocuments({ verificationStatus: 'verified' }),
      ]);

    const pipelineStages = await CandidateShortlist.aggregate([
      { $match: { company: companyId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const pipelineSummary = {
      Matched: 0,
      Shortlisted: 0,
      Screening: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    };

    pipelineStages.forEach((stage) => {
      if (pipelineSummary[stage._id] !== undefined) {
        pipelineSummary[stage._id] = stage.count;
      }
    });

    const recentShortlists = await CandidateShortlist.find({ company: companyId })
      .populate('student', 'name email avatar')
      .sort({ updatedAt: -1 })
      .limit(5);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          eligibleStudentsCount,
          totalShortlisted,
          activeOpportunities,
          institutionsCount,
          pipelineSummary,
        },
        recentShortlists,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const searchCandidates = async (req, res, next) => {
  try {
    const {
      institutionId,
      course,
      semester,
      graduationYear,
      minCgpa,
      maxBacklogs,
      skills, // comma-separated or array
      preferredSkills,
    } = req.query;

    const query = { isPublicForRecruitment: true };

    if (institutionId) query.institution = institutionId;
    if (course) query.course = new RegExp(course, 'i');
    if (semester) query.semester = Number(semester);
    if (graduationYear) query.graduationYear = Number(graduationYear);
    if (minCgpa) query.cgpa = { $gte: Number(minCgpa) };
    if (maxBacklogs !== undefined) query.backlogs = { $lte: Number(maxBacklogs) };

    const candidates = await StudentProfile.find(query)
      .populate('user', 'name avatar email phone')
      .populate('institution', 'name code')
      .populate('department', 'name code');

    const reqSkillsList = skills ? (Array.isArray(skills) ? skills : skills.split(',')) : [];
    const prefSkillsList = preferredSkills
      ? Array.isArray(preferredSkills)
        ? preferredSkills
        : preferredSkills.split(',')
      : [];

    // Fetch company shortlists to know if already shortlisted
    const shortlists = await CandidateShortlist.find({ company: req.user._id });
    const shortlistMap = {};
    shortlists.forEach((s) => {
      shortlistMap[s.student.toString()] = s;
    });

    // Score each candidate
    const scoredCandidates = candidates.map((candidate) => {
      const matchResult = calculateCandidateMatchScore(candidate, {
        requiredSkills: reqSkillsList,
        preferredSkills: prefSkillsList,
        minCgpa: minCgpa ? Number(minCgpa) : 7.0,
        eligibleCourses: course ? [course] : [],
        graduationYear: graduationYear ? Number(graduationYear) : 2026,
        maxBacklogs: maxBacklogs !== undefined ? Number(maxBacklogs) : 0,
      });

      const shortlistEntry = shortlistMap[candidate.user?._id?.toString()];
      const isContactUnlocked =
        shortlistEntry && ['Screening', 'Interview', 'Selected'].includes(shortlistEntry.status);

      return {
        _id: candidate._id,
        userId: candidate.user?._id,
        name: candidate.user?.name,
        avatar: candidate.user?.avatar,
        institution: candidate.institution?.name,
        course: candidate.course,
        semester: candidate.semester,
        graduationYear: candidate.graduationYear,
        cgpa: candidate.cgpa,
        backlogs: candidate.backlogs,
        skills: candidate.skills,
        projectsCount: candidate.projects?.length || 0,
        certificationsCount: candidate.certifications?.length || 0,
        matchScore: matchResult.matchScore,
        matchDetails: matchResult,
        shortlistStatus: shortlistEntry ? shortlistEntry.status : null,
        // Privacy rule: Contact info exposed only through explicit screening/contact
        contactEmail: isContactUnlocked ? candidate.user?.email : 'Hidden until Screening',
        contactPhone: isContactUnlocked ? candidate.user?.phone : 'Hidden until Screening',
      };
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    return res.status(200).json({
      success: true,
      data: scoredCandidates,
      disclaimer: 'Match Score — not a hiring guarantee.',
    });
  } catch (error) {
    next(error);
  }
};

export const getCandidateDetail = async (req, res, next) => {
  try {
    const { studentUserId } = req.params;

    const profile = await StudentProfile.findOne({ user: studentUserId, isPublicForRecruitment: true })
      .populate('user', 'name email avatar phone')
      .populate('institution', 'name code')
      .populate('department', 'name code');

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Candidate profile not found or not visible for recruitment.',
      });
    }

    const achievements = await Achievement.find({ student: studentUserId }).populate(
      'skillExchange',
      'skillName skillLevel'
    );

    const shortlist = await CandidateShortlist.findOne({
      company: req.user._id,
      student: studentUserId,
    });

    const isContactUnlocked =
      shortlist && ['Screening', 'Interview', 'Selected'].includes(shortlist.status);

    return res.status(200).json({
      success: true,
      data: {
        profile,
        achievements,
        shortlist,
        contactEmail: isContactUnlocked ? profile.user?.email : 'Protected — Move to Screening to unlock',
        contactPhone: isContactUnlocked ? profile.user?.phone : 'Protected — Move to Screening to unlock',
      },
    });
  } catch (error) {
    next(error);
  }
};

export const toggleCandidateShortlist = async (req, res, next) => {
  try {
    const { studentUserId, status = 'Shortlisted', notes = '' } = req.body;

    let shortlist = await CandidateShortlist.findOne({
      company: req.user._id,
      student: studentUserId,
    });

    if (shortlist) {
      shortlist.status = status;
      if (notes) shortlist.notes = notes;
      shortlist.statusHistory.push({
        stage: status,
        updatedAt: new Date(),
        note: notes || `Moved to ${status}`,
      });
      await shortlist.save();

      return res.status(200).json({
        success: true,
        message: `Candidate updated to '${status}'.`,
        data: shortlist,
      });
    }

    shortlist = await CandidateShortlist.create({
      company: req.user._id,
      student: studentUserId,
      status,
      notes,
      statusHistory: [
        {
          stage: status,
          updatedAt: new Date(),
          note: notes || 'Initial Shortlist',
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Candidate shortlisted successfully.',
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePipelineStatus = async (req, res, next) => {
  try {
    const { shortlistId } = req.params;
    const { status, note } = req.body;

    const shortlist = await CandidateShortlist.findOne({
      _id: shortlistId,
      company: req.user._id,
    });

    if (!shortlist) {
      return res.status(404).json({ success: false, message: 'Candidate shortlist entry not found.' });
    }

    shortlist.status = status;
    shortlist.statusHistory.push({
      stage: status,
      updatedAt: new Date(),
      note: note || `Updated pipeline stage to ${status}`,
    });
    await shortlist.save();

    return res.status(200).json({
      success: true,
      message: `Candidate stage moved to ${status}.`,
      data: shortlist,
    });
  } catch (error) {
    next(error);
  }
};

export const getShortlistedCandidates = async (req, res, next) => {
  try {
    const shortlists = await CandidateShortlist.find({ company: req.user._id })
      .populate('student', 'name email avatar phone')
      .sort({ updatedAt: -1 });

    const studentIds = shortlists.map((s) => s.student?._id);
    const profiles = await StudentProfile.find({ user: { $in: studentIds } })
      .populate('institution', 'name code')
      .populate('department', 'name code');

    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = p;
    });

    const enriched = shortlists.map((s) => {
      const p = profileMap[s.student?._id?.toString()];
      const isContactUnlocked = ['Screening', 'Interview', 'Selected'].includes(s.status);
      return {
        ...s.toObject(),
        profile: p || null,
        contactEmail: isContactUnlocked ? s.student?.email : 'Unlock in Screening',
        contactPhone: isContactUnlocked ? s.student?.phone : 'Unlock in Screening',
      };
    });

    return res.status(200).json({ success: true, data: enriched });
  } catch (error) {
    next(error);
  }
};

export const getOpportunities = async (req, res, next) => {
  try {
    const opportunities = await Opportunity.find({ company: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: opportunities });
  } catch (error) {
    next(error);
  }
};

export const createOpportunity = async (req, res, next) => {
  try {
    const {
      title,
      description,
      type = 'Full-time',
      workMode = 'Hybrid',
      location = 'Bengaluru',
      salaryOrStipend,
      minCgpa = 7.0,
      eligibleCourses = ['MCA', 'B.Tech CS'],
      graduationYear = 2026,
      requiredSkills = [],
      deadline,
      vacancies = 5,
    } = req.body;

    if (!title || !description || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and application deadline are required.',
      });
    }

    const opportunity = await Opportunity.create({
      company: req.user._id,
      title,
      description,
      type,
      workMode,
      location,
      salaryOrStipend: salaryOrStipend || 'Competitive',
      minCgpa,
      eligibleCourses,
      graduationYear,
      requiredSkills,
      deadline: new Date(deadline),
      vacancies,
      status: 'Active',
    });

    return res.status(201).json({
      success: true,
      message: 'Recruitment opportunity published successfully.',
      data: opportunity,
    });
  } catch (error) {
    next(error);
  }
};

export const getInstitutionsList = async (req, res, next) => {
  try {
    const institutions = await Institution.find({ verificationStatus: 'verified' })
      .select('name code universityCollegeId website address verificationStatus')
      .sort({ name: 1 });

    return res.status(200).json({ success: true, data: institutions });
  } catch (error) {
    next(error);
  }
};
