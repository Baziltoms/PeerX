import mongoose from 'mongoose';

const skillExchangeSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Skill course title is required'],
      trim: true,
    },
    skillName: {
      type: String,
      required: [true, 'Skill name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    skillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    prerequisites: [String],
    learningOutcomes: [String],
    estimatedDuration: {
      type: String,
      default: '3 Weeks',
    },
    tags: [String],
    ratingAverage: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'archived', 'draft'],
      default: 'active',
    },
    meetingLink: {
      type: String,
      default: 'https://meet.jit.si/PeerX-StudyRoom',
    },
  },
  { timestamps: true }
);

const skillModuleSchema = new mongoose.Schema(
  {
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    orderIndex: {
      type: Number,
      required: true, // 1-indexed
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    isInitialUnlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

skillModuleSchema.index({ skillExchange: 1, orderIndex: 1 }, { unique: true });

const skillLessonSchema = new mongoose.Schema(
  {
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    skillModule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillModule',
      required: true,
    },
    orderIndex: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    resourcePdfUrl: {
      type: String,
      default: '',
    },
    videoUrl: {
      type: String,
      default: '',
    },
    durationMinutes: {
      type: Number,
      default: 20,
    },
    materialType: {
      type: String,
      enum: ['youtube', 'video_recording', 'document', 'article_notes'],
      default: 'youtube',
    },
    youtubeUrl: {
      type: String,
      default: '',
    },
    videoRecordingUrl: {
      type: String,
      default: '',
    },
    documentUrl: {
      type: String,
      default: '',
    },
    documentName: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const skillEnrollmentSchema = new mongoose.Schema(
  {
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'active', 'rejected', 'completed', 'dropped'],
      default: 'pending',
    },
    requestMessage: {
      type: String,
      default: '',
    },
    reviewedAt: Date,
    currentModuleOrder: {
      type: Number,
      default: 1, // Only Module 1 unlocked initially
    },
    completedLessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SkillLesson',
      },
    ],
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    midpointEvaluation: {
      score: { type: Number, default: 0 },
      passed: { type: Boolean, default: false },
      completedAt: Date,
      answers: [Number],
    },
    finalEvaluation: {
      score: { type: Number, default: 0 },
      passed: { type: Boolean, default: false },
      completedAt: Date,
      answers: [Number],
    },
    finalScore: {
      type: Number,
      default: 0,
    },
    scoreBreakdown: {
      evaluationScore: { type: Number, default: 0 },
      completionRate: { type: Number, default: 0 },
      timelinessFactor: { type: Number, default: 0 },
      methodologyNote: {
        type: String,
        default: 'Score = (Evaluation % * 0.5) + (Completion % * 0.3) + (Prompt Completion Speed * 0.2). Not a hiring guarantee.',
      },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
  },
  { timestamps: true }
);

skillEnrollmentSchema.index({ learner: 1, skillExchange: 1 }, { unique: true });

const lessonProgressSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillEnrollment',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillLesson',
      required: true,
    },
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillModule',
      required: true,
    },
    isViewed: {
      type: Boolean,
      default: false,
    },
    viewedAt: Date,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

lessonProgressSchema.index({ enrollment: 1, lesson: 1 }, { unique: true });

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctOptionIndex: { type: Number, required: true },
    points: { type: Number, default: 10 },
  },
  { _id: true }
);

const skillEvaluationSchema = new mongoose.Schema(
  {
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    evaluationType: {
      type: String,
      enum: ['mid_term', 'final'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
    passingScore: {
      type: Number,
      default: 60,
    },
  },
  { timestamps: true }
);

const skillFeedbackSchema = new mongoose.Schema(
  {
    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillEnrollment',
      required: true,
    },
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    learner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    review: {
      type: String,
      default: '',
    },
    teachingClarity: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    responsiveness: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
  },
  { timestamps: true }
);

skillFeedbackSchema.index({ enrollment: 1 }, { unique: true });

const tutorRankSchema = new mongoose.Schema(
  {
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    totalPoints: {
      type: Number,
      default: 100,
    },
    rankTier: {
      type: String,
      enum: ['Starter Tutor', 'Skilled Tutor', 'Expert Tutor', 'Mentor'],
      default: 'Starter Tutor',
    },
    totalStudentsTaught: {
      type: Number,
      default: 0,
    },
    averageRating: {
      type: Number,
      default: 5.0,
    },
  },
  { timestamps: true }
);

const achievementSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    skillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
      required: true,
    },
    skillName: {
      type: String,
      required: true,
    },
    skillLevel: {
      type: String,
      default: 'Intermediate',
    },
    assessedLevel: {
      type: String,
      default: 'Intermediate',
    },
    scoreAchieved: {
      type: Number,
      required: true,
    },
    badgeType: {
      type: String,
      enum: ['Bronze', 'Silver', 'Gold', 'Platinum'],
      default: 'Gold',
    },
    verificationCode: {
      type: String,
      required: true,
      unique: true,
    },
    issuedDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const SkillExchange = mongoose.model('SkillExchange', skillExchangeSchema);
export const SkillModule = mongoose.model('SkillModule', skillModuleSchema);
export const SkillLesson = mongoose.model('SkillLesson', skillLessonSchema);
export const SkillEnrollment = mongoose.model('SkillEnrollment', skillEnrollmentSchema);
export const LessonProgress = mongoose.model('LessonProgress', lessonProgressSchema);
export const SkillEvaluation = mongoose.model('SkillEvaluation', skillEvaluationSchema);
export const SkillFeedback = mongoose.model('SkillFeedback', skillFeedbackSchema);
export const TutorRank = mongoose.model('TutorRank', tutorRankSchema);
export const Achievement = mongoose.model('Achievement', achievementSchema);
