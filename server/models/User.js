const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
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
    aadhaarHash: {
      type: String,
      sparse: true,
      index: true,
    },
    aadhaarMasked: {
      type: String,
      required: true,
      trim: true,
    },
    aadhaarConsentGiven: {
      type: Boolean,
      default: false,
    },
    aadhaarConsentAt: {
      type: Date,
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
    },
    isVerified: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
