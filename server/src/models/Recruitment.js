import mongoose from 'mongoose';

const requirementSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    requiredSkills: [String],
    preferredSkills: [String],
    minCgpa: {
      type: Number,
      default: 7.0,
    },
    eligibleCourses: [String],
    graduationYear: {
      type: Number,
      default: 2026,
    },
    preferredInstitutions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Institution',
      },
    ],
    minSkillLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate',
    },
    maxBacklogs: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const opportunitySchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyProfile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
    },
    title: {
      type: String,
      required: [true, 'Opportunity title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Internship', 'Contract'],
      default: 'Full-time',
    },
    workMode: {
      type: String,
      enum: ['Remote', 'Hybrid', 'On-site'],
      default: 'Hybrid',
    },
    location: {
      type: String,
      default: 'Bengaluru, India',
    },
    salaryOrStipend: {
      type: String,
      default: '₹8 - ₹12 LPA',
    },
    minCgpa: {
      type: Number,
      default: 7.5,
    },
    eligibleCourses: {
      type: [String],
      default: ['MCA', 'B.Tech CS', 'M.Tech CS'],
    },
    graduationYear: {
      type: Number,
      default: 2026,
    },
    requiredSkills: [String],
    deadline: {
      type: Date,
      required: true,
    },
    vacancies: {
      type: Number,
      default: 5,
    },
    status: {
      type: String,
      enum: ['Active', 'Closed', 'Draft'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

const candidateStatusHistorySchema = new mongoose.Schema(
  {
    stage: {
      type: String,
      enum: ['Matched', 'Shortlisted', 'Screening', 'Interview', 'Selected', 'Rejected'],
      required: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    note: {
      type: String,
      default: '',
    },
  },
  { _id: false }
);

const candidateShortlistSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
    },
    status: {
      type: String,
      enum: ['Matched', 'Shortlisted', 'Screening', 'Interview', 'Selected', 'Rejected'],
      default: 'Shortlisted',
    },
    matchScore: {
      type: Number,
      default: 0,
    },
    notes: {
      type: String,
      default: '',
    },
    statusHistory: [candidateStatusHistorySchema],
  },
  { timestamps: true }
);

candidateShortlistSchema.index({ company: 1, student: 1 }, { unique: true });

const recruitmentApplicationSchema = new mongoose.Schema(
  {
    opportunity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Opportunity',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['New', 'Shortlisted', 'Screening', 'Interview', 'Selected', 'Rejected'],
      default: 'New',
    },
    coverLetter: {
      type: String,
      default: '',
    },
    matchScoreAtApplication: {
      type: Number,
      default: 0,
    },
    statusHistory: [candidateStatusHistorySchema],
  },
  { timestamps: true }
);

recruitmentApplicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });

export const Requirement = mongoose.model('Requirement', requirementSchema);
export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
export const CandidateShortlist = mongoose.model('CandidateShortlist', candidateShortlistSchema);
export const RecruitmentApplication = mongoose.model('RecruitmentApplication', recruitmentApplicationSchema);
