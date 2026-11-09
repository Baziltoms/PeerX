import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Announcement title is required'],
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium',
    },
    targetAudience: {
      type: [String],
      enum: ['all', 'student', 'faculty', 'department'],
      default: ['all'],
    },
    targetDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    viewsCount: {
      type: Number,
      default: 0,
    },
    scheduledFor: {
      type: Date,
      default: Date.now,
    },
    expiresAt: Date,
  },
  { timestamps: true }
);

const eventSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['Academic', 'Cultural', 'Sports', 'Workshop', 'Placement', 'Holiday', 'Seminar'],
      default: 'Academic',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    venue: {
      type: String,
      required: true,
    },
    targetAudience: {
      type: [String],
      default: ['all'],
    },
    registrationLink: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['announcement', 'assignment', 'attendance', 'skill', 'message', 'complaint', 'approval', 'system'],
      default: 'system',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    link: {
      type: String,
      default: '',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

const conversationSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    title: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['direct', 'group', 'skill_exchange'],
      default: 'direct',
    },
    relatedSkillExchange: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillExchange',
    },
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageAt: {
      type: Date,
      default: Date.now,
    },
    activeStudyRoom: {
      isActive: {
        type: Boolean,
        default: false,
      },
      startedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      startedByName: {
        type: String,
        default: '',
      },
      startedAt: {
        type: Date,
      },
    },
  },
  { timestamps: true }
);

const messageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    isReadBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const complaintSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Complaint title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Academic', 'Infrastructure', 'Harassment', 'Hostel', 'Examination', 'Faculty', 'Other'],
      default: 'Academic',
    },
    status: {
      type: String,
      enum: ['Pending', 'In Progress', 'Resolved'],
      default: 'Pending',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    resolvedAt: Date,
  },
  { timestamps: true }
);

const approvalSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: true,
    },
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Event', 'StudentVerification', 'FacultyLeave', 'ComplaintEscalation', 'StudyTrip'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    details: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected'],
      default: 'Pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    remarks: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const Announcement = mongoose.model('Announcement', announcementSchema);
export const Event = mongoose.model('Event', eventSchema);
export const Notification = mongoose.model('Notification', notificationSchema);
export const Conversation = mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.model('Message', messageSchema);
export const Complaint = mongoose.model('Complaint', complaintSchema);
export const Approval = mongoose.model('Approval', approvalSchema);
