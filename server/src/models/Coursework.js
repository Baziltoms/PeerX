import mongoose from 'mongoose';

const studyMaterialSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Material title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    materialType: {
      type: String,
      enum: ['PDF', 'PPT', 'DOC', 'Notes', 'Video Link', 'ZIP', 'External Link'],
      default: 'PDF',
    },
    fileUrl: {
      type: String,
      required: true,
    },
    externalUrl: {
      type: String,
      default: '',
    },
    unitCategory: {
      type: String,
      enum: ['Unit 1', 'Unit 2', 'Unit 3', 'Unit 4', 'Unit 5', 'Previous Papers', 'Assignments', 'References'],
      default: 'Unit 1',
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    availabilityDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Assignment title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    instructions: {
      type: String,
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    deadline: {
      type: Date,
      required: [true, 'Submission deadline is required'],
    },
    maxMarks: {
      type: Number,
      default: 100,
    },
  },
  { timestamps: true }
);

const submissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    fileUrl: {
      type: String,
      default: '',
    },
    submissionText: {
      type: String,
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['submitted', 'late', 'graded', 'resubmitted'],
      default: 'submitted',
    },
    marksAwarded: {
      type: Number,
      min: 0,
    },
    feedback: {
      type: String,
      default: '',
    },
    gradedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    gradedAt: Date,
  },
  { timestamps: true }
);

submissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

export const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);
export const Assignment = mongoose.model('Assignment', assignmentSchema);
export const Submission = mongoose.model('Submission', submissionSchema);
