"use strict";
// ─── Statutory Rule-Engine Eligibility Engine ────────────────────────────────
// Evaluates citizen demographic profiles against structured scheme rules.
// Supports multi-factor eligibility: Income, Category, Age, Education,
// Occupation, Disability, Student Status, Residency, and Gender.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHEME_RULES = void 0;
exports.normalizeCategory = normalizeCategory;
exports.normalizeIncome = normalizeIncome;
exports.formatINR = formatINR;
exports.evaluateSchemeEligibility = evaluateSchemeEligibility;
exports.evaluateAllSchemes = evaluateAllSchemes;
const schemeDatabase_1 = require("./schemeDatabase");
// ─── Normalization Utilities ──────────────────────────────────────────────────
function normalizeCategory(cat) {
    const c = (cat || '').trim().toUpperCase();
    if (['SC', 'SCHEDULED CASTE', 'SCHEDULED_CASTE'].includes(c))
        return 'SC';
    if (['ST', 'SCHEDULED TRIBE', 'SCHEDULED_TRIBE'].includes(c))
        return 'ST';
    if (['OBC', 'OTHER BACKWARD CLASS', 'OTHER BACKWARD CLASSES'].includes(c))
        return 'OBC';
    if (['VJNT', 'VJ/NT', 'NT', 'VIMUKTA JATI'].some(k => c.includes(k)))
        return 'VJNT';
    if (['SBC', 'SPECIAL BACKWARD CLASS'].includes(c))
        return 'SBC';
    if (['EWS', 'ECONOMICALLY WEAKER SECTION'].includes(c))
        return 'EWS';
    if (['OPEN', 'GENERAL', 'OPEN / GENERAL'].some(k => c.includes(k)))
        return 'OPEN';
    if (['MINORITY', 'MUSLIM', 'BUDDHIST', 'JAIN', 'CHRISTIAN', 'PARSI', 'SIKH'].some(k => c.includes(k)))
        return 'Minority';
    return c || 'OPEN';
}
function normalizeIncome(val) {
    if (typeof val === 'number')
        return isNaN(val) ? 0 : val;
    if (!val)
        return 0;
    const str = String(val).trim();
    if (str === 'under-2.5L')
        return 150000;
    if (str === '2.5L-8L')
        return 500000;
    if (str === 'above-8L')
        return 900000;
    // Clean currency symbols and commas
    const cleaned = str.replace(/[₹,\s]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
}
function formatINR(val) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(val);
}
// ─── Scheme Eligibility Rules Master Table ───────────────────────────────────
// Structured eligibility criteria for all 30 schemes across departments.
exports.SCHEME_RULES = {
    // ── REVENUE DEPARTMENT (10) ────────────────────────────────────────────────
    'REV-001': {
        // Income Certificate
        isService: true,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-002': {
        // Caste Certificate
        isService: true,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-003': {
        // Maharashtra Domicile Certificate
        isService: true,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-004': {
        // Non-Creamy Layer Certificate
        isService: true,
        incomeLimit: 800000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['OBC', 'VJNT', 'SBC', 'EWS'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-005': {
        // Senior Citizen Certificate
        isService: true,
        minAge: 60,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['senior', 'any'],
        residencyRequired: true,
    },
    'REV-006': {
        // 7/12 Land Extract
        isService: true,
        incomeOperator: 'none',
        occupations: ['farmer', 'any'],
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'REV-007': {
        // City Survey Property Card
        isService: true,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-008': {
        // Agricultural Land Assistance & Compensation
        isService: false,
        occupations: ['farmer'],
        incomeLimit: 300000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'REV-009': {
        // Revenue Disaster & Natural Calamity Relief
        isService: false,
        incomeLimit: 350000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['any'],
        residencyRequired: true,
    },
    'REV-010': {
        // Certificate of Residence / Talathi Dakhla
        isService: true,
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        occupations: ['any'],
        residencyRequired: true,
    },
    // ── EDUCATION DEPARTMENT (10) ──────────────────────────────────────────────
    'EDU-001': {
        // Post-Matric Scholarship for Backward Class Students
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS'],
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        minAge: 16,
        maxAge: 35,
        educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-002': {
        // Pre-Matric Scholarship for Minorities & Backward Classes
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['SC', 'ST', 'Minority', 'OBC', 'VJNT'],
        incomeLimit: 100000,
        incomeOperator: 'less_than_or_equal',
        minAge: 6,
        maxAge: 16,
        educationLevels: ['School'],
        residencyRequired: true,
    },
    'EDU-003': {
        // Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['OPEN', 'EWS', 'OBC', 'VJNT', 'SBC', 'SC', 'ST'],
        incomeLimit: 800000,
        incomeOperator: 'less_than_or_equal',
        minAge: 17,
        maxAge: 32,
        educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-004': {
        // Dr. Panjabrao Deshmukh Hostel Maintenance Allowance
        isService: false,
        studentRequired: true,
        occupations: ['student', 'farmer'],
        allowedCategories: ['OPEN', 'EWS', 'OBC', 'SC', 'ST', 'VJNT', 'SBC'],
        incomeLimit: 800000,
        incomeOperator: 'less_than_or_equal',
        educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-005': {
        // Laptop & Digital Device Subsidy for Students
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC'],
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        educationLevels: ['Undergraduate', 'Postgraduate', 'Diploma'],
        residencyRequired: true,
    },
    'EDU-006': {
        // Higher & Technical Education Fee Reimbursement
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['OPEN', 'EWS', 'OBC', 'VJNT', 'SBC'],
        incomeLimit: 800000,
        incomeOperator: 'less_than_or_equal',
        educationLevels: ['Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-007': {
        // Open Merit Scholarship for Girls
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        gender: 'female',
        allowedCategories: ['OPEN', 'EWS', 'OBC', 'SC', 'ST', 'VJNT', 'SBC'],
        incomeLimit: 500000,
        incomeOperator: 'less_than_or_equal',
        minAge: 15,
        maxAge: 25,
        educationLevels: ['School', 'Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-008': {
        // Savitribai Phule Scholarship for SC/ST/VJNT Girls
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        gender: 'female',
        allowedCategories: ['SC', 'ST', 'VJNT'],
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        minAge: 10,
        maxAge: 25,
        educationLevels: ['School', 'Diploma', 'Undergraduate'],
        residencyRequired: true,
    },
    'EDU-009': {
        // Swadhar Yojana for SC/ST Higher Studies
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['SC', 'ST'],
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        minAge: 17,
        maxAge: 32,
        educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    'EDU-010': {
        // Minority Professional Education Support
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        allowedCategories: ['Minority', 'OBC', 'EWS'],
        incomeLimit: 600000,
        incomeOperator: 'less_than_or_equal',
        educationLevels: ['Diploma', 'Undergraduate', 'Postgraduate'],
        residencyRequired: true,
    },
    // ── SOCIAL WELFARE DEPARTMENT (10) ─────────────────────────────────────────
    'SOC-001': {
        // Sanjay Gandhi Niradhar Anudan Yojana (Destitute Pension)
        isService: false,
        occupations: ['destitute', 'senior', 'woman', 'any'],
        incomeLimit: 50000,
        incomeOperator: 'less_than_or_equal',
        minAge: 18,
        maxAge: 65,
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    // ── SOCIAL WELFARE DEPARTMENT (10) ─────────────────────────────────────────
    'SW-001': {
        // Disability Pension
        isService: false,
        disabilityRequired: true,
        minAge: 18,
        maxAge: 65,
        incomeLimit: 100000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'SW-002': {
        // Disability Financial Assistance
        isService: false,
        disabilityRequired: true,
        minAge: 18,
        maxAge: 60,
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'SW-003': {
        // Senior Citizen Assistance
        isService: false,
        occupations: ['senior', 'any'],
        minAge: 60,
        incomeLimit: 200000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'SW-004': {
        // Social Welfare Financial Assistance
        isService: false,
        incomeLimit: 150000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC'],
        residencyRequired: true,
    },
    'SW-005': {
        // Housing Assistance (Ramai Awas)
        isService: false,
        allowedCategories: ['SC', 'ST'],
        incomeLimit: 150000,
        incomeOperator: 'less_than_or_equal',
        occupations: ['any'],
        residencyRequired: true,
    },
    'SW-006': {
        // Women Welfare Assistance
        isService: false,
        gender: 'female',
        occupations: ['woman', 'homemaker', 'any'],
        incomeLimit: 250000,
        incomeOperator: 'less_than_or_equal',
        minAge: 18,
        maxAge: 60,
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'SW-007': {
        // Family Welfare Assistance
        isService: false,
        gender: 'female',
        occupations: ['woman', 'destitute', 'any'],
        incomeLimit: 150000,
        incomeOperator: 'less_than_or_equal',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
    'SW-008': {
        // Student Welfare Assistance (SW)
        isService: false,
        studentRequired: true,
        occupations: ['student'],
        incomeLimit: 450000,
        incomeOperator: 'less_than_or_equal',
        minAge: 17,
        maxAge: 28,
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC'],
        residencyRequired: true,
    },
    'SW-009': {
        // Minority Welfare Assistance
        isService: false,
        occupations: ['any'],
        allowedCategories: ['Minority', 'OBC', 'EWS'],
        incomeLimit: 300000,
        incomeOperator: 'less_than_or_equal',
        residencyRequired: true,
    },
    'SW-010': {
        // Social Security Assistance
        isService: false,
        incomeLimit: 100000,
        incomeOperator: 'less_than_or_equal',
        minAge: 18,
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
        residencyRequired: true,
    },
};
// ─── Document to Service Cross-Mapping ───────────────────────────────────────
const SERVICE_RECOMMENDATIONS = {
    'DOC-INC': {
        id: 'REV-001',
        name: 'Apply for Income Certificate',
        nameMr: 'उत्पन्नाचा दाखला अर्ज करा',
        dept: 'Revenue Department',
        deptMr: 'महसूल विभाग',
    },
    'DOC-CASTE': {
        id: 'REV-002',
        name: 'Apply for Caste Certificate',
        nameMr: 'जात प्रमाणपत्र अर्ज करा',
        dept: 'Revenue Department',
        deptMr: 'महसूल विभाग',
    },
    'DOC-DOM': {
        id: 'REV-003',
        name: 'Apply for Domicile Certificate',
        nameMr: 'अधिवास प्रमाणपत्र अर्ज करा',
        dept: 'Revenue Department',
        deptMr: 'महसूल विभाग',
    },
    'DOC-712': {
        id: 'REV-006',
        name: 'Download Digital 7/12 Extract',
        nameMr: 'डिजिटल ७/१२ उतारा डाउनलोड करा',
        dept: 'Revenue Department (e-Mahabhumi)',
        deptMr: 'महसूल विभाग (ई-महाभूमी)',
    },
    'DOC-NCL': {
        id: 'REV-004',
        name: 'Apply for Non-Creamy Layer Certificate',
        nameMr: 'नॉन-क्रिमीलेअर दाखला अर्ज करा',
        dept: 'Revenue Department',
        deptMr: 'महसूल विभाग',
    },
};
// ─── Single Scheme Evaluation Function ───────────────────────────────────────
function evaluateSchemeEligibility(profile, scheme) {
    // Merge scheme's embedded rules or lookup from master table
    const rules = scheme.structuredEligibility || exports.SCHEME_RULES[scheme.id] || {
        incomeOperator: 'none',
        allowedCategories: ['SC', 'ST', 'OBC', 'VJNT', 'SBC', 'EWS', 'OPEN'],
    };
    const normUserCat = normalizeCategory(profile.category);
    const userIncome = profile.annualIncome;
    const userAge = profile.age;
    const isStudent = profile.isStudent || profile.occupation === 'student';
    const checks = [];
    const passedReasonsEn = [];
    const passedReasonsMr = [];
    const failedReasonsEn = [];
    const failedReasonsMr = [];
    let hardFails = 0;
    let softWarnings = 0;
    let totalApplicableRules = 0;
    let passedRules = 0;
    // 1. RESIDENCY CHECK
    if (rules.residencyRequired) {
        totalApplicableRules++;
        const resPass = profile.isMaharashtraResident !== false;
        if (resPass) {
            passedRules++;
            passedReasonsEn.push('Maharashtra residency requirement satisfied');
            passedReasonsMr.push('महाराष्ट्र अधिवास निकष पूर्ण');
            checks.push({
                id: 'residency',
                name: 'State Residency',
                nameMr: 'राज्य अधिवास',
                passed: true,
                userValue: profile.district ? `${profile.district}, Maharashtra` : 'Maharashtra',
                requiredValue: 'Maharashtra Resident',
                messageEn: 'Permanent resident of Maharashtra verified',
                messageMr: 'महाराष्ट्राचे कायमस्वरूपी रहिवासी प्रमाणित',
            });
        }
        else {
            hardFails++;
            failedReasonsEn.push('Requires permanent residency in Maharashtra');
            failedReasonsMr.push('महाराष्ट्राचे कायमचे रहिवासी असणे आवश्यक');
            checks.push({
                id: 'residency',
                name: 'State Residency',
                nameMr: 'राज्य अधिवास',
                passed: false,
                userValue: 'Out of State',
                requiredValue: 'Maharashtra Resident',
                messageEn: 'Scheme requires permanent Maharashtra residency',
                messageMr: 'या योजनेसाठी महाराष्ट्र अधिवास अनिवार्य आहे',
            });
        }
    }
    // 2. CATEGORY CHECK
    if (rules.allowedCategories && rules.allowedCategories.length > 0) {
        totalApplicableRules++;
        const normAllowed = rules.allowedCategories.map(normalizeCategory);
        const catPass = normAllowed.includes(normUserCat) || normAllowed.includes('ALL');
        if (catPass) {
            passedRules++;
            passedReasonsEn.push(`Category ${profile.category} is eligible`);
            passedReasonsMr.push(`प्रवर्ग ${profile.category} पात्र आहे`);
            checks.push({
                id: 'category',
                name: 'Social Category',
                nameMr: 'सामाजिक प्रवर्ग',
                passed: true,
                userValue: profile.category,
                requiredValue: rules.allowedCategories.join(', '),
                messageEn: `Category ${profile.category} satisfies scheme requirements`,
                messageMr: `प्रवर्ग ${profile.category} या योजनेच्या अटींमध्ये समाविष्ट आहे`,
            });
        }
        else {
            hardFails++;
            const reqStr = rules.allowedCategories.join(', ');
            failedReasonsEn.push(`Category ${profile.category} is not eligible (Restricted to ${reqStr})`);
            failedReasonsMr.push(`प्रवर्ग ${profile.category} या योजनेसाठी पात्र नाही (केवळ ${reqStr} साठी)`);
            checks.push({
                id: 'category',
                name: 'Social Category',
                nameMr: 'सामाजिक प्रवर्ग',
                passed: false,
                userValue: profile.category,
                requiredValue: reqStr,
                messageEn: `Category ${profile.category} is not among eligible categories (${reqStr})`,
                messageMr: `आपला प्रवर्ग ${profile.category} या योजनेच्या निकषात बसत नाही (${reqStr})`,
            });
        }
    }
    // 3. INCOME CHECK
    const incomeOp = rules.incomeOperator || (rules.incomeLimit ? 'less_than_or_equal' : 'none');
    if (incomeOp !== 'none') {
        totalApplicableRules++;
        let incomePass = true;
        let failMsgEn = '';
        let failMsgMr = '';
        if (incomeOp === 'less_than_or_equal' && typeof rules.incomeLimit === 'number') {
            if (userIncome <= rules.incomeLimit) {
                incomePass = true;
            }
            else {
                incomePass = false;
                failMsgEn = `Your annual family income of ${formatINR(userIncome)} exceeds the stated income limit of ${formatINR(rules.incomeLimit)}`;
                failMsgMr = `आपले वार्षिक उत्पन्न ${formatINR(userIncome)} कमाल उत्पन्न मर्यादा ${formatINR(rules.incomeLimit)} पेक्षा जास्त आहे`;
            }
        }
        else if (incomeOp === 'greater_than_or_equal' && typeof rules.minIncome === 'number') {
            if (userIncome >= rules.minIncome) {
                incomePass = true;
            }
            else {
                incomePass = false;
                failMsgEn = `Your annual family income of ${formatINR(userIncome)} is below the required minimum of ${formatINR(rules.minIncome)}`;
                failMsgMr = `आपले वार्षिक उत्पन्न ${formatINR(userIncome)} किमान आवश्यक मर्यादा ${formatINR(rules.minIncome)} पेक्षा कमी आहे`;
            }
        }
        else if (incomeOp === 'between' && typeof rules.minIncome === 'number' && typeof rules.maxIncome === 'number') {
            if (userIncome >= rules.minIncome && userIncome <= rules.maxIncome) {
                incomePass = true;
            }
            else {
                incomePass = false;
                failMsgEn = `Your income of ${formatINR(userIncome)} is outside the allowed bracket (${formatINR(rules.minIncome)} - ${formatINR(rules.maxIncome)})`;
                failMsgMr = `आपले उत्पन्न ${formatINR(userIncome)} विहित उत्पन्न मर्यादेबाहेर आहे (${formatINR(rules.minIncome)} - ${formatINR(rules.maxIncome)})`;
            }
        }
        if (incomePass) {
            passedRules++;
            const limitStr = rules.incomeLimit ? formatINR(rules.incomeLimit) : 'N/A';
            passedReasonsEn.push(`Annual family income of ${formatINR(userIncome)} is within the required limit (${limitStr})`);
            passedReasonsMr.push(`वार्षिक उत्पन्न ${formatINR(userIncome)} विहित मर्यादेत (${limitStr}) आहे`);
            checks.push({
                id: 'income',
                name: 'Family Income',
                nameMr: 'कौटुंबिक उत्पन्न',
                passed: true,
                userValue: formatINR(userIncome),
                requiredValue: rules.incomeLimit ? `≤ ${formatINR(rules.incomeLimit)}` : 'Compliant',
                messageEn: `Income of ${formatINR(userIncome)} complies with ceiling`,
                messageMr: `उत्पन्न ${formatINR(userIncome)} विहित मर्यादेच्या आत आहे`,
            });
        }
        else {
            hardFails++;
            failedReasonsEn.push(failMsgEn);
            failedReasonsMr.push(failMsgMr);
            checks.push({
                id: 'income',
                name: 'Family Income',
                nameMr: 'कौटुंबिक उत्पन्न',
                passed: false,
                userValue: formatINR(userIncome),
                requiredValue: rules.incomeLimit ? `≤ ${formatINR(rules.incomeLimit)}` : 'Compliant',
                messageEn: failMsgEn,
                messageMr: failMsgMr,
            });
        }
    }
    // 4. AGE CHECK
    if (rules.minAge !== undefined || rules.maxAge !== undefined) {
        totalApplicableRules++;
        const minA = rules.minAge ?? 0;
        const maxA = rules.maxAge ?? 120;
        const agePass = userAge >= minA && userAge <= maxA;
        if (agePass) {
            passedRules++;
            passedReasonsEn.push(`Age requirement satisfied (${userAge} years)`);
            passedReasonsMr.push(`वयाची अट पूर्ण (${userAge} वर्षे)`);
            checks.push({
                id: 'age',
                name: 'Age Criteria',
                nameMr: 'वयाचा निकष',
                passed: true,
                userValue: `${userAge} yrs`,
                requiredValue: `${minA} - ${maxA} yrs`,
                messageEn: `Age ${userAge} falls within acceptable range (${minA} - ${maxA} yrs)`,
                messageMr: `वय ${userAge} वर्षे विहित मर्यादेत (${minA} - ${maxA} वर्षे) बसते`,
            });
        }
        else {
            hardFails++;
            const reqAgeStr = rules.minAge && rules.maxAge
                ? `${rules.minAge} to ${rules.maxAge} years`
                : rules.minAge
                    ? `Minimum ${rules.minAge} years`
                    : `Up to ${rules.maxAge} years`;
            failedReasonsEn.push(`Age of ${userAge} years does not meet criterion (${reqAgeStr})`);
            failedReasonsMr.push(`वय ${userAge} वर्षे निकषात बसत नाही (${reqAgeStr})`);
            checks.push({
                id: 'age',
                name: 'Age Criteria',
                nameMr: 'वयाचा निकष',
                passed: false,
                userValue: `${userAge} yrs`,
                requiredValue: reqAgeStr,
                messageEn: `Age ${userAge} does not satisfy age bracket (${reqAgeStr})`,
                messageMr: `वय ${userAge} वर्षे वयोमर्यादेत बसत नाही (${reqAgeStr})`,
            });
        }
    }
    // 5. STUDENT STATUS CHECK
    if (rules.studentRequired) {
        totalApplicableRules++;
        if (isStudent) {
            passedRules++;
            passedReasonsEn.push('Currently enrolled student status verified');
            passedReasonsMr.push('महाविद्यालयीन / शालेय विद्यार्थी स्थिती प्रमाणित');
            checks.push({
                id: 'student',
                name: 'Student Status',
                nameMr: 'विद्यार्थी स्थिती',
                passed: true,
                userValue: 'Enrolled Student',
                requiredValue: 'Student Required',
                messageEn: 'Enrolled in recognized educational institution',
                messageMr: 'मान्यताप्राप्त शिक्षण संस्थेत शिकत आहे',
            });
        }
        else {
            hardFails++;
            failedReasonsEn.push('Scheme strictly requires active student enrollment');
            failedReasonsMr.push('या योजनेसाठी सक्रिय विद्यार्थी असणे अनिवार्य आहे');
            checks.push({
                id: 'student',
                name: 'Student Status',
                nameMr: 'विद्यार्थी स्थिती',
                passed: false,
                userValue: profile.occupation || 'Non-student',
                requiredValue: 'Active Student',
                messageEn: 'Applicant is not currently an enrolled student',
                messageMr: 'अर्जदार सध्या विद्यार्थी म्हणून नोंदणीकृत नाही',
            });
        }
    }
    // 6. OCCUPATION / ROLE CHECK
    if (rules.occupations && rules.occupations.length > 0 && !rules.occupations.includes('any')) {
        totalApplicableRules++;
        const userRole = (profile.occupation || '').toLowerCase();
        const occPass = rules.occupations.some(o => {
            if (o === 'any')
                return true;
            if (o === 'student' && isStudent)
                return true;
            if (o === 'senior' && (userRole === 'senior' || userAge >= 60))
                return true;
            if (o === 'woman' && (userRole === 'woman' || profile.gender === 'female'))
                return true;
            return userRole.includes(o) || o.includes(userRole);
        });
        if (occPass) {
            passedRules++;
            passedReasonsEn.push(`Occupation/role criteria satisfied (${profile.occupation})`);
            passedReasonsMr.push(`व्यवसाय/भूमिका निकष पूर्ण (${profile.occupation})`);
            checks.push({
                id: 'occupation',
                name: 'Occupation / Role',
                nameMr: 'व्यवसाय / भूमिका',
                passed: true,
                userValue: profile.occupation,
                requiredValue: rules.occupations.join(', '),
                messageEn: `Occupation matches target group`,
                messageMr: `व्यवसाय योजनेच्या उद्दिष्टांशी सुसंगत आहे`,
            });
        }
        else {
            // Soft warning if other conditions match, or hard fail if scheme specifically targets this
            if (rules.studentRequired) {
                // already counted in student check
            }
            else {
                hardFails++;
                const occStr = rules.occupations.join(' or ');
                failedReasonsEn.push(`Targeted primarily at: ${occStr} (current: ${profile.occupation})`);
                failedReasonsMr.push(`मुख्यत्वे ${occStr} साठी लागू (सध्या: ${profile.occupation})`);
                checks.push({
                    id: 'occupation',
                    name: 'Occupation / Role',
                    nameMr: 'व्यवसाय / भूमिका',
                    passed: false,
                    userValue: profile.occupation,
                    requiredValue: occStr,
                    messageEn: `Scheme is designed for ${occStr}`,
                    messageMr: `ही योजना मुख्यत्वे ${occStr} साठी आहे`,
                });
            }
        }
    }
    // 7. DISABILITY CHECK
    if (rules.disabilityRequired) {
        totalApplicableRules++;
        if (profile.hasDisability) {
            passedRules++;
            passedReasonsEn.push('Divyang / Persons with Disabilities status confirmed');
            passedReasonsMr.push('दिव्यांग व्यक्ती निकष प्रमाणित');
            checks.push({
                id: 'disability',
                name: 'Disability Status',
                nameMr: 'दिव्यांगत्व स्थिती',
                passed: true,
                userValue: 'PwD / Divyang',
                requiredValue: 'Disability Required',
                messageEn: 'Eligible under Persons with Disabilities category',
                messageMr: 'दिव्यांग प्रवर्गांतर्गत लाभासाठी पात्र',
            });
        }
        else {
            hardFails++;
            failedReasonsEn.push('Scheme strictly requires Persons with Disabilities (Divyang) certification');
            failedReasonsMr.push('या योजनेसाठी किमान ४०% दिव्यांगत्व प्रमाणपत्र आवश्यक आहे');
            checks.push({
                id: 'disability',
                name: 'Disability Status',
                nameMr: 'दिव्यांगत्व स्थिती',
                passed: false,
                userValue: 'None',
                requiredValue: 'Divyang / PwD Certificate Required',
                messageEn: 'Applicant has not declared disability status',
                messageMr: 'अर्जदाराने दिव्यांगत्व घोषित केलेले नाही',
            });
        }
    }
    // 8. GENDER CHECK
    if (rules.gender && rules.gender !== 'any') {
        totalApplicableRules++;
        const genPass = profile.gender === rules.gender || (rules.gender === 'female' && profile.occupation === 'woman');
        if (genPass) {
            passedRules++;
            passedReasonsEn.push('Gender requirement satisfied (Female Beneficiary Scheme)');
            passedReasonsMr.push('लिंग निकष पूर्ण (महिला लाभार्थी योजना)');
            checks.push({
                id: 'gender',
                name: 'Gender Criteria',
                nameMr: 'लिंग निकष',
                passed: true,
                userValue: profile.gender || 'Female',
                requiredValue: rules.gender,
                messageEn: 'Applicant meets gender requirement',
                messageMr: 'अर्जदार विहित लिंग निकष पूर्ण करतो',
            });
        }
        else {
            hardFails++;
            failedReasonsEn.push(`Scheme is specifically reserved for ${rules.gender} applicants`);
            failedReasonsMr.push(`ही योजना विशेषतः ${rules.gender === 'female' ? 'महिला' : 'पुरुष'} अर्जदारांसाठी आहे`);
            checks.push({
                id: 'gender',
                name: 'Gender Criteria',
                nameMr: 'लिंग निकष',
                passed: false,
                userValue: profile.gender || 'Not specified',
                requiredValue: rules.gender,
                messageEn: `Scheme reserved for ${rules.gender}`,
                messageMr: `योजना केवळ ${rules.gender === 'female' ? 'महिला' : 'पुरुष'} लाभार्थ्यांसाठी राखीव`,
            });
        }
    }
    // 9. EDUCATION LEVEL CHECK (Soft / Warning check)
    if (rules.educationLevels && rules.educationLevels.length > 0 && isStudent) {
        const userEdu = profile.educationLevel || 'Undergraduate';
        const eduPass = rules.educationLevels.includes(userEdu) || rules.educationLevels.includes('Any');
        if (eduPass) {
            passedReasonsEn.push(`Education level ${userEdu} complies with scheme standard`);
            passedReasonsMr.push(`शिक्षण पातळी ${userEdu} निकषानुसार आहे`);
            checks.push({
                id: 'education',
                name: 'Education Level',
                nameMr: 'शिक्षण पातळी',
                passed: true,
                userValue: userEdu,
                requiredValue: rules.educationLevels.join(', '),
                messageEn: `Enrolled course level (${userEdu}) is eligible`,
                messageMr: `अभ्यासक्रम पातळी (${userEdu}) अनुज्ञेय आहे`,
            });
        }
        else {
            softWarnings++;
            failedReasonsEn.push(`Typically requires ${rules.educationLevels.join(' or ')} (currently ${userEdu})`);
            failedReasonsMr.push(`साधारणपणे ${rules.educationLevels.join(' किंवा ')} आवश्यक असते (सध्या ${userEdu})`);
            checks.push({
                id: 'education',
                name: 'Education Level',
                nameMr: 'शिक्षण पातळी',
                passed: false,
                isWarning: true,
                userValue: userEdu,
                requiredValue: rules.educationLevels.join(', '),
                messageEn: `Current education stage (${userEdu}) may need verification`,
                messageMr: `सध्याची शिक्षण पातळी (${userEdu}) पडताळणी आवश्यक असू शकते`,
            });
        }
    }
    // ─── Status & Score Calculation ───────────────────────────────────────────
    let status = 'eligible';
    let matchScore = 100;
    if (hardFails > 0) {
        status = 'ineligible';
        // Score reflects partial criteria met
        const passRatio = totalApplicableRules > 0 ? passedRules / totalApplicableRules : 0;
        matchScore = Math.max(15, Math.min(50, Math.round(passRatio * 50)));
    }
    else if (softWarnings > 0) {
        status = 'possible';
        matchScore = Math.max(60, 85 - softWarnings * 10);
    }
    else {
        status = 'eligible';
        // Dynamic demographic alignment scoring (85 - 100%)
        let score = 88;
        if (rules.disabilityRequired && profile.hasDisability)
            score += 12;
        if (rules.minAge && rules.minAge >= 60 && profile.age >= 60)
            score += 12;
        if (rules.studentRequired && isStudent)
            score += 10;
        if (rules.allowedCategories && !rules.allowedCategories.includes('OPEN') && rules.allowedCategories.includes(normUserCat))
            score += 8;
        if (rules.gender && (rules.gender === profile.gender || (rules.gender === 'female' && profile.occupation === 'woman')))
            score += 7;
        if (rules.occupations && rules.occupations.includes('farmer') && profile.occupation === 'farmer')
            score += 10;
        if (rules.isService)
            score = Math.min(score, 85); // Direct welfare schemes outrank certificate issuance
        matchScore = Math.min(100, score);
    }
    // ─── Missing Documents & Services Recommendation ──────────────────────────
    const requiredDocs = scheme.requiredDocuments || [];
    const missingDocuments = requiredDocs.filter(d => !d.available);
    const availableDocuments = requiredDocs.filter(d => d.available);
    const recommendedServices = [];
    for (const doc of missingDocuments) {
        const srv = SERVICE_RECOMMENDATIONS[doc.id];
        if (srv) {
            recommendedServices.push({
                serviceId: srv.id,
                serviceName: srv.name,
                serviceNameMr: srv.nameMr,
                department: srv.dept,
                departmentMr: srv.deptMr,
                missingDocName: doc.name,
                missingDocNameMr: doc.nameMr,
                reasonEn: `Missing ${doc.name} required for ${scheme.name}`,
                reasonMr: `${scheme.nameMr} साठी आवश्यक ${doc.nameMr} उपलब्ध नाही`,
            });
        }
    }
    // Route URL - dynamically maps to specific scheme application
    const actionUrl = `/apply/scheme/${encodeURIComponent(scheme.id)}`;
    return {
        scheme,
        status,
        matchScore,
        criteriaChecks: checks,
        passedReasonsEn,
        passedReasonsMr,
        failedReasonsEn,
        failedReasonsMr,
        missingDocuments,
        availableDocuments,
        recommendedServices,
        actionUrl,
    };
}
// ─── Batch Evaluation & Priority Ranking ─────────────────────────────────────
function evaluateAllSchemes(profile) {
    const evaluated = schemeDatabase_1.ALL_SCHEMES.map(scheme => evaluateSchemeEligibility(profile, scheme));
    // Sort order:
    // 1. Eligible schemes (descending by matchScore, then welfare schemes first)
    // 2. Possible schemes (descending by matchScore)
    // 3. Ineligible schemes (descending by matchScore)
    return evaluated.sort((a, b) => {
        const statusWeight = { eligible: 3, possible: 2, ineligible: 1 };
        const diff = statusWeight[b.status] - statusWeight[a.status];
        if (diff !== 0)
            return diff;
        // Within same status, sort by matchScore
        if (b.matchScore !== a.matchScore) {
            return b.matchScore - a.matchScore;
        }
        // Prioritize welfare schemes over generic certificate services if eligible
        const aIsService = a.scheme.structuredEligibility?.isService || a.scheme.category === 'Certificate';
        const bIsService = b.scheme.structuredEligibility?.isService || b.scheme.category === 'Certificate';
        if (!aIsService && bIsService)
            return -1;
        if (aIsService && !bIsService)
            return 1;
        return 0;
    });
}
