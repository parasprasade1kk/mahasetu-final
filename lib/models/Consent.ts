import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IConsent extends Document {
  consentId: string;
  userId: string;
  requestingDept: string;
  requestingDeptMr?: string;
  sourceDept: string;
  sourceDeptMr?: string;
  purpose: string;
  purposeMr?: string;
  dataFields: string[];
  status: 'Active' | 'Revoked' | 'Pending Approval';
  validUntil: string;
  source?: string;
  actor?: string;
  grantedAt?: Date;
  revokedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ConsentSchema = new Schema<IConsent>(
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

ConsentSchema.index({ userId: 1, consentId: 1 }, { unique: true });

export const Consent: Model<IConsent> =
  mongoose.models.Consent || mongoose.model<IConsent>('Consent', ConsentSchema);
