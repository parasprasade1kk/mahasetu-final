require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
require('dotenv').config();

const { supabase } = require('./config/supabase');
const bcrypt = require('bcryptjs');

const ADMIN_ID = process.env.ADMIN_ID || '1120610';
const ADMIN_PASSWORD_HASH =
  process.env.ADMIN_PASSWORD_HASH ||
  '$2a$10$ZB4s9wtLu841OUnZwDw/G.bU6Woe.BTNeyarNiH9jj3b25Qdnj11O';

const DEPARTMENTS = [
  {
    department_id: 'revenue',
    name: 'Revenue & Land Records Department',
    name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Income, Domicile, Land Records, Solvency, and Non-Creamy Layer services.',
  },
  {
    department_id: 'education',
    name: 'Higher & Technical Education Department',
    name_mr: 'उच्च व तंत्रशिक्षण विभाग',
    description: 'Post-Matric Scholarships, Tuition Fee waivers, E-Scholarships.',
  },
  {
    department_id: 'social_welfare',
    name: 'Social Justice & Special Assistance Department',
    name_mr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    description: 'Caste validity, Shravanbal pension, Divyangjan disability welfare schemes.',
  },
  {
    department_id: 'agriculture',
    name: 'Agriculture & Animal Husbandry Department',
    name_mr: 'कृषी व पशुसंवर्धन विभाग',
    description: 'PM Kisan, Namo Shetkari, e-Pik Pahani, Krishi Yantrikikaran.',
  },
  {
    department_id: 'food',
    name: 'Food & Civil Supplies Department',
    name_mr: 'अन्न व नागरी पुरवठा विभाग',
    description: 'Ration cards, PDS grain allocation, Antyodaya welfare cards.',
  },
];

