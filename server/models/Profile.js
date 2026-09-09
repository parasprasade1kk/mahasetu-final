const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema(
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
    mobile: {
      type: String,
      required: true,
      index: true,
      trim: true,
    },
    dob: {
      type: String,
      default: '',
    },
    age: {
      type: Number,
      default: 0,
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Transgender', ''],
      default: 'Male',
    },
    maritalStatus: {
      type: String,
      enum: ['Single', 'Married', 'Divorced', 'Widowed', ''],
      default: 'Single',
    },
    religion: {
      type: String,
      default: 'Hindu',
    },

    // Location
    state: {
      type: String,
      default: 'Maharashtra',
    },
    district: {
      type: String,
      default: 'Pune',
      index: true,
    },
    taluka: {
      type: String,
      default: '',
    },
    villageCity: {
      type: String,
      default: '',
    },
    pinCode: {
      type: String,
      default: '',
    },

    // Socio-economic
    category: {
      type: String,
      default: 'General/Open',
      index: true,
    },
    annualIncomeTier: {
      type: String,
      default: '1L-2.5L',
    },
    annualIncomeAmount: {
      type: Number,
      default: 150000,
      index: true,
    },
    occupation: {
      type: String,
      default: 'Farmer',
      index: true,
    },
    educationLevel: {
      type: String,
      default: 'Graduate',
    },

    // Student Information
    isStudent: {
      type: Boolean,
      default: false,
    },
    currentCourse: {
      type: String,
      default: '',
    },
    courseClass: {
      type: String,
      default: '',
    },
    institutionType: {
      type: String,
      default: '',
    },
    academicYear: {
      type: String,
      default: '',
    },

    // Disability Information
    hasDisability: {
      type: Boolean,
      default: false,
    },
    disabilityType: {
      type: String,
      default: '',
    },
    disabilityPercentage: {
      type: Number,
      default: 0,
    },

    // Preferences & Requirements
    schemeInterests: {
      type: [String],
      default: [],
    },
    preferredLanguage: {
      type: String,
      enum: ['mr', 'hi', 'en'],
      default: 'mr',
    },
    governmentRequirements: {
      type: String,
      default: '',
    },

    // Confirmation & DPDP Consent Info
    confirmedAccurate: {
      type: Boolean,
      default: false,
    },
    consentAccepted: {
      type: Boolean,
      default: true,
    },
    completedAt: {
      type: Date,
      default: null,
    },

    // DigiLocker Status
    digiLockerLinked: {
      type: Boolean,
      default: false,
    },
    digiLockerId: {
      type: String,
      default: '',
    },
    digiLockerLinkedAt: {
      type: Date,
      default: null,
    },
    aadhaarMasked: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.models.Profile || mongoose.model('Profile', profileSchema);
