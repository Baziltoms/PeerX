import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email'],
    },
    passwordHash: {
      type: String,
      required: [true, 'Please provide password'],
      select: false, // Never return password in queries by default
    },
    role: {
      type: String,
      enum: ['student', 'faculty', 'admin', 'company'],
      required: [true, 'User role is required'],
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Institution',
      required: function () {
        return this.role !== 'company'; // Companies are not bound to a single institution
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isHod: {
      type: Boolean,
      default: false,
    },
    isFa: {
      type: Boolean,
      default: false,
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (password) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const User = mongoose.model('User', userSchema);
