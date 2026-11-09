import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      uppercase: true,
      trim: true,
    },
    hodName: {
      type: String,
      default: '',
    },
    hodUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    description: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

departmentSchema.index({ institution: 1, code: 1 }, { unique: true });

const subjectSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    credits: {
      type: Number,
      default: 4,
    },
    type: {
      type: String,
      enum: ['Theory', 'Practical', 'Seminar', 'Project'],
      default: 'Theory',
    },
  },
  { timestamps: true }
);

subjectSchema.index({ institution: 1, code: 1 }, { unique: true });

const classSectionSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    academicYear: {
      type: String,
      default: '2025-2026',
    },
    roomNumber: {
      type: String,
      default: 'Hall 201',
    },
    facultyAdvisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const timetableSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: function() { return this.sessionType !== 'Break'; },
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: function() { return this.sessionType !== 'Break'; },
    },
    classSection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ClassSection',
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      default: 'Hall 201',
    },
    sessionType: {
      type: String,
      enum: ['Lecture', 'Lab', 'Tutorial', 'Break'],
      default: 'Lecture',
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

timetableSchema.index(
  { institution: 1, classSection: 1, dayOfWeek: 1, periodNumber: 1 },
  { unique: true }
);

const examSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['Internal Assessment 1', 'Internal Assessment 2', 'Midterm', 'Final Semester', 'Lab Practical'],
      default: 'Internal Assessment 1',
    },
    semester: {
      type: Number,
      required: true,
    },
    startDate: Date,
    endDate: Date,
    status: {
      type: String,
      enum: ['Scheduled', 'Ongoing', 'Completed'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

const markSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    maxMarks: {
      type: Number,
      required: true,
      default: 50,
    },
    marksObtained: {
      type: Number,
      required: true,
      min: 0,
    },
    grade: {
      type: String,
      default: 'A',
    },
    feedback: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

markSchema.index({ exam: 1, subject: 1, student: 1 }, { unique: true });

export const Department = mongoose.model('Department', departmentSchema);
export const Subject = mongoose.model('Subject', subjectSchema);
export const ClassSection = mongoose.model('ClassSection', classSectionSchema);
export const Timetable = mongoose.model('Timetable', timetableSchema);
export const Exam = mongoose.model('Exam', examSchema);
export const Mark = mongoose.model('Mark', markSchema);
