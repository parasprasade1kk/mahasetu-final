const mongoose = require('mongoose');

const consentSchema = new mongoose.Schema(
  {
    consentId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    requestingDept: {
      type: String,
      required: true,
    },
    requestingDeptMr: {
      type: String,
      default: '',
    },
    sourceDept: {
      type: String,
      required: true,
    },
    sourceDeptMr: {
      type: String,
      default: '',
    },
    purpose: {
      type: String,
      required: true,
    },
    purposeMr: {
      type: String,
      default: '',
    },
    dataFields: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: ['Active', 'Revoked', 'Pending Approval'],
      default: 'Active',
      index: true,
    },
    validUntil: {
      type: String,
      default: '31 Mar 2027',
    },
    source: {
      type: String,
      default: 'MahaSetu Consent Gateway',
    },
    actor: {
      type: String,
      default: 'Citizen',
    },
    grantedAt: {
      type: Date,
      default: Date.now,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index so a user can't have duplicate consentId
consentSchema.index({ userId: 1, consentId: 1 }, { unique: true });

module.exports = mongoose.models.Consent || mongoose.model('Consent', consentSchema);
