require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config(); // also fallback to server/.env

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { connectDB } = require('./config/db');

const User = require('./models/User');
const Profile = require('./models/Profile');
const AdminUser = require('./models/AdminUser');
const Scheme = require('./models/Scheme');
const Application = require('./models/Application');
const Document = require('./models/Document');
const Consent = require('./models/Consent');
const Notification = require('./models/Notification');
const DigiLockerConnection = require('./models/DigiLockerConnection');
const AuditLog = require('./models/AuditLog');

const ADMIN_ID = process.env.ADMIN_ID || '1120610';
const ADMIN_PASSWORD = 'm@h@admin';

const SEED_CITIZENS = [
  {
    userId: 'MH-CIT-001',
    fullName: 'Paras Prasade',
    fullNameMr: 'पारस प्रसादे',
    mobile: '7276218598',
    email: 'paras.prasade@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7276',
    role: 'citizen',
    isVerified: true,
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
      preferredLanguage: 'mr',
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
    role: 'citizen',
    isVerified: true,
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
      preferredLanguage: 'mr',
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
    role: 'citizen',
    isVerified: true,
    profile: {
      dob: '2001-11-12',
      age: 25,
      gender: 'Male',
      category: 'SC',
      annualIncomeTier: '50k-1L',
      annualIncomeAmount: 95000,
      district: 'Chhatrapati Sambhajinagar',
      taluka: 'Aurangabad',
      villageCity: 'CIDCO',
      pinCode: '431003',
      occupation: 'Self-Employed / Business',
      educationLevel: 'Diploma',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['business', 'employment'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digiLockerLinked: false,
    },
  },
  {
    userId: 'MH-CIT-004',
    fullName: 'Anshul Patil',
    fullNameMr: 'अंशुल पाटील',
    mobile: '7249517306',
    email: 'anshul.patil@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7249',
    role: 'citizen',
    isVerified: true,
    profile: {
      dob: '2002-03-10',
      age: 24,
      gender: 'Male',
      category: 'EWS',
      annualIncomeTier: '2.5L-8L',
      annualIncomeAmount: 320000,
      district: 'Kolhapur',
      taluka: 'Karvir',
      villageCity: 'Kolhapur',
      pinCode: '416003',
      occupation: 'Student',
      educationLevel: 'Graduate',
      isStudent: true,
      currentCourse: 'MBA / Management',
      institutionType: 'University Department',
      academicYear: 'First Year',
      hasDisability: false,
      schemeInterests: ['education', 'housing'],
      preferredLanguage: 'en',
      confirmedAccurate: true,
      digiLockerLinked: true,
      digiLockerId: 'DL-MH-7306-9931',
    },
  },
  {
    userId: 'MH-CIT-005',
    fullName: 'Aman Chaudhary',
    fullNameMr: 'अमन चौधरी',
    mobile: '8329895972',
    email: 'aman.chaudhary@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8329',
    role: 'citizen',
    isVerified: true,
    profile: {
      dob: '1995-07-22',
      age: 31,
      gender: 'Male',
      category: 'OBC',
      annualIncomeTier: '1L-2.5L',
      annualIncomeAmount: 210000,
      district: 'Nagpur',
      taluka: 'Nagpur Rural',
      villageCity: 'Nagpur',
      pinCode: '440010',
      occupation: 'Private Job',
      educationLevel: 'Post Graduate',
      isStudent: false,
      hasDisability: false,
      schemeInterests: ['housing', 'healthcare'],
      preferredLanguage: 'hi',
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
    role: 'citizen',
    isVerified: true,
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
      preferredLanguage: 'mr',
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
    studentRequired: true,
    residencyRequired: true,
    requiredDocuments: [
      { id: 'DOC-INC', name: 'Annual Income Certificate', nameMr: 'वार्षिक उत्पन्नाचा दाखला', source: 'Revenue Department', available: true },
      { id: 'DOC-CST', name: 'Caste Certificate', nameMr: 'जात प्रमाणपत्र', source: 'Revenue Department', available: true },
      { id: 'DOC-DOM', name: 'Domicile Certificate', nameMr: 'अधिवास प्रमाणपत्र', source: 'Executive Magistrate', available: true },
      { id: 'DOC-ENR', name: 'College Admission Fee Receipt', nameMr: 'महाविद्यालय प्रवेश पावती', source: 'Citizen Upload', available: false },
    ],
    keywords: ['scholarship', 'student', 'tuition', 'fee', 'obc', 'ebc', 'higher education', 'college', 'engineering', 'medical'],
    problemTypes: ['education fees', 'college grant', 'tuition fee concession', 'student financial assistance'],
    applicationRoute: '/apply/scheme/post-matric-scholarship-obc',
    applicationType: 'scheme',
    active: true,
  },
  {
    schemeId: 'namo-shetkari-mahasanman',
    name: 'Namo Shetkari Mahasanman Nidhi Yojana',
    nameMr: 'नमो शेतकरी महासन्मान निधी योजना',
    department: 'Agriculture Department',
    departmentMr: 'कृषी विभाग',
    departmentKey: 'revenue',
    category: 'Agriculture & Farmer Welfare',
    categoryMr: 'कृषी आणि शेतकरी कल्याण',
    description: 'Supplemental annual financial support of ₹6,000 provided by the Government of Maharashtra to all PM-KISAN beneficiary farmers in three equal installments.',
    descriptionMr: 'पीएम-किसान लाभार्थी शेतकऱ्यांना महाराष्ट्र शासनाकडून तीन समान हप्त्यांमध्ये ₹६,००० चे वार्षिक आर्थिक सहाय्य.',
    benefits: '₹6,000 per year transferred directly to Aadhaar-linked bank account in 3 installments',
    benefitsMr: 'वार्षिक ₹६,००० थेट आधार संलग्न बँक खात्यात ३ हप्त्यांमध्ये जमा',
    disbursementMode: 'Direct Benefit Transfer (DBT)',
    eligibility: [
      'Must be an active beneficiary of the PM-KISAN scheme in Maharashtra',
      'Must hold cultivable agricultural land in Maharashtra with digitized 7/12 land record',
      'Aadhaar-seeded active bank account required for DBT transfers',
    ],
    eligibilityMr: [
      'महाराष्ट्रातील पीएम-किसान योजनेचे सक्रिय लाभार्थी',
      'डिजिटल स्वाक्षरीत ७/१२ जमिनीचा उतारा असणे आवश्यक',
    ],
    incomeCriteria: 'Small and marginal landholding farmers',
    ageCriteria: '18 years and above',
    minAge: 18,
    maxAge: 100,
    occupations: ['Farmer', 'Agricultural Labourer'],
    residencyRequired: true,
    requiredDocuments: [
      { id: 'DOC-LND', name: '7/12 Land Record Extract', nameMr: '७/१२ जमीन उतारा', source: 'e-Mahabhumi', available: true },
      { id: 'DOC-AADH', name: 'Aadhaar Card', nameMr: 'आधार कार्ड', source: 'UIDAI', available: true },
      { id: 'DOC-BNK', name: 'Bank Passbook Copy', nameMr: 'बँक पासबुक प्रत', source: 'DigiLocker', available: true },
    ],
    keywords: ['farmer', 'shetkari', 'kisan', 'agriculture', 'land', 'dbt', '7/12', 'crop', 'fertilizer', 'khedut'],
    problemTypes: ['agricultural support', 'farm input cost', 'farmer financial aid', 'crop debt support'],
    applicationRoute: '/apply/scheme/namo-shetkari-mahasanman',
    applicationType: 'scheme',
    active: true,
  },
  {
    schemeId: 'sanjay-gandhi-niradhar-anudan',
    name: 'Sanjay Gandhi Niradhar Anudan Yojana',
    nameMr: 'संजय गांधी निराधार अनुदान योजना',
    department: 'Social Justice & Special Assistance Department',
    departmentMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    departmentKey: 'social_welfare',
    category: 'Social Security & Pension',
    categoryMr: 'सामाजिक सुरक्षा आणि पेन्शन',
    description: 'Monthly pension and financial sustenance for destitute persons, elderly, disabled, widows, and terminal illness patients residing in Maharashtra.',
    descriptionMr: 'निराधार व्यक्ती, वृद्ध, दिव्यांग, विधवा आणि गंभीर आजारग्रस्तांसाठी मासिक निवृत्तीवेतन व आर्थिक आधार.',
    benefits: '₹1,500 per month pension disbursed directly via DBT',
    benefitsMr: 'दरमहा ₹१,५०० निवृत्तीवेतन थेट डीबीटीद्वारे जमा',
    disbursementMode: 'Direct Benefit Transfer (DBT)',
    eligibility: [
      'Destitute persons, age 65 years or above, or person with 40%+ disability, or widow',
      'Annual family income must not exceed ₹21,000 (or ₹50,000 for families with disability)',
      'Continuous resident of Maharashtra for at least 15 years',
    ],
    eligibilityMr: [
      '६५ वर्षे किंवा त्याहून अधिक वयाचे निराधार, किंवा ४०%+ दिव्यांग, किंवा विधवा',
      'कौटुंबिक वार्षिक उत्पन्न ₹२१,००० पेक्षा कमी (दिव्यांगांसाठी ₹५०,०००)',
    ],
    incomeCriteria: 'Below ₹21,000 per annum (Below ₹50,000 for disability)',
    ageCriteria: '65+ for senior citizens, all ages for disability/widows',
    minAge: 18,
    maxAge: 100,
    incomeLimit: 50000,
    incomeOperator: 'less_than_or_equal',
    requiredDocuments: [
      { id: 'DOC-AGE', name: 'Age & Domicile Proof', nameMr: 'वय व अधिवास पुरावा', source: 'Executive Magistrate', available: true },
      { id: 'DOC-INC', name: 'Income Certificate', nameMr: 'उत्पन्नाचा दाखला', source: 'Revenue Department', available: true },
      { id: 'DOC-DIS', name: 'Civil Surgeon Disability Certificate', nameMr: 'दिव्यांगत्व प्रमाणपत्र', source: 'Health Department', available: false },
    ],
    keywords: ['pension', 'senior citizen', 'old age', 'destitute', 'disability', 'widow', 'niradhar', 'social assistance'],
    problemTypes: ['old age support', 'disability pension', 'widow sustenance', 'destitute pension'],
    applicationRoute: '/apply/scheme/sanjay-gandhi-niradhar-anudan',
    applicationType: 'scheme',
    active: true,
  },
  {
    schemeId: 'rajashri-shahu-maharaj-fee-reimbursement',
    name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti',
    nameMr: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती योजना',
    department: 'Higher & Technical Education Department',
    departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
    departmentKey: 'education',
    category: 'Scholarship',
    categoryMr: 'शिष्यवृत्ती',
    description: 'Reimbursement of 50% tuition and examination fees for students from Economically Backward Classes (EBC) and General category admitted through CAP.',
    descriptionMr: 'कॅप (CAP) द्वारे प्रवेश घेतलेल्या खुल्या व आर्थिक दुर्बल घटकातील विद्यार्थ्यांसाठी ५०% शिक्षण व परीक्षा शुल्क प्रतिपूर्ती.',
    benefits: '50% reimbursement of professional course tuition fees directly deposited to college/student account',
    benefitsMr: 'व्यावसायिक अभ्यासक्रम शिक्षण शुल्काची ५०% प्रतिपूर्ती थेट जमा',
    disbursementMode: 'Direct Benefit Transfer (DBT)',
    eligibility: [
      'Admitted through Centralized Admission Process (CAP) in Maharashtra',
      'Annual family income must be less than or equal to ₹8,00,000',
      'Resident and domicile of Maharashtra',
      'Maximum 2 beneficiaries per family',
    ],
    eligibilityMr: [
      'महाराष्ट्रात कॅप (CAP) प्रक्रियेद्वारे प्रवेश',
      'कौटुंबिक वार्षिक उत्पन्न ₹८ लाखांपर्यंत',
    ],
    incomeCriteria: 'Below ₹8,00,000 per annum',
    ageCriteria: '17 to 28 years',
    minAge: 17,
    maxAge: 28,
    incomeLimit: 800000,
    incomeOperator: 'less_than_or_equal',
    allowedCategories: ['General/Open', 'EWS', 'EBC'],
    studentRequired: true,
    residencyRequired: true,
    requiredDocuments: [
      { id: 'DOC-INC', name: 'Income Certificate from Tehsildar', nameMr: 'तहसीलदार उत्पन्न दाखला', source: 'Revenue Department', available: true },
      { id: 'DOC-CAP', name: 'CAP Allotment Letter', nameMr: 'कॅप वाटप पत्र', source: 'Citizen Upload', available: false },
      { id: 'DOC-DOM', name: 'Domicile Certificate', nameMr: 'अधिवास दाखला', source: 'Revenue Department', available: true },
    ],
    keywords: ['ebc scholarship', 'shahu maharaj', 'tuition reimbursement', 'engineering fees', 'cap admission', 'general category scholarship'],
    problemTypes: ['college tuition fees', 'professional education grant', 'exam fees reimbursement'],
    applicationRoute: '/apply/scheme/rajashri-shahu-maharaj-fee-reimbursement',
    applicationType: 'scheme',
    active: true,
  },
  {
    schemeId: 'income-certificate',
    name: 'Income Certificate (1/3 Years)',
    nameMr: 'उत्पन्नाचा दाखला (१ किंवा ३ वर्षे)',
    department: 'Revenue Department',
    departmentMr: 'महसूल विभाग',
    departmentKey: 'revenue',
    category: 'Revenue Services',
    categoryMr: 'महसूल सेवा',
    description: 'Statutory certificate certifying annual family income issued by the Tehsildar office for educational and welfare benefits.',
    descriptionMr: 'तहसीलदार कार्यालयामार्फत जारी करण्यात येणारा वार्षिक कौटुंबिक उत्पन्नाचा दाखला.',
    benefits: 'Legally recognized income certificate issued within statutory SLA of 3 days',
    benefitsMr: '३ दिवसांत कायदेशीर मान्यताप्राप्त उत्पन्नाचा दाखला',
    disbursementMode: 'Digitally Signed Certificate (e-Signed)',
    eligibility: [
      'Permanent resident of Maharashtra State',
      'Proof of income sources from Talathi or employer',
      'Valid Aadhaar-linked citizen identity',
    ],
    eligibilityMr: ['महाराष्ट्र राज्याचा कायमस्वरूपी रहिवासी', 'तलाठी किंवा नियोक्त्याचा उत्पन्नाचा पुरावा'],
    incomeCriteria: 'All income slabs',
    ageCriteria: '18 years and above',
    minAge: 18,
    maxAge: 100,
    requiredDocuments: [
      { id: 'DOC-RAT', name: 'Ration Card', nameMr: 'रेशन कार्ड', source: 'Food & Civil Supplies', available: true },
      { id: 'DOC-SAL', name: 'Salary Slip / Talathi Income Report', nameMr: 'पगार पावती / तलाठी अहवाल', source: 'Citizen Upload', available: false },
      { id: 'DOC-AADH', name: 'Aadhaar Card', nameMr: 'आधार कार्ड', source: 'UIDAI / DigiLocker', available: true },
    ],
    keywords: ['income certificate', 'utpanna dakhla', 'tehsildar', 'salary slip', 'talathi report', 'certificate'],
    problemTypes: ['certificate', 'income proof', 'welfare prerequisite'],
    applicationRoute: '/apply/income-certificate',
    applicationType: 'service',
    active: true,
  },
  {
    schemeId: 'caste-certificate',
    name: 'Caste Certificate (SC/ST/OBC/VJNT/SBC)',
    nameMr: 'जात प्रमाणपत्र (अ.जा./अ.ज./इ.मा.व./वि.जा.भ.ज.)',
    department: 'Revenue Department & Social Justice',
    departmentMr: 'महसूल विभाग व सामाजिक न्याय',
    departmentKey: 'revenue',
    category: 'Revenue Services',
    categoryMr: 'महसूल सेवा',
    description: 'Official statutory caste certification issued under the Maharashtra Scheduled Castes, De-notified Tribes, and Other Backward Classes Act.',
    descriptionMr: 'सक्षम प्राधिकाऱ्यामार्फत जारी करण्यात येणारे अधिकृत जात प्रमाणपत्र.',
    benefits: 'Legally certified caste document essential for education reservations and government examinations',
    benefitsMr: 'शिक्षण आरक्षण व शासकीय परीक्षांसाठी आवश्यक जात प्रमाणपत्र',
    disbursementMode: 'Digitally Signed Certificate',
    eligibility: ['Applicant must belong to recognized reserved categories in Maharashtra', 'Ancestral domicile proof before 1967/1961'],
    eligibilityMr: ['मान्यताप्राप्त राखीव प्रवर्गातील अर्जदार', '१९६७/१९६१ पूर्वीचा पुरावा'],
    incomeCriteria: 'As applicable per category rules',
    ageCriteria: 'All ages',
    requiredDocuments: [
      { id: 'DOC-DOM', name: 'Domicile / Birth Certificate', nameMr: 'अधिवास / जन्म दाखला', source: 'Executive Magistrate', available: true },
      { id: 'DOC-FAT', name: 'Father / Ancestral Caste Proof', nameMr: 'वडिलांचा / पूर्वजांचा जात पुरावा', source: 'Citizen Upload', available: false },
    ],
    keywords: ['caste certificate', 'jaat dakhla', 'obc certificate', 'sc certificate', 'caste validity'],
    problemTypes: ['caste certificate', 'reservation document'],
    applicationRoute: '/apply/caste-certificate',
    applicationType: 'service',
    active: true,
  },
  {
    schemeId: 'domicile-certificate',
    name: 'Age, Nationality & Domicile Certificate',
    nameMr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
    department: 'Revenue Department',
    departmentMr: 'महसूल विभाग',
    departmentKey: 'revenue',
    category: 'Revenue Services',
    categoryMr: 'महसूल सेवा',
    description: 'Official attestation proving minimum 15 years continuous residence within Maharashtra.',
    descriptionMr: 'महाराष्ट्र राज्यात सलग १५ वर्षे वास्तव्याचा अधिकृत दाखला.',
    benefits: 'Statutory domicile certificate required for MPSC, CET, NEET, state recruitment and admission',
    benefitsMr: 'सर्व राज्यस्तरीय परीक्षा व प्रवेशांसाठी अनिवार्य अधिवास प्रमाणपत्र',
    disbursementMode: 'Digitally Signed Certificate',
    eligibility: ['Continuous residence in Maharashtra for a minimum of 15 years'],
    eligibilityMr: ['महाराष्ट्रात सलग १५ वर्षे वास्तव्याचा पुरावा'],
    incomeCriteria: 'No income criteria',
    ageCriteria: 'All age groups',
    requiredDocuments: [
      { id: 'DOC-RES', name: '15 Years Residence Proof (Light bill / Ration Card)', nameMr: '१५ वर्षे वास्तव्याचा पुरावा', source: 'Citizen Upload', available: false },
      { id: 'DOC-AADH', name: 'Aadhaar Card', nameMr: 'आधार कार्ड', source: 'UIDAI / DigiLocker', available: true },
    ],
    keywords: ['domicile certificate', 'adhivas dakhla', 'nationality', '15 years residence', 'residence proof'],
    problemTypes: ['domicile certificate', 'residence proof'],
    applicationRoute: '/apply/domicile-certificate',
    applicationType: 'service',
    active: true,
  },
  {
    schemeId: 'land-712-extract',
    name: 'Digitally Signed 7/12 Land Record Extract',
    nameMr: 'डिजिटल स्वाक्षरीत ७/१२ जमीन उतारा',
    department: 'Revenue & Land Records (e-Mahabhumi)',
    departmentMr: 'महसूल व भूमी अभिलेख विभाग',
    departmentKey: 'revenue',
    category: 'Land Records',
    categoryMr: 'भूमी अभिलेख',
    description: 'Statutory record of rights showing land ownership, survey number, gat number, crop pattern, and area measurement in Maharashtra.',
    descriptionMr: 'जमिनीची मालकी, गट क्रमांक आणि क्षेत्र दर्शवणारा डिजिटल स्वाक्षरीत अधिकार अभिलेख.',
    benefits: 'Instantly issued digitally signed statutory 7/12 extract for legal and agricultural credit usage',
    benefitsMr: 'कायदेशीर व कृषी कर्जासाठी तात्काळ वैध डिजिटल ७/१२ उतारा',
    disbursementMode: 'Instant Download (e-Signed PDF)',
    eligibility: ['Holder or authorized seeker of land records within Maharashtra'],
    eligibilityMr: ['महाराष्ट्रातील जमिनीचे मालक किंवा अधिकृत अर्जदार'],
    incomeCriteria: 'No income limit',
    ageCriteria: '18 years and above',
    requiredDocuments: [
      { id: 'DOC-AADH', name: 'Aadhaar Card', nameMr: 'आधार कार्ड', source: 'UIDAI / DigiLocker', available: true },
    ],
    keywords: ['7/12', 'satbara', 'land record', 'e-mahabhumi', 'gat number', 'survey number', 'khet'],
    problemTypes: ['land record', 'property proof', 'farm credit'],
    applicationRoute: '/apply/land-712-extract',
    applicationType: 'service',
    active: true,
  },
];

async function seedDatabase() {
  console.log('🌱 [MahaSetu Seed]: Initializing database connection...');
  await connectDB();

  if (mongoose.connection.readyState !== 1) {
    console.log('\n⚠️  [MahaSetu Seed Notice]: MongoDB is not currently reachable.');
    console.log('   To seed your live database, ensure your valid MongoDB Atlas URI is set in .env');
    console.log('   and your current IP is whitelisted in MongoDB Atlas Network Access (0.0.0.0/0).');
    console.log('   Example: MONGODB_URI=mongodb+srv://user:pass@cluster0.abcde.mongodb.net/mahasetu?retryWrites=true&w=majority\n');
    return;
  }

  console.log('🔐 [Admin]: Checking administrator account (ID: 1120610)...');
  const hashedAdminPassword = bcrypt.hashSync(ADMIN_PASSWORD, 10);
  await AdminUser.findOneAndUpdate(
    { adminId: ADMIN_ID },
    {
      adminId: ADMIN_ID,
      name: 'Shri. S. K. Deshmukh',
      department: 'General Administration Department (GAD), Mantralaya, Mumbai',
      role: 'admin',
      passwordHash: hashedAdminPassword,
      isActive: true,
    },
    { upsert: true, new: true }
  );
  console.log(`✅ [Admin]: Administrator account ready (ID: ${ADMIN_ID}) with hashed password.`);

  console.log('👥 [Citizens]: Seeding 6 demo citizens and their profiles...');
  for (const c of SEED_CITIZENS) {
    const user = await User.findOneAndUpdate(
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

    // Seed DigiLocker connection record
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

    // Seed default baseline documents for the user
    const sampleDocs = [
      {
        documentId: `DOC-INC-${c.userId}`,
        userId: c.userId,
        documentType: 'Income Proof',
        documentName: 'Annual Income Certificate (1 Year)',
        documentNameMr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
        authorityEn: 'Tehsildar Office, Haveli, Pune',
        authorityMr: 'तहसीलदार कार्यालय, हवेली, पुणे',
        issueDate: '04 Sep 2026',
        certNo: `MH-REV-2025-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
      {
        documentId: `DOC-CST-${c.userId}`,
        userId: c.userId,
        documentType: 'Caste & Category',
        documentName: `Caste Certificate (${c.profile.category || 'OBC'})`,
        documentNameMr: 'जात प्रमाणपत्र',
        authorityEn: 'Sub-Divisional Officer, Revenue Division',
        authorityMr: 'उपविभागीय अधिकारी, महसूल विभाग',
        issueDate: '12 Jan 2024',
        certNo: `MH-CST-2024-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
      {
        documentId: `DOC-DOM-${c.userId}`,
        userId: c.userId,
        documentType: 'Identity & Domicile',
        documentName: 'Age, Nationality & Domicile Certificate',
        documentNameMr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
        authorityEn: 'Executive Magistrate Office',
        authorityMr: 'कार्यकारी दंडाधिकारी कार्यालय',
        issueDate: '18 Aug 2023',
        certNo: `MH-DOM-2023-${Math.floor(10000 + Math.random() * 90000)}`,
        source: 'DigiLocker',
        verificationStatus: 'Verified',
        verified: true,
      },
    ];

    for (const d of sampleDocs) {
      await Document.findOneAndUpdate(
        { documentId: d.documentId },
        d,
        { upsert: true, new: true }
      );
    }

    // Seed baseline DPDP consents
    const sampleConsents = [
      {
        consentId: `CNS-${c.userId}-001`,
        userId: c.userId,
        requestingDept: 'Higher & Technical Education Department',
        requestingDeptMr: 'उच्च व तंत्रशिक्षण विभाग',
        sourceDept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
        sourceDeptMr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
        purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
        purposeMr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
        dataFields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref', 'Caste Certificate Ref'],
        status: 'Active',
        validUntil: '31 Mar 2027',
      },
      {
        consentId: `CNS-${c.userId}-002`,
        userId: c.userId,
        requestingDept: 'Agriculture Department (e-Pik Pahani)',
        requestingDeptMr: 'कृषी विभाग (ई-पीक पाहणी)',
        sourceDept: 'Revenue Department (7/12 Land Registry)',
        sourceDeptMr: 'महसूल विभाग (७/१२ जमीन नोंदणी)',
        purpose: 'Verification of land ownership for PM Kisan & Namo Shetkari Mahasanman Yojana',
        purposeMr: 'पीएम किसान आणि नमो शेतकरी महासन्मान योजनेसाठी जमिनीच्या मालकीची पडताळणी',
        dataFields: ['7/12 Extract (Record of Rights)', 'Gat Number', 'Crop Survey 2026'],
        status: 'Active',
        validUntil: '31 Dec 2026',
      },
    ];

    for (const con of sampleConsents) {
      await Consent.findOneAndUpdate(
        { userId: c.userId, consentId: con.consentId },
        con,
        { upsert: true, new: true }
      );
    }
  }
  console.log(`✅ [Citizens]: ${SEED_CITIZENS.length} demo accounts, profiles, documents, and consents seeded.`);

  console.log('📜 [Schemes & Services]: Seeding Maharashtra scheme and service datasets...');
  for (const s of SEED_SCHEMES) {
    await Scheme.findOneAndUpdate(
      { schemeId: s.schemeId },
      s,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ [Schemes]: ${SEED_SCHEMES.length} schemes and government services seeded.`);

  console.log('📁 [Applications]: Seeding sample applications across departments...');
  const sampleApplications = [
    {
      applicationId: 'MH-REV-2025-88319',
      userId: 'MH-CIT-001',
      applicantName: 'Paras Prasade',
      serviceId: 'income-certificate',
      serviceName: 'Income Certificate (1 Year)',
      serviceNameMr: 'उत्पन्नाचा दाखला (१ वर्ष)',
      department: 'Revenue Department',
      departmentMr: 'महसूल विभाग',
      appliedDate: '02 Sep 2026',
      status: 'Approved',
      statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      district: 'Pune',
      applicationType: 'service',
      applicationRoute: '/apply/income-certificate',
    },
    {
      applicationId: 'MH-EDU-2026-44102',
      userId: 'MH-CIT-001',
      applicantName: 'Paras Prasade',
      schemeId: 'post-matric-scholarship-obc',
      serviceName: 'Post-Matric Scholarship for OBC Students',
      serviceNameMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
      department: 'Higher & Technical Education Department',
      departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
      appliedDate: '04 Sep 2026',
      status: 'Under Review',
      statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
      district: 'Pune',
      applicationType: 'scheme',
      applicationRoute: '/apply/scheme/post-matric-scholarship-obc',
    },
    {
      applicationId: 'MH-SOC-2026-11928',
      userId: 'MH-CIT-002',
      applicantName: 'Jay Sawale',
      serviceId: 'caste-certificate',
      serviceName: 'Caste Certificate (OBC / SC / ST)',
      serviceNameMr: 'जात प्रमाणपत्र पडताळणी',
      department: 'Social Justice & Special Assistance Department',
      departmentMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
      appliedDate: '28 Aug 2026',
      status: 'Submitted',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      district: 'Nashik',
      applicationType: 'service',
      applicationRoute: '/apply/caste-certificate',
    },
    {
      applicationId: 'MH-AGR-2026-77301',
      userId: 'MH-CIT-002',
      applicantName: 'Jay Sawale',
      schemeId: 'namo-shetkari-mahasanman',
      serviceName: 'Namo Shetkari Mahasanman Nidhi Yojana',
      serviceNameMr: 'नमो शेतकरी महासन्मान निधी योजना',
      department: 'Agriculture Department',
      departmentMr: 'कृषी विभाग',
      appliedDate: '01 Sep 2026',
      status: 'Documents Required',
      statusColor: 'bg-purple-100 text-purple-800 border-purple-300',
      district: 'Nashik',
      applicationType: 'scheme',
      applicationRoute: '/apply/scheme/namo-shetkari-mahasanman',
    },
  ];

  for (const app of sampleApplications) {
    await Application.findOneAndUpdate(
      { applicationId: app.applicationId },
      app,
      { upsert: true, new: true }
    );
  }
  console.log(`✅ [Applications]: ${sampleApplications.length} departmental applications seeded.`);

  // Baseline audit logs
  await AuditLog.create({
    logId: `AUD-INIT-${Date.now()}`,
    actorId: ADMIN_ID,
    actorRole: 'admin',
    action: 'DATABASE_SEED_COMPLETED',
    targetResource: 'System',
    metadata: {
      citizensCount: SEED_CITIZENS.length,
      schemesCount: SEED_SCHEMES.length,
      applicationsCount: sampleApplications.length,
    },
    timestamp: new Date(),
  });

  console.log('\n🎉 [MahaSetu Seed Complete]: MongoDB Atlas database seeded successfully without duplicates!');
}

if (require.main === module) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error('❌ Seed Error:', err);
      process.exit(1);
    });
}

module.exports = { seedDatabase };