const SCHEMES = [
  {
    scheme_id: 'post-matric-scholarship',
    name: 'Post-Matric Scholarship for OBC / EBC Students',
    name_mr: 'इतर मागासवर्गीय व आर्थिकदृष्ट्या दुर्बल घटकांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
    department_id: 'education',
    department_name: 'Higher & Technical Education Department',
    department_name_mr: 'उच्च व तंत्रशिक्षण विभाग',
    category: 'Education',
    category_mr: 'शिक्षण',
    description: 'Tuition and exam fee reimbursement plus monthly maintenance allowance for post-secondary education.',
    description_mr: 'महाविद्यालयीन विद्यार्थ्यांसाठी १००% शिक्षण शुल्क प्रतिपूर्ती आणि मासिक निर्वाह भत्ता.',
    benefits: '100% Tuition & Exam Fee paid directly to Institute + Maintenance allowance up to ₹1,200/mo',
    benefits_mr: '१००% शिक्षण व परीक्षा शुल्क थेट महाविद्यालयास अदा + दरमहा ₹१,२०० पर्यंत निर्वाह भत्ता',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Income below ₹8 Lakhs', 'Enrolled in recognized degree/diploma', 'Maharashtra Domicile'],
    eligibility_mr: ['वार्षिक उत्पन्न ₹८ लाखांपेक्षा कमी', 'मान्यताप्राप्त पदवी/पदविका अभ्यासक्रमात प्रवेशित', 'महाराष्ट्राचे अधिवास'],
    income_limit: 800000,
    income_operator: 'less_than_or_equal',
    min_age: 16,
    max_age: 35,
    allowed_categories: ['OBC', 'EWS', 'VJNT', 'SBC', 'General/Open'],
    student_required: true,
    residency_required: true,
    disability_required: false,
    keywords: ['scholarship', 'tuition', 'college', 'engineering', 'medical', 'exam fee', 'grant', 'hostel'],
    problem_types: ['College fee payment', 'Exam fee assistance', 'Education grant'],
    application_route: '/apply/scheme/post-matric-scholarship',
  },
  {
    scheme_id: 'disability-scholarship',
    name: 'Divyangjan Student Education & Assistive Allowance',
    name_mr: 'दिव्यांग विद्यार्थी शिक्षण व सहाय्यक साधन योजना',
    department_id: 'social_welfare',
    department_name: 'Social Justice & Special Assistance Department',
    department_name_mr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    category: 'Divyangjan',
    category_mr: 'दिव्यांग कल्याण',
    description: 'Financial assistance, reader allowance, and assistive devices grant for differently abled students.',
    description_mr: 'दिव्यांग विद्यार्थ्यांसाठी विद्यावेतन, वाचक भत्ता आणि मोफत सहाय्यक साधने वाटप.',
    benefits: 'Monthly stipend of ₹1,500 + Reader allowance of ₹400/mo + Free assistive devices',
    benefits_mr: 'मासिक ₹१,५०० विद्यावेतन + ₹४०० वाचक भत्ता + मोफत सहाय्यक साधने',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Minimum 40% certified disability', 'Enrolled in school or college', 'Family income below ₹2.5 Lakhs'],
    eligibility_mr: ['किमान ४०% प्रमाणित दिव्यांगत्व', 'शाळा किंवा महाविद्यालयात प्रवेशित', 'कौटुंबिक उत्पन्न ₹२.५ लाखांच्या आत'],
    income_limit: 250000,
    income_operator: 'less_than_or_equal',
    min_age: 6,
    max_age: 40,
    disability_required: true,
    residency_required: true,
    keywords: ['disability', 'divyang', 'handicapped', 'assistive', 'braille', 'wheelchair', 'special education'],
    problem_types: ['Disability education assistance', 'Assistive equipment funding'],
    application_route: '/apply/scheme/disability-scholarship',
  },
  {
    scheme_id: 'shravanbal-seva-rajya-nivruttivetan',
    name: 'Shravanbal Seva Rajya Nivruttivetan Yojana (Senior Citizen Pension)',
    name_mr: 'श्रावणबाळ सेवा राज्य निवृत्तीवेतन योजना',
    department_id: 'social_welfare',
    department_name: 'Social Justice & Special Assistance Department',
    department_name_mr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    category: 'Social Security',
    category_mr: 'सामाजिक सुरक्षा',
    description: 'Monthly direct financial pension for destitute and low-income senior citizens aged 65 years and above.',
    description_mr: '६५ वर्षे व त्यावरील निराधार व अल्प उत्पन्न ज्येष्ठ नागरिकांना दरमहा थेट आर्थिक निवृत्तीवेतन.',
    benefits: '₹1,500 per month deposited directly into bank account',
    benefits_mr: 'दरमहा ₹१,५०० थेट बँक खात्यात जमा',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Age 65 years or older', 'Family income below ₹21,000/yr or BPL list', 'Maharashtra resident for 15+ years'],
    eligibility_mr: ['वय ६५ वर्षे किंवा त्याहून अधिक', 'वार्षिक उत्पन्न ₹२१,००० पर्यंत किंवा बीपीएल यादीत नाव', 'महाराष्ट्रात किमान १५ वर्षे वास्तव्य'],
    income_limit: 50000,
    income_operator: 'less_than_or_equal',
    min_age: 65,
    max_age: 120,
    residency_required: true,
    keywords: ['pension', 'senior citizen', 'old age', 'elderly', 'monthly pension', 'shravanbal', 'destitute'],
    problem_types: ['Old age pension', 'Financial support for elderly'],
    application_route: '/apply/scheme/shravanbal-seva-rajya-nivruttivetan',
  },
  {
    scheme_id: 'namo-shetkari-mahasanman-nidhi',
    name: 'Namo Shetkari Mahasanman Nidhi Yojana',
    name_mr: 'नमो शेतकरी महासन्मान निधी योजना',
    department_id: 'agriculture',
    department_name: 'Agriculture & Animal Husbandry Department',
    department_name_mr: 'कृषी व पशुसंवर्धन विभाग',
    category: 'Agriculture',
    category_mr: 'कृषी',
    description: 'Additional financial grant of ₹6,000 per year directly to PM-KISAN beneficiary farmers in Maharashtra.',
    description_mr: 'महाराष्ट्रातील पीएम-किसान लाभार्थी शेतकऱ्यांना वार्षिक ₹६,००० चे अतिरिक्त आर्थिक सहाय्य.',
    benefits: '₹6,000 per year in 3 equal installments (₹2,000 each) via Aadhaar DBT',
    benefits_mr: 'वर्षाला ₹६,००० (३ हप्त्यांमध्ये प्रत्येकी ₹२,०००) थेट आधार DBT द्वारे',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Landholding farmer family in Maharashtra', 'Active PM-KISAN beneficiary', 'Aadhaar linked bank account'],
    eligibility_mr: ['महाराष्ट्रातील शेतजमीनधारक कुटुंब', 'पीएम-किसान योजनेचा सक्रिय लाभार्थी', 'आधार संलग्न बँक खाते'],
    occupations: ['Farmer', 'Agricultural Labourer'],
    residency_required: true,
    keywords: ['farmer', 'kisan', 'agriculture', 'land', 'crop', '7/12', 'cultivable', 'pm kisan', 'shetkari'],
    problem_types: ['Farming input costs', 'Agricultural financial aid', 'Kisan subsidy'],
    application_route: '/apply/scheme/namo-shetkari-mahasanman-nidhi',
  },
  {
    scheme_id: 'financial-assistance-scheme',
    name: 'Financial Assistance Scheme for Low-Income Families',
    name_mr: 'अल्प उत्पन्न कुटुंबांसाठी आर्थिक सहाय्य योजना',
    department_id: 'social_welfare',
    department_name: 'Social Justice & Special Assistance Department',
    department_name_mr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    category: 'Welfare',
    category_mr: 'कल्याण',
    description: 'Direct economic distress grant to low-income households for livelihood security.',
    description_mr: 'अल्प उत्पन्न कुटुंबांसाठी उपजीविका सुरक्षेसाठी थेट आर्थिक संकट निवारण अनुदान.',
    benefits: 'Direct financial assistance up to ₹25,000 to family account',
    benefits_mr: 'कुटुंबाच्या खात्यात थेट ₹२५,००० पर्यंत आर्थिक सहाय्य',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Family annual income below ₹1,00,000', 'Resident of Maharashtra'],
    eligibility_mr: ['कौटुंबिक वार्षिक उत्पन्न ₹१,००,००० पर्यंत', 'महाराष्ट्राचे रहिवासी'],
    income_limit: 100000,
    income_operator: 'less_than_or_equal',
    min_age: 18,
    max_age: 65,
    residency_required: true,
    keywords: ['financial assistance', 'low income', 'bpl', 'distress grant', 'family aid'],
    problem_types: ['Family financial distress', 'Economic relief'],
    application_route: '/apply/scheme/financial-assistance-scheme',
  },
  {
    scheme_id: 'women-welfare-scheme',
    name: 'Women Welfare Scheme & Empowerment Grant',
    name_mr: 'महिला कल्याण व सक्षमीकरण अनुदान योजना',
    department_id: 'social_welfare',
    department_name: 'Social Justice & Special Assistance Department',
    department_name_mr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    category: 'Women Welfare',
    category_mr: 'महिला कल्याण',
    description: 'Self-help and micro-livelihood seed fund grant for women entrepreneurs and self-help groups.',
    description_mr: 'महिला उद्योजक व बचत गटांसाठी स्वयंसहाय्यता व सूक्ष्म-उपजीविका बीजभांडवल अनुदान.',
    benefits: 'Seed capital grant of ₹50,000 with 0% interest livelihood credit',
    benefits_mr: '₹५०,००० बीजभांडवल अनुदान आणि शून्य टक्के व्याजाचे कर्ज सहाय्य',
    disbursement_mode: 'Direct Benefit Transfer (DBT)',
    disbursement_mode_mr: 'थेट लाभ हस्तांतरण (DBT)',
    eligibility: ['Women residents of Maharashtra aged 18-55', 'Annual income below ₹2,50,000'],
    eligibility_mr: ['महाराष्ट्रातील १८ ते ५५ वयोगटातील महिला', 'वार्षिक उत्पन्न ₹२,५०,००० च्या आत'],
    income_limit: 250000,
    income_operator: 'less_than_or_equal',
    min_age: 18,
    max_age: 55,
    gender: 'female',
    residency_required: true,
    keywords: ['women', 'mahila', 'self help group', 'bachat gat', 'empowerment', 'seed fund', 'micro business'],
    problem_types: ['Women microbusiness funding', 'Self help group subsidy'],
    application_route: '/apply/scheme/women-welfare-scheme',
  },
];

