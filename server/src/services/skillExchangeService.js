import {
  SkillExchange,
  SkillModule,
  SkillLesson,
  SkillEnrollment,
  LessonProgress,
  SkillEvaluation,
  SkillFeedback,
  TutorRank,
  Achievement,
  User,
} from '../models/index.js';

/**
 * 1. Request to join a peer skill course
 * Enforces:
 * - Tutor cannot enroll in own course
 * - Duplicate enrolments/requests are prevented
 */
export const requestJoinCourse = async (skillExchangeId, learnerId, requestMessage = '') => {
  const course = await SkillExchange.findById(skillExchangeId);
  if (!course) {
    throw new Error('Skill course not found.');
  }

  if (course.tutor.toString() === learnerId.toString()) {
    throw new Error('You cannot request to join or enroll in a course you are tutoring.');
  }

  const existing = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (existing) {
    if (existing.status === 'pending') {
      const err = new Error('You have already submitted a join request for this course. Awaiting tutor review.');
      err.statusCode = 400;
      throw err;
    }
    if (['accepted', 'active'].includes(existing.status)) {
      const err = new Error('You are already enrolled in this course.');
      err.statusCode = 400;
      throw err;
    }
    if (existing.status === 'completed') {
      const err = new Error('You have already completed this course.');
      err.statusCode = 400;
      throw err;
    }
    if (existing.status === 'rejected') {
      // Re-apply if previously rejected
      existing.status = 'pending';
      existing.requestMessage = requestMessage || '';
      existing.reviewedAt = null;
      await existing.save();
      return {
        success: true,
        message: 'Join request re-submitted. Awaiting tutor review.',
        enrollment: existing,
      };
    }
  }

  const enrollment = await SkillEnrollment.create({
    learner: learnerId,
    skillExchange: skillExchangeId,
    tutor: course.tutor,
    status: 'pending',
    requestMessage: requestMessage || '',
    currentModuleOrder: 1,
    progressPercentage: 0,
  });

  return {
    success: true,
    message: 'Join request submitted successfully. Awaiting tutor review.',
    enrollment,
  };
};

/**
 * 2. Tutor reviews join request (Accept or Reject)
 */
export const reviewJoinRequest = async (enrollmentId, tutorId, action) => {
  const enrollment = await SkillEnrollment.findById(enrollmentId).populate('skillExchange');
  if (!enrollment) {
    throw new Error('Enrollment request not found.');
  }

  if (enrollment.tutor.toString() !== tutorId.toString()) {
    const err = new Error('Unauthorized. You are not the tutor for this course.');
    err.statusCode = 403;
    throw err;
  }

  const normalizedAction = (action || '').toLowerCase();
  if (normalizedAction === 'accept' || normalizedAction === 'accepted') {
    enrollment.status = 'active';
    enrollment.reviewedAt = new Date();
    await enrollment.save();

    // Increment course totalEnrollments
    await SkillExchange.findByIdAndUpdate(enrollment.skillExchange._id, {
      $inc: { totalEnrollments: 1 },
    });

    return {
      success: true,
      message: 'Student join request accepted! Learner can now access Module 1.',
      enrollment,
    };
  } else if (normalizedAction === 'reject' || normalizedAction === 'rejected') {
    enrollment.status = 'rejected';
    enrollment.reviewedAt = new Date();
    await enrollment.save();

    return {
      success: true,
      message: 'Student join request declined.',
      enrollment,
    };
  } else {
    throw new Error("Invalid action. Must be 'accept' or 'reject'.");
  }
};

/**
 * 3. Get all join requests for tutor
 */
export const getTutorRequests = async (tutorId) => {
  const requests = await SkillEnrollment.find({ tutor: tutorId })
    .populate('learner', 'name email avatar phone')
    .populate('skillExchange', 'title skillName skillLevel')
    .sort({ createdAt: -1 });

  return requests;
};

