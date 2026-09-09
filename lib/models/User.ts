import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  fullName: string;
  fullNameMr?: string;
  mobile: string;
  aadhaarMasked: string;
  email?: string;
  role: 'citizen';
  isVerified: boolean;
  profileCompleted?: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    fullNameMr: {
      type: String,
      trim: true,
      default: '',
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    aadhaarMasked: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      default: '',
    },
    role: {
      type: String,
      enum: ['citizen'],
      default: 'citizen',
      index: true,
    },
    isVerified: {
      type: Boolean,
      default: true,
      index: true,
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ role: 1, isVerified: 1 });
UserSchema.index({ createdAt: -1 });

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
