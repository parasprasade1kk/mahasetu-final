// ─── Centralized Authentication & User Registry Configuration ─────────────────
// Only authorized citizens registered with the Government of Maharashtra can access MahaSetu.

export interface RegisteredUser {
  id: string;
  name: string;
  nameMr: string;
  mobile: string;
  email: string;
  aadhaarMasked: string;
  role: 'citizen';
}

export interface CitizenProfile {
  // Personal
  fullName: string;
  mobile: string;
  dob: string;
  age: number;
  gender: 'Male' | 'Female' | 'Transgender';
  category: 'General/Open' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'VJNT' | 'SBC';
  religion: 'Hindu' | 'Muslim' | 'Buddhist' | 'Christian' | 'Jain' | 'Sikh' | 'Other';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';

  // Address
  state?: string;
  district: string;
  taluka: string;
  villageCity: string;
  pinCode: string;

  // Socio-Economic
  annualIncomeTier: 'under-50k' | '50k-1L' | '1L-2.5L' | '2.5L-8L' | 'above-8L' | string;
  annualIncomeAmount: number;
  occupation: 'Farmer' | 'Agricultural Labourer' | 'Student' | 'Self-Employed / Business' | 'Unemployed' | 'Private Job' | 'Government Employee' | 'Retired' | string;
  educationLevel: 'Illiterate' | 'Primary School' | '10th Pass' | '12th Pass' | 'Diploma' | 'Graduate' | 'Post Graduate' | 'Doctorate' | string;
  isStudent: boolean;
  currentCourse?: string;
  courseClass?: string;
  institutionType?: string;
  academicYear?: string;
  hasDisability: boolean;
  disabilityType?: string;
  disabilityPercentage?: number;

  // Interests & Preferences
  schemeInterests: string[];
  preferredLanguage: 'mr' | 'hi' | 'en';
  confirmedAccurate: boolean;
  completedAt: string;
}

// ─── 6 Authorized Registered Citizens ───────────────────────────────────────────
export const AUTHORIZED_USERS: RegisteredUser[] = [
  {
    id: 'MH-CIT-001',
    name: 'Paras Prasade',
    nameMr: 'पारस प्रसादे',
    mobile: '7276218598',
    email: 'paras.prasade@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-7276',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-002',
    name: 'Jay Sawale',
    nameMr: 'जय सावळे',
    mobile: '9588647927',
    email: 'jay.sawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-9588',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-003',
    name: 'Aniruddha Nawale',
    nameMr: 'अनिरुद्ध नवले',
    mobile: '7447571077',
    email: 'aniruddha.nawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-7447',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-004',
    name: 'Anshul Patil',
    nameMr: 'अंशुल पाटील',
    mobile: '7249517306',
    email: 'anshul.patil@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-7249',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-005',
    name: 'Aman Chaudhary',
    nameMr: 'अमन चौधरी',
    mobile: '8329895972',
    email: 'aman.chaudhary@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-8329',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-006',
    name: 'Shrushti Shinde',
    nameMr: 'सृष्टी शिंदे',
    mobile: '8767867760',
    email: 'shrushti.shinde@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX-XXXX-8767',
    role: 'citizen',
  },
];

export const ACCESS_DENIED_ERROR_MESSAGE = 'Access denied. This mobile number is not registered with MahaSetu.';
export const ACCESS_DENIED_ERROR_MESSAGE_MR = 'प्रवेश नाकारला. हा मोबाईल क्रमांक महासेतू पोर्टलवर नोंदणीकृत नाही.';

/**
 * Standardizes a 10-digit mobile number by stripping country code (+91 / 91), spaces, and dashes.
 */
export function normalizeMobileNumber(input: string): string {
  const digitsOnly = input.replace(/\D/g, '');
  if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
    return digitsOnly.slice(2);
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
    return digitsOnly.slice(1);
  }
  return digitsOnly;
}

/**
 * Verifies if mobile belongs to one of the 6 authorized users.
 */
export function findAuthorizedUser(mobile: string): RegisteredUser | null {
  const cleanMobile = normalizeMobileNumber(mobile);
  return AUTHORIZED_USERS.find(user => user.mobile === cleanMobile) || null;
}

// ─── Welfare Scheme Interest Categories ────────────────────────────────────────
export const SCHEME_INTEREST_CATEGORIES = [
  { id: 'agriculture', nameEn: 'Agriculture & Farmer Welfare', nameMr: 'कृषी आणि शेतकरी कल्याण', icon: 'agriculture' },
  { id: 'education', nameEn: 'Education & Scholarships', nameMr: 'शिक्षण आणि शिष्यवृत्ती', icon: 'school' },
  { id: 'women_child', nameEn: 'Women & Child Development', nameMr: 'महिला आणि बालविकास', icon: 'family_restroom' },
  { id: 'healthcare', nameEn: 'Healthcare & Medical Aid', nameMr: 'आरोग्य आणि वैद्यकीय मदत', icon: 'local_hospital' },
  { id: 'employment', nameEn: 'Employment & Skill Development', nameMr: 'रोजगार आणि कौशल्य विकास', icon: 'work' },
  { id: 'housing', nameEn: 'Housing & Shelter', nameMr: 'गृहनिर्माण आणि निवारा', icon: 'home' },
  { id: 'senior_citizens', nameEn: 'Senior Citizens Welfare', nameMr: 'ज्येष्ठ नागरिक कल्याण', icon: 'elderly' },
  { id: 'business', nameEn: 'Business & Entrepreneurship', nameMr: 'व्यवसाय आणि उद्योग', icon: 'store' },
  { id: 'social_security', nameEn: 'Social Security & Pension', nameMr: 'सामाजिक सुरक्षा आणि पेन्शन', icon: 'shield_person' },
];
