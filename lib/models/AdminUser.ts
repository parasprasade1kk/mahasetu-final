import mongoose, { Schema, Model } from 'mongoose';

export interface IAdminUser {
  adminId: string;
  name: string;
  department: string;
  role: 'admin' | 'superadmin';
  passwordHash: string;
  lastLogin?: Date | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const AdminUserSchema = new Schema<IAdminUser>(
  {
    adminId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      default: 'Government Administrative Officer',
    },
    department: {
      type: String,
      default: 'General Administration Department (GAD), Mantralaya',
    },
    role: {
      type: String,
      enum: ['admin', 'superadmin'],
      default: 'admin',
    },
    passwordHash: {
      type: String,
      required: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export const AdminUser: Model<IAdminUser> =
  mongoose.models.AdminUser || mongoose.model<IAdminUser>('AdminUser', AdminUserSchema);
