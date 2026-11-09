import mongoose from 'mongoose';

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Institution name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Institution code is required'],
      uppercase: true,
      trim: true,
    },
    universityCollegeId: {
      type: String,
      required: [true, 'University/College verification ID is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    adminUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      unique: true,
      sparse: true,
    },
    website: {
      type: String,
      default: '',
    },
    email: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
      country: { type: String, default: 'India' },
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'verified',
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export const Institution = mongoose.model('Institution', institutionSchema);