const SERVICES = [
  {
    service_id: 'income-certificate',
    name: 'Income Certificate (1/3 Years)',
    name_mr: 'उत्पन्नाचा दाखला (१ किंवा ३ वर्षे)',
    department_id: 'revenue',
    department_name: 'Revenue & Land Records Department',
    department_name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Statutory certificate certifying annual family income issued by the Tehsildar office.',
    description_mr: 'तहसीलदार कार्यालयामार्फत जारी करण्यात येणारा वार्षिक कौटुंबिक उत्पन्नाचा दाखला.',
    eligibility: 'Permanent resident of Maharashtra State with proof of income sources.',
    eligibility_mr: 'उत्पन्नाच्या पुराव्यासह महाराष्ट्र राज्याचे कायमचे रहिवासी.',
    application_route: '/apply/income-certificate',
    processing_days: 3,
    fee_inr: 33.6,
  },
  {
    service_id: 'age-nationality-domicile',
    name: 'Age, Nationality and Domicile Certificate',
    name_mr: 'वय, राष्ट्रीयत्व आणि अधिवास प्रमाणपत्र',
    department_id: 'revenue',
    department_name: 'Revenue & Land Records Department',
    department_name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Legal certificate establishing continuous 15-year residency in Maharashtra and Indian citizenship.',
    description_mr: 'महाराष्ट्रात सलग १५ वर्षे वास्तव्य व भारतीय नागरिकत्व प्रमाणित करणारा अधिकृत दाखला.',
    eligibility: 'Resident of Maharashtra continuously for minimum 15 years.',
    eligibility_mr: 'महाराष्ट्रात किमान १५ वर्षे सलग वास्तव्य असणारे नागरिक.',
    application_route: '/apply/age-nationality-domicile',
    processing_days: 7,
    fee_inr: 33.6,
  },
  {
    service_id: 'caste-certificate',
    name: 'Caste Certificate (SC/ST/VJNT/OBC/SBC)',
    name_mr: 'जात प्रमाणपत्र (अजा/अज/विजाभज/इमाव/विमाप्र)',
    department_id: 'revenue',
    department_name: 'Revenue & Land Records Department',
    department_name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Statutory caste certificate issued by Sub-Divisional Officer based on pre-mandated cutoff date records.',
    description_mr: 'उपविभागीय अधिकाऱ्यांमार्फत जारी करण्यात येणारे अधिकृत जात प्रमाणपत्र.',
    eligibility: 'Permanent resident belonging to recognized backward classes in Maharashtra.',
    eligibility_mr: 'महाराष्ट्रातील मान्यताप्राप्त मागास प्रवर्गातील रहिवासी.',
    application_route: '/apply/caste-certificate',
    processing_days: 21,
    fee_inr: 33.6,
  },
  {
    service_id: 'non-creamy-layer',
    name: 'Non-Creamy Layer Certificate',
    name_mr: 'नॉन-क्रिमीलेयर प्रमाणपत्र',
    department_id: 'revenue',
    department_name: 'Revenue & Land Records Department',
    department_name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Certificate certifying family gross annual income below statutory ceiling of ₹8 Lakhs for OBC/VJNT/SBC reservations.',
    description_mr: 'इमाव/विजाभज प्रवर्गासाठी कौटुंबिक वार्षिक उत्पन्न ₹८ लाखांच्या आत असल्याचे प्रमाणपत्र.',
    eligibility: 'OBC/VJNT/SBC/SEBC citizens whose family income does not exceed ₹8,00,000 for consecutive 3 years.',
    eligibility_mr: 'मागील सलग ३ वर्षे कौटुंबिक उत्पन्न ₹८ लाखांपेक्षा कमी असणारे इमाव/विजाभज नागरिक.',
    application_route: '/apply/non-creamy-layer',
    processing_days: 7,
    fee_inr: 33.6,
  },
  {
    service_id: 'land-record-7-12',
    name: '7/12 Extract & 8A Digitally Signed Land Record (e-Mahabhumi)',
    name_mr: 'डिजिटल स्वाक्षरीत ७/१२ व ८-अ जमीन उतारा (ई-महाभूमी)',
    department_id: 'revenue',
    department_name: 'Revenue & Land Records Department',
    department_name_mr: 'महसूल व भूमी अभिलेख विभाग',
    description: 'Digitally signed Record of Rights and land holding extract from Land Records Authority with legal validity under IT Act.',
    description_mr: 'जमीन मालकी हक्काचा अधिकृत डिजिटल स्वाक्षरीत सातबारा व आठ-अ उतारा.',
    eligibility: 'Any citizen or agricultural landowner in Maharashtra having valid Gat/Survey number.',
    eligibility_mr: 'गट क्रमांक किंवा सर्व्हे क्रमांक असणारे कोणतेही शेतकरी किंवा नागरिक.',
    application_route: '/apply/land-record-7-12',
    processing_days: 1,
    fee_inr: 15.0,
  },
];

