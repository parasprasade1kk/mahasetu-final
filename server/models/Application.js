const mongoose = require('mongoose');

const smartDocumentItemSchema = new mongoose.Schema(
  {
    documentId: String,
    documentType: String,
    documentName: String,
    source: {
      type: String,
      enum: ['DigiLocker', 'Demo Government Connector', 'User Upload', 'Government API'],
      default: 'Demo Government Connector',
    },
    consentGranted: { type: Boolean, default: true },
    retrievalTime: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending Verification', 'Citizen Uploaded', 'Rejected'],
      default: 'Verified',
    },
    fileUrl: { type: String, default: '' },
  },
  { _id: false }
);

const applicationSchema = new mongoose.Schema(
  {
    applicationId: {
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
    applicantName: {
      type: String,
      required: true,
    },
    serviceId: {
      type: String,
      default: '',
      index: true,
    },
    schemeId: {
      type: String,
      default: '',
      index: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    serviceNameMr: {
      type: String,
      default: '',
    },
    department: {
      type: String,
      required: true,
      index: true,
    },
    departmentMr: {
      type: String,
      default: '',
    },
    appliedDate: {
      type: String,
      default: () =>
        new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    },
    status: {
      type: String,
      enum: [
        'Draft',
        'Submitted',
        'Under Review',
        'Documents Required',
        'Approved',
        'Rejected',
        'Completed',
      ],
      default: 'Submitted',
      index: true,
    },
    statusColor: {
      type: String,
      default: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    district: {
      type: String,
      default: 'Maharashtra',
    },
    formData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    smartDocumentPack: {
      type: [smartDocumentItemSchema],
      default: [],
    },
    downloadUrl: {
      type: String,
      default: '#',
    },
    applicationRoute: {
      type: String,
      default: '',
    },
    applicationType: {
      type: String,
      enum: ['scheme', 'service'],
      default: 'scheme',
    },
    remarks: {
      type: String,
      default: '',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Application || mongoose.model('Application', applicationSchema);
