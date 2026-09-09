import mongoose, { Schema, Model, Document } from 'mongoose';

export interface IProfile extends Document {
  userId: string;
  fullName: string;
  mobile: string;
  dob?: string;
  age?: number;
  gender?: string;
  maritalStatus?: string;
  religion?: string;
  state?: string;
  district?: string;
  taluka?: string;
  villageCity?: string;
  pinCode?: string;
  category?: string;
  annualIncomeTier?: string;
  annualIncomeAmount?: number;
  occupation?: string;
  educationLevel?: string;
  isStudent?: boolean;
  currentCourse?: string;
  courseClass?: string;
  institutionType?: string;
  academicYear?: string;
  hasDisability?: boolean;
  disabilityType?: string;
  disabilityPercentage?: number;
  schemeInterests?: string[];
  preferredLanguage?: 'mr' | 'hi' | 'en';
  governmentRequirements?: string;
  confirmedAccurate?: boolean;
  consentAccepted?: boolean;
  completedAt?: Date | null;
  digiLockerLinked?: boolean;
  digiLockerId?: string;
  digiLockerLinkedAt?: Date | null;
  aadhaarMasked?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProfileSchema = new Schema<IProfile>(
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
    dob: { type: String, default: '' },
    age: { type: Number, default: 0 },
    gender: { type: String, default: 'Male' },
    maritalStatus: { type: String, default: 'Single' },
    religion: { type: String, default: 'Hindu' },

    state: { type: String, default: 'Maharashtra' },
    district: { type: String, default: 'Pune', index: true },
    taluka: { type: String, default: '' },
    villageCity: { type: String, default: '' },
    pinCode: { type: String, default: '' },

    category: { type: String, default: 'General/Open', index: true },
    annualIncomeTier: { type: String, default: '1L-2.5L' },
    annualIncomeAmount: { type: Number, default: 150000, index: true },
    occupation: { type: String, default: 'Farmer', index: true },
    educationLevel: { type: String, default: 'Graduate' },

    isStudent: { type: Boolean, default: false },
    currentCourse: { type: String, default: '' },
    courseClass: { type: String, default: '' },
    institutionType: { type: String, default: '' },
    academicYear: { type: String, default: '' },

    hasDisability: { type: Boolean, default: false },
    disabilityType: { type: String, default: '' },
    disabilityPercentage: { type: Number, default: 0 },

    schemeInterests: { type: [String], default: [] },
    preferredLanguage: { type: String, enum: ['mr', 'hi', 'en'], default: 'mr' },
    governmentRequirements: { type: String, default: '' },

    confirmedAccurate: { type: Boolean, default: false },
    consentAccepted: { type: Boolean, default: true },
    completedAt: { type: Date, default: null },

    digiLockerLinked: { type: Boolean, default: false },
    digiLockerId: { type: String, default: '' },
    digiLockerLinkedAt: { type: Date, default: null },
    aadhaarMasked: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

export const Profile: Model<IProfile> =
  mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
