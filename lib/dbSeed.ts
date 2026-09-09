import { User } from './models/User';
import { Profile } from './models/Profile';
import { AdminUser } from './models/AdminUser';
import { Scheme } from './models/Scheme';
import { Application } from './models/Application';
import { Document } from './models/Document';
import { Consent } from './models/Consent';
import { DigiLockerConnection } from './models/DigiLockerConnection';

const SEED_CITIZENS = [
  {
    userId: 'MH-CIT-001',
    fullName: 'Paras Prasade',
    fullNameMr: 'पारस प्रसादे',
    mobile: '7276218598',
    email: 'paras.prasade@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7276',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '2003-05-15',
      age: 23,
      gender: 'Male',
      category: 'OBC',
      annualIncomeTier: '1L-2.5L',
      annualIncomeAmount: 180000,
      district: 'Pune',
      taluka: 'Haveli',
      villageCity: 'Pune City',
      pinCode: '411001',
      occupation: 'Student',
      educationLevel: 'Graduate',
      isStudent: true,
      currentCourse: 'B.Tech / Computer Engineering',
      institutionType: 'Autonomous College / University',
      academicYear: 'Final Year',
      hasDisability: false,
      schemeInterests: ['education', 'employment', 'business'],
      preferredLanguage: 'mr' as const,
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-8598-4019',
    },
  },
  {
    userId: 'MH-CIT-002',
    fullName: 'Jay Sawale',
    fullNameMr: 'जय सावळे',
    mobile: '9588647927',
    email: 'jay.sawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 9588',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '1998-08-20',
      age: 28,
      gender: 'Male',
      category: 'General/Open',
      annualIncomeTier: 'under-50k',
      annualIncomeAmount: 48000,
      district: 'Nashik',
      taluka: 'Niphad',
      villageCity: 'Niphad',
      pinCode: '422303',
      occupation: 'Farmer',
      educationLevel: '12th Pass',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['agriculture', 'social_security'],
      preferredLanguage: 'mr' as const,
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-7927-1182',
    },
  },
  {
    userId: 'MH-CIT-003',
    fullName: 'Aniruddha Nawale',
    fullNameMr: 'अनिरुद्ध नवले',
    mobile: '7447571077',
    email: 'aniruddha.nawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7447',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '2001-11-12',
      age: 25,
      gender: 'Male',
      category: 'EWS',
      annualIncomeTier: '50k-1L',
      annualIncomeAmount: 90000,
      district: 'Chhatrapati Sambhajinagar',
      taluka: 'Aurangabad',
      villageCity: 'Chhatrapati Sambhajinagar',
      pinCode: '431001',
      occupation: 'Self-Employed / Business',
      educationLevel: 'Diploma',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['business', 'housing'],
      preferredLanguage: 'mr' as const,
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-1077-8821',
    },
  },
  {
    userId: 'MH-CIT-004',
    fullName: 'Anshul Patil',
    fullNameMr: 'अंशुल पाटील',
    mobile: '7249517306',
    email: 'anshul.patil@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7249',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '2000-03-25',
      age: 26,
      gender: 'Male',
      category: 'OBC',
      annualIncomeTier: '1L-2.5L',
      annualIncomeAmount: 140000,
      district: 'Kolhapur',
      taluka: 'Karvir',
      villageCity: 'Kolhapur',
      pinCode: '416003',
      occupation: 'Farmer',
      educationLevel: 'Graduate',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['agriculture', 'social_security'],
      preferredLanguage: 'mr' as const,
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-7306-3391',
    },
  },
  {
    userId: 'MH-CIT-005',
    fullName: 'Aman Chaudhary',
    fullNameMr: 'अमन चौधरी',
    mobile: '8329895972',
    email: 'aman.chaudhary@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8329',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '1995-07-08',
      age: 31,
      gender: 'Male',
      category: 'General/Open',
      annualIncomeTier: '2.5L-8L',
      annualIncomeAmount: 380000,
      district: 'Nagpur',
      taluka: 'Nagpur Urban',
      villageCity: 'Nagpur',
      pinCode: '440010',
      occupation: 'Private Job',
      educationLevel: 'Post Graduate',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['housing', 'healthcare'],
      preferredLanguage: 'hi' as const,
      confirmedAccurate: true,
      digiLockerLinked: false,
    },
  },
  {
    userId: 'MH-CIT-006',
    fullName: 'Shrushti Shinde',
    fullNameMr: 'सृष्टी शिंदे',
    mobile: '8767867760',
    email: 'shrushti.shinde@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8767',
    role: 'citizen' as const,
    isVerified: true,
    profileCompleted: true,
    profile: {
      dob: '2004-09-18',
      age: 22,
      gender: 'Female',
      category: 'VJNT',
      annualIncomeTier: '50k-1L',
      annualIncomeAmount: 75000,
      district: 'Satara',
      taluka: 'Karad',
      villageCity: 'Karad',
      pinCode: '415110',
      occupation: 'Student',
      educationLevel: 'Undergraduate',
      isStudent: true,
      currentCourse: 'B.Sc / Agriculture',
      institutionType: 'Government College',
      academicYear: 'Third Year',
      hasDisability: false,
      schemeInterests: ['education', 'women_child'],
      preferredLanguage: 'mr' as const,
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-7760-5521',
    },
  },
];

