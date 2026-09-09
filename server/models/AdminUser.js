const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
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

module.exports = mongoose.models.AdminUser || mongoose.model('AdminUser', adminUserSchema);
