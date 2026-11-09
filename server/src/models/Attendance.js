import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema(
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
    periodNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },
    date: {
      type: Date,
      required: true,
    },
    totalStudents: {
      type: Number,
      default: 0,
    },
    presentCount: {
      type: Number,
      default: 0,
    },
    absentCount: {
      type: Number,
      default: 0,
    },
    lateCount: {
      type: Number,
      default: 0,
    },
    excusedCount: {
      type: Number,
      default: 0,
    },
    editableUntil: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24-hour edit window
    },
    topicCovered: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceSessionSchema.index(
  { institution: 1, classSection: 1, subject: 1, date: 1, periodNumber: 1 },
  { unique: true }
);

const attendanceSchema = new mongoose.Schema(
  {
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
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
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    periodNumber: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late', 'Excused'],
      default: 'Present',
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceSchema.index(
  { student: 1, subject: 1, date: 1, periodNumber: 1 },
  { unique: true }
);

export const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
export const Attendance = mongoose.model('Attendance', attendanceSchema);
