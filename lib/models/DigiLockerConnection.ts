import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IDigiLockerConnection extends Document {
  userId: string;
  isConnected: boolean;
  linkedAt?: Date | null;
  digiLockerId?: string;
  maskedAadhaar?: string;
  consentGiven?: boolean;
  documentsRetrieved?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DigiLockerConnectionSchema = new Schema<IDigiLockerConnection>(
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

export const DigiLockerConnection: Model<IDigiLockerConnection> =
  mongoose.models.DigiLockerConnection ||
  mongoose.model<IDigiLockerConnection>('DigiLockerConnection', DigiLockerConnectionSchema);
