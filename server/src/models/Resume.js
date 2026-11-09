import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    templateId: {
      type: String,
      enum: ['modern_tech', 'classic_academic', 'executive_minimal'],
      default: 'modern_tech',
    },
    headline: {
      type: String,
      default: 'MCA Student & Full Stack Software Engineer',
    },
    summary: {
      type: String,
      default: '',
    },
    contactInfo: {
      fullName: String,
      email: String,
      phone: String,
      location: String,
      linkedin: String,
      github: String,
      portfolio: String,
    },
    education: [
      {
        degree: String,
        institution: String,
        score: String,
        year: String,
      },
    ],
    skills: [
      {
        category: String,
        items: [String],
      },
    ],
    peerAchievements: [
      {
        skillName: String,
        level: String,
        score: Number,
        badgeType: String,
        verificationCode: String,
      },
    ],
    experience: [
      {
        role: String,
        company: String,
        duration: String,
        location: String,
        description: String,
      },
    ],
    projects: [
      {
        title: String,
        description: String,
        techStack: [String],
        link: String,
      },
    ],
    certifications: [
      {
        title: String,
        issuer: String,
        year: String,
      },
    ],
    lastGeneratedAt: Date,
  },
  { timestamps: true }
);

const resumeGenerationSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    nextEligibleAt: {
      type: Date,
      default: Date.now,
    },
    templateUsed: {
      type: String,
      default: 'modern_tech',
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

resumeGenerationSchema.index({ student: 1, generatedAt: -1 });

const resumeFeedbackSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      default: 5,
    },
    suggestions: {
      type: String,
      default: '',
      trim: true,
    },
    templateUsed: {
      type: String,
      default: 'modern_tech',
    },
  },
  { timestamps: true }
);

resumeFeedbackSchema.index({ student: 1, createdAt: -1 });

export const Resume = mongoose.model('Resume', resumeSchema);
export const ResumeGeneration = mongoose.model('ResumeGeneration', resumeGenerationSchema);
export const ResumeFeedback = mongoose.model('ResumeFeedback', resumeFeedbackSchema);
