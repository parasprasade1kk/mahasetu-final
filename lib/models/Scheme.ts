import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISchemeDocument {
  id: string;
  name: string;
  nameMr?: string;
  source?: string;
  sourceMr?: string;
  available?: boolean;
}

export interface IScheme extends Document {
  schemeId: string;
  name: string;
  nameMr?: string;
  department: string;
  departmentMr?: string;
  departmentKey?: string;
  category?: string;
  categoryMr?: string;
  description?: string;
  descriptionMr?: string;
  benefits?: string;
  benefitsMr?: string;
  disbursementMode?: string;
  disbursementModeMr?: string;
  eligibility?: string[];
  eligibilityMr?: string[];
  incomeCriteria?: string;
  ageCriteria?: string;
  minAge?: number;
  maxAge?: number;
  incomeLimit?: number;
  incomeOperator?: string;
  allowedCategories?: string[];
  educationLevels?: string[];
  occupations?: string[];
  disabilityRequired?: boolean;
  residencyRequired?: boolean;
  studentRequired?: boolean;
  requiredDocuments?: ISchemeDocument[];
  keywords?: string[];
  problemTypes?: string[];
  applicationRoute: string;
  applicationType?: 'scheme' | 'service';
  active?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SchemeDocumentSchema = new Schema<ISchemeDocument>(
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

const SchemeSchema = new Schema<IScheme>(
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
    minAge: { type: Number, default: 0 },
    maxAge: { type: Number, default: 120 },
    incomeLimit: { type: Number, default: 0 },
    incomeOperator: {
      type: String,
      default: 'none',
    },
    allowedCategories: { type: [String], default: [] },
    educationLevels: { type: [String], default: [] },
    occupations: { type: [String], default: [] },
    disabilityRequired: { type: Boolean, default: false },
    residencyRequired: { type: Boolean, default: true },
    studentRequired: { type: Boolean, default: false },
    requiredDocuments: {
      type: [SchemeDocumentSchema],
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

export const Scheme: Model<IScheme> =
  mongoose.models.Scheme || mongoose.model<IScheme>('Scheme', SchemeSchema);
