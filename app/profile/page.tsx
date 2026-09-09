'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { CitizenProfile, SCHEME_INTEREST_CATEGORIES } from '@/lib/authConfig';
import { MAHARASHTRA_DISTRICTS, getTalukasForDistrict } from '@/lib/maharashtraGeo';

export default function UpdateProfilePage() {
  const router = useRouter();
  const { language, currentUser, userProfile, saveUserProfile, isAuthLoaded, isLoggedIn } = useApp();

  // Personal Information
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [dob, setDob] = useState('2003-05-15');
  const [age, setAge] = useState(23);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Transgender'>('Male');
  const [maritalStatus, setMaritalStatus] = useState<'Single' | 'Married' | 'Divorced' | 'Widowed'>('Single');

  // Location
  const [state] = useState('Maharashtra');
  const [district, setDistrict] = useState('Pune');
  const [taluka, setTaluka] = useState('Haveli');
  const [villageCity, setVillageCity] = useState('');
  const [pinCode, setPinCode] = useState('411001');

  // Social & Eligibility Information
  const [category, setCategory] = useState<'General/Open' | 'OBC' | 'SC' | 'ST' | 'EWS' | 'VJNT' | 'SBC'>('OBC');
  const [annualIncomeTier, setAnnualIncomeTier] = useState<'under-50k' | '50k-1L' | '1L-2.5L' | '2.5L-8L' | 'above-8L'>('1L-2.5L');
  const [occupation, setOccupation] = useState<string>('Student');
  const [educationLevel, setEducationLevel] = useState<string>('Graduate');

  // Additional Information: Student
  const [isStudent, setIsStudent] = useState<boolean>(true);
  const [courseClass, setCourseClass] = useState('B.Tech / Computer Engineering');
  const [institutionType, setInstitutionType] = useState('Autonomous College / University');
  const [academicYear, setAcademicYear] = useState('Final Year');

  // Additional Information: Disability
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [disabilityType, setDisabilityType] = useState('Locomotor');
  const [disabilityPercentage, setDisabilityPercentage] = useState<number>(40);

  // Scheme Interests & Preferences
  const [schemeInterests, setSchemeInterests] = useState<string[]>(['education', 'employment']);
  const [preferredLanguage, setPreferredLanguage] = useState<'mr' | 'hi' | 'en'>('mr');

  // Feedback State
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Load existing authenticated user profile into state
  useEffect(() => {
    if (currentUser) {
      setMobile(currentUser.mobile);
      if (!fullName) {
        setFullName(userProfile?.fullName || currentUser.name);
      }
    }

    if (userProfile) {
      if (userProfile.fullName) setFullName(userProfile.fullName);
      if (userProfile.dob) setDob(userProfile.dob);
      if (userProfile.age !== undefined) setAge(userProfile.age);
      if (userProfile.gender) setGender(userProfile.gender);
      if (userProfile.maritalStatus) setMaritalStatus(userProfile.maritalStatus);

      if (userProfile.district) setDistrict(userProfile.district);
      if (userProfile.taluka) setTaluka(userProfile.taluka);
      if (userProfile.villageCity) setVillageCity(userProfile.villageCity);
      if (userProfile.pinCode) setPinCode(userProfile.pinCode);

      if (userProfile.category) setCategory(userProfile.category);
      if (userProfile.annualIncomeTier) setAnnualIncomeTier(userProfile.annualIncomeTier as any);
      if (userProfile.occupation) setOccupation(userProfile.occupation);
      if (userProfile.educationLevel) setEducationLevel(userProfile.educationLevel);

      if (userProfile.isStudent !== undefined) setIsStudent(userProfile.isStudent);
      if (userProfile.courseClass || userProfile.currentCourse) {
        setCourseClass(userProfile.courseClass || userProfile.currentCourse || '');
      }
      if (userProfile.institutionType) setInstitutionType(userProfile.institutionType);
      if (userProfile.academicYear) setAcademicYear(userProfile.academicYear);

      if (userProfile.hasDisability !== undefined) setHasDisability(userProfile.hasDisability);
      if (userProfile.disabilityType) setDisabilityType(userProfile.disabilityType);
      if (userProfile.disabilityPercentage !== undefined) setDisabilityPercentage(userProfile.disabilityPercentage);

      if (userProfile.schemeInterests && userProfile.schemeInterests.length > 0) {
        setSchemeInterests(userProfile.schemeInterests);
      }
      if (userProfile.preferredLanguage) setPreferredLanguage(userProfile.preferredLanguage);
    }
  }, [currentUser, userProfile]);

  // Recalculate age from DOB
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

  // Dynamic Talukas for chosen District
  const availableTalukas = useMemo(() => {
    return getTalukasForDistrict(district);
  }, [district]);

  // Reset taluka if not valid in district
  useEffect(() => {
    if (availableTalukas.length > 0 && !availableTalukas.includes(taluka)) {
      setTaluka(availableTalukas[0]);
    }
  }, [district, availableTalukas, taluka]);

  // Toggle Scheme Interests
  const toggleInterest = (id: string) => {
    setSchemeInterests((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError('');

    if (!fullName.trim()) {
      setValidationError(language === 'mr' ? 'कृपया पूर्ण नाव भरा.' : 'Please enter your full name.');
      return;
    }

    if (!district || !taluka) {
      setValidationError(language === 'mr' ? 'कृपया जिल्हा आणि तालुका निवडा.' : 'Please select your district and taluka.');
      return;
    }

    if (!pinCode || pinCode.length !== 6) {
      setValidationError(language === 'mr' ? 'कृपया ६ अंकी पिन कोड प्रविष्ट करा.' : 'Please enter a valid 6-digit pin code.');
      return;
    }

    if (schemeInterests.length === 0) {
      setValidationError(language === 'mr' ? 'कृपया किमान एक योजना आवश्यकता निवडा.' : 'Please select at least one scheme interest.');
      return;
    }

    setIsSaving(true);

    const updatedProfile: CitizenProfile = {
      fullName: fullName.trim(),
      mobile: currentUser ? currentUser.mobile : mobile,
      dob,
      age,
      gender,
      category,
      religion: userProfile?.religion || 'Hindu',
      maritalStatus,
      state,
      district,
      taluka,
      villageCity: villageCity.trim() || taluka,
      pinCode,
      annualIncomeTier,
      annualIncomeAmount: incomeNumericAmount,
      occupation,
      educationLevel,
      isStudent,
      currentCourse: isStudent ? courseClass : undefined,
      courseClass: isStudent ? courseClass : undefined,
      institutionType: isStudent ? institutionType : undefined,
      academicYear: isStudent ? academicYear : undefined,
      hasDisability,
      disabilityType: hasDisability ? disabilityType : undefined,
      disabilityPercentage: hasDisability ? disabilityPercentage : undefined,
      schemeInterests,
      preferredLanguage,
      confirmedAccurate: true,
      completedAt: new Date().toISOString(),
    };

    saveUserProfile(updatedProfile);

    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Automatically redirect to dashboard after 1.5s so the user sees the confirmation
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }, 400);
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/dashboard" className="hover:text-[#003b5a] flex items-center gap-1 font-semibold">
          <span className="material-symbols-outlined text-[16px]">dashboard</span>
          <span>Citizen Dashboard</span>
        </Link>
        <span>/</span>
        <span className="text-[#003b5a] font-bold">Update Profile</span>
      </div>

      {/* Header Banner */}
      <div className="bg-[#003b5a] text-white rounded-2xl p-6 sm:p-8 shadow-gov relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/10 text-amber-400 flex items-center justify-center border border-amber-400/40 flex-shrink-0">
              <span className="material-symbols-outlined text-[32px]">manage_accounts</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[11px] font-bold px-3 py-0.5 rounded-full border border-amber-400/30 mb-1">
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Citizen Profile Management</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {language === 'mr' ? 'आपली नागरिक प्रोफाइल अद्ययावत करा' : 'Update Your Profile'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {language === 'mr'
                  ? 'आपली माहिती अद्ययावत करा. बदललेली माहिती थेट डॅशबोर्ड, पात्रता तपासणी आणि योजना शोधकामध्ये लागू होईल.'
                  : 'Modify your demographic and socio-economic details. Updates instantly recalculate your scheme recommendations and eligibility.'}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20 text-right sm:block hidden">
            <span className="text-[10px] text-slate-300 uppercase tracking-wider block">Logged In Citizen</span>
            <span className="text-sm font-bold text-amber-400 font-mono">{currentUser?.name || fullName}</span>
            <span className="text-[11px] text-slate-300 font-mono block">Mobile: +91 {currentUser?.mobile || mobile}</span>
          </div>
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-5 bg-emerald-50 border-2 border-emerald-400 text-emerald-900 rounded-2xl flex items-start gap-3.5 shadow-gov animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600 text-[26px] flex-shrink-0 mt-0.5">check_circle</span>
          <div className="flex-grow">
            <h3 className="text-sm font-bold text-emerald-900">
              ✓ Profile Updated Successfully
            </h3>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Your scheme and service recommendations will now use your updated information. Redirecting to Citizen Dashboard...
            </p>
          </div>
          <Link
            href="/dashboard"
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
          >
            Go to Dashboard
          </Link>
        </div>
      )}

      {/* Validation Error Alert */}
      {validationError && (
        <div className="p-4 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-center gap-3 shadow-sm">
          <span className="material-symbols-outlined text-red-600 text-[20px]">error</span>
          <p className="font-semibold">{validationError}</p>
        </div>
      )}

      {/* Main Profile Edit Form */}
      <form onSubmit={handleSave} className="space-y-8 bg-white rounded-2xl p-6 sm:p-10 shadow-gov border border-slate-200">
        {/* SECTION 1: PERSONAL INFORMATION */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">1</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'वैयक्तिक माहिती (Personal Information)' : 'Personal Information'}
              </h2>
              <p className="text-[11px] text-slate-500">Name, Date of Birth, Gender, and Marital Status</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="fullName">
                {language === 'mr' ? 'पूर्ण नाव (Full Name)' : 'Full Name'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                required
              />
            </div>

            {/* Mobile Number (READ-ONLY) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="mobile">
                  {language === 'mr' ? 'मोबाईल क्रमांक (Mobile Number)' : 'Mobile Number'}
                </label>
                <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px] text-slate-500">lock</span> Read-Only
                </span>
              </div>
              <div className="relative">
                <input
                  id="mobile"
                  type="text"
                  value={mobile ? `+91 ${mobile}` : ''}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Associated with your sovereign authenticated account.</p>
            </div>

            {/* Aadhaar Number (READ-ONLY) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700" htmlFor="aadhaar">
                  {language === 'mr' ? 'आधार क्रमांक (Aadhaar Number)' : 'Aadhaar Number'}
                </label>
                <span className="text-[10px] text-emerald-700 uppercase font-bold flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[12px] text-emerald-600">verified</span> Verified / Provided
                </span>
              </div>
              <div className="relative">
                <input
                  id="aadhaar"
                  type="text"
                  value={currentUser?.aadhaarMasked || userProfile?.aadhaarMasked || 'XXXX XXXX 0000'}
                  readOnly
                  disabled
                  className="w-full h-11 px-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-600 cursor-not-allowed"
                />
                <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-emerald-600">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Sovereign identity locked to citizen account.</p>
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

            {/* Age (Auto-computed) */}
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

        {/* SECTION 2: LOCATION */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">2</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'स्थान आणि पत्ता (Location)' : 'Location'}
              </h2>
              <p className="text-[11px] text-slate-500">State, District, Taluka, and Residential Address</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* State */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="state">
                {language === 'mr' ? 'राज्य (State)' : 'State'}
              </label>
              <input
                id="state"
                type="text"
                value={state}
                readOnly
                disabled
                className="w-full h-11 px-3.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 cursor-not-allowed"
              />
            </div>

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
                {language === 'mr' ? 'गाव / शहर (Village / City)' : 'Village / City'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                id="villageCity"
                type="text"
                value={villageCity}
                onChange={(e) => setVillageCity(e.target.value)}
                placeholder="e.g. Haveli, Kothrud"
                className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                required
              />
            </div>

            {/* Pin Code */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="pinCode">
                {language === 'mr' ? 'पिन कोड (Pin Code)' : 'Pin Code'}
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

        {/* SECTION 3: SOCIAL & ELIGIBILITY INFORMATION */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">3</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'सामाजिक व पात्रता निकष (Social & Eligibility Information)' : 'Social & Eligibility Information'}
              </h2>
              <p className="text-[11px] text-slate-500">Category, Income, Occupation, and Education used directly by Eligibility Engine</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="General/Open">General / Open</option>
                <option value="OBC">OBC (Other Backward Class)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
                <option value="EWS">EWS (Economically Weaker Section)</option>
                <option value="VJNT">VJNT (Vimukta Jati & Nomadic Tribes)</option>
                <option value="SBC">SBC (Special Backward Class)</option>
              </select>
            </div>

            {/* Annual Family Income */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="annualIncomeTier">
                {language === 'mr' ? 'वार्षिक कौटुंबिक उत्पन्न (Annual Income)' : 'Annual Family Income'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="annualIncomeTier"
                value={annualIncomeTier}
                onChange={(e) => setAnnualIncomeTier(e.target.value as any)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="under-50k">Below ₹50,000 (BPL / Antyodaya)</option>
                <option value="50k-1L">₹50,000 - ₹1,00,000</option>
                <option value="1L-2.5L">₹1,00,000 - ₹2,50,000 (MahaDBT Standard)</option>
                <option value="2.5L-8L">₹2,50,000 - ₹8,00,000 (Non-Creamy Layer)</option>
                <option value="above-8L">Above ₹8,00,000</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="occupation">
                {language === 'mr' ? 'व्यवसाय (Occupation)' : 'Occupation'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="occupation"
                value={occupation}
                onChange={(e) => {
                  const val = e.target.value;
                  setOccupation(val);
                  if (val === 'Student') {
                    setIsStudent(true);
                  }
                }}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Farmer">Farmer (शेतकरी)</option>
                <option value="Agricultural Labourer">Agricultural Labourer (शेतमजूर)</option>
                <option value="Student">Student (विद्यार्थी)</option>
                <option value="Self-Employed / Business">Self-Employed / Business</option>
                <option value="Private Employee">Private Employee / Job</option>
                <option value="Government Employee">Government Employee</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Retired">Retired</option>
              </select>
            </div>

            {/* Education Level */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="educationLevel">
                {language === 'mr' ? 'शिक्षण पातळी (Education Level)' : 'Education Level'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                id="educationLevel"
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Illiterate">Illiterate</option>
                <option value="Primary School">Primary School</option>
                <option value="10th Pass">10th Pass</option>
                <option value="12th Pass">12th Pass</option>
                <option value="Diploma">Diploma</option>
                <option value="Graduate">Graduate (Undergraduate Degree)</option>
                <option value="Post Graduate">Post Graduate</option>
                <option value="Doctorate">Doctorate / Ph.D.</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 4: ADDITIONAL INFORMATION (Student & Disability) */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">4</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'अतिरिक्त माहिती (Additional Information)' : 'Additional Information'}
              </h2>
              <p className="text-[11px] text-slate-500">Student status, course, academic year, and disability criteria</p>
            </div>
          </div>

          {/* Student Status Box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'तुम्ही सध्या विद्यार्थी आहात का?' : 'Student Status'}
                </span>
                <p className="text-[11px] text-slate-500">
                  Enable to match scholarship, tuition fee waiver, and hostel maintenance schemes.
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
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="courseClass">
                    Course / Class
                  </label>
                  <input
                    id="courseClass"
                    type="text"
                    value={courseClass}
                    onChange={(e) => setCourseClass(e.target.value)}
                    placeholder="e.g. B.Tech Computer Engineering"
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="institutionType">
                    Institution Type
                  </label>
                  <select
                    id="institutionType"
                    value={institutionType}
                    onChange={(e) => setInstitutionType(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  >
                    <option value="Government College">Government College / University</option>
                    <option value="Government Aided">Government Aided Institution</option>
                    <option value="Autonomous College / University">Autonomous College / Institute</option>
                    <option value="Private Unaided">Private Unaided College</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="academicYear">
                    Current Academic Year
                  </label>
                  <select
                    id="academicYear"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="Final Year">Final Year</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Disability Status Box */}
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-800">
                  {language === 'mr' ? 'दिव्यांगत्व स्थिती (Disability Status)' : 'Disability Status (Divyangjan)'}
                </span>
                <p className="text-[11px] text-slate-500">
                  Enable to match specialized assistive aid, pension, and transport concession schemes.
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
              <div className="pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="disabilityType">
                    Disability Type
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
                    Disability Percentage (%)
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

        {/* SECTION 5: SCHEME / SERVICE REQUIREMENTS */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">5</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'शासकीय योजना / सेवा आवश्यकता (Requirements)' : 'Government Scheme / Service Requirements'}
              </h2>
              <p className="text-[11px] text-slate-500">Select welfare areas you are interested in for smart recommendations</p>
            </div>
          </div>

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
                      ? 'bg-blue-50/90 border-[#003b5a] shadow-sm text-[#003b5a]'
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

        {/* SECTION 6: PREFERENCES */}
        <div>
          <div className="flex items-center gap-2 pb-3 mb-6 border-b border-slate-200">
            <span className="w-7 h-7 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-xs font-bold">6</span>
            <div>
              <h2 className="text-base font-bold text-[#003b5a]">
                {language === 'mr' ? 'प्राधान्ये (Preferences)' : 'Preferences'}
              </h2>
              <p className="text-[11px] text-slate-500">Official SMS & Notifications Language</p>
            </div>
          </div>

          <div className="flex gap-6">
            {[
              { code: 'mr', label: 'मराठी (Marathi)' },
              { code: 'hi', label: 'हिंदी (Hindi)' },
              { code: 'en', label: 'English' },
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

        {/* Action Buttons */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 h-11 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[16px]">close</span>
            <span>Cancel</span>
          </button>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 h-12 bg-[#003b5a] hover:bg-[#002840] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-gov disabled:opacity-75"
            >
              {isSaving ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Changes...</span>
                </div>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