const SEED_SCHEMES = [
  {
    schemeId: 'post-matric-scholarship-obc',
    name: 'Post-Matric Scholarship for OBC / EBC Students',
    nameMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
    department: 'Higher & Technical Education Department',
    departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
    departmentKey: 'education',
    category: 'Scholarship',
    categoryMr: 'शिष्यवृत्ती',
    description: 'Financial assistance for tuition fees, examination fees, and maintenance allowance for students pursuing higher education in Maharashtra.',
    descriptionMr: 'महाराष्ट्रात उच्च शिक्षण घेणाऱ्या विद्यार्थ्यांसाठी शिक्षण शुल्क, परीक्षा शुल्क आणि निर्वाह भत्ता आर्थिक सहाय्य.',
    benefits: '100% Tuition Fee Waiver + Annual Maintenance Allowance up to ₹50,000',
    benefitsMr: '१००% शिक्षण शुल्क माफी + वार्षिक निर्वाह भत्ता ₹५०,००० पर्यंत',
    disbursementMode: 'Direct Benefit Transfer (DBT)',
    eligibility: [
      'Belong to OBC, EBC, VJNT, or SBC category in Maharashtra',
      'Annual family income must not exceed ₹8,00,000',
      'Enrolled in a recognized post-matric course or university in Maharashtra',
      'Permanent resident and domicile of Maharashtra state',
    ],
    eligibilityMr: [
      'महाराष्ट्रातील OBC, EBC, VJNT किंवा SBC प्रवर्गातील विद्यार्थी',
      'कौटुंबिक वार्षिक उत्पन्न ₹८ लाखांपेक्षा कमी असावे',
      'महाराष्ट्रातील मान्यताप्राप्त महाविद्यालयात मॅट्रिकोत्तर अभ्यासक्रमात प्रवेश',
    ],
    incomeCriteria: 'Below ₹8,00,000 per annum',
    ageCriteria: '17 to 30 years',
    minAge: 17,
    maxAge: 30,
    incomeLimit: 800000,
    incomeOperator: 'less_than_or_equal',
    allowedCategories: ['OBC', 'EBC', 'VJNT', 'SBC', 'SC', 'ST'],
    educationLevels: ['12th Pass', 'Diploma', 'Graduate', 'Undergraduate', 'Post Graduate'],
    studentRequired: true,
    applicationRoute: '/scholarship-application',
    applicationType: 'scheme' as const,
    active: true,
  },
  {
    schemeId: 'namo-shetkari-mahasanman',
    name: 'Namo Shetkari Mahasanman Nidhi Yojana',
    nameMr: 'नमो शेतकरी महासन्मान निधी योजना',
    department: 'Agriculture Department',
    departmentMr: 'कृषी विभाग',
    departmentKey: 'agriculture',
    category: 'Agriculture & Farmer Welfare',
    categoryMr: 'कृषी व शेतकरी कल्याण',
    description: 'Direct financial assistance of ₹6,000 per year in three installments to small and marginal farmers across Maharashtra, supplementing PM-Kisan.',
    descriptionMr: 'महाराष्ट्रातील अल्प व अल्पभूधारक शेतकऱ्यांना दरवर्षी ₹६,००० चे थेट आर्थिक सहाय्य तीन हप्त्यांमध्ये.',
    benefits: '₹6,000 annually via direct DBT into Aadhaar-linked bank account',
    benefitsMr: 'वार्षिक ₹६,००० थेट आधार संलग्न बँक खात्यात',
    disbursementMode: 'Direct Benefit Transfer (DBT)',
    eligibility: [
      'Landholding farmer in Maharashtra with cultivable land in 7/12 extract',
      'Registered beneficiary under PM-KISAN Portal',
      'Aadhaar seeded bank account',
    ],
    eligibilityMr: [
      'महाराष्ट्रात शेतजमीन धारक शेतकरी (७/१२ नोंद)',
      'पीएम किसान योजनेचे लाभार्थी',
      'आधार जोडणी असलेले बँक खाते',
    ],
    incomeCriteria: 'Small and marginal farmers',
    ageCriteria: '18 years and above',
    minAge: 18,
    maxAge: 100,
    occupations: ['Farmer', 'Agricultural Labourer'],
    applicationRoute: '/apply/namo-shetkari',
    applicationType: 'scheme' as const,
    active: true,
  },
  {
    schemeId: 'caste-certificate',
    name: 'Issuance of Caste & Category Certificate',
    nameMr: 'जात प्रमाणपत्र प्रदान करणे',
    department: 'Revenue & Social Welfare Department',
    departmentMr: 'महसूल व समाजकल्याण विभाग',
    departmentKey: 'revenue',
    category: 'Caste & Category Services',
    categoryMr: 'जात प्रमाणपत्र सेवा',
    description: 'Statutory certificate attesting citizen caste identity for education, scholarship, and public employment benefits in Maharashtra.',
    descriptionMr: 'शिक्षण, शिष्यवृत्ती आणि शासकीय सेवेसाठी अधिकृत जात प्रमाणपत्र.',
    benefits: 'Statutory government certificate issued with digital signature and QR verification code',
    benefitsMr: 'डिजिटल स्वाक्षरी आणि क्यूआर कोड असलेले अधिकृत शासकीय प्रमाणपत्र',
    disbursementMode: 'Digitally Signed Certificate (e-District)',
    eligibility: ['Citizen belonging to SC, ST, VJNT, NT, OBC, or SBC category in Maharashtra'],
    eligibilityMr: ['महाराष्ट्रातील SC, ST, VJNT, NT, OBC किंवा SBC प्रवर्गातील नागरिक'],
    incomeCriteria: 'No income criteria',
    ageCriteria: 'All age groups',
    applicationRoute: '/apply/caste-certificate',
    applicationType: 'service' as const,
    active: true,
  },
  {
    schemeId: 'income-certificate',
    name: 'Annual Income Certificate (Tahsildar)',
    nameMr: 'वार्षिक उत्पन्नाचा दाखला (तहसीलदार)',
    department: 'Revenue Department',
    departmentMr: 'महसूल विभाग',
    departmentKey: 'revenue',
    category: 'Revenue Services',
    categoryMr: 'महसूल सेवा',
    description: 'Official revenue certificate validating annual family income for scholarship admissions and government welfare schemes.',
    descriptionMr: 'शिष्यवृत्ती आणि सरकारी योजनांसाठी कौटुंबिक वार्षिक उत्पन्नाचा अधिकृत दाखला.',
    benefits: 'Statutory legal document valid for 1 year or 3 years across all Maharashtra departments',
    benefitsMr: '१ किंवा ३ वर्षांसाठी सर्व सरकारी विभागांमध्ये वैध कायदेशीर दाखला',
    disbursementMode: 'Digitally Signed Certificate (e-District)',
    eligibility: ['Permanent resident of Maharashtra'],
    eligibilityMr: ['महाराष्ट्राचे कायमस्वरूपी रहिवासी'],
    incomeCriteria: 'All income slabs',
    ageCriteria: 'All age groups',
    applicationRoute: '/apply/income-certificate',
    applicationType: 'service' as const,
    active: true,
  },
];

