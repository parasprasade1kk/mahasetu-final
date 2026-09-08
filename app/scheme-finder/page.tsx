'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { findMatchingSchemes, ScoredScheme } from '@/lib/schemeMatcher';
import { Scheme, ALL_SCHEMES } from '@/lib/schemeDatabase';
import { evaluateAllSchemes, UserProfile } from '@/lib/eligibilityEngine';

// ─── Translations ─────────────────────────────────────────────────────────────
const t: Record<string, Record<string, string>> = {
  en: {
    welcome_sub: 'Government of Maharashtra',
    welcome_title_prefix: 'Namaste, ',
    welcome_desc: 'Access verified public schemes and digital locker services securely.',
    ai_powered: 'AI Powered',
    banner_title: 'Smart Scheme Finder',
    banner_desc: 'Let our AI match your profile with over 450+ central and state welfare schemes instantly.',
    start_finder: 'Start Smart Search',
    rec_title: 'Recommended For You',
    view_all: 'View All (12)',
    match_92: '92% Match',
    sch_1_title: 'Post-Matric Scholarship',
    sch_1_desc: 'Financial assistance for higher education students belonging to economically weaker sections.',
    dept_edu: 'Education Department',
    benefit_amt: '₹50,000 / yr',
    match_85: '85% Match',
    sch_2_title: 'Mahatma Jyotirao Phule Shetkari Karmukti',
    sch_2_desc: 'Agricultural debt waiver scheme for eligible farmers across Maharashtra.',
    dept_agri: 'Agriculture Department',
    benefit_up_to: 'Up to ₹2 Lakhs',
    finder_header: 'Smart Scheme Finder',
    prompt_help: 'What do you need help with?',
    finder_placeholder: 'e.g. I am a final year engineering student looking for education grants and laptop subsidy...',
    suggested_chips: 'Suggested Categories',
    chip_edu: 'Education',
    chip_fin: 'Financial Assistance',
    chip_agri: 'Agriculture',
    chip_health: 'Healthcare',
    chip_housing: 'Housing',
    btn_find_schemes: 'Find Schemes',
    form_title: 'Eligibility Questionnaire',
    step_indicator: 'Step 1 of 4',
    step1_heading: 'Basic Information',
    lbl_fullname: 'Full Name (As per Aadhaar)',
    lbl_district: 'District',
    lbl_category: 'Social Category',
    btn_back: 'Back',
    btn_next: 'Next Step',
    results_header: 'Matching Schemes',
    results_sub: 'Based on your problem, these schemes may be relevant to you.',
    no_match_title: 'No closely matching scheme was found.',
    no_match_sub: 'Try describing your problem in more detail.',
    no_match_browse: 'Browse All Schemes',
    suggested_cats: 'Suggested Categories',
    lbl_benefit: 'Benefit:',
    lbl_mode: 'Disbursement:',
    val_db_direct: 'Direct Benefit Transfer (DBT)',
    why_match: 'Why this matches',
    match_crit_1: 'Annual family income is below ₹8 Lakhs',
    match_crit_2: 'Currently enrolled in recognized professional degree',
    match_crit_3: 'Domicile resident of Maharashtra state',
    btn_details: 'View Details',
    btn_check_elig: 'Check Eligibility',
    btn_apply: 'Apply Now',
    details_header: 'Scheme Information',
    sec_overview: 'Scheme Overview',
    sec_eligibility: 'Key Criteria',
    btn_check_doc_avail: 'Check Document Availability',
    doc_check_header: 'Document Locker Check',
    doc_check_desc: 'We checked your Digilocker and MahaSetu vault for required documents.',
    sec_verified: 'Verified & Available',
    src_revenue: 'Revenue Department',
    badge_verified: 'Verified',
    sec_missing: 'Missing Documents',
    status_req_upload: 'Required for evaluation',
    status_req_college: 'Required from college',
    btn_proceed_consent: 'Proceed to Consent & Upload',
    consent_header: 'Document Access Consent',
    consent_title: 'Data Privacy & Security Guarantee',
    consent_desc: 'MahaSetu requires your explicit consent to securely fetch verified documents from Revenue & Education department digital vaults for this application.',
    chk_revenue: 'Grant Revenue Department access to fetch Domicile & Income certificates.',
    chk_edu: 'Grant Education Department access to fetch enrollment records.',
    btn_allow_collect: 'Allow & Collect Documents',
    upload_header: 'Upload Missing Files',
    dropzone_title: 'Drag & drop files here, or browse',
    dropzone_sub: 'Supports PDF, JPG, PNG up to 10MB',
    btn_continue_pack: 'Continue to Document Pack',
    pack_header: 'Smart Document Pack',
    pack_sub: 'Ready to attach to application',
    badge_gov: 'Govt Verified',
    badge_citizen: 'Citizen Uploaded',
    btn_proceed_app: 'Proceed to Application Form',
    app_form_header: 'Application Form',
    lbl_institute: 'Institute Name',
    lbl_course: 'Current Course & Year',
    lbl_bank_acc: 'Bank Account for DBT',
    lbl_attached_pack: 'Attached Smart Document Pack',
    btn_review_submit: 'Review & Submit',
    review_header: 'Review Application',
    lbl_applicant_name: 'Applicant Name',
    lbl_scheme_name: 'Scheme',
    lbl_verification_status: 'Verification Status',
    val_fully_verified: 'Fully Verified',
    summary_badges_label: 'Summary Badges',
    badge_gov_ver: 'Govt Verified',
    badge_citizen_up: 'Citizen Uploaded',
    btn_final_submit: 'Submit Application',
    success_title: 'Application Submitted!',
    success_desc: 'Your application has been successfully submitted.',
    lbl_app_id: 'Application Reference ID',
    status_submitted: 'Status: Under Department Review',
    btn_back_dashboard: 'Back to Dashboard',
    btn_track_app: 'Track Application Status',
    lbl_required_docs: 'Required Documents',
    lbl_available: 'Available',
    lbl_missing: 'Missing',
    select_scheme: 'Select This Scheme',
    potential_match: 'Potential Match',
    based_on_info: 'Based on your information',
    doc_available_source: 'Available via MahaSetu',
    doc_missing_status: 'Need to upload',
    pack_status_ready: 'Documents Complete',
    doc_aadhaar: 'Aadhaar Verification',
    doc_domicile: 'Maharashtra Domicile Certificate',
    doc_income: 'Income Certificate',
    doc_marksheet: 'Previous Year Marksheet',
    doc_bonafide: 'Bonafide Certificate',
    doc_bank: 'Bank Passbook Copy',
    status_uploaded_mark: 'Uploaded successfully (1.4 MB)',
    status_uploaded_bona: 'Uploaded successfully (850 KB)',
    val_attached_complete: 'All Attached',
    desc_overview: 'Designed to provide financial support to students studying at post-matriculation or post-secondary stage to enable them to complete their education.',
    crit_1: 'Must be permanent resident of Maharashtra',
    crit_2: 'Minimum 50% marks in previous qualifying exam',
    crit_3: 'Family annual income limit up to ₹8,00,000',
  },
  mr: {
    welcome_sub: 'महाराष्ट्र शासन',
    welcome_title_prefix: 'नमस्कार, ',
    welcome_desc: 'सत्यापित सार्वजनिक योजना आणि डिजिटल लॉकर सेवांचा सुरक्षितपणे लाभ घ्या.',
    ai_powered: 'एआय समर्थित',
    banner_title: 'स्मार्ट योजना शोधक',
    banner_desc: 'आमच्या एआयला तुमची प्रोफाईल ४५०+ केंद्रीय आणि राज्य कल्याणकारी योजनांशी त्वरित जुळवू द्या.',
    start_finder: 'स्मार्ट शोध सुरू करा',
    rec_title: 'आपल्यासाठी शिफारस केलेले',
    view_all: 'सर्व पहा (१२)',
    match_92: '९२% जुळणी',
    sch_1_title: 'मॅट्रिकोत्तर शिष्यवृत्ती',
    sch_1_desc: 'आर्थिकदृष्ट्या दुर्बल घटकांमधील उच्च शिक्षणाच्या विद्यार्थ्यांसाठी आर्थिक सहाय्य.',
    dept_edu: 'शिक्षण विभाग',
    benefit_amt: '₹५०,००० / वर्ष',
    match_85: '८५% जुळणी',
    sch_2_title: 'महात्मा ज्योतिराव फुले शेतकरी कर्जमुक्ति',
    sch_2_desc: 'महाराष्ट्रभरातील पात्र शेतकऱ्यांसाठी कृषी कर्जमाफी योजना.',
    dept_agri: 'कृषी विभाग',
    benefit_up_to: '₹२ लाखांपर्यंत',
    finder_header: 'स्मार्ट योजना शोधक',
    prompt_help: 'तुम्हाला कशात मदत हवी आहे?',
    finder_placeholder: 'उदा. मी अंतिम वर्षाचा अभियांत्रिकी विद्यार्थी आहे जो शिक्षण अनुदान आणि लॅपटॉप अनुदानासाठी शोधत आहे...',
    suggested_chips: 'सुचवलेले प्रवर्ग',
    chip_edu: 'शिक्षण',
    chip_fin: 'आर्थिक सहाय्य',
    chip_agri: 'कृषी',
    chip_health: 'आरोग्य सेवा',
    chip_housing: 'गृहनिर्माण',
    btn_find_schemes: 'योजना शोधा',
    form_title: 'पात्रता प्रश्नावली',
    step_indicator: 'पायरी १ पैकी ४',
    step1_heading: 'मूलभूत माहिती',
    lbl_fullname: 'पूर्ण नाव (आधार कार्डनुसार)',
    lbl_district: 'जिल्हा',
    lbl_category: 'सामाजिक प्रवर्ग',
    btn_back: 'मागे',
    btn_next: 'पुढची पायरी',
    results_header: 'जुळणाऱ्या योजना',
    results_sub: 'तुमच्या समस्येच्या आधारे, या योजना तुमच्यासाठी उपयुक्त असू शकतात.',
    no_match_title: 'जवळचे जुळणारे योजना सापडले नाही.',
    no_match_sub: 'तुमची समस्या अधिक तपशीलाने सांगण्याचा प्रयत्न करा.',
    no_match_browse: 'सर्व योजना पहा',
    suggested_cats: 'सुचवलेले प्रवर्ग',
    lbl_benefit: 'लाभ:',
    lbl_mode: 'वितरण:',
    val_db_direct: 'थेट लाभ हस्तांतरण (DBT)',
    why_match: 'हे का जुळते',
    match_crit_1: 'वार्षिक कौटुंबिक उत्पन्न ₹८ लाखांपेक्षा कमी आहे',
    match_crit_2: 'सध्या मान्यताप्राप्त व्यावसायिक पदवीमध्ये शिकत आहे',
    match_crit_3: 'महाराष्ट्र राज्याचे रहिवासी',
    btn_details: 'तपशील पहा',
    btn_check_elig: 'पात्रता तपासा',
    btn_apply: 'आता अर्ज करा',
    details_header: 'योजना माहिती',
    sec_overview: 'योजना आढावा',
    sec_eligibility: 'मुख्य निकष',
    btn_check_doc_avail: 'दस्तऐवज उपलब्धता तपासा',
    doc_check_header: 'दस्तऐवज लॉकर तपासा',
    doc_check_desc: 'आम्ही आवश्यक कागदपत्रांसाठी तुमच्या डिजिलॉकर आणि महासेतु व्हॉल्टची तपासणी केली आहे.',
    sec_verified: 'सत्यापित आणि उपलब्ध',
    src_revenue: 'महसूल विभाग',
    badge_verified: 'सत्यापित',
    sec_missing: 'गहाळ कागदपत्रे',
    status_req_upload: 'मूल्यांकनासाठी आवश्यक',
    status_req_college: 'महाविद्यालयाकडून आवश्यक',
    btn_proceed_consent: 'संमती आणि अपलोडकडे पुढे जा',
    consent_header: 'दस्तऐवज प्रवेश संमती',
    consent_title: 'डेटा गोपनीयता आणि सुरक्षा हमी',
    consent_desc: 'या अर्जासाठी महसूल आणि शिक्षण विभागाच्या डिजिटल व्हॉल्टमधून सत्यापित कागदपत्रे सुरक्षितपणे मिळवण्यासाठी महासेतूला तुमच्या स्पष्ट संमतीची आवश्यकता आहे.',
    chk_revenue: 'अधिवास आणि उत्पन्न प्रमाणपत्रे मिळवण्यासाठी महसूल विभागाला प्रवेश द्या.',
    chk_edu: 'नावनोंदणी रेकॉर्ड मिळवण्यासाठी शिक्षण विभागाला प्रवेश द्या.',
    btn_allow_collect: 'परवानगी द्या आणि कागदपत्रे गोळा करा',
    upload_header: 'गहाळ फाईल्स अपलोड करा',
    dropzone_title: 'फायली येथे ड्रॅग आणि ड्रॉप करा, किंवा ब्राउझ करा',
    dropzone_sub: '१०MB पर्यंत PDF, JPG, PNG समर्थित',
    btn_continue_pack: 'दस्तऐवज पॅकवर चालू ठेवा',
    pack_header: 'स्मार्ट दस्तऐवज पॅक',
    pack_sub: 'अर्जाशी जोडण्यासाठी तयार',
    badge_gov: 'शासन सत्यापित',
    badge_citizen: 'नागरिक अपलोड',
    btn_proceed_app: 'अर्ज फॉर्मकडे पुढे जा',
    app_form_header: 'अर्ज फॉर्म',
    lbl_institute: 'संस्थेचे नाव',
    lbl_course: 'सध्याचा अभ्यासक्रम आणि वर्ष',
    lbl_bank_acc: 'DBT साठी बँक खाते',
    lbl_attached_pack: 'जोडलेले स्मार्ट दस्तऐवज पॅक',
    btn_review_submit: 'तपासा आणि सादर करा',
    review_header: 'अर्ज पुनरावलोकन',
    lbl_applicant_name: 'अर्जदाराचे नाव',
    lbl_scheme_name: 'योजना',
    lbl_verification_status: 'पडताळणी स्थिती',
    val_fully_verified: 'पूर्णपणे पडताळणी झाली',
    summary_badges_label: 'सारांश बॅजेस',
    badge_gov_ver: 'शासन सत्यापित',
    badge_citizen_up: 'नागरिक अपलोड',
    btn_final_submit: 'अर्ज सादर करा',
    success_title: 'अर्ज सादर केला!',
    success_desc: 'तुमचा अर्ज यशस्वीरित्या सादर करण्यात आला आहे.',
    lbl_app_id: 'अर्ज संदर्भ आयडी',
    status_submitted: 'स्थिती: विभाग पुनरावलोकनाधीन',
    btn_back_dashboard: 'डॅशबोर्डवर परत जा',
    btn_track_app: 'अर्ज स्थिती ट्रॅक करा',
    lbl_required_docs: 'आवश्यक कागदपत्रे',
    lbl_available: 'उपलब्ध',
    lbl_missing: 'गहाळ',
    select_scheme: 'ही योजना निवडा',
    potential_match: 'संभाव्य जुळणी',
    based_on_info: 'तुमच्या माहितीच्या आधारे',
    doc_available_source: 'महासेतूद्वारे उपलब्ध',
    doc_missing_status: 'अपलोड करणे आवश्यक',
    pack_status_ready: 'कागदपत्रे पूर्ण',
    doc_aadhaar: 'आधार पडताळणी',
    doc_domicile: 'महाराष्ट्र अधिवास प्रमाणपत्र',
    doc_income: 'उत्पन्न प्रमाणपत्र',
    doc_marksheet: 'मागील वर्षाची गुणपत्रिका',
    doc_bonafide: 'बोनाफाइड प्रमाणपत्र',
    doc_bank: 'बँक पासबुक प्रत',
    status_uploaded_mark: 'यशस्वीरित्या अपलोड केले (१.४ MB)',
    status_uploaded_bona: 'यशस्वीरित्या अपलोड केले (८५० KB)',
    val_attached_complete: 'सर्व जोडलेले',
    desc_overview: 'विद्यार्थ्यांना त्यांचे शिक्षण पूर्ण करता यावे यासाठी मॅट्रिकनंतरच्या टप्प्यावर अभ्यास करणाऱ्या विद्यार्थ्यांना आर्थिक मदत देण्याकरीता डिझाइन केलेले आहे.',
    crit_1: 'महाराष्ट्राचे रहिवासी असणे आवश्यक आहे',
    crit_2: 'मागील पात्रता परीक्षेत किमान ५०% गुण',
    crit_3: 'कुटुंबाची वार्षिक उत्पन्न मर्यादा ₹८,००,००० पर्यंत',
  },
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function tx(lang: string, key: string): string {
  return t[lang]?.[key] ?? t['en'][key] ?? key;
}

// ─── Match percentage color helper ────────────────────────────────────────────
function matchColor(pct: number): string {
  if (pct >= 85) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
  if (pct >= 70) return 'text-[#003b5a] bg-[#e5eeff] border-[#9bccf6]';
  return 'text-amber-700 bg-amber-50 border-amber-200';
}

// ─── Department badge color ────────────────────────────────────────────────────
function deptColor(key: string): string {
  if (key === 'revenue') return 'bg-orange-50 text-orange-800 border-orange-200';
  if (key === 'education') return 'bg-blue-50 text-blue-800 border-blue-200';
  return 'bg-purple-50 text-purple-800 border-purple-200';
}

// Chip label → query appended text mapping
const CHIP_QUERIES: Record<string, string> = {
  chip_edu: 'I am a student and need education support and scholarship',
  chip_fin: 'I need financial assistance my family has low income',
  chip_agri: 'I need help with agricultural land records and farm assistance',
  chip_health: 'I need health and disability assistance',
  chip_housing: 'I need housing assistance affordable home',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function SchemeFinderPage() {
  const { language, user, userProfile, addApplication } = useApp();
  const lang = language === 'mr' ? 'mr' : 'en';

  // Screen navigation
  const [screen, setScreen] = useState(1);
  const goTo = (n: number) => {
    setScreen(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Form state
  const [query, setQuery] = useState('');
  const [fullName, setFullName] = useState(user.name);
  const [district, setDistrict] = useState('Pune');
  const [category, setCategory] = useState('OBC (Other Backward Class)');
  const [institute, setInstitute] = useState('College of Engineering, Pune (COEP)');
  const [course, setCourse] = useState('B.Tech Final Year (Computer Engineering)');
  const [bankAcc, setBankAcc] = useState('State Bank of India - A/C XXXXXX4821');

  // Sync profile details if available
  useEffect(() => {
    if (userProfile) {
      if (userProfile.fullName) setFullName(userProfile.fullName);
      if (userProfile.district) setDistrict(userProfile.district);
      if (userProfile.category) setCategory(userProfile.category);
      if (userProfile.currentCourse) setCourse(userProfile.currentCourse);
    }
  }, [userProfile]);

  // AI Scheme Finder state — the core fix
  const [matchedSchemes, setMatchedSchemes] = useState<ScoredScheme[]>([]);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [selectedMatchReasons, setSelectedMatchReasons] = useState<string[]>([]);

  // Consent state
  const [consentRevenue, setConsentRevenue] = useState(true);
  const [consentEdu, setConsentEdu] = useState(true);

  // Accordion state
  const [matchReasonsOpen, setMatchReasonsOpen] = useState(false);
  const [openAccordionIndex, setOpenAccordionIndex] = useState<number | null>(null);

  // Generated application reference
  const [appRefId] = useState(() => {
    const num = Math.floor(10000 + Math.random() * 90000);
    return `MH-SCH-2026-${String(num).padStart(5, '0')}`;
  });

  // Dynamically compute recommended schemes based on userProfile
  const evaluatedList = useMemo(() => {
    if (!userProfile) return [];
    let occ = (userProfile.occupation || '').toLowerCase();
    if (occ.includes('farmer') || occ.includes('agricultural')) occ = 'farmer';
    else if (occ.includes('student')) occ = 'student';
    else if (occ.includes('private') || occ.includes('salaried') || occ.includes('employee') || occ.includes('job')) occ = 'salaried';
    else if (occ.includes('unemployed')) occ = 'unemployed';
    else if (occ.includes('retired')) occ = 'senior';

    let edu = 'Undergraduate';
    const rawEdu = (userProfile.educationLevel || '').toLowerCase();
    if (rawEdu.includes('post') || rawEdu.includes('doctorate')) edu = 'Postgraduate';
    else if (rawEdu.includes('diploma')) edu = 'Diploma';
    else if (rawEdu.includes('school') || rawEdu.includes('10th') || rawEdu.includes('12th')) edu = 'School';
    else if (rawEdu.includes('illiterate')) edu = 'None';

    const engineProfile: UserProfile = {
      category: userProfile.category === 'General/Open' ? 'OPEN' : userProfile.category,
      annualIncome: userProfile.annualIncomeAmount,
      age: userProfile.age,
      occupation: occ,
      educationLevel: edu,
      isStudent: Boolean(userProfile.isStudent),
      hasDisability: Boolean(userProfile.hasDisability),
      isMaharashtraResident: true,
      gender: userProfile.gender === 'Male' ? 'male' : userProfile.gender === 'Female' ? 'female' : 'any',
      district: userProfile.district,
    };
    return evaluateAllSchemes(engineProfile);
  }, [userProfile]);

  const topRecommended = useMemo(() => {
    if (evaluatedList.length > 0) {
      return evaluatedList
        .filter(s => s.status === 'eligible' || s.status === 'possible')
        .slice(0, 3);
    }
    return [];
  }, [evaluatedList]);

  // ─── Run Matching ──────────────────────────────────────────────────────────
  const runFinder = (q: string) => {
    const results = findMatchingSchemes(q);
    setMatchedSchemes(results);
    goTo(4);
  };

  // ─── Select a Scheme from results ─────────────────────────────────────────
  const selectScheme = (scored: ScoredScheme) => {
    setSelectedScheme(scored.scheme);
    setSelectedMatchReasons(scored.matchReasons);
    setMatchReasonsOpen(false);
    goTo(5);
  };

  // ─── Document helpers ──────────────────────────────────────────────────────
  const availableDocs = selectedScheme?.requiredDocuments.filter(d => d.available) ?? [];
  const missingDocs = selectedScheme?.requiredDocuments.filter(d => !d.available) ?? [];
  const totalDocs = selectedScheme?.requiredDocuments.length ?? 0;

  // ─── Submit handler — uses selectedScheme dynamically ─────────────────────
  const handleSubmit = () => {
    const schemeName = selectedScheme
      ? (lang === 'mr' ? selectedScheme.nameMr : selectedScheme.name)
      : 'Smart Scheme Finder';
    const deptName = selectedScheme
      ? (lang === 'mr' ? selectedScheme.departmentMr : selectedScheme.department)
      : 'Government of Maharashtra';

    addApplication({
      id: appRefId,
      serviceName: `${selectedScheme?.name ?? 'Scheme'} (Smart Scheme Finder)`,
      serviceNameMr: `${selectedScheme?.nameMr ?? 'योजना'} (स्मार्ट योजना शोधक)`,
      department: deptName,
      departmentMr: selectedScheme?.departmentMr ?? 'महाराष्ट्र शासन',
      appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: 'Submitted',
      statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
      applicantName: user.name,
      district: district,
    });
    goTo(12);
  };

  // Initials for avatar
  const initials = user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  // ─── Back Button ──────────────────────────────────────────────────────────
  const BackButton = ({ to }: { to: number }) => (
    <button
      onClick={() => goTo(to)}
      className="p-1.5 rounded-full hover:bg-slate-100 transition"
      aria-label="Go back"
    >
      <span className="material-symbols-outlined text-[#003b5a]">arrow_back</span>
    </button>
  );

  // ─── Screen Header ────────────────────────────────────────────────────────
  const ScreenHeader = ({ title, backTo }: { title: string; backTo: number }) => (
    <div className="flex items-center gap-2 pb-3">
      <BackButton to={backTo} />
      <h2 className="text-xl font-bold text-[#003b5a]">{title}</h2>
    </div>
  );

  return (
    <div className="max-w-lg mx-auto px-4 py-6 pb-16 space-y-4 min-h-[70vh]">

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 1: Citizen Dashboard
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 1 && (
        <div className="space-y-5 animate-fadeIn">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-[#f47920] to-[#003b5a] p-5 rounded-xl text-white space-y-2 shadow-gov-md">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold opacity-80">
                  {tx(lang, 'welcome_sub')}
                </span>
                <h2 className="text-2xl font-bold">
                  {tx(lang, 'welcome_title_prefix')}{user.name.split(' ')[0]}!
                </h2>
              </div>
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-[#003b5a] font-bold shadow-inner text-sm">
                {initials}
              </div>
            </div>
            <p className="text-sm opacity-90">{tx(lang, 'welcome_desc')}</p>
          </div>

          {/* Smart Scheme Finder Banner Card */}
          <button
            onClick={() => goTo(2)}
            className="w-full bg-white border border-slate-200 p-5 rounded-xl shadow-gov hover:shadow-gov-md hover:border-[#003b5a]/40 cursor-pointer transition-all space-y-3 group text-left"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-[#f47920]/15 flex items-center justify-center text-[#f47920]">
                <span className="material-symbols-outlined">auto_fix_high</span>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-medium">
                {tx(lang, 'ai_powered')}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#003b5a] group-hover:text-[#f47920] transition-colors">
                {tx(lang, 'banner_title')}
              </h3>
              <p className="text-sm text-slate-600 mt-1">{tx(lang, 'banner_desc')}</p>
            </div>
            <div className="flex items-center text-[#003b5a] text-sm font-semibold pt-1">
              <span>{tx(lang, 'start_finder')}</span>
              <span className="material-symbols-outlined text-sm ml-1 group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </button>

          {/* Recommended Schemes */}
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-[#003b5a]">{tx(lang, 'rec_title')}</h3>
              <span className="text-[#003b5a] text-sm font-semibold cursor-pointer hover:underline">{tx(lang, 'view_all')}</span>
            </div>

            {/* Dynamic Recommended Scheme Cards */}
            {topRecommended.length > 0 ? (
              topRecommended.map((item) => (
                <button
                  key={item.scheme.id}
                  onClick={() => {
                    setSelectedScheme(item.scheme);
                    setSelectedMatchReasons(lang === 'mr' ? item.passedReasonsMr : item.passedReasonsEn);
                    setMatchReasonsOpen(false);
                    goTo(5);
                  }}
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-gov hover:shadow-gov-md hover:border-[#003b5a]/40 cursor-pointer transition-all space-y-2.5 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${
                        item.status === 'eligible' 
                          ? 'text-emerald-700 bg-emerald-50 border-emerald-200' 
                          : 'text-[#003b5a] bg-[#e5eeff] border-[#9bccf6]'
                      }`}>
                        {item.status === 'eligible' ? '95% Match • Eligible' : '85% Match • High Fit'}
                      </span>
                      <h4 className="text-base font-bold text-[#003b5a] mt-1.5">
                        {lang === 'mr' ? item.scheme.nameMr : item.scheme.name}
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {lang === 'mr' ? item.scheme.descriptionMr : item.scheme.description}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>{lang === 'mr' ? item.scheme.departmentMr : item.scheme.department}</span>
                    <span className="text-[#003b5a] font-semibold">{item.scheme.benefits}</span>
                  </div>
                </button>
              ))
            ) : (
              <>
                {/* Fallback Scheme Card 1 */}
                <button
                  onClick={() => runFinder('Post-Matric Scholarship for higher education students')}
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-gov hover:shadow-gov-md hover:border-[#003b5a]/40 cursor-pointer transition-all space-y-3 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {tx(lang, 'match_92')}
                      </span>
                      <h4 className="text-base font-bold text-[#003b5a] mt-1.5">{tx(lang, 'sch_1_title')}</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{tx(lang, 'sch_1_desc')}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>{tx(lang, 'dept_edu')}</span>
                    <span className="text-[#003b5a] font-semibold">{tx(lang, 'benefit_amt')}</span>
                  </div>
                </button>

                {/* Fallback Scheme Card 2 */}
                <button
                  onClick={() => runFinder('farmer agricultural assistance debt waiver')}
                  className="w-full bg-white border border-slate-200 p-4 rounded-xl shadow-gov hover:shadow-gov-md hover:border-[#003b5a]/40 cursor-pointer transition-all space-y-3 text-left"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs text-[#003b5a] font-medium bg-[#e5eeff] px-2 py-0.5 rounded border border-[#9bccf6]">
                        {tx(lang, 'match_85')}
                      </span>
                      <h4 className="text-base font-bold text-[#003b5a] mt-1.5">{tx(lang, 'sch_2_title')}</h4>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2">{tx(lang, 'sch_2_desc')}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                    <span>{tx(lang, 'dept_agri')}</span>
                    <span className="text-[#003b5a] font-semibold">{tx(lang, 'benefit_up_to')}</span>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 2: Smart Scheme Finder Landing
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 2 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'finder_header')} backTo={1} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-[#003b5a]">{tx(lang, 'prompt_help')}</label>
              <textarea
                className="w-full bg-[#f8f9ff] border border-slate-300 rounded-xl p-3 text-sm focus:border-[#003b5a] focus:ring-2 focus:ring-[#003b5a]/20 outline-none resize-none h-32"
                placeholder={tx(lang, 'finder_placeholder')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-medium">{tx(lang, 'suggested_chips')}</span>
              <div className="flex flex-wrap gap-2">
                {(['chip_edu', 'chip_fin', 'chip_agri', 'chip_health', 'chip_housing'] as const).map((key) => (
                  <span
                    key={key}
                    onClick={() => {
                      const chipQuery = CHIP_QUERIES[key] ?? tx(lang, key);
                      setQuery(chipQuery);
                    }}
                    className="px-3 py-1.5 bg-slate-100 rounded-full text-sm cursor-pointer hover:bg-[#f47920]/15 hover:text-[#f47920] transition-colors"
                  >
                    {tx(lang, key)}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (query.trim().length > 2) {
                  runFinder(query);
                } else {
                  goTo(3);
                }
              }}
              className="w-full bg-[#003b5a] text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-gov-md hover:bg-[#002840] transition"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              <span>{tx(lang, 'btn_find_schemes')}</span>
            </button>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 3: Eligibility Questionnaire (Step 1 of 4)
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 3 && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <BackButton to={2} />
              <h2 className="text-lg font-bold text-[#003b5a]">{tx(lang, 'form_title')}</h2>
            </div>
            <span className="text-xs font-medium text-[#003b5a] bg-[#e5eeff] px-2.5 py-1 rounded border border-[#9bccf6]">
              {tx(lang, 'step_indicator')}
            </span>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div className="bg-[#003b5a] h-full w-1/4 rounded-full transition-all" />
          </div>

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            <h3 className="text-base font-bold text-[#003b5a]">{tx(lang, 'step1_heading')}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_fullname')}</label>
                <input
                  type="text"
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_district')}</label>
                <select
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
                  <option>Pune</option>
                  <option>Mumbai Suburban</option>
                  <option>Nagpur</option>
                  <option>Nashik</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_category')}</label>
                <select
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option>OBC (Other Backward Class)</option>
                  <option>SC (Scheduled Caste)</option>
                  <option>ST (Scheduled Tribe)</option>
                  <option>Open / General</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => goTo(2)}
                className="px-5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-[#003b5a] hover:bg-slate-50 transition"
              >
                {tx(lang, 'btn_back')}
              </button>
              <button
                onClick={() => runFinder(query || `I am from ${district} ${category} category and need government assistance`)}
                className="px-6 py-2.5 bg-[#003b5a] text-white rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition"
              >
                {tx(lang, 'btn_next')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 4: Matching Schemes Result — NOW DYNAMIC
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 4 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'results_header')} backTo={2} />

          {/* No match case */}
          {matchedSchemes.length === 0 ? (
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-gov space-y-4 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-3xl text-slate-400">search_off</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#003b5a]">{tx(lang, 'no_match_title')}</h3>
                <p className="text-sm text-slate-500 mt-1">{tx(lang, 'no_match_sub')}</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-500">{tx(lang, 'suggested_cats')}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['Education', 'Financial Assistance', 'Housing', 'Disability', 'Senior Citizen', 'Women Welfare', 'Land & Property', 'Certificates'].map(cat => (
                    <button
                      key={cat}
                      onClick={() => {
                        setQuery(cat);
                        runFinder(cat);
                      }}
                      className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium hover:bg-[#003b5a]/10 hover:text-[#003b5a] transition"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => goTo(2)}
                className="w-full border border-[#003b5a] text-[#003b5a] py-2.5 rounded-xl text-sm font-semibold hover:bg-[#e5eeff] transition"
              >
                {tx(lang, 'no_match_browse')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-500 px-1">{tx(lang, 'results_sub')}</p>

              {matchedSchemes.map((scored, idx) => (
                <div
                  key={scored.scheme.id}
                  className="bg-white border border-slate-200 p-4 rounded-xl shadow-gov space-y-3"
                >
                  {/* Header: match % + scheme name */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-2">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${matchColor(scored.matchPct)}`}>
                        {scored.matchPct}% Match
                      </span>
                      <h4 className="text-base font-bold text-[#003b5a] mt-1.5 leading-tight">
                        {lang === 'mr' ? scored.scheme.nameMr : scored.scheme.name}
                      </h4>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-medium flex-shrink-0 ${deptColor(scored.scheme.departmentKey)}`}>
                      {lang === 'mr' ? scored.scheme.departmentMr : scored.scheme.department}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {lang === 'mr' ? scored.scheme.descriptionMr : scored.scheme.description}
                  </p>

                  {/* Benefit + Docs count */}
                  <div className="bg-[#f8f9ff] p-2.5 rounded-lg border border-slate-200 flex justify-between text-xs">
                    <span className="text-slate-500">{tx(lang, 'lbl_benefit')} <span className="font-bold text-[#003b5a]">{scored.scheme.benefits.split('+')[0].trim()}</span></span>
                    <span className="text-slate-500">
                      {tx(lang, 'lbl_required_docs')}: <span className="font-bold text-[#003b5a]">{scored.scheme.requiredDocuments.length}</span>
                      {' · '}
                      {tx(lang, 'lbl_available')}: <span className="font-bold text-emerald-700">{scored.scheme.requiredDocuments.filter(d => d.available).length}</span>
                      {' · '}
                      {tx(lang, 'lbl_missing')}: <span className="font-bold text-red-600">{scored.scheme.requiredDocuments.filter(d => !d.available).length}</span>
                    </span>
                  </div>

                  {/* Why this matches — collapsible */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <button
                      className="w-full p-2.5 bg-slate-50 flex justify-between items-center text-xs font-semibold"
                      onClick={() => setOpenAccordionIndex(openAccordionIndex === idx ? null : idx)}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-emerald-600 text-[16px]">check_circle</span>
                        <span>{tx(lang, 'why_match')}</span>
                      </span>
                      <span className="material-symbols-outlined text-[16px]">
                        {openAccordionIndex === idx ? 'expand_less' : 'expand_more'}
                      </span>
                    </button>
                    {openAccordionIndex === idx && (
                      <div className="p-2.5 text-xs space-y-1.5 bg-white">
                        {scored.matchReasons.map((reason, ri) => (
                          <div key={ri} className="flex items-start gap-1.5 text-slate-600">
                            <span className="material-symbols-outlined text-[13px] text-emerald-600 flex-shrink-0 mt-0.5">done</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                        <p className="text-slate-400 italic mt-1">
                          {tx(lang, 'based_on_info')} — {tx(lang, 'potential_match')}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => selectScheme(scored)}
                      className="px-2 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 text-center transition"
                    >
                      {tx(lang, 'btn_details')}
                    </button>
                    <button
                      onClick={() => selectScheme(scored)}
                      className="px-2 py-2.5 bg-[#003b5a] text-white rounded-xl text-xs font-bold shadow-gov text-center transition hover:bg-[#002840]"
                    >
                      {tx(lang, 'select_scheme')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 5: Scheme Details — DYNAMIC
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 5 && selectedScheme && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'details_header')} backTo={4} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded border ${deptColor(selectedScheme.departmentKey)}`}>
                {lang === 'mr' ? selectedScheme.departmentMr : selectedScheme.department}
              </span>
              <h3 className="text-xl font-bold text-[#003b5a] mt-2">
                {lang === 'mr' ? selectedScheme.nameMr : selectedScheme.name}
              </h3>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <div>
                <h4 className="font-bold text-[#003b5a] mb-1">{tx(lang, 'sec_overview')}</h4>
                <p>{lang === 'mr' ? selectedScheme.descriptionMr : selectedScheme.description}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#003b5a] mb-1">{tx(lang, 'lbl_benefit')}</h4>
                <p className="font-semibold text-[#003b5a]">{selectedScheme.benefits}</p>
              </div>

              <div>
                <h4 className="font-bold text-[#003b5a] mb-1">{tx(lang, 'sec_eligibility')}</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {(lang === 'mr' ? selectedScheme.eligibilityMr : selectedScheme.eligibility).map((crit, i) => (
                    <li key={i}>{crit}</li>
                  ))}
                </ul>
              </div>

              {/* Why it matched */}
              {selectedMatchReasons.length > 0 && (
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <button
                    className="w-full p-3 bg-slate-50 flex justify-between items-center text-sm font-semibold"
                    onClick={() => setMatchReasonsOpen(!matchReasonsOpen)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                      <span>{tx(lang, 'why_match')}</span>
                    </span>
                    <span className="material-symbols-outlined text-[18px]">
                      {matchReasonsOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  {matchReasonsOpen && (
                    <div className="p-3 text-sm space-y-2 bg-white">
                      {selectedMatchReasons.map((reason, ri) => (
                        <div key={ri} className="flex items-start gap-2 text-slate-600">
                          <span className="material-symbols-outlined text-sm text-emerald-600 flex-shrink-0 mt-0.5">done</span>
                          <span>{reason}</span>
                        </div>
                      ))}
                      <p className="text-xs text-slate-400 italic mt-1">
                        {tx(lang, 'based_on_info')} — {tx(lang, 'potential_match')}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <button
                onClick={() => goTo(6)}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-gov hover:bg-[#002840] transition"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{tx(lang, 'btn_check_doc_avail')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 6: Document Locker Check — DYNAMIC
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 6 && selectedScheme && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'doc_check_header')} backTo={5} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            {/* Scheme badge */}
            <div className="bg-[#f8f9ff] p-3 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-500">{tx(lang, 'lbl_scheme_name')}</p>
              <p className="text-sm font-bold text-[#003b5a] mt-0.5">
                {lang === 'mr' ? selectedScheme.nameMr : selectedScheme.name}
              </p>
              <div className="flex gap-4 mt-2 text-xs">
                <span className="text-slate-500">Required: <span className="font-bold text-[#003b5a]">{totalDocs}</span></span>
                <span className="text-emerald-600">Available: <span className="font-bold">{availableDocs.length}</span></span>
                <span className="text-red-500">Missing: <span className="font-bold">{missingDocs.length}</span></span>
              </div>
            </div>

            <p className="text-sm text-slate-600">{tx(lang, 'doc_check_desc')}</p>

            {/* Verified Documents */}
            {availableDocs.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-emerald-700 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{tx(lang, 'sec_verified')} ({availableDocs.length})</span>
                </h4>
                {availableDocs.map((doc) => (
                  <div key={doc.id} className="bg-[#f8f9ff] p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">description</span>
                      <div>
                        <h5 className="text-sm font-semibold">{lang === 'mr' ? doc.nameMr : doc.name}</h5>
                        <span className="text-xs text-slate-500">{lang === 'mr' ? doc.sourceMr : doc.source}</span>
                      </div>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded font-medium border border-emerald-200">
                      {tx(lang, 'badge_verified')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Missing Documents */}
            {missingDocs.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-bold text-red-600 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">error</span>
                  <span>{tx(lang, 'sec_missing')} ({missingDocs.length})</span>
                </h4>
                {missingDocs.map((doc) => (
                  <div key={doc.id} className="bg-[#f8f9ff] p-3 rounded-lg border border-red-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-red-500">upload_file</span>
                      <div>
                        <h5 className="text-sm font-semibold">{lang === 'mr' ? doc.nameMr : doc.name}</h5>
                        <span className="text-xs text-red-500">{tx(lang, 'doc_missing_status')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => goTo(7)}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition"
              >
                {tx(lang, 'btn_proceed_consent')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 7: Document Access Consent
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 7 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'consent_header')} backTo={6} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            <div className="bg-[#e5eeff] p-4 rounded-xl border border-[#9bccf6] space-y-2">
              <div className="flex items-center gap-2 text-[#003b5a] font-bold text-sm">
                <span className="material-symbols-outlined text-[18px]">security</span>
                <span>{tx(lang, 'consent_title')}</span>
              </div>
              <p className="text-sm text-slate-600">{tx(lang, 'consent_desc')}</p>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentRevenue}
                  onChange={(e) => setConsentRevenue(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#003b5a] rounded border-slate-300 focus:ring-[#003b5a]"
                />
                <span className="text-sm">{tx(lang, 'chk_revenue')}</span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentEdu}
                  onChange={(e) => setConsentEdu(e.target.checked)}
                  className="mt-1 w-5 h-5 text-[#003b5a] rounded border-slate-300 focus:ring-[#003b5a]"
                />
                <span className="text-sm">{tx(lang, 'chk_edu')}</span>
              </label>
            </div>

            <div className="pt-4">
              <button
                onClick={() => goTo(8)}
                disabled={!consentRevenue || !consentEdu}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {tx(lang, 'btn_allow_collect')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 8: Upload Missing Files — DYNAMIC
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 8 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'upload_header')} backTo={7} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            {/* Dropzone */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center space-y-2 hover:border-[#003b5a] transition-colors bg-[#f8f9ff] cursor-pointer">
              <span className="material-symbols-outlined text-4xl text-[#003b5a]">cloud_upload</span>
              <h4 className="text-sm font-bold">{tx(lang, 'dropzone_title')}</h4>
              <p className="text-xs text-slate-500">{tx(lang, 'dropzone_sub')}</p>
            </div>

            {/* Missing docs shown as uploaded (simulated) */}
            {missingDocs.length > 0 && (
              <div className="space-y-2">
                {missingDocs.map((doc) => (
                  <div key={doc.id} className="bg-[#f8f9ff] p-3 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600">task</span>
                      <div>
                        <h5 className="text-sm font-semibold">{lang === 'mr' ? doc.nameMr : doc.name}</h5>
                        <span className="text-xs text-emerald-600">{tx(lang, 'status_uploaded_mark')}</span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600">check_circle</span>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={() => goTo(9)}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition"
              >
                {tx(lang, 'btn_continue_pack')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 9: Smart Document Pack — DYNAMIC
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 9 && selectedScheme && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'pack_header')} backTo={8} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            {/* Ready Banner */}
            <div className="flex justify-between items-center bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
              <div>
                <h4 className="text-sm font-bold text-emerald-800">
                  {totalDocs}/{totalDocs} {tx(lang, 'pack_status_ready')}
                </h4>
                <p className="text-xs text-slate-600">{tx(lang, 'pack_sub')}</p>
              </div>
              <span className="material-symbols-outlined text-3xl text-emerald-600">verified_user</span>
            </div>

            {/* Document List — all scheme docs */}
            <div className="space-y-2">
              {selectedScheme.requiredDocuments.map((doc) => (
                <div key={doc.id} className="bg-[#f8f9ff] p-2.5 rounded-lg border border-slate-200 flex items-center justify-between text-sm">
                  <span>{lang === 'mr' ? doc.nameMr : doc.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded font-medium border ${
                    doc.available
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      : 'bg-[#e5eeff] text-[#003b5a] border-[#9bccf6]'
                  }`}>
                    {doc.available ? tx(lang, 'badge_gov') : tx(lang, 'badge_citizen')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => goTo(10)}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition"
              >
                {tx(lang, 'btn_proceed_app')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 10: Application Form — DYNAMIC scheme name
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 10 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'app_form_header')} backTo={9} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            {/* Selected scheme banner */}
            {selectedScheme && (
              <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#9bccf6] text-sm">
                <span className="text-slate-500 text-xs">{tx(lang, 'lbl_scheme_name')}</span>
                <p className="font-bold text-[#003b5a]">{lang === 'mr' ? selectedScheme.nameMr : selectedScheme.name}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_institute')}</label>
                <input
                  type="text"
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={institute}
                  onChange={(e) => setInstitute(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_course')}</label>
                <input
                  type="text"
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">{tx(lang, 'lbl_bank_acc')}</label>
                <input
                  type="text"
                  className="w-full bg-[#f8f9ff] border border-slate-300 rounded-lg p-3 text-sm mt-1 focus:border-[#003b5a] outline-none"
                  value={bankAcc}
                  onChange={(e) => setBankAcc(e.target.value)}
                />
              </div>
            </div>

            <div className="p-3 bg-[#f8f9ff] rounded-lg border border-slate-200 flex items-center justify-between">
              <span className="text-sm text-slate-500">{tx(lang, 'lbl_attached_pack')}</span>
              <span className="text-emerald-700 font-semibold text-xs">
                {totalDocs}/{totalDocs} {tx(lang, 'val_attached_complete')}
              </span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => goTo(11)}
                className="w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov hover:bg-[#002840] transition"
              >
                {tx(lang, 'btn_review_submit')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 11: Review Application — DYNAMIC scheme name
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 11 && (
        <div className="space-y-4 animate-fadeIn">
          <ScreenHeader title={tx(lang, 'review_header')} backTo={10} />

          <div className="bg-white border border-slate-200 p-5 rounded-xl space-y-4 shadow-gov">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{tx(lang, 'lbl_applicant_name')}</span>
                <span className="font-semibold">{fullName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{tx(lang, 'lbl_scheme_name')}</span>
                <span className="font-semibold text-right max-w-[55%]">
                  {selectedScheme
                    ? (lang === 'mr' ? selectedScheme.nameMr : selectedScheme.name)
                    : tx(lang, 'sch_1_title')}
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">{tx(lang, 'lbl_institute')}</span>
                <span className="font-semibold text-right max-w-[55%]">{institute.length > 20 ? institute.split(',')[0] : institute}</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500">{tx(lang, 'lbl_verification_status')}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  <span>{tx(lang, 'val_fully_verified')}</span>
                </span>
              </div>
            </div>

            <div className="bg-[#f8f9ff] p-3 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-500">{tx(lang, 'summary_badges_label')}</span>
              <div className="flex gap-1">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-xs font-medium border border-emerald-200">
                  {tx(lang, 'badge_gov_ver')}
                </span>
                <span className="px-2 py-0.5 bg-[#e5eeff] text-[#003b5a] rounded text-xs font-medium border border-[#9bccf6]">
                  {tx(lang, 'badge_citizen_up')}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleSubmit}
                className="w-full bg-[#f47920] hover:bg-[#d86815] text-white py-3.5 rounded-xl text-sm font-bold shadow-gov-md flex items-center justify-center gap-2 transition"
              >
                <span className="material-symbols-outlined text-[18px]">send</span>
                <span>{tx(lang, 'btn_final_submit')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          SCREEN 12: Success
         ═══════════════════════════════════════════════════════════════════════ */}
      {screen === 12 && (
        <div className="space-y-5 text-center py-8 animate-fadeIn">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-gov">
            <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-[#003b5a]">{tx(lang, 'success_title')}</h2>
            <p className="text-sm text-slate-600">{tx(lang, 'success_desc')}</p>
          </div>

          <div className="bg-white border border-slate-200 p-4 rounded-xl max-w-xs mx-auto space-y-1 shadow-gov text-left">
            <span className="text-xs text-slate-500">{tx(lang, 'lbl_app_id')}</span>
            <div className="text-lg font-bold font-mono text-[#003b5a]">{appRefId}</div>
            <span className="text-xs text-emerald-600 font-medium block pt-1">{tx(lang, 'status_submitted')}</span>
          </div>

          <div className="space-y-2 pt-4 max-w-xs mx-auto">
            <Link
              href="/"
              className="block w-full bg-[#003b5a] text-white py-3 rounded-xl text-sm font-bold shadow-gov text-center hover:bg-[#002840] transition"
            >
              {tx(lang, 'btn_back_dashboard')}
            </Link>
            <Link
              href="/track"
              className="block w-full bg-slate-100 border border-slate-300 py-3 rounded-xl text-sm font-bold text-[#003b5a] text-center hover:bg-slate-200 transition"
            >
              {tx(lang, 'btn_track_app')}
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