/**
 * 4. Get learner course status
 * Enforces:
 * - Only accepted learners or course tutor can access course contents
 * - Module 1 unlocked initially, subsequent modules unlocked sequentially
 * - Evaluates midpoint and final evaluation availability
 */
export const getLearnerCourseStatus = async (skillExchangeId, learnerId) => {
  const course = await SkillExchange.findById(skillExchangeId).populate('tutor', 'name avatar email');
  if (!course) {
    throw new Error('Skill course not found.');
  }

  // Ensure course has a unique study room meeting link instead of global generic link
  if (!course.meetingLink || course.meetingLink === 'https://meet.jit.si/PeerX-StudyRoom') {
    const safeSlug = (course.skillName || 'Skill').replace(/[^a-zA-Z0-9]/g, '');
    course.meetingLink = `https://meet.jit.si/PeerX-${safeSlug}-${course._id.toString().slice(-6)}`;
    await course.save();
  }

  const isTutor = learnerId && course.tutor?._id?.toString() === learnerId.toString();

  const modules = await SkillModule.find({ skillExchange: skillExchangeId }).sort({ orderIndex: 1 });
  const lessons = await SkillLesson.find({ skillExchange: skillExchangeId }).sort({ orderIndex: 1 });

  let enrollment = null;
  let completedLessonIds = [];
  let viewedLessonIds = [];

  if (learnerId) {
    enrollment = await SkillEnrollment.findOne({
      skillExchange: skillExchangeId,
      learner: learnerId,
    });

    if (enrollment) {
      const progresses = await LessonProgress.find({
        enrollment: enrollment._id,
        learner: learnerId,
      });

      completedLessonIds = progresses.filter((p) => p.isCompleted).map((p) => p.lesson.toString());
      viewedLessonIds = progresses.filter((p) => p.isViewed).map((p) => p.lesson.toString());
    }
  }

  const isAccepted = isTutor || (enrollment && ['accepted', 'active', 'completed'].includes(enrollment.status));
  const enrollmentStatus = isTutor ? 'tutor' : enrollment ? enrollment.status : 'none';

  // Midpoint module order calculation
  const midpointModuleOrder = Math.max(1, Math.ceil(modules.length / 2));

  // Find first-half lessons
  const firstHalfModuleIds = modules
    .filter((m) => m.orderIndex <= midpointModuleOrder)
    .map((m) => m._id.toString());
  const firstHalfLessons = lessons.filter((l) => firstHalfModuleIds.includes(l.skillModule.toString()));
  const firstHalfCompleted =
    firstHalfLessons.length > 0 &&
    firstHalfLessons.every((l) => completedLessonIds.includes(l._id.toString()));

  const progressPercentage = enrollment ? enrollment.progressPercentage : 0;
  const isMidpointEligible = isAccepted && (firstHalfCompleted || progressPercentage >= 50);

  // Evaluations availability
  const midEval = await SkillEvaluation.findOne({ skillExchange: skillExchangeId, evaluationType: 'mid_term' });
  const finalEval = await SkillEvaluation.findOne({ skillExchange: skillExchangeId, evaluationType: 'final' });

  const isMidtermPassed =
    !midEval || (enrollment?.midpointEvaluation?.passed && (enrollment?.midpointEvaluation?.score || 0) >= 60);

  // Sequential module status calculation
  const modulesWithStatus = [];
  let previousModuleFullyCompleted = true;

  for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const moduleLessons = lessons.filter((l) => l.skillModule.toString() === mod._id.toString());
    const isSecondHalf = mod.orderIndex > midpointModuleOrder;

    // Module in second half requires previous modules done AND midterm evaluation passed with >= 60%
    let isUnlocked = false;
    let lockedReason = null;

    if (isAccepted) {
      if (isTutor) {
        isUnlocked = true;
      } else if (i === 0) {
        isUnlocked = true;
      } else if (!previousModuleFullyCompleted) {
        isUnlocked = false;
        lockedReason = 'previous_module_required';
      } else if (isSecondHalf && !isMidtermPassed) {
        isUnlocked = false;
        lockedReason = 'midterm_required';
      } else {
        isUnlocked = true;
      }
    }

    const lessonsWithStatus = moduleLessons.map((les) => {
      const isCompleted = completedLessonIds.includes(les._id.toString());
      const isViewed = viewedLessonIds.includes(les._id.toString()) || isCompleted;

      return {
        _id: les._id,
        orderIndex: les.orderIndex,
        title: les.title,
        durationMinutes: les.durationMinutes,
        materialType: les.materialType || 'youtube',
        isCompleted,
        isViewed,
        content: isUnlocked ? les.content : null,
        resourcePdfUrl: isUnlocked ? (les.documentUrl || les.resourcePdfUrl) : null,
        videoUrl: isUnlocked ? (les.youtubeUrl || les.videoRecordingUrl || les.videoUrl) : null,
        youtubeUrl: isUnlocked ? (les.youtubeUrl || les.videoUrl) : null,
        videoRecordingUrl: isUnlocked ? les.videoRecordingUrl : null,
        documentUrl: isUnlocked ? (les.documentUrl || les.resourcePdfUrl) : null,
        documentName: isUnlocked ? les.documentName : null,
      };
    });

    const allModuleLessonsDone =
      moduleLessons.length > 0 &&
      moduleLessons.every((l) => completedLessonIds.includes(l._id.toString()));

    modulesWithStatus.push({
      _id: mod._id,
      orderIndex: mod.orderIndex,
      title: mod.title,
      description: mod.description,
      isUnlocked,
      isSecondHalf,
      lockedReason,
      totalLessons: moduleLessons.length,
      completedLessonsCount: moduleLessons.filter((l) => completedLessonIds.includes(l._id.toString())).length,
      isFullyCompleted: allModuleLessonsDone,
      lessons: lessonsWithStatus,
    });

    previousModuleFullyCompleted = allModuleLessonsDone;
  }

  const isFinalEligible = isAccepted && progressPercentage === 100 && isMidtermPassed;

  // Check if feedback already submitted
  let existingFeedback = null;
  if (enrollment) {
    existingFeedback = await SkillFeedback.findOne({ enrollment: enrollment._id });
  }

  // Get course feedback summary
  const allFeedbacks = await SkillFeedback.find({ skillExchange: skillExchangeId })
    .populate('learner', 'name avatar')
    .sort({ createdAt: -1 });

  return {
    course,
    enrollment,
    enrollmentStatus,
    isAccepted,
    isTutor,
    midpointModuleOrder,
    isMidtermPassed,
    modules: modulesWithStatus,
    totalLessons: lessons.length,
    completedLessonsCount: completedLessonIds.length,
    viewedLessonsCount: viewedLessonIds.length,
    progressPercentage,
    evaluations: {
      midpoint: {
        exists: !!midEval,
        title: midEval?.title || 'Midpoint Assessment',
        questionsCount: midEval?.questions?.length || 0,
        isEligible: isMidpointEligible,
        passed: enrollment?.midpointEvaluation?.passed || false,
        score: enrollment?.midpointEvaluation?.score || 0,
        completedAt: enrollment?.midpointEvaluation?.completedAt,
        questions: isMidpointEligible ? midEval?.questions : [],
      },
      final: {
        exists: !!finalEval,
        title: finalEval?.title || 'Final Mastery Evaluation',
        questionsCount: finalEval?.questions?.length || 0,
        isEligible: isFinalEligible,
        passed: enrollment?.finalEvaluation?.passed || false,
        score: enrollment?.finalEvaluation?.score || 0,
        completedAt: enrollment?.finalEvaluation?.completedAt,
        questions: isFinalEligible ? finalEval?.questions : [],
      },
    },
    hasFeedbackSubmitted: !!existingFeedback,
    userFeedback: existingFeedback,
    allFeedbacks,
  };
};

