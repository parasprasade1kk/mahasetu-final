import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  logId: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetResource: string;
  targetId?: string;
  status: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    logId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    actorId: {
      type: String,
      required: true,
      index: true,
    },
    actorRole: {
      type: String,
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      index: true,
    },
    targetResource: {
      type: String,
      required: true,
      index: true,
    },
    targetId: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['SUCCESS', 'FAILURE', 'WARNING'],
      default: 'SUCCESS',
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
      type: String,
      default: '',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ timestamp: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
