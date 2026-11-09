import {
  SkillExchange,
  SkillModule,
  SkillLesson,
  SkillEnrollment,
  SkillEvaluation,
  Achievement,
  TutorRank,
  SkillFeedback,
  User,
  Conversation,
  Message,
  Notification,
} from '../models/index.js';
import {
  getLearnerCourseStatus,
  requestJoinCourse as requestJoinCourseService,
  reviewJoinRequest as reviewJoinRequestService,
  getTutorRequests as getTutorRequestsService,
  markLessonViewed as markLessonViewedService,
  completeLesson,
  getLessonResource as getLessonResourceService,
  submitCourseEvaluation,
  submitTutorFeedback as submitTutorFeedbackService,
  updateTutorRank,
} from '../services/skillExchangeService.js';

export const getCourses = async (req, res, next) => {
  try {
    const { search = '', skillLevel = '' } = req.query;

    const query = { status: 'active' };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { skillName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (skillLevel) {
      query.skillLevel = skillLevel;
    }

    const courses = await SkillExchange.find(query)
      .populate('tutor', 'name email avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getCourseDetails = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const learnerId = req.user ? req.user._id : null;

    const details = await getLearnerCourseStatus(courseId, learnerId);
    return res.status(200).json({ success: true, data: details });
  } catch (error) {
    next(error);
  }
};

export const createCourse = async (req, res, next) => {
  try {
    const {
      title,
      skillName,
      description,
      skillLevel = 'beginner',
      prerequisites = [],
      learningOutcomes = [],
      estimatedDuration = '3 Weeks',
      tags = [],
      meetingLink = 'https://meet.jit.si/PeerX-StudyRoom',
      modules = [], // Array of { title, description, lessons: [...] }
      evaluations,
      midtermQuestions = [],
      finalQuestions = [],
    } = req.body;

    if (!title || !skillName || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title, skillName, and description are required.',
      });
    }

    if (!Array.isArray(modules) || modules.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'At least 2 modules are required for sequential course progression with mid-term and final evaluations.',
      });
    }

    const midQuestions = evaluations?.midterm?.questions || evaluations?.midpoint?.questions || midtermQuestions || [];
    const finQuestions = evaluations?.final?.questions || finalQuestions || [];
    const totalQuestions = midQuestions.length + finQuestions.length;

    if (totalQuestions < 30) {
      return res.status(400).json({
        success: false,
        message: `Evaluation requires a minimum of 30 questions total across mid-term and final evaluations (currently ${totalQuestions} provided).`,
      });
    }

    if (midQuestions.length === 0 || finQuestions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Both mid-term and final evaluations must contain questions.',
      });
    }

    const safeSkillSlug = (skillName || 'Skill').replace(/[^a-zA-Z0-9]/g, '');
    const finalMeetingLink =
      meetingLink && meetingLink !== 'https://meet.jit.si/PeerX-StudyRoom'
        ? meetingLink.trim()
        : `https://meet.jit.si/PeerX-${safeSkillSlug}-${Date.now().toString(36)}`;

    const course = await SkillExchange.create({
      tutor: req.user._id,
      institution: req.user.institution,
      title,
      skillName,
      description,
      skillLevel,
      prerequisites,
      learningOutcomes,
      estimatedDuration,
      tags,
      meetingLink: finalMeetingLink,
    });

    // Create modules and lessons/materials
    for (let i = 0; i < modules.length; i++) {
      const modData = modules[i];
      const skillMod = await SkillModule.create({
        skillExchange: course._id,
        orderIndex: i + 1,
        title: modData.title || `Module ${i + 1}`,
        description: modData.description || '',
        isInitialUnlocked: i === 0, // Module 1 is unlocked initially
      });

      if (modData.lessons && Array.isArray(modData.lessons)) {
        for (let j = 0; j < modData.lessons.length; j++) {
          const lesData = modData.lessons[j];
          await SkillLesson.create({
            skillExchange: course._id,
            skillModule: skillMod._id,
            orderIndex: j + 1,
            title: lesData.title || `Lesson ${j + 1}`,
            content: lesData.content || '',
            materialType: lesData.materialType || 'youtube',
            youtubeUrl: lesData.youtubeUrl || lesData.videoUrl || '',
            videoRecordingUrl: lesData.videoRecordingUrl || '',
            documentUrl: lesData.documentUrl || lesData.resourcePdfUrl || '',
            documentName: lesData.documentName || '',
            resourcePdfUrl: lesData.documentUrl || lesData.resourcePdfUrl || '',
            videoUrl: lesData.youtubeUrl || lesData.videoRecordingUrl || lesData.videoUrl || '',
            durationMinutes: lesData.durationMinutes || 20,
          });
        }
      }
    }

    // Create Mid-Term and Final Evaluations
    await SkillEvaluation.create({
      skillExchange: course._id,
      evaluationType: 'mid_term',
      title: evaluations?.midterm?.title || evaluations?.midpoint?.title || `${skillName} Mid-Term Assessment`,
      passingScore: evaluations?.midterm?.passingScore || evaluations?.midpoint?.passingScore || 60,
      questions: midQuestions,
    });

    await SkillEvaluation.create({
      skillExchange: course._id,
      evaluationType: 'final',
      title: evaluations?.final?.title || `${skillName} Final Mastery Evaluation`,
      passingScore: evaluations?.final?.passingScore || 60,
      questions: finQuestions,
    });

    return res.status(201).json({
      success: true,
      message: 'Skill course with sequential modules, rich materials, and mid-term/final evaluations published successfully.',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Request to join a peer skill course
 * Enforces:
 * - Duplicate enrolments/requests are prevented
 * - Tutors cannot join their own course
 */
export const requestJoinCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { requestMessage = '' } = req.body;

    const result = await requestJoinCourseService(courseId, req.user._id, requestMessage);
    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.enrollment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.message.includes('already') || error.message.includes('cannot')) {
      return res.status(400).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Alias / enroll endpoint for joining course
 */
export const enrollInCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { requestMessage = '', autoAccept = false } = req.body;

    const course = await SkillExchange.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Skill course not found.' });
    }

    if (course.tutor.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot enroll in a course you are tutoring.' });
    }

    const existing = await SkillEnrollment.findOne({
      skillExchange: courseId,
      learner: req.user._id,
    });

    if (existing) {
      if (existing.status === 'pending') {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted a join request for this course. Awaiting tutor review.',
          data: existing,
        });
      }
      if (['active', 'accepted'].includes(existing.status)) {
        return res.status(200).json({
          success: true,
          message: 'Already enrolled in this course.',
          data: existing,
        });
      }
      if (existing.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'You have already completed this course.',
          data: existing,
        });
      }
    }

    const enrollmentStatus = autoAccept ? 'active' : 'pending';

    const enrollment = await SkillEnrollment.create({
      learner: req.user._id,
      skillExchange: courseId,
      tutor: course.tutor,
      status: enrollmentStatus,
      requestMessage: requestMessage || '',
      currentModuleOrder: 1,
      progressPercentage: 0,
    });

    if (enrollmentStatus === 'active') {
      course.totalEnrollments = (course.totalEnrollments || 0) + 1;
      await course.save();
    }

    return res.status(201).json({
      success: true,
      message:
        enrollmentStatus === 'active'
          ? 'Enrolled in peer skill course successfully. Module 1 is now unlocked!'
          : 'Join request submitted successfully. Awaiting tutor review.',
      data: enrollment,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate enrollment: you have already registered for this course.',
      });
    }
    next(error);
  }
};

