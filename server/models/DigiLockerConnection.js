const mongoose = require('mongoose');

const digiLockerConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    isConnected: {
      type: Boolean,
      default: false,
    },
    linkedAt: {
      type: Date,
      default: null,
    },
    digiLockerId: {
      type: String,
      default: '',
    },
    maskedAadhaar: {
      type: String,
      default: '',
    },
    consentGiven: {
      type: Boolean,
      default: true,
    },
    documentsRetrieved: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DigiLockerConnection ||
  mongoose.model('DigiLockerConnection', digiLockerConnectionSchema);
