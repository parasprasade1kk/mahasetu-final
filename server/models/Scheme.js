const mongoose = require('mongoose');

const schemeDocumentSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    nameMr: { type: String, default: '' },
    source: { type: String, default: 'Authorized Department' },
    sourceMr: { type: String, default: '' },
    available: { type: Boolean, default: false },
  },
  { _id: false }
);

const schemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    nameMr: {
      type: String,
      trim: true,
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
    departmentKey: {
      type: String,
      default: 'general',
      index: true,
    },
    category: {
      type: String,
      default: 'Welfare',
      index: true,
    },
    categoryMr: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    descriptionMr: {
      type: String,
      default: '',
    },
    benefits: {
      type: String,
      default: '',
    },
    benefitsMr: {
      type: String,
      default: '',
    },
    disbursementMode: {
      type: String,
      default: 'Direct Benefit Transfer (DBT)',
    },
    disbursementModeMr: {
      type: String,
      default: '',
    },
    eligibility: {
      type: [String],
      default: [],
    },
    eligibilityMr: {
      type: [String],
      default: [],
    },
    incomeCriteria: {
      type: String,
      default: 'No income limit',
    },
    ageCriteria: {
      type: String,
      default: 'All age groups',
    },

    // Structured rule engine fields
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 120 },
    incomeLimit: { type: Number, default: 0 },
    incomeOperator: {
      type: String,
      enum: ['less_than_or_equal', 'greater_than_or_equal', 'between', 'none'],
      default: 'none',
    },
    allowedCategories: { type: [String], default: [] },
    educationLevels: { type: [String], default: [] },
    occupations: { type: [String], default: [] },
    disabilityRequired: { type: Boolean, default: false },
    residencyRequired: { type: Boolean, default: true },
    studentRequired: { type: Boolean, default: false },

    requiredDocuments: {
      type: [schemeDocumentSchema],
      default: [],
    },
    keywords: {
      type: [String],
      default: [],
      index: true,
    },
    problemTypes: {
      type: [String],
      default: [],
      index: true,
    },
    applicationRoute: {
      type: String,
      required: true,
    },
    applicationType: {
      type: String,
      enum: ['scheme', 'service'],
      default: 'scheme',
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Text index for AI Scheme search
schemeSchema.index({
  name: 'text',
  description: 'text',
  benefits: 'text',
  keywords: 'text',
  problemTypes: 'text',
});

module.exports = mongoose.models.Scheme || mongoose.model('Scheme', schemeSchema);