let isSeeding = false;
let hasSeeded = false;

export async function ensureDatabaseSeeded(): Promise<void> {
  if (hasSeeded || isSeeding) return;
  isSeeding = true;

  try {
    // 1. Seed demo citizens idempotently
    for (const c of SEED_CITIZENS) {
      await User.findOneAndUpdate(
        { userId: c.userId },
        {
          userId: c.userId,
          fullName: c.fullName,
          fullNameMr: c.fullNameMr,
          mobile: c.mobile,
          email: c.email,
          aadhaarMasked: c.aadhaarMasked,
          role: c.role,
          isVerified: c.isVerified,
          profileCompleted: c.profileCompleted,
        },
        { upsert: true, new: true }
      );

      await Profile.findOneAndUpdate(
        { userId: c.userId },
        {
          userId: c.userId,
          fullName: c.fullName,
          mobile: c.mobile,
          aadhaarMasked: c.aadhaarMasked,
          ...c.profile,
        },
        { upsert: true, new: true }
      );

      await DigiLockerConnection.findOneAndUpdate(
        { userId: c.userId },
        {
          userId: c.userId,
          isConnected: Boolean(c.profile.digiLockerLinked),
          digiLockerId: c.profile.digiLockerId || '',
          maskedAadhaar: c.aadhaarMasked,
          linkedAt: c.profile.digiLockerLinked ? new Date('2026-01-15') : null,
        },
        { upsert: true, new: true }
      );

      // Baseline Document
      await Document.findOneAndUpdate(
        { documentId: `DOC-INC-${c.userId}` },
        {
          documentId: `DOC-INC-${c.userId}`,
          userId: c.userId,
          documentType: 'Income Proof',
          documentName: 'Annual Income Certificate (1 Year)',
          documentNameMr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
          authorityEn: 'Tehsildar Office',
          authorityMr: 'तहसीलदार कार्यालय',
          source: 'DigiLocker',
          verificationStatus: 'Verified',
          verified: true,
        },
        { upsert: true, new: true }
      );

      // Baseline Consent
      await Consent.findOneAndUpdate(
        { userId: c.userId, consentId: `CNS-${c.userId}-001` },
        {
          consentId: `CNS-${c.userId}-001`,
          userId: c.userId,
          requestingDept: 'Higher & Technical Education Department',
          requestingDeptMr: 'उच्च व तंत्रशिक्षण विभाग',
          sourceDept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
          sourceDeptMr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
          purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
          purposeMr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
          dataFields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref'],
          status: 'Active',
          validUntil: '31 Mar 2027',
        },
        { upsert: true, new: true }
      );
    }

    // 2. Seed schemes idempotently
    for (const s of SEED_SCHEMES) {
      await Scheme.findOneAndUpdate(
        { schemeId: s.schemeId },
        s,
        { upsert: true, new: true }
      );
    }

    // 3. Seed baseline applications if none exist
    const appCount = await Application.countDocuments();
    if (appCount === 0) {
      await Application.create([
        {
          applicationId: 'MH-REV-2025-88319',
          userId: 'MH-CIT-001',
          applicantName: 'Paras Prasade',
          serviceName: 'Income Certificate (1 Year)',
          serviceNameMr: 'उत्पन्नाचा दाखला (१ वर्ष)',
          department: 'Revenue Department',
          departmentMr: 'महसूल विभाग',
          appliedDate: '02 Sep 2026',
          status: 'Approved',
          statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          district: 'Pune',
          applicationType: 'service',
        },
        {
          applicationId: 'MH-EDU-2026-44102',
          userId: 'MH-CIT-001',
          applicantName: 'Paras Prasade',
          serviceName: 'Post-Matric Scholarship for OBC Students',
          serviceNameMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
          department: 'Higher & Technical Education Department',
          departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
          appliedDate: '04 Sep 2026',
          status: 'Submitted',
          statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
          district: 'Pune',
          applicationType: 'scheme',
        },
        {
          applicationId: 'MH-SOC-2026-11928',
          userId: 'MH-CIT-002',
          applicantName: 'Jay Sawale',
          serviceName: 'Caste Validity Certificate Verification',
          serviceNameMr: 'जात पडताळणी प्रमाणपत्र पडताळणी',
          department: 'Social Justice & Special Assistance',
          departmentMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
          appliedDate: '28 Aug 2026',
          status: 'Under Review',
          statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
          district: 'Nashik',
          applicationType: 'service',
        },
      ]);
    }

    hasSeeded = true;
  } catch (err) {
    console.error('[dbSeed] Error during idempotent seed:', err);
  } finally {
    isSeeding = false;
  }
}