/**
 * 5. Mark resource as viewed
 */
export const markLessonViewed = async (skillExchangeId, lessonId, learnerId) => {
  const enrollment = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (!enrollment || !['accepted', 'active', 'completed'].includes(enrollment.status)) {
    const err = new Error('You must be an accepted learner to access course resources.');
    err.statusCode = 403;
    throw err;
  }

  const lesson = await SkillLesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found.');
  }

  const targetModule = await SkillModule.findById(lesson.skillModule);
  if (!targetModule) {
    throw new Error('Module not found.');
  }

  // Verify module is unlocked
  if (targetModule.orderIndex > 1) {
    const prevModule = await SkillModule.findOne({
      skillExchange: skillExchangeId,
      orderIndex: targetModule.orderIndex - 1,
    });
    if (prevModule) {
      const prevLessons = await SkillLesson.find({ skillModule: prevModule._id });
      const completedCount = await LessonProgress.countDocuments({
        enrollment: enrollment._id,
        lesson: { $in: prevLessons.map((l) => l._id) },
        isCompleted: true,
      });
      if (completedCount < prevLessons.length) {
        const err = new Error(`Module ${targetModule.orderIndex} is locked. You cannot view resources in locked modules.`);
        err.statusCode = 403;
        throw err;
      }
    }
  }

  const allModulesCountView = await SkillModule.countDocuments({ skillExchange: skillExchangeId });
  const midModuleOrderView = Math.max(1, Math.ceil(allModulesCountView / 2));
  if (targetModule.orderIndex > midModuleOrderView) {
    const midEval = await SkillEvaluation.findOne({ skillExchange: skillExchangeId, evaluationType: 'mid_term' });
    if (midEval && (!enrollment.midpointEvaluation?.passed || (enrollment.midpointEvaluation?.score || 0) < 60)) {
      const err = new Error(`Module ${targetModule.orderIndex} is in the second half of the course and is locked. You must complete the Mid-Term Evaluation and score at least 60% to unlock it.`);
      err.statusCode = 403;
      throw err;
    }
  }

  await LessonProgress.findOneAndUpdate(
    { enrollment: enrollment._id, lesson: lesson._id },
    {
      enrollment: enrollment._id,
      learner: learnerId,
      lesson: lesson._id,
      module: targetModule._id,
      isViewed: true,
      viewedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  return { success: true, message: 'Resource marked as viewed.' };
};

/**
 * 6. Mark lesson as completed
 * Completing all lessons in a module unlocks the next module
 */
export const completeLesson = async (skillExchangeId, lessonId, learnerId) => {
  const enrollment = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (!enrollment || !['accepted', 'active', 'completed'].includes(enrollment.status)) {
    const err = new Error('You must be an accepted learner to complete lessons.');
    err.statusCode = 403;
    throw err;
  }

  const lesson = await SkillLesson.findById(lessonId);
  if (!lesson) {
    throw new Error('Lesson not found.');
  }

  const targetModule = await SkillModule.findById(lesson.skillModule);
  if (!targetModule) {
    throw new Error('Module not found.');
  }

  // Verify that the module is unlocked for this learner
  if (targetModule.orderIndex > 1) {
    const prevModule = await SkillModule.findOne({
      skillExchange: skillExchangeId,
      orderIndex: targetModule.orderIndex - 1,
    });
    if (prevModule) {
      const prevModuleLessons = await SkillLesson.find({ skillModule: prevModule._id });
      const completedInPrev = await LessonProgress.countDocuments({
        enrollment: enrollment._id,
        lesson: { $in: prevModuleLessons.map((l) => l._id) },
        isCompleted: true,
      });

      if (completedInPrev < prevModuleLessons.length) {
        const err = new Error(
          `Module ${targetModule.orderIndex} is locked. You must complete all lessons in Module ${prevModule.orderIndex} first.`
        );
        err.statusCode = 403;
        throw err;
      }
    }
  }

  const allModulesCountComplete = await SkillModule.countDocuments({ skillExchange: skillExchangeId });
  const midModuleOrderComplete = Math.max(1, Math.ceil(allModulesCountComplete / 2));
  if (targetModule.orderIndex > midModuleOrderComplete) {
    const midEval = await SkillEvaluation.findOne({ skillExchange: skillExchangeId, evaluationType: 'mid_term' });
    if (midEval && (!enrollment.midpointEvaluation?.passed || (enrollment.midpointEvaluation?.score || 0) < 60)) {
      const err = new Error(
        `Module ${targetModule.orderIndex} is in the second half of the course and is locked. You must complete the Mid-Term Evaluation and score at least 60% to unlock it.`
      );
      err.statusCode = 403;
      throw err;
    }
  }

  // Record progress
  await LessonProgress.findOneAndUpdate(
    { enrollment: enrollment._id, lesson: lesson._id },
    {
      enrollment: enrollment._id,
      learner: learnerId,
      lesson: lesson._id,
      module: targetModule._id,
      isViewed: true,
      viewedAt: new Date(),
      isCompleted: true,
      completedAt: new Date(),
    },
    { upsert: true, new: true }
  );

  // Recalculate course percentage
  const allLessonsCount = await SkillLesson.countDocuments({ skillExchange: skillExchangeId });
  const completedCount = await LessonProgress.countDocuments({
    enrollment: enrollment._id,
    isCompleted: true,
  });

  const progressPercentage = allLessonsCount > 0 ? Math.round((completedCount / allLessonsCount) * 100) : 100;

  // Check if current module is fully completed to update currentModuleOrder
  const currentModuleLessons = await SkillLesson.find({ skillModule: targetModule._id });
  const currentModDone = await LessonProgress.countDocuments({
    enrollment: enrollment._id,
    lesson: { $in: currentModuleLessons.map((l) => l._id) },
    isCompleted: true,
  });

  if (currentModDone === currentModuleLessons.length) {
    // Unlock next module order
    enrollment.currentModuleOrder = Math.max(enrollment.currentModuleOrder || 1, targetModule.orderIndex + 1);
  }

  enrollment.progressPercentage = progressPercentage;
  await enrollment.save();

  return {
    success: true,
    progressPercentage,
    completedCount,
    allLessonsCount,
    unlockedModuleOrder: enrollment.currentModuleOrder,
  };
};

/**
 * 7. Get specific lesson resource with strict lock enforcement
 * Locked resources cannot be accessed directly
 */
export const getLessonResource = async (skillExchangeId, lessonId, learnerId) => {
  const course = await SkillExchange.findById(skillExchangeId);
  if (!course) {
    throw new Error('Skill course not found.');
  }

  const isTutor = course.tutor.toString() === learnerId.toString();

  const enrollment = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (!isTutor && (!enrollment || !['accepted', 'active', 'completed'].includes(enrollment.status))) {
    const err = new Error('Locked resources cannot be accessed directly. You must be an accepted learner in this course.');
    err.statusCode = 403;
    throw err;
  }

  const lesson = await SkillLesson.findById(lessonId);
  if (!lesson || lesson.skillExchange.toString() !== skillExchangeId.toString()) {
    throw new Error('Lesson not found in this course.');
  }

  const targetModule = await SkillModule.findById(lesson.skillModule);

  if (!isTutor && targetModule.orderIndex > 1) {
    const prevModule = await SkillModule.findOne({
      skillExchange: skillExchangeId,
      orderIndex: targetModule.orderIndex - 1,
    });
    if (prevModule) {
      const prevLessons = await SkillLesson.find({ skillModule: prevModule._id });
      const completedInPrev = await LessonProgress.countDocuments({
        enrollment: enrollment._id,
        lesson: { $in: prevLessons.map((l) => l._id) },
        isCompleted: true,
      });

      if (completedInPrev < prevLessons.length) {
        const err = new Error('Locked resources cannot be accessed directly. Please complete preceding modules first.');
        err.statusCode = 403;
        throw err;
      }
    }

    const allModulesCountRes = await SkillModule.countDocuments({ skillExchange: skillExchangeId });
    const midModuleOrderRes = Math.max(1, Math.ceil(allModulesCountRes / 2));
    if (targetModule.orderIndex > midModuleOrderRes) {
      const midEval = await SkillEvaluation.findOne({ skillExchange: skillExchangeId, evaluationType: 'mid_term' });
      if (midEval && (!enrollment.midpointEvaluation?.passed || (enrollment.midpointEvaluation?.score || 0) < 60)) {
        const err = new Error('Locked resources cannot be accessed directly. You must complete the Mid-Term Evaluation and score at least 60% to unlock the second half of the course.');
        err.statusCode = 403;
        throw err;
      }
    }
  }

  return lesson;
};

/**
 * 8. Submit Course Evaluation (Midpoint or Final)
 * Enforces:
 * - Midpoint available at required stage (50% progress)
 * - Final available at 100% progress + midpoint passed
 * - Calculates scores, stores in enrollment, creates Achievement with assessed level
 */
export const submitCourseEvaluation = async ({
  skillExchangeId,
  learnerId,
  evaluationType = 'final',
  answers = [],
}) => {
  const enrollment = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (!enrollment || !['accepted', 'active', 'completed'].includes(enrollment.status)) {
    const err = new Error('Enrollment record not found or not active.');
    err.statusCode = 403;
    throw err;
  }

  const course = await SkillExchange.findById(skillExchangeId);

  if (evaluationType === 'mid_term') {
    const modules = await SkillModule.find({ skillExchange: skillExchangeId }).sort({ orderIndex: 1 });
    const midpointModuleOrder = Math.max(1, Math.ceil(modules.length / 2));
    const firstHalfModuleIds = modules.filter(m => m.orderIndex <= midpointModuleOrder).map(m => m._id.toString());
    const firstHalfLessons = await SkillLesson.find({ skillModule: { $in: firstHalfModuleIds } });
    
    const completedProgresses = await LessonProgress.find({
      enrollment: enrollment._id,
      learner: learnerId,
      isCompleted: true,
    });
    const completedLessonIds = completedProgresses.map(p => p.lesson.toString());
    const firstHalfCompleted = firstHalfLessons.length > 0 && firstHalfLessons.every(l => completedLessonIds.includes(l._id.toString()));

    // Stage check: must complete first-half modules or have at least 50%
    if (enrollment.progressPercentage < 50 && !firstHalfCompleted) {
      const err = new Error('Mid-term evaluation is locked. You must complete the first half of the course curriculum first.');
      err.statusCode = 403;
      throw err;
    }

    const evaluation = await SkillEvaluation.findOne({
      skillExchange: skillExchangeId,
      evaluationType: 'mid_term',
    });

    if (!evaluation) {
      throw new Error('No mid-term evaluation configured for this course.');
    }

    let correctAnswers = 0;
    evaluation.questions.forEach((q, idx) => {
      if (answers[idx] !== undefined && answers[idx] === q.correctOptionIndex) {
        correctAnswers += 1;
      }
    });

    const totalQuestions = evaluation.questions.length || 1;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    const passingThreshold = evaluation.passingScore || 60;
    const passed = score >= passingThreshold;

    enrollment.midpointEvaluation = {
      score,
      passed,
      completedAt: new Date(),
      answers,
    };
    await enrollment.save();

    return {
      evaluationType: 'mid_term',
      score,
      passed,
      passingScore: passingThreshold,
      message: passed
        ? `Mid-Term Evaluation passed with ${score}%! The second half of the course is now unlocked.`
        : `Mid-Term Evaluation score (${score}%) is below the required ${passingThreshold}% threshold. The second half remains locked. Please review the first half lessons and retake the evaluation.`,
    };
  }

  // Final evaluation
  if (enrollment.progressPercentage < 100) {
    const err = new Error('Final evaluation is locked. You must complete 100% of curriculum lessons first.');
    err.statusCode = 403;
    throw err;
  }

  // Check if midpoint evaluation existed and was passed
  const midpointConfig = await SkillEvaluation.findOne({
    skillExchange: skillExchangeId,
    evaluationType: 'mid_term',
  });

  if (midpointConfig && !enrollment.midpointEvaluation?.passed) {
    const err = new Error('You must successfully complete and pass the midpoint evaluation before taking the final evaluation.');
    err.statusCode = 403;
    throw err;
  }

  const evaluation = await SkillEvaluation.findOne({
    skillExchange: skillExchangeId,
    evaluationType: 'final',
  });

  if (!evaluation) {
    throw new Error('No final evaluation found for this skill course.');
  }

  let correctAnswers = 0;
  evaluation.questions.forEach((q, idx) => {
    if (answers[idx] !== undefined && answers[idx] === q.correctOptionIndex) {
      correctAnswers += 1;
    }
  });

  const totalQuestions = evaluation.questions.length || 1;
  const evaluationPercent = Math.round((correctAnswers / totalQuestions) * 100);
  const midScore = enrollment.midpointEvaluation?.score || evaluationPercent;

  // Composite final score: Final Eval (50%) + Midpoint Eval (20%) + Completion Rate (30%)
  const finalScore = Math.round(evaluationPercent * 0.5 + midScore * 0.2 + enrollment.progressPercentage * 0.3);
  const passed = evaluationPercent >= (evaluation.passingScore || 60);

  enrollment.finalEvaluation = {
    score: evaluationPercent,
    passed,
    completedAt: new Date(),
    answers,
  };

  if (!passed) {
    await enrollment.save();
    return {
      evaluationType: 'final',
      score: evaluationPercent,
      finalScore,
      passed: false,
      message: `Final evaluation score (${evaluationPercent}%) is below passing threshold (${evaluation.passingScore || 60}%). Please review the course materials and try again.`,
    };
  }

  // Assessed Level determination
  let assessedLevel = 'Intermediate';
  let badgeType = 'Silver';
  if (finalScore >= 90) {
    assessedLevel = 'Advanced Mastery';
    badgeType = 'Platinum';
  } else if (finalScore >= 80) {
    assessedLevel = 'Skilled Mastery';
    badgeType = 'Gold';
  } else if (finalScore >= 70) {
    assessedLevel = 'Proficient';
    badgeType = 'Silver';
  } else {
    assessedLevel = 'Foundational';
    badgeType = 'Bronze';
  }

  enrollment.status = 'completed';
  enrollment.completedAt = new Date();
  enrollment.finalScore = finalScore;
  enrollment.scoreBreakdown = {
    evaluationScore: evaluationPercent,
    completionRate: enrollment.progressPercentage,
    timelinessFactor: 100,
    methodologyNote:
      'Calculated: (Final Eval 50% + Midpoint Eval 20% + Completion Rate 30%). Peer Mastery Assessed Level.',
  };
  await enrollment.save();

  // Create verifiable achievement / Skill Card credential
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const verificationCode = `PX-${course.skillName.substring(0, 3).toUpperCase()}-${randomSuffix}`;

  const achievement = await Achievement.create({
    student: learnerId,
    tutor: course.tutor,
    skillExchange: course._id,
    skillName: course.skillName,
    skillLevel: course.skillLevel,
    assessedLevel,
    scoreAchieved: finalScore,
    badgeType,
    verificationCode,
    issuedDate: new Date(),
  });

  // Award Tutor points: 50 points per student course completion
  await updateTutorRank(course.tutor, 50);

  return {
    evaluationType: 'final',
    score: evaluationPercent,
    finalScore,
    assessedLevel,
    passed: true,
    achievement,
    enrollment,
    message: 'Congratulations! You have passed the evaluation and earned your verified Skill Card.',
  };
};

/**
 * 9. Submit Tutor Feedback
 * Enforces:
 * - Only eligible course participants with completed enrolment can submit feedback
 * - One feedback record allowed per completed enrolment
 * - Ratings and comments are saved
 * - Tutor points and rankings follow agreed rules
 */
export const submitTutorFeedback = async ({
  skillExchangeId,
  learnerId,
  rating,
  review = '',
  teachingClarity = 5,
  responsiveness = 5,
}) => {
  const enrollment = await SkillEnrollment.findOne({
    skillExchange: skillExchangeId,
    learner: learnerId,
  });

  if (!enrollment || enrollment.status !== 'completed') {
    const err = new Error('Only eligible course participants who have completed the course can submit tutor feedback.');
    err.statusCode = 403;
    throw err;
  }

  const existingFeedback = await SkillFeedback.findOne({ enrollment: enrollment._id });
  if (existingFeedback) {
    const err = new Error('One feedback record is allowed per completed enrolment. You have already submitted feedback.');
    err.statusCode = 400;
    throw err;
  }

  const numRating = Number(rating);
  if (!numRating || numRating < 1 || numRating > 5) {
    const err = new Error('Rating must be an integer between 1 and 5.');
    err.statusCode = 400;
    throw err;
  }

  const feedback = await SkillFeedback.create({
    enrollment: enrollment._id,
    skillExchange: skillExchangeId,
    learner: learnerId,
    tutor: enrollment.tutor,
    rating: numRating,
    review: review || '',
    teachingClarity: Number(teachingClarity) || 5,
    responsiveness: Number(responsiveness) || 5,
  });

  // Recalculate Course ratings
  const allCourseFeedbacks = await SkillFeedback.find({ skillExchange: skillExchangeId });
  const avgRating = Number(
    (allCourseFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allCourseFeedbacks.length).toFixed(1)
  );

  await SkillExchange.findByIdAndUpdate(skillExchangeId, {
    totalRatings: allCourseFeedbacks.length,
    ratingAverage: avgRating,
  });

  // Tutor Points & Ranking rules:
  // 5 stars: +25 pts, 4 stars: +15 pts, 3 stars: +10 pts, 1-2 stars: +5 pts
  let feedbackPoints = 5;
  if (numRating === 5) feedbackPoints = 25;
  else if (numRating === 4) feedbackPoints = 15;
  else if (numRating === 3) feedbackPoints = 10;

  // Recalculate Tutor's global average rating
  const allTutorFeedbacks = await SkillFeedback.find({ tutor: enrollment.tutor });
  const tutorAvgRating = Number(
    (allTutorFeedbacks.reduce((sum, f) => sum + f.rating, 0) / allTutorFeedbacks.length).toFixed(1)
  );

  const updatedTutorRank = await updateTutorRank(enrollment.tutor, feedbackPoints, tutorAvgRating);

  return {
    success: true,
    message: 'Tutor feedback and rating recorded successfully.',
    feedback,
    tutorRank: updatedTutorRank,
  };
};

/**
 * 10. Update Tutor Rank and points
 */
export const updateTutorRank = async (tutorId, additionalPoints = 0, newAvgRating = null) => {
  let tutorRank = await TutorRank.findOne({ tutor: tutorId });
  if (!tutorRank) {
    tutorRank = new TutorRank({ tutor: tutorId, totalPoints: 100, averageRating: 5.0 });
  }

  tutorRank.totalPoints += additionalPoints;
  if (additionalPoints > 0 && !newAvgRating) {
    tutorRank.totalStudentsTaught = (tutorRank.totalStudentsTaught || 0) + 1;
  }

  if (newAvgRating !== null) {
    tutorRank.averageRating = newAvgRating;
  }

  // Determine rank tier
  if (tutorRank.totalPoints >= 1000) {
    tutorRank.rankTier = 'Mentor';
  } else if (tutorRank.totalPoints >= 500) {
    tutorRank.rankTier = 'Expert Tutor';
  } else if (tutorRank.totalPoints >= 250) {
    tutorRank.rankTier = 'Skilled Tutor';
  } else {
    tutorRank.rankTier = 'Starter Tutor';
  }

  await tutorRank.save();
  return tutorRank;
};
