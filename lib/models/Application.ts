import mongoose, { Schema, Model, Document } from 'mongoose';

export interface ISmartDocumentItem {
  documentId?: string;
  documentType?: string;
  documentName?: string;
  source?: string;
  consentGranted?: boolean;
  retrievalTime?: Date;
  verificationStatus?: string;
  fileUrl?: string;
}

export interface IApplication extends Document {
  applicationId: string;
  userId: string;
  applicantName: string;
  serviceId?: string;
  schemeId?: string;
  serviceName: string;
  serviceNameMr?: string;
  department: string;
  departmentMr?: string;
  appliedDate: string;
  status: string;
  statusColor?: string;
  district?: string;
  formData?: any;
  smartDocumentPack?: ISmartDocumentItem[];
  downloadUrl?: string;
  applicationRoute?: string;
  applicationType?: 'scheme' | 'service';
  remarks?: string;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SmartDocumentItemSchema = new Schema<ISmartDocumentItem>(
  {
    documentId: String,
    documentType: String,
    documentName: String,
    source: {
      type: String,
      default: 'Demo Government Connector',
    },
    consentGranted: { type: Boolean, default: true },
    retrievalTime: { type: Date, default: Date.now },
    verificationStatus: {
      type: String,
      default: 'Verified',
    },
    fileUrl: { type: String, default: '' },
  },
  { _id: false }
);

const ApplicationSchema = new Schema<IApplication>(
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
      type: Schema.Types.Mixed,
      default: {},
    },
    smartDocumentPack: {
      type: [SmartDocumentItemSchema],
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

ApplicationSchema.index({ userId: 1, createdAt: -1 });

export const Application: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);
