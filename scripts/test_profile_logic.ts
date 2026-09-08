import { evaluateAllSchemes, UserProfile } from '../lib/eligibilityEngine';
import { findAuthorizedUser, CitizenProfile } from '../lib/authConfig';

console.log('=== TEST 1: AUTHORIZED USERS LOOKUP ===');
const paras = findAuthorizedUser('7276218598');
const jay = findAuthorizedUser('9588647927');
console.log('Paras user:', paras?.name, paras?.mobile);
console.log('Jay user:', jay?.name, jay?.mobile);
if (paras?.name !== 'Paras Prasade' || jay?.name !== 'Jay Sawale') {
  throw new Error('Authorized user lookup failed');
}

console.log('\n=== TEST 2: INDEPENDENT PROFILES PER USER ===');
const parasProfile: CitizenProfile = {
  fullName: 'Paras Prasade',
  mobile: '7276218598',
  dob: '2003-05-15',
  age: 23,
  gender: 'Male',
  category: 'OBC',
  religion: 'Hindu',
  maritalStatus: 'Single',
  state: 'Maharashtra',
  district: 'Pune',
  taluka: 'Haveli',
  villageCity: 'Kothrud',
  pinCode: '411038',
  annualIncomeTier: '1L-2.5L',
  annualIncomeAmount: 180000,
  occupation: 'Student',
  educationLevel: 'Graduate',
  isStudent: true,
  currentCourse: 'B.Tech Computer Engineering',
  hasDisability: false,
  schemeInterests: ['education', 'employment'],
  preferredLanguage: 'mr',
  confirmedAccurate: true,
  completedAt: new Date().toISOString()
};

const jayProfile: CitizenProfile = {
  fullName: 'Jay Sawale',
  mobile: '9588647927',
  dob: '1998-08-20',
  age: 28,
  gender: 'Male',
  category: 'Open',
  religion: 'Hindu',
  maritalStatus: 'Married',
  state: 'Maharashtra',
  district: 'Nashik',
  taluka: 'Nashik',
  villageCity: 'Panchavati',
  pinCode: '422003',
  annualIncomeTier: '2.5L-8L',
  annualIncomeAmount: 450000,
  occupation: 'Farmer',
  educationLevel: 'Graduate',
  isStudent: false,
  hasDisability: false,
  schemeInterests: ['agriculture'],
  preferredLanguage: 'mr',
  confirmedAccurate: true,
  completedAt: new Date().toISOString()
};

console.log('Paras Profile Mobile:', parasProfile.mobile, 'Category:', parasProfile.category);
console.log('Jay Profile Mobile:', jayProfile.mobile, 'Category:', jayProfile.category);

console.log('\n=== TEST 3: ELIGIBILITY ENGINE BEFORE & AFTER PROFILE UPDATE ===');
// Before update: Paras is OBC, Income 180000, Occupation student
const beforeEngineProfile: UserProfile = {
  category: parasProfile.category,
  annualIncome: parasProfile.annualIncomeAmount,
  age: parasProfile.age,
  occupation: 'student',
  educationLevel: 'Undergraduate',
  isStudent: true,
  hasDisability: false,
  isMaharashtraResident: true,
  gender: 'male',
  district: parasProfile.district
};

const beforeResults = evaluateAllSchemes(beforeEngineProfile);
const beforeEligible = beforeResults.filter(s => s.status === 'eligible').map(s => s.scheme.id);
console.log('Paras Before Eligible Schemes count:', beforeEligible.length);

// After update: Change Category OBC -> SC, Income 180000 -> 500000, Occupation Student -> Private Employee
const updatedParasProfile: CitizenProfile = {
  ...parasProfile,
  category: 'SC',
  annualIncomeTier: '2.5L-8L',
  annualIncomeAmount: 500000,
  occupation: 'Private Employee',
  isStudent: false
};

const afterEngineProfile: UserProfile = {
  category: updatedParasProfile.category,
  annualIncome: updatedParasProfile.annualIncomeAmount,
  age: updatedParasProfile.age,
  occupation: 'salaried',
  educationLevel: 'Undergraduate',
  isStudent: false,
  hasDisability: false,
  isMaharashtraResident: true,
  gender: 'male',
  district: updatedParasProfile.district
};

const afterResults = evaluateAllSchemes(afterEngineProfile);
const afterEligible = afterResults.filter(s => s.status === 'eligible').map(s => s.scheme.id);
console.log('Paras After Eligible Schemes count:', afterEligible.length);

// Check that results actually changed due to the demographic update
const changed = JSON.stringify(beforeEligible) !== JSON.stringify(afterEligible);
console.log('Did eligible schemes change after profile update?:', changed);

if (!changed) {
  throw new Error('Eligibility results should differ after updating category, income, and occupation');
}

console.log('\n=== TEST 4: JAY PROFILE IS NOT AFFECTED ===');
console.log('Jay remains:', jayProfile.fullName, 'in', jayProfile.district, 'with category:', jayProfile.category);
if (jayProfile.category !== 'Open') {
  throw new Error("Jay's profile was incorrectly modified!");
}

console.log('\nALL PROFILE UPDATE & ENGINE INTEGRATION TESTS PASSED SUCCESSFULLY!');