/**
 * Tutors review join requests (accept or reject)
 */
export const reviewJoinRequest = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const { action, status } = req.body;

    const targetAction = action || status;
    const result = await reviewJoinRequestService(enrollmentId, req.user._id, targetAction);

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.enrollment,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Get all join requests for tutor
 */
export const getTutorRequests = async (req, res, next) => {
  try {
    const requests = await getTutorRequestsService(req.user._id);
    return res.status(200).json({
      success: true,
      data: requests,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark resource as viewed
 */
export const markLessonViewed = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const result = await markLessonViewedService(courseId, lessonId, req.user._id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Mark lesson as completed
 */
export const markLessonComplete = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const result = await completeLesson(courseId, lessonId, req.user._id);

    return res.status(200).json({
      success: true,
      message: 'Lesson marked as completed.',
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.message.includes('locked')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Get specific lesson resource (enforcing locked resource protection)
 */
export const getLessonResource = async (req, res, next) => {
  try {
    const { courseId, lessonId } = req.params;
    const lesson = await getLessonResourceService(courseId, lessonId, req.user._id);

    return res.status(200).json({
      success: true,
      data: lesson,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Submit Course Evaluation (Midpoint or Final)
 */
export const submitEvaluation = async (req, res, next) => {
  try {
    const { courseId, evaluationType: paramEvalType } = req.params;
    const { answers, evaluationType: bodyEvalType } = req.body;
    const evaluationType = paramEvalType || bodyEvalType || 'final';

    const result = await submitCourseEvaluation({
      skillExchangeId: courseId,
      learnerId: req.user._id,
      evaluationType,
      answers: answers || [],
    });

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    if (error.message.includes('locked') || error.message.includes('must')) {
      return res.status(403).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Submit Tutor Feedback
 * Enforces:
 * - Only eligible course participants with completed enrolment can submit feedback
 * - One feedback record allowed per completed enrolment
 * - Ratings and comments are saved
 * - Tutor points and rankings follow agreed rules
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { rating, review, teachingClarity, responsiveness } = req.body;

    const result = await submitTutorFeedbackService({
      skillExchangeId: courseId,
      learnerId: req.user._id,
      rating,
      review,
      teachingClarity,
      responsiveness,
    });

    return res.status(201).json({
      success: true,
      message: result.message,
      data: result.feedback,
      tutorRank: result.tutorRank,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * Get feedback reviews for course
 */
export const getCourseFeedback = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const feedbacks = await SkillFeedback.find({ skillExchange: courseId })
      .populate('learner', 'name avatar')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    next(error);
  }
};

export const getAchievementCertificate = async (req, res, next) => {
  try {
    const { achievementId } = req.params;
    const achievement = await Achievement.findById(achievementId)
      .populate('student', 'name email avatar')
      .populate('tutor', 'name email avatar')
      .populate('skillExchange', 'title skillName estimatedDuration');

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement certificate not found.' });
    }

    return res.status(200).json({ success: true, data: achievement });
  } catch (error) {
    next(error);
  }
};

export const getMyLearningSummary = async (req, res, next) => {
  try {
    const enrollments = await SkillEnrollment.find({ learner: req.user._id })
      .populate('skillExchange', 'title skillName skillLevel estimatedDuration ratingAverage')
      .populate('tutor', 'name avatar email')
      .sort({ updatedAt: -1 });

    const achievements = await Achievement.find({ student: req.user._id })
      .populate('skillExchange', 'title skillName')
      .sort({ issuedDate: -1 });

    const taughtCourses = await SkillExchange.find({ tutor: req.user._id }).sort({ createdAt: -1 });
    const tutorRank = await TutorRank.findOne({ tutor: req.user._id });
    const pendingRequestsCount = await SkillEnrollment.countDocuments({
      tutor: req.user._id,
      status: 'pending',
    });

    return res.status(200).json({
      success: true,
      data: {
        enrollments,
        achievements,
        taughtCourses,
        pendingRequestsCount,
        tutorRank: tutorRank || {
          rankTier: 'Starter Tutor',
          totalPoints: 100,
          totalStudentsTaught: 0,
          averageRating: 5.0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload learning material (video recordings, PDFs, documents)
 */
export const uploadSkillMaterial = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided for upload.',
      });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.status(200).json({
      success: true,
      message: 'Learning material uploaded successfully.',
      data: {
        fileUrl,
        originalName: req.file.originalname,
        documentName: req.file.originalname,
        fileName: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * -------------------------------------------------------------
 * Course Discussion & Peer Study Room Live Chat
 * -------------------------------------------------------------
 */

/**
 * Get discussion thread and messages for a skill exchange course
 */
export const getCourseChat = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const course = await SkillExchange.findById(courseId).populate('tutor', 'name avatar email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Skill course not found.' });
    }

    const isTutor = course.tutor?._id?.toString() === req.user._id.toString();
    const enrollment = await SkillEnrollment.findOne({
      skillExchange: courseId,
      learner: req.user._id,
      status: { $in: ['accepted', 'active', 'completed'] },
    });

    if (!isTutor && !enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be an accepted learner or the tutor to view the course discussion.',
      });
    }

    // Gather active learners
    const activeEnrollments = await SkillEnrollment.find({
      skillExchange: courseId,
      status: { $in: ['accepted', 'active', 'completed'] },
    }).populate('learner', 'name avatar email role');

    const participantIds = [course.tutor._id];
    activeEnrollments.forEach((e) => {
      if (e.learner && !participantIds.some((p) => p.toString() === e.learner._id.toString())) {
        participantIds.push(e.learner._id);
      }
    });

    let conversation = await Conversation.findOne({
      relatedSkillExchange: courseId,
      type: 'skill_exchange',
    });

    if (!conversation) {
      conversation = await Conversation.create({
        institution: course.institution || req.user.institution,
        participants: participantIds,
        title: `${course.skillName} - Peer Study Room & Discussion`,
        type: 'skill_exchange',
        relatedSkillExchange: courseId,
        lastMessage: 'Welcome to the peer study room discussion!',
        lastMessageAt: new Date(),
      });
    } else {
      // Sync participants
      const currentParticipantSet = new Set(conversation.participants.map((p) => p.toString()));
      let updated = false;
      participantIds.forEach((pid) => {
        if (!currentParticipantSet.has(pid.toString())) {
          conversation.participants.push(pid);
          updated = true;
        }
      });
      if (updated) await conversation.save();
    }

    const messages = await Message.find({ conversation: conversation._id })
      .populate('sender', 'name avatar role email')
      .sort({ createdAt: 1 })
      .limit(150);

    const safeSkillSlug = (course.skillName || 'Skill').replace(/[^a-zA-Z0-9]/g, '');
    const effectiveMeetingLink =
      course.meetingLink && course.meetingLink !== 'https://meet.jit.si/PeerX-StudyRoom'
        ? course.meetingLink
        : `https://meet.jit.si/PeerX-${safeSkillSlug}-${course._id.toString().slice(-6)}`;

    // Build participants summary
    const participantsList = [
      {
        _id: course.tutor._id,
        name: course.tutor.name,
        avatar: course.tutor.avatar,
        role: 'tutor',
        isTutor: true,
      },
      ...activeEnrollments
        .filter((e) => e.learner && e.learner._id.toString() !== course.tutor._id.toString())
        .map((e) => ({
          _id: e.learner._id,
          name: e.learner.name,
          avatar: e.learner.avatar,
          role: 'learner',
          isTutor: false,
        })),
    ];

    // Check active study room status
    let activeStudyRoom = conversation.activeStudyRoom;
    if (activeStudyRoom?.isActive) {
      const elapsed = Date.now() - new Date(activeStudyRoom.startedAt || 0).getTime();
      if (elapsed > 45 * 60 * 1000) {
        activeStudyRoom.isActive = false;
        conversation.activeStudyRoom = activeStudyRoom;
        await conversation.save();
      }
    } else if (!activeStudyRoom || activeStudyRoom.isActive === undefined) {
      // Fallback inference for messages in conversation
      const latestPingMsg = [...messages].reverse().find(
        (m) => m.content?.includes('🎥') || m.content?.includes('🏁')
      );
      const isActive =
        latestPingMsg &&
        latestPingMsg.content?.includes('🎥') &&
        Date.now() - new Date(latestPingMsg.createdAt).getTime() < 30 * 60 * 1000;

      activeStudyRoom = {
        isActive: !!isActive,
        startedBy: isActive ? latestPingMsg.sender?._id : null,
        startedByName: isActive ? latestPingMsg.sender?.name : '',
        startedAt: isActive ? latestPingMsg.createdAt : null,
      };
    }

    return res.status(200).json({
      success: true,
      data: {
        conversationId: conversation._id,
        meetingLink: effectiveMeetingLink,
        participants: participantsList,
        messages,
        activeStudyRoom: activeStudyRoom || { isActive: false },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Send a message in course discussion, or broadcast a "Waiting in Study Room" alert
 */
export const sendCourseChatMessage = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { content, isStudyRoomPing = false } = req.body;

    if (!content && !isStudyRoomPing) {
      return res.status(400).json({ success: false, message: 'Message content is required.' });
    }

    const course = await SkillExchange.findById(courseId).populate('tutor', 'name avatar email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Skill course not found.' });
    }

    const isTutor = course.tutor?._id?.toString() === req.user._id.toString();
    const enrollment = await SkillEnrollment.findOne({
      skillExchange: courseId,
      learner: req.user._id,
      status: { $in: ['accepted', 'active', 'completed'] },
    });

    if (!isTutor && !enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be an accepted learner or the tutor to send messages.',
      });
    }

    let conversation = await Conversation.findOne({
      relatedSkillExchange: courseId,
      type: 'skill_exchange',
    });

    if (!conversation) {
      conversation = await Conversation.create({
        institution: course.institution || req.user.institution,
        participants: [req.user._id],
        title: `${course.skillName} - Peer Study Room & Discussion`,
        type: 'skill_exchange',
        relatedSkillExchange: courseId,
      });
    }

    const finalContent = isStudyRoomPing
      ? (content || `🎥 I am waiting in the Peer Study Room! Join the video conference now.`)
      : content.trim();

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: finalContent,
      isReadBy: [req.user._id],
    });

    conversation.lastMessage = finalContent;
    conversation.lastMessageAt = new Date();

    // If study room ping, mark the room as active with the starter's info
    if (isStudyRoomPing) {
      conversation.activeStudyRoom = {
        isActive: true,
        startedBy: req.user._id,
        startedByName: req.user.name,
        startedAt: new Date(),
      };
    }
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar role email');

    // If it's a study room ping, send in-app notifications to all other course participants
    if (isStudyRoomPing) {
      const activeEnrollments = await SkillEnrollment.find({
        skillExchange: courseId,
        status: { $in: ['accepted', 'active', 'completed'] },
      }).select('learner');

      const recipientIds = new Set();
      if (course.tutor?._id && course.tutor._id.toString() !== req.user._id.toString()) {
        recipientIds.add(course.tutor._id.toString());
      }
      activeEnrollments.forEach((e) => {
        if (e.learner && e.learner.toString() !== req.user._id.toString()) {
          recipientIds.add(e.learner.toString());
        }
      });

      const notifications = Array.from(recipientIds).map((recipientId) => ({
        recipient: recipientId,
        institution: req.user.institution || course.institution,
        title: 'Peer Study Room Alert 🎥',
        message: `${req.user.name} is waiting in the Peer Study Room for "${course.title}". Click to join!`,
        type: 'skill',
        priority: 'high',
        link: `/student/skills/${course._id}?tab=chat`,
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    return res.status(201).json({
      success: true,
      message: isStudyRoomPing ? 'Study Room alert broadcasted to peers!' : 'Message sent.',
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End an active Study Room session (tutor or student)
 */
export const endCourseStudyRoom = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await SkillExchange.findById(courseId).populate('tutor', 'name avatar email');
    if (!course) {
      return res.status(404).json({ success: false, message: 'Skill course not found.' });
    }

    const isTutor = course.tutor?._id?.toString() === req.user._id.toString();
    const enrollment = await SkillEnrollment.findOne({
      skillExchange: courseId,
      learner: req.user._id,
      status: { $in: ['accepted', 'active', 'completed'] },
    });

    if (!isTutor && !enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You must be an accepted learner or the tutor to end the session.',
      });
    }

    let conversation = await Conversation.findOne({
      relatedSkillExchange: courseId,
      type: 'skill_exchange',
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found.' });
    }

    conversation.activeStudyRoom = {
      isActive: false,
      startedBy: null,
      startedByName: '',
      startedAt: null,
    };

    const finalContent = `🏁 Peer Study Room session ended by ${req.user.name}.`;

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: finalContent,
      isReadBy: [req.user._id],
    });

    conversation.lastMessage = finalContent;
    conversation.lastMessageAt = new Date();
    await conversation.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar role email');

    return res.status(200).json({
      success: true,
      message: 'Study Room session ended successfully.',
      data: {
        message: populated,
        activeStudyRoom: { isActive: false },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course meeting link (tutor only)
 */
export const updateCourseMeetingLink = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { meetingLink } = req.body;

    if (!meetingLink || typeof meetingLink !== 'string' || !meetingLink.startsWith('http')) {
      return res.status(400).json({
        success: false,
        message: 'A valid meeting link URL starting with http:// or https:// is required.',
      });
    }

    const course = await SkillExchange.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Skill course not found.' });
    }

    if (course.tutor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the course tutor can update the study room meeting link.',
      });
    }

    course.meetingLink = meetingLink.trim();
    await course.save();

    // Post announcement in course chat
    let conversation = await Conversation.findOne({
      relatedSkillExchange: courseId,
      type: 'skill_exchange',
    });

    if (conversation) {
      const updateMsg = `📢 Tutor updated the Study Room meeting link to: ${course.meetingLink}`;
      await Message.create({
        conversation: conversation._id,
        sender: req.user._id,
        content: updateMsg,
        isReadBy: [req.user._id],
      });
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: updateMsg,
        lastMessageAt: new Date(),
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Meeting link updated successfully.',
      data: { meetingLink: course.meetingLink },
    });
  } catch (error) {
    next(error);
  }
};

