import mongoose, { Schema, Model, Document as MongooseDocument } from 'mongoose';

export interface IDocumentItem extends MongooseDocument {
  documentId: string;
  userId: string;
  documentType: string;
  documentName: string;
  documentNameMr?: string;
  authorityEn?: string;
  authorityMr?: string;
  issueDate?: string;
  certNo?: string;
  source: string;
  verificationStatus: string;
  verified: boolean;
  uploadedAt: Date;
  verifiedAt: Date;
  expiryDate?: string;
  fileUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DocumentSchema = new Schema<IDocumentItem>(
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
      default: 'Demo Government Connector',
      index: true,
    },
    verificationStatus: {
      type: String,
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

export const Document: Model<IDocumentItem> =
  mongoose.models.Document || mongoose.model<IDocumentItem>('Document', DocumentSchema);
