const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    documentId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    documentType: {
      type: String,
      required: true,
      index: true,
    },
    documentName: {
      type: String,
      required: true,
    },
    documentNameMr: {
      type: String,
      default: '',
    },
    authorityEn: {
      type: String,
      default: 'Government Authority',
    },
    authorityMr: {
      type: String,
      default: '',
    },
    issueDate: {
      type: String,
      default: '',
    },
    certNo: {
      type: String,
      default: '',
    },
    source: {
      type: String,
      enum: ['DigiLocker', 'Demo Government Connector', 'User Upload', 'Government API'],
      default: 'Demo Government Connector',
      index: true,
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Citizen Uploaded', 'Rejected'],
      default: 'Verified',
      index: true,
    },
    verified: {
      type: Boolean,
      default: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: String,
      default: 'Permanent / Valid',
    },
    fileUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Document || mongoose.model('Document', documentSchema);
