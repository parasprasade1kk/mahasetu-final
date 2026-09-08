'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { CitizenProfile, SCHEME_INTEREST_CATEGORIES } from '@/lib/authConfig';
import { MAHARASHTRA_DISTRICTS, getTalukasForDistrict } from '@/lib/maharashtraGeo';

export default function OnboardingProfilePage() {
  const router = useRouter();
  const { language, currentUser, saveUserProfile, isAuthLoaded, isLoggedIn } = useApp();

  // Form State
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [mobile, setMobile] = useState(currentUser?.mobile || '');
  const [dob, setDob] = useState('2003-05-15');
  const [age, setAge] = useState(23);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender'>('Male');
  const [category, setCategory] = useState<'General/Open' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'VJNT' | 'SBC'>('OBC');
  const [religion, setReligion] = useState<'Hindu' | 'Muslim' | 'Buddhist' | 'Christian' | 'Jain' | 'Sikh' | 'Other'>('Hindu');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');

  // Address
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Haveli');
  const [villageCity, setVillageCity] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Socio-Economic
  const [annualIncomeTier, setAnnualIncomeTier] = useState<'under-50k' | '50k-1L' | '1L-2.5L' | '2.5L-8L' | 'above-8L'>('1L-2.5L');
  const [occupation, setOccupation] = useState<'Farmer' | 'Agricultural Labourer' | 'Student' | 'Self-Employed / Business' | 'Unemployed' | 'Private Job' | 'Government Employee' | 'Retired'>('Student');
  const [educationLevel, setEducationLevel] = useState<'Illiterate' | 'Primary School' | '10th Pass' | '12th Pass' | 'Diploma' | 'Graduate' | 'Post Graduate' | 'Doctorate'>('Graduate');
  
  // Conditional Flags
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [currentCourse, setCurrentCourse] = useState('B.Tech / Engineering');
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [disabilityType, setDisabilityType] = useState('Locomotor');
  const [disabilityPercentage, setDisabilityPercentage] = useState<number>(40);

  // Scheme Interests & Preferences
  const [schemeInterests, setSchemeInterests] = useState<string[]>(['education', 'employment']);
  const [preferredLanguage, setPreferredLanguage] = useState<'mr' | 'hi' | 'en'>('mr');
  const [confirmedAccurate, setConfirmedAccurate] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Sync user details if loaded
  useEffect(() => {
    if (currentUser) {
      if (!fullName) setFullName(currentUser.name);
      setMobile(currentUser.mobile);
    }
  }, [currentUser, fullName]);

  // Calculate age dynamically when DOB changes
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(Math.max(0, calculatedAge));
    }
  }, [dob]);

  // Available talukas based on district
  const availableTalukas = useMemo(() => {
    return getTalukasForDistrict(district);
  }, [district]);

  // Reset taluka when district changes if current taluka not in new district
  useEffect(() => {
    if (availableTalukas.length > 0 && !availableTalukas.includes(taluka)) {
      setTaluka(availableTalukas[0]);
    }
  }, [district, availableTalukas, taluka]);

  // Toggle Scheme Interest
  const toggleInterest = (id: string) => {
    setSchemeInterests(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Convert annualIncomeTier to approximate numeric amount for engine compatibility
  const incomeNumericAmount = useMemo(() => {
    switch (annualIncomeTier) {
      case 'under-50k': return 45000;
      case '50k-1L': return 80000;
      case '1L-2.5L': return 180000;
      case '2.5L-8L': return 500000;
      case 'above-8L': return 900000;
      default: return 180000;
    }
  }, [annualIncomeTier]);

  // Validation
  const isFormValid = useMemo(() => {
    return (
      fullName.trim().length > 0 &&
      mobile.length === 10 &&
      dob.length > 0 &&
      age >= 0 &&
      district.trim().length > 0 &&
      taluka.trim().length > 0 &&
      villageCity.trim().length > 0 &&
      pinCode.length === 6 &&
      schemeInterests.length > 0 &&
      confirmedAccurate === true
    );
  }, [fullName, mobile, dob, age, district, taluka, villageCity, pinCode, schemeInterests, confirmedAccurate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      setFormError(
        language === 'mr'
          ? 'कृपया सर्व आवश्यक रकाने भरा आणि माहितीच्या अचूकतेची पुष्टी करा.'
          : 'Please complete all required fields and check the confirmation box.'
      );
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    const profileData: CitizenProfile = {
      fullName: fullName.trim(),
      mobile,
      dob,
      age,
      gender,
      category,
      religion,
      maritalStatus,
      district,
      taluka,
      villageCity: villageCity.trim(),
      pinCode,
      annualIncomeTier,
      annualIncomeAmount: incomeNumericAmount,
      occupation,
      educationLevel,
      isStudent,
      currentCourse: isStudent ? currentCourse : undefined,
      hasDisability,
      disabilityType: hasDisability ? disabilityType : undefined,
      disabilityPercentage: hasDisability ? disabilityPercentage : undefined,
      schemeInterests,
      preferredLanguage,
      confirmedAccurate: true,
      completedAt: new Date().toISOString()
    };

    saveUserProfile(profileData);

    setTimeout(() => {
      setIsSubmitting(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Banner */}
      <div className="bg-[#003b5a] text-white rounded-2xl p-6 sm:p-8 shadow-gov mb-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 text-amber-400 flex items-center justify-center border border-amber-400/40 flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">manage_accounts</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-amber-400/30 mb-1">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>MahaSetu Citizen Onboarding</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {language === 'mr' ? 'नागरिक मूलभूत तपशील नोंदणी' : 'Basic Citizen Profile Setup'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {language === 'mr'
                  ? 'आपल्या पात्रतेनुसार योग्य शासकीय योजना आणि सेवा मिळवण्यासाठी हा अर्ज भरा.'
                  : 'Complete this one-time profile to power automatic scheme matching and eligibility verification.'}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 text-right sm:block hidden">
            <span className="text-[11px] text-slate-300 uppercase tracking-wider block">Authenticated Citizen</span>
            <span className="text-sm font-bold text-amber-400 font-mono">{currentUser?.name || fullName}</span>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-8 bg-white rounded-2xl p-6 sm:p-10 shadow-gov border border-slate-200">
        {formError && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-center gap-3">
            <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
            <p className="font-semibold">{formError}</p>
          </div>
        )}

        {/* SECTION 1: Personal Demographics */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">1</span>
            <h2 className="text-base font-bold text-[#003b5a]">
              {language === 'mr' ? 'वैयक्तिक माहिती (Personal Demographics)' : 'Personal Demographics'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="fullName">
                {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name (As per records)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-11 px-3.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a] focus:bg-white"
                required
              />
            </div>

            {/* Mobile Number (Read-Only) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="mobile">
                {language === 'mr' ? 'मोबाईल क्रमांक (Mobile Number)' : 'Mobile Number (Verified)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  id="mobile"
                  type="text"
                  value={mobile}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="dob">
                {language === 'mr' ? 'जन्मतारीख (Date of Birth)' : 'Date of Birth'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                required
              />
            </div>

            {/* Calculated Age */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="age">
                {language === 'mr' ? 'वय (Age in Years)' : 'Age (Computed)'}
              </label>
              <div className="relative">
                <input
                  id="age"
                  type="text"
                  value={`${age} Years`}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                  <span className="material-symbols-outlined text-[18px]">cake</span>
                </span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="gender">
                {language === 'mr' ? 'लिंग (Gender)' : 'Gender'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Male">{language === 'mr' ? 'पुरुष (Male)' : 'Male'}</option>
                <option value="Female">{language === 'mr' ? 'स्त्री (Female)' : 'Female'}</option>
                <option value="Transgender">{language === 'mr' ? 'तृतीयपंथी (Transgender)' : 'Transgender'}</option>
              </select>
            </div>

            {/* Social Category */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="category">
                {language === 'mr' ? 'सामाजिक प्रवर्ग (Social Category)' : 'Category / Reservation'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="General/Open">General / Open</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="VJNT">VJNT (Vimukta Jati & Nomadic Tribes)</option>
                <option value="SBC">SBC (Special Backward Class)</option>
              </select>
            </div>

            {/* Religion */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="religion">
                {language === 'mr' ? 'धर्म (Religion)' : 'Religion'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="religion"
                value={religion}
                onChange={(e) => setReligion(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Hindu">Hindu</option>
                <option value="Muslim">Muslim</option>
                <option value="Buddhist">Buddhist</option>
                <option value="Christian">Christian</option>
                <option value="Jain">Jain</option>
                <option value="Sikh">Sikh</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Marital Status */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="maritalStatus">
                {language === 'mr' ? 'वैवाहिक स्थिती (Marital Status)' : 'Marital Status'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="maritalStatus"
                value={maritalStatus}
                onChange={(e) => setMaritalStatus(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Single">{language === 'mr' ? 'अविवाहित (Single)' : 'Single'}</option>
                <option value="Married">{language === 'mr' ? 'विवाहित (Married)' : 'Married'}</option>
                <option value="Divorced">{language === 'mr' ? 'घटस्फोटित (Divorced)' : 'Divorced'}</option>
                <option value="Widowed">{language === 'mr' ? 'विधवा / विधुर (Widowed)' : 'Widowed'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Maharashtra Residence Details */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">2</span>
            <h2 className="text-base font-bold text-[#003b5a]">
              {language === 'mr' ? 'महाराष्ट्रातील वास्तव्याचा पत्ता (Residence in Maharashtra)' : 'Maharashtra Residence Address'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* District */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="district">
                {language === 'mr' ? 'जिल्हा (District)' : 'District (Maharashtra)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                {MAHARASHTRA_DISTRICTS.map((d) => (
                  <option key={d.id} value={d.nameEn}>
                    {language === 'mr' ? d.nameMr : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Taluka */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="taluka">
                {language === 'mr' ? 'तालुका (Taluka)' : 'Taluka / Tehsil'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="taluka"
                value={taluka}
                onChange={(e) => setTaluka(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                {availableTalukas.map((tName) => (
                  <option key={tName} value={tName}>
                    {tName}
                  </option>
                ))}
              </select>
            </div>

            {/* Village / City */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="villageCity">
                {language === 'mr' ? 'गाव / शहर (Village / City)' : 'Village / Town / City'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="villageCity"
                type="text"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
                placeholder="e.g. Haveli, Shivajinagar"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                required
              />
            </div>

            {/* Pin Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pinCode">
                {language === 'mr' ? 'पिन कोड (Pin Code)' : 'Pin Code (6 Digits)'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="pinCode"
                type="text"
                maxLength={6}
                value={pinCode}
                onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 411001"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-mono font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                required
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Socio-Economic Profile */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">3</span>
            <h2 className="text-base font-bold text-[#003b5a]">
              {language === 'mr' ? 'सामाजिक-आर्थिक तपशील (Socio-Economic Profile)' : 'Socio-Economic Profile'}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Annual Income Tier */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="annualIncomeTier">
                {language === 'mr' ? 'वार्षिक कौटुंबिक उत्पन्न (Annual Family Income)' : 'Annual Family Income Tier'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="annualIncomeTier"
                value={annualIncomeTier}
                onChange={(e) => setAnnualIncomeTier(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="under-50k">Below ₹50,000 (अत्यंत दुर्बल घटक / BPL)</option>
                <option value="50k-1L">₹50,000 - ₹1,00,000</option>
                <option value="1L-2.5L">₹1,00,000 - ₹2,50,000 (MahaDBT Standard)</option>
                <option value="2.5L-8L">₹2,50,000 - ₹8,00,000 (Non-Creamy Layer Cap)</option>
                <option value="above-8L">Above ₹8,00,000 (₹८ लाखांपेक्षा जास्त)</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="occupation">
                {language === 'mr' ? 'व्यवसाय (Occupation)' : 'Primary Occupation'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="occupation"
                value={occupation}
                onChange={(e) => {
                  const occ = e.target.value as any;
                  setOccupation(occ);
                  if (occ === 'Student') {
                    setIsStudent(true);
                  }
                }}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Farmer">Farmer (शेतकरी)</option>
                <option value="Agricultural Labourer">Agricultural Labourer (शेतमजूर)</option>
                <option value="Student">Student (विद्यार्थी)</option>
                <option value="Self-Employed / Business">Self-Employed / Business (स्वतःचा व्यवसाय / उद्योजक)</option>
                <option value="Private Job">Private Sector Employee (खाजगी नोकरी)</option>
                <option value="Government Employee">Government Employee (शासकीय कर्मचारी)</option>
                <option value="Unemployed">Unemployed / Looking for work (बेरोजगार)</option>
                <option value="Retired">Retired (सेवानिवृत्त)</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="educationLevel">
                {language === 'mr' ? 'शिक्षण पातळी (Education Level)' : 'Highest Education Level'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Illiterate">Illiterate</option>
                <option value="Primary School">Primary School (इ. १ ली ते ८ वी)</option>
                <option value="10th Pass">10th Pass (एसएससी)</option>
                <option value="12th Pass">12th Pass (एचएससी)</option>
                <option value="Diploma">Polytechnic Diploma</option>
                <option value="Graduate">Graduate (पदवीधर - B.A., B.Com, B.Sc, B.E., etc.)</option>
                <option value="Post Graduate">Post Graduate (पदव्युत्तर - M.A., M.Sc, M.Tech, etc.)</option>
                <option value="Doctorate">Doctorate / Ph.D.</option>
              </select>
            </div>
          </div>

          {/* Conditional Student Details */}
          <div className="mt-5 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'तुम्ही सध्या विद्यार्थी आहात का?' : 'Are you currently a student?'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {language === 'mr'
                    ? 'महाडीबीटी आणि केंद्र/राज्य शिष्यवृत्तीच्या पडताळणीसाठी आवश्यक'
                    : 'Helps automatically check eligibility for MahaDBT scholarships & hostel stipends'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStudent}
                  onChange={(e) => setIsStudent(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003b5a]"></div>
              </label>
            </div>

            {isStudent && (
              <div className="pt-3 border-t border-slate-200">
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="currentCourse">
                  {language === 'mr' ? 'सध्याचा अभ्यासक्रम किंवा शाखा' : 'Current Course / Degree Program'}
                </label>
                <input
                  id="currentCourse"
                  type="text"
                  value={currentCourse}
                  onChange={(e) => setCurrentCourse(e.target.value)}
                  placeholder="e.g. B.Tech Computer Engineering (Final Year)"
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                />
              </div>
            )}
          </div>

          {/* Conditional Disability Details */}
          <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'दिव्यांगत्व आहे का? (Person with Disability - PwD)' : 'Person with Disability (Divyangjan)?'}
                </span>
                <p className="text-[11px] text-slate-500">
                  {language === 'mr'
                    ? 'दिव्यांग सहाय्यक उपकरणे आणि विशेष निवृत्तीवेतन योजनांसाठी'
                    : 'Enables matching with specialized disability pension, assistive aids & travel concessions'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#003b5a]"></div>
              </label>
            </div>

            {hasDisability && (
              <div className="pt-3 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="disabilityType">
                    {language === 'mr' ? 'दिव्यांगत्वाचा प्रकार' : 'Disability Category'}
                  </label>
                  <select
                    id="disabilityType"
                    value={disabilityType}
                    onChange={(e) => setDisabilityType(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  >
                    <option value="Locomotor">Locomotor / Orthopedic</option>
                    <option value="Visual Impairment">Visual Impairment / Blindness</option>
                    <option value="Hearing Impairment">Hearing Impairment</option>
                    <option value="Intellectual Disability">Intellectual Disability</option>
                    <option value="Multiple Disabilities">Multiple Disabilities</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="disabilityPercentage">
                    {language === 'mr' ? 'दिव्यांगत्व प्रमाण (%)' : 'Disability Percentage (%)'}
                  </label>
                  <input
                    id="disabilityPercentage"
                    type="number"
                    min={40}
                    max={100}
                    value={disabilityPercentage}
                    onChange={(e) => setDisabilityPercentage(Number(e.target.value))}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 4: Scheme Requirement Interests & Language Preference */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">4</span>
            <h2 className="text-base font-bold text-[#003b5a]">
              {language === 'mr' ? 'योजनांची आवश्यकता व प्राधान्ये (Scheme Interests & Notifications)' : 'Scheme Interests & Communication'}
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {language === 'mr'
                ? 'तुम्हाला कोणत्या क्षेत्रातील योजनांची माहिती हवी आहे? (Select scheme interests)'
                : 'Select areas where you seek government assistance & welfare benefits:'}
              <span className="text-red-500 ml-1">*</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {SCHEME_INTEREST_CATEGORIES.map((cat) => {
                const isSelected = schemeInterests.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleInterest(cat.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-blue-50/80 border-[#003b5a] shadow-sm text-[#003b5a]'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isSelected ? 'bg-[#003b5a] text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <span className="material-symbols-outlined text-[18px]">{cat.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">
                        {language === 'mr' ? cat.nameMr : cat.nameEn}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-[18px]">
                      {isSelected ? 'check_box' : 'check_box_outline_blank'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Preferred Communication Language */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {language === 'mr' ? 'शासकीय संवादाची प्राधान्य भाषा' : 'Preferred Language for Official SMS & Notifications:'}
            </label>
            <div className="flex gap-4">
              {[
                { code: 'mr', label: 'मराठी (Marathi)' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'en', label: 'English' }
              ].map((langItem) => (
                <label key={langItem.code} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="radio"
                    name="preferredLanguage"
                    value={langItem.code}
                    checked={preferredLanguage === langItem.code}
                    onChange={() => setPreferredLanguage(langItem.code as any)}
                    className="text-[#003b5a] focus:ring-[#003b5a]"
                  />
                  <span>{langItem.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* SECTION 5: Mandatory Consent Notice & Confirmation Checkbox */}
        <div className="pt-4 border-t border-slate-200 space-y-4">
          {/* Official Privacy Consent Notice */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
            <span className="material-symbols-outlined text-amber-700 text-[22px] flex-shrink-0 mt-0.5">shield</span>
            <div>
              <p className="font-bold mb-1">
                {language === 'mr' ? 'डेटा गोपनीयता व सुरक्षितता सूचना' : 'Official Consent Notice (DPDP Act 2023)'}
              </p>
              <p className="leading-relaxed text-amber-800">
                Your profile details are stored locally and will be used solely for personalized scheme recommendations and eligibility checks under MahaSetu.
              </p>
            </div>
          </div>

          {/* Mandatory Confirmation Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition">
            <input
              type="checkbox"
              checked={confirmedAccurate}
              onChange={(e) => setConfirmedAccurate(e.target.checked)}
              className="mt-1 w-4 h-4 text-[#003b5a] rounded border-slate-300 focus:ring-[#003b5a]"
              required
            />
            <span className="text-xs text-slate-700 font-medium leading-relaxed">
              I confirm that the details provided above are accurate and can be used to determine my eligibility for government schemes and services.
            </span>
          </label>
        </div>

        {/* Submit Action */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-slate-500">
            All fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.
          </p>

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className={`w-full sm:w-auto px-8 h-12 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-gov ${
              isFormValid && !isSubmitting
                ? 'bg-[#003b5a] hover:bg-[#002840] text-white cursor-pointer'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Citizen Profile...</span>
              </div>
            ) : (
              <>
                <span>{language === 'mr' ? 'महासेतू पोर्टलवर सुरू ठेवा' : 'Continue to MahaSetu'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