const SEED_CITIZENS = [
  {
    userId: 'MH-CIT-001',
    fullName: 'Paras Prasade',
    fullNameMr: 'पारस प्रसादे',
    mobile: '7276218598',
    email: 'paras.prasade@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7276',
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
      studentStatus: true,
      currentCourse: 'B.Tech / Computer Engineering',
      institutionType: 'Autonomous College / University',
      academicYear: 'Final Year',
      disabilityStatus: false,
      schemeInterests: ['education', 'employment', 'business'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digilockerLinked: true,
      digilockerId: 'DL-MH-8598-4019',
    },
  },
  {
    userId: 'MH-CIT-002',
    fullName: 'Jay Sawale',
    fullNameMr: 'जय सावळे',
    mobile: '9588647927',
    email: 'jay.sawale@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 9588',
    profile: {
      dob: '1998-08-20',
      age: 28,
      gender: 'Male',
      category: 'General/Open',
      annualIncomeTier: '2.5L-8L',
      annualIncomeAmount: 420000,
      district: 'Nashik',
      taluka: 'Nashik',
      villageCity: 'Nashik City',
      pinCode: '422002',
      occupation: 'Self-Employed / Business',
      educationLevel: 'Graduate',
      studentStatus: false,
      disabilityStatus: false,
      schemeInterests: ['business', 'housing'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digilockerLinked: true,
      digilockerId: 'DL-MH-7927-1102',
    },
  },
  {
    userId: 'MH-CIT-003',
    fullName: 'Ananya Deshmukh',
    fullNameMr: 'अनन्या देशमुख',
    mobile: '9822012345',
    email: 'ananya.deshmukh@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 2345',
    profile: {
      dob: '2001-11-10',
      age: 25,
      gender: 'Female',
      category: 'EWS',
      annualIncomeTier: 'under-50k',
      annualIncomeAmount: 45000,
      district: 'Aurangabad (Chhatrapati Sambhajinagar)',
      taluka: 'Aurangabad',
      villageCity: 'Aurangabad',
      pinCode: '431001',
      occupation: 'Student',
      educationLevel: 'Post Graduate',
      studentStatus: true,
      currentCourse: 'M.Sc Biotechnology',
      institutionType: 'State University',
      academicYear: 'Second Year',
      disabilityStatus: false,
      schemeInterests: ['education', 'women'],
      preferredLanguage: 'en',
      confirmedAccurate: true,
      digilockerLinked: true,
      digilockerId: 'DL-MH-2345-9081',
    },
  },
  {
    userId: 'MH-CIT-004',
    fullName: 'Rameshwar Patil',
    fullNameMr: 'रामेश्वर पाटील',
    mobile: '9423067890',
    email: 'rameshwar.patil@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 7890',
    profile: {
      dob: '1976-03-25',
      age: 50,
      gender: 'Male',
      category: 'General/Open',
      annualIncomeTier: '50k-1L',
      annualIncomeAmount: 90000,
      district: 'Kolhapur',
      taluka: 'Karveer',
      villageCity: 'Shiroli',
      pinCode: '416122',
      occupation: 'Farmer',
      educationLevel: '10th Pass',
      studentStatus: false,
      disabilityStatus: false,
      schemeInterests: ['agriculture', 'social_security'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digilockerLinked: true,
      digilockerId: 'DL-MH-7890-4412',
    },
  },
  {
    userId: 'MH-CIT-005',
    fullName: 'Pooja Gaikwad',
    fullNameMr: 'पूजा गायकवाड',
    mobile: '9657098765',
    email: 'pooja.gaikwad@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 8765',
    profile: {
      dob: '1995-07-14',
      age: 31,
      gender: 'Female',
      category: 'SC',
      annualIncomeTier: 'under-50k',
      annualIncomeAmount: 48000,
      district: 'Solapur',
      taluka: 'Solapur North',
      villageCity: 'Solapur City',
      pinCode: '413001',
      occupation: 'Private Job',
      educationLevel: 'Diploma',
      studentStatus: false,
      disabilityStatus: false,
      schemeInterests: ['women', 'employment', 'housing'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digilockerLinked: false,
    },
  },
  {
    userId: 'MH-CIT-006',
    fullName: 'Santosh Kamble',
    fullNameMr: 'संतोष कांबळे',
    mobile: '9764054321',
    email: 'santosh.kamble@citizen.mahasetu.gov.in',
    aadhaarMasked: 'XXXX XXXX 4321',
    profile: {
      dob: '1988-12-05',
      age: 37,
      gender: 'Male',
      category: 'SC',
      annualIncomeTier: '50k-1L',
      annualIncomeAmount: 80000,
      district: 'Nagpur',
      taluka: 'Nagpur Urban',
      villageCity: 'Nagpur City',
      pinCode: '440001',
      occupation: 'Self-Employed / Business',
      educationLevel: '12th Pass',
      studentStatus: false,
      disabilityStatus: true,
      disabilityType: 'Locomotor Disability',
      disabilityPercentage: 55,
      schemeInterests: ['disability', 'business', 'social_security'],
      preferredLanguage: 'mr',
      confirmedAccurate: true,
      digilockerLinked: true,
      digilockerId: 'DL-MH-4321-7788',
    },
  },
];

async function seed() {
  console.log('\n================================================================');
  console.log('🏛️  MahaSetu Supabase Database Seeder');
  console.log('================================================================\n');

  try {
    // 1. Seed Departments
    console.log('Seeding Departments...');
    for (const dept of DEPARTMENTS) {
      const { error } = await supabase.from('departments').upsert(dept, { onConflict: 'department_id' });
      if (error) console.error(`Error seeding department ${dept.department_id}:`, error.message);
    }
    console.log(`✅ [Departments]: ${DEPARTMENTS.length} records verified.`);

    // 2. Seed Admin User
    console.log('Seeding Dedicated Admin User...');
    const adminRecord = {
      admin_id: ADMIN_ID,
      name: 'Shri. S. K. Deshmukh (Addl. Secretary, GAD)',
      password_hash: ADMIN_PASSWORD_HASH,
      role: 'admin',
      active: true,
      last_login: new Date().toISOString(),
    };
    const { error: adminErr } = await supabase.from('admin_users').upsert(adminRecord, { onConflict: 'admin_id' });
    if (adminErr) console.error('Error seeding admin user:', adminErr.message);
    else console.log(`✅ [Admin User]: ID ${ADMIN_ID} verified.`);

    // 3. Seed Schemes
    console.log('Seeding Schemes...');
    for (const scheme of SCHEMES) {
      const { error } = await supabase.from('schemes').upsert(scheme, { onConflict: 'scheme_id' });
      if (error) console.error(`Error seeding scheme ${scheme.scheme_id}:`, error.message);
    }
    console.log(`✅ [Schemes]: ${SCHEMES.length} welfare schemes verified.`);

    // 4. Seed Services
    console.log('Seeding Services...');
    for (const service of SERVICES) {
      const { error } = await supabase.from('services').upsert(service, { onConflict: 'service_id' });
      if (error) console.error(`Error seeding service ${service.service_id}:`, error.message);
    }
    console.log(`✅ [Services]: ${SERVICES.length} citizen services verified.`);

    // 5. Seed Pre-Registered Demo Citizens
    console.log('Seeding Pre-Registered Demo Citizens...');
    for (const cit of SEED_CITIZENS) {
      const crypto = require('crypto');
      const aadhaarRaw = '11112222' + cit.mobile.slice(-4);
      const aadhaarHash = crypto.createHash('sha256').update(aadhaarRaw).digest('hex');

      const profilePayload = {
        user_id: cit.userId,
        full_name: cit.fullName,
        full_name_mr: cit.fullNameMr,
        mobile_number: cit.mobile,
        email: cit.email,
        aadhaar_hash: aadhaarHash,
        aadhaar_masked: cit.aadhaarMasked,
        aadhaar_consent_given: true,
        aadhaar_consent_at: new Date().toISOString(),
        date_of_birth: cit.profile.dob,
        age: cit.profile.age,
        gender: cit.profile.gender,
        district: cit.profile.district,
        taluka: cit.profile.taluka,
        village_city: cit.profile.villageCity,
        pin_code: cit.profile.pinCode,
        category: cit.profile.category,
        annual_family_income: cit.profile.annualIncomeAmount,
        annual_income_tier: cit.profile.annualIncomeTier,
        occupation: cit.profile.occupation,
        education_level: cit.profile.educationLevel,
        student_status: cit.profile.studentStatus,
        current_course: cit.profile.currentCourse,
        institution_type: cit.profile.institutionType,
        academic_year: cit.profile.academicYear,
        disability_status: cit.profile.disabilityStatus,
        disability_type: cit.profile.disabilityType,
        disability_percentage: cit.profile.disabilityPercentage,
        scheme_interests: cit.profile.schemeInterests,
        preferred_language: cit.profile.preferredLanguage,
        confirmed_accurate: cit.profile.confirmedAccurate,
        digilocker_linked: cit.profile.digilockerLinked,
        digilocker_id: cit.profile.digilockerId,
        profile_completed: true,
      };

      const { error: profErr } = await supabase.from('profiles').upsert(profilePayload, { onConflict: 'user_id' });
      if (profErr) console.error(`Error seeding profile for ${cit.userId}:`, profErr.message);

      // Seed baseline DPDP consents
      const consents = [
        {
          consent_id: `CNS-${cit.userId}-001`,
          user_id: cit.userId,
          requesting_dept: 'Higher & Technical Education Department',
          requesting_dept_mr: 'उच्च व तंत्रशिक्षण विभाग',
          source_dept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
          source_dept_mr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
          purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
          purpose_mr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
          data_fields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref', 'Caste Certificate Ref'],
          status: 'Active',
          valid_until: '31 Mar 2027',
        },
        {
          consent_id: `CNS-${cit.userId}-002`,
          user_id: cit.userId,
          requesting_dept: 'Agriculture Department (e-Pik Pahani)',
          requesting_dept_mr: 'कृषी विभाग (ई-पीक पाहणी)',
          source_dept: 'Revenue Department (7/12 Land Registry)',
          source_dept_mr: 'महसूल विभाग (७/१२ जमीन नोंदणी)',
          purpose: 'Verification of land ownership for PM Kisan & Namo Shetkari Mahasanman Yojana',
          purpose_mr: 'पीएम किसान आणि नमो शेतकरी महासन्मान योजनेसाठी जमिनीच्या मालकीची पडताळणी',
          data_fields: ['7/12 Extract (Record of Rights)', 'Gat Number', 'Crop Survey 2026'],
          status: 'Active',
          valid_until: '31 Dec 2026',
        },
      ];

      for (const c of consents) {
        await supabase.from('consents').upsert(c, { onConflict: 'consent_id' });
      }
    }
    console.log(`✅ [Citizens]: ${SEED_CITIZENS.length} demo citizens seeded.`);

    // Seed Demo Applications for Paras Prasade (MH-CIT-001) so he has demo tracking records
    const demoApps = [
      {
        application_id: 'MH-REV-2025-88319',
        user_id: 'MH-CIT-001',
        type: 'service',
        service_id: 'income-certificate',
        service_name: 'Income Certificate (1 Year)',
        service_name_mr: 'उत्पन्नाचा दाखला (१ वर्ष)',
        department_id: 'revenue',
        department: 'Revenue Department',
        department_mr: 'महसूल विभाग',
        applicant_name: 'Paras Prasade',
        district: 'Pune',
        status: 'Approved',
        status_color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
        applied_date: '02 Sep 2026',
        submitted_at: '2026-09-02T10:00:00Z',
      },
      {
        application_id: 'MH-EDU-2026-44102',
        user_id: 'MH-CIT-001',
        type: 'scheme',
        scheme_id: 'post-matric-scholarship',
        scheme_name: 'Post-Matric Scholarship for OBC Students',
        service_name: 'Post-Matric Scholarship for OBC Students',
        service_name_mr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
        department_id: 'education',
        department: 'Higher & Technical Education',
        department_mr: 'उच्च व तंत्रशिक्षण विभाग',
        applicant_name: 'Paras Prasade',
        district: 'Pune',
        status: 'Under Review',
        status_color: 'bg-amber-100 text-amber-800 border-amber-300',
        applied_date: '04 Sep 2026',
        submitted_at: '2026-09-04T12:00:00Z',
      },
    ];

    for (const app of demoApps) {
      await supabase.from('applications').upsert(app, { onConflict: 'application_id' });
      await supabase.from('application_timeline').upsert(
        {
          application_id: app.application_id,
          status: app.status,
          message: `Application is currently ${app.status}.`,
          changed_by: 'Authorized Government Officer',
        },
        { onConflict: 'id' }
      );
    }
    console.log(`✅ [Demo Applications]: Initial application records seeded for demonstration.`);

    // Seed Demo DigiLocker Documents for Paras Prasade
    const demoDocs = [
      {
        document_id: 'DOC-MH-88319',
        user_id: 'MH-CIT-001',
        document_type: 'Income Proof',
        document_name: 'Annual Income Certificate (1 Year)',
        document_name_mr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
        source: 'DigiLocker',
        verification_status: 'Verified',
        issued_date: '2026-09-04T00:00:00Z',
        file_size: '245 KB',
        file_name: 'income_certificate_2026.pdf',
        mime_type: 'application/pdf',
      },
      {
        document_id: 'DOC-MH-51092',
        user_id: 'MH-CIT-001',
        document_type: 'Caste & Category',
        document_name: 'Caste Certificate (OBC - Kunbi)',
        document_name_mr: 'जात प्रमाणपत्र (इमाव - कुणबी)',
        source: 'DigiLocker',
        verification_status: 'Verified',
        issued_date: '2024-01-12T00:00:00Z',
        file_size: '310 KB',
        file_name: 'caste_certificate_obc.pdf',
        mime_type: 'application/pdf',
      },
    ];

    for (const d of demoDocs) {
      await supabase.from('documents').upsert(d, { onConflict: 'document_id' });
    }
    console.log(`✅ [Demo Documents]: Initial document vault seeded for demonstration.`);

    console.log('\n🎉 [Supabase Seeding Finished Successfully!]');
  } catch (err) {
    console.error('❌ Seeding error:', err);
  }
}

seed();
