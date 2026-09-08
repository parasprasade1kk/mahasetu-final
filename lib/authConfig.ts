// ─── MahaSetu Citizen Authentication & Account Registry ──────────────────────
// Open Registration Platform — Government of Maharashtra
// Any citizen with a valid mobile number can register and access MahaSetu.
// The 6 original demo citizens are pre-seeded on first load.
//
// PRODUCTION NOTE: Replace localStorage helpers with real API calls.
// The OTP flow should be replaced with a real SMS/Aadhaar OTP gateway.

// ─── Account Interface ────────────────────────────────────────────────────────
export interface CitizenAccount {
  id: string;
  name: string;
  nameMr?: string;            // Optional: Marathi name (pre-seeded accounts have this)
  mobile: string;
  email?: string;
  aadhaarMasked?: string;
  createdAt: string;
  role: 'citizen';
}

// Backward-compatibility alias — used in older imports
export type RegisteredUser = CitizenAccount;

// ─── Citizen Profile (unchanged) ─────────────────────────────────────────────
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

  // DigiLocker Status (per-user)
  digiLockerLinked?: boolean;
  digiLockerLinkedAt?: string;
  digiLockerId?: string;
  aadhaarMasked?: string;
}

// ─── Centralized Configurable Demo OTP ──────────────────────────────────────
// ONLY this OTP is accepted in prototype/demo mode.
// In production, this configuration is replaced with a real SMS / Aadhaar OTP gateway.
export const DEMO_OTP = '123456';

export function maskAadhaar(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  const last4 = digits.length >= 4 ? digits.slice(-4) : '0000';
  return `XXXX XXXX ${last4}`;
}

// ─── 6 Pre-Seeded Demo Citizen Accounts ──────────────────────────────────────
// These are no longer an "authorized whitelist" — they are simply the first
// 6 demo accounts pre-registered in the platform for demonstration purposes.
// New citizens can register freely alongside these accounts.
export const SEED_ACCOUNTS: CitizenAccount[] = [
  {
    id: 'MH-CIT-001',
    name: 'Paras Prasade',
    nameMr: 'पारस प्रसादे',
    mobile: '7276218598',
    email: 'paras.prasade@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7276',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-002',
    name: 'Jay Sawale',
    nameMr: 'जय सावळे',
    mobile: '9588647927',
    email: 'jay.sawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 9588',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-003',
    name: 'Aniruddha Nawale',
    nameMr: 'अनिरुद्ध नवले',
    mobile: '7447571077',
    email: 'aniruddha.nawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7447',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-004',
    name: 'Anshul Patil',
    nameMr: 'अंशुल पाटील',
    mobile: '7249517306',
    email: 'anshul.patil@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7249',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-005',
    name: 'Aman Chaudhary',
    nameMr: 'अमन चौधरी',
    mobile: '8329895972',
    email: 'aman.chaudhary@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8329',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
  {
    id: 'MH-CIT-006',
    name: 'Shrushti Shinde',
    nameMr: 'सृष्टी शिंदे',
    mobile: '8767867760',
    email: 'shrushti.shinde@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8767',
    createdAt: '2026-01-01T00:00:00.000Z',
    role: 'citizen',
  },
];

// ─── localStorage Key for Account Registry ────────────────────────────────────
const ACCOUNTS_STORAGE_KEY = 'mahasetu_accounts';

// ─── Unique ID Generator ──────────────────────────────────────────────────────
export function generateUserId(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `MH-CIT-${ts}-${rand}`;
}

// ─── Mobile Number Normalization ──────────────────────────────────────────────
/**
 * Standardizes a 10-digit mobile number by stripping +91 / 91 / 0 prefix,
 * spaces, and dashes.
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

// ─── Account Registry CRUD ────────────────────────────────────────────────────

/**
 * Load all registered accounts from localStorage.
 * Seeds the 6 demo accounts if the registry is empty.
 */
export function loadAccounts(): CitizenAccount[] {
  if (typeof window === 'undefined') return [...SEED_ACCOUNTS];
  try {
    const stored = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (stored) {
      const parsed: CitizenAccount[] = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    // First boot: seed the 6 demo accounts
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(SEED_ACCOUNTS));
    return [...SEED_ACCOUNTS];
  } catch {
    return [...SEED_ACCOUNTS];
  }
}

/**
 * Persist the account registry to localStorage.
 */
export function saveAccounts(accounts: CitizenAccount[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch {
    // Storage quota or private mode — ignore silently
  }
}

/**
 * Find a registered account by mobile number.
 * Returns null if the mobile is not yet registered.
 */
export function findAccount(mobile: string): CitizenAccount | null {
  const clean = normalizeMobileNumber(mobile);
  return loadAccounts().find(a => a.mobile === clean) || null;
}

/**
 * Backward-compatibility alias for findAccount.
 * Previously this checked against a hardcoded whitelist — now it simply looks
 * up any registered account, enabling open registration.
 */
export function findAuthorizedUser(mobile: string): CitizenAccount | null {
  return findAccount(mobile);
}

/**
 * Register a new citizen account.
 * If the mobile is already registered, returns the existing account.
 * Persists to localStorage and returns the new CitizenAccount.
 */
export function registerAccount(name: string, mobile: string, aadhaar?: string): CitizenAccount {
  const clean = normalizeMobileNumber(mobile);
  const accounts = loadAccounts();
  const existing = accounts.find(a => a.mobile === clean);
  if (existing) return existing;

  const newAccount: CitizenAccount = {
    id: generateUserId(),
    name: name.trim(),
    mobile: clean,
    email: `citizen.${clean}@mahasetu.gov.in`,
    aadhaarMasked: aadhaar ? maskAadhaar(aadhaar) : `XXXX XXXX ${clean.slice(-4)}`,
    createdAt: new Date().toISOString(),
    role: 'citizen',
  };

  accounts.push(newAccount);
  saveAccounts(accounts);
  return newAccount;
}

// ─── Welfare Scheme Interest Categories ──────────────────────────────────────
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
