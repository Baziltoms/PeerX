import mongoose from 'mongoose';

const analyticsEventSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    eventType: {
      type: String,
      required: true,
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: String,
  },
  { timestamps: true }
);

const auditLogSchema = new mongoose.Schema(
  {
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetResource: {
      type: String,
      required: true,
    },
    targetId: String,
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export const AuditLog = mongoose.model('AuditLog', auditLogSchema);
