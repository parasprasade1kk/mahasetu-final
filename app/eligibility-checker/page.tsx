'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  evaluateAllSchemes,
  UserProfile,
  normalizeIncome,
  formatINR,
  EvaluatedScheme,
} from '@/lib/eligibilityEngine';

export default function EligibilityCheckerPage() {
  const { language, userProfile: savedProfile } = useApp();

  // ─── Citizen Demographics State ─────────────────────────────────────────────
  const [category, setCategory] = useState<string>('OBC');
  const [incomeRange, setIncomeRange] = useState<string>('under-2.5L');
  const [exactIncome, setExactIncome] = useState<string>('1,50,000');
  const [occupation, setOccupation] = useState<string>('student');
  const [age, setAge] = useState<number>(20);
  const [educationLevel, setEducationLevel] = useState<string>('Undergraduate');
  const [hasDisability, setHasDisability] = useState<boolean>(false);
  const [isMaharashtraResident, setIsMaharashtraResident] = useState<boolean>(true);
  const [gender, setGender] = useState<'any' | 'male' | 'female'>('any');
  const [district, setDistrict] = useState<string>('Pune');

  // Pre-fill state whenever savedProfile is available
  useEffect(() => {
    if (savedProfile) {
      if (savedProfile.category) {
        setCategory(savedProfile.category === 'General/Open' ? 'OPEN' : savedProfile.category);
      }
      if (savedProfile.annualIncomeTier) {
        if (savedProfile.annualIncomeTier === 'under-50k' || savedProfile.annualIncomeTier === '50k-1L' || savedProfile.annualIncomeTier === '1L-2.5L') {
          setIncomeRange('under-2.5L');
          setExactIncome(savedProfile.annualIncomeAmount.toLocaleString('en-IN'));
        } else if (savedProfile.annualIncomeTier === '2.5L-8L') {
          setIncomeRange('2.5L-8L');
          setExactIncome(savedProfile.annualIncomeAmount.toLocaleString('en-IN'));
        } else {
          setIncomeRange('above-8L');
          setExactIncome(savedProfile.annualIncomeAmount.toLocaleString('en-IN'));
        }
      }
      if (savedProfile.age) setAge(savedProfile.age);
      if (savedProfile.occupation) setOccupation(savedProfile.occupation.toLowerCase());
      if (savedProfile.educationLevel) setEducationLevel(savedProfile.educationLevel);
      if (savedProfile.hasDisability !== undefined) setHasDisability(savedProfile.hasDisability);
      if (savedProfile.gender) {
        setGender(savedProfile.gender === 'Male' ? 'male' : savedProfile.gender === 'Female' ? 'female' : 'any');
      }
      if (savedProfile.district) setDistrict(savedProfile.district);
    }
  }, [savedProfile]);

  // ─── Results View State ─────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'eligible' | 'possible' | 'ineligible' | 'all'>('eligible');
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>(null);

  // ─── Income Handlers ────────────────────────────────────────────────────────
  const handleRangeChange = (rangeId: string) => {
    setIncomeRange(rangeId);
    if (rangeId === 'under-2.5L') {
      setExactIncome('1,50,000');
    } else if (rangeId === '2.5L-8L') {
      setExactIncome('5,00,000');
    } else if (rangeId === 'above-8L') {
      setExactIncome('9,00,000');
    }
  };

  const handleExactIncomeChange = (val: string) => {
    setExactIncome(val);
    const num = normalizeIncome(val);
    if (num < 250000) {
      setIncomeRange('under-2.5L');
    } else if (num <= 800000) {
      setIncomeRange('2.5L-8L');
    } else {
      setIncomeRange('above-8L');
    }
  };

  // ─── Occupation Handlers ────────────────────────────────────────────────────
  const handleOccupationChange = (newOcc: string) => {
    setOccupation(newOcc);
    if (newOcc === 'senior') {
      if (age < 60) setAge(65);
    } else if (newOcc === 'student') {
      if (age > 35) setAge(20);
    }
  };

  // ─── Reactive Eligibility Evaluation ────────────────────────────────────────
  const numericIncome = useMemo(() => normalizeIncome(exactIncome), [exactIncome]);
  const isStudent = occupation === 'student';

  const userProfile: UserProfile = useMemo(() => ({
    category,
    annualIncome: numericIncome,
    age,
    occupation,
    educationLevel,
    isStudent,
    hasDisability,
    isMaharashtraResident,
    gender,
    district,
  }), [category, numericIncome, age, occupation, educationLevel, isStudent, hasDisability, isMaharashtraResident, gender, district]);

  const allEvaluated: EvaluatedScheme[] = useMemo(() => {
    return evaluateAllSchemes(userProfile);
  }, [userProfile]);

  const eligibleList = useMemo(() => allEvaluated.filter(s => s.status === 'eligible'), [allEvaluated]);
  const possibleList = useMemo(() => allEvaluated.filter(s => s.status === 'possible'), [allEvaluated]);
  const ineligibleList = useMemo(() => allEvaluated.filter(s => s.status === 'ineligible'), [allEvaluated]);

  const displayedList = useMemo(() => {
    if (activeTab === 'eligible') return eligibleList;
    if (activeTab === 'possible') return possibleList;
    if (activeTab === 'ineligible') return ineligibleList;
    return allEvaluated;
  }, [activeTab, eligibleList, possibleList, ineligibleList, allEvaluated]);

  // Estimated annual benefits sum for eligible welfare schemes
  const totalEstimatedBenefits = useMemo(() => {
    let total = 0;
    eligibleList.forEach((e) => {
      const bStr = e.scheme.benefits;
      const match = bStr.match(/₹([\d,]+)/);
      if (match && match[1]) {
        const val = parseInt(match[1].replace(/,/g, ''), 10);
        if (!isNaN(val)) total += val;
      }
    });
    return total > 0 ? formatINR(total) : '₹75,000+';
  }, [eligibleList]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-[#f47920] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
          {language === 'mr' ? 'स्मार्ट पात्रता शोधक' : 'Rule-Engine Eligibility Calculator'}
        </span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#003b5a]">
          {language === 'mr' ? 'माझ्यासाठी शासकीय योजना शोधा' : 'Find Government Schemes for Me'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600">
          {language === 'mr'
            ? 'आपली वैयक्तिक माहिती प्रविष्ट करा; आमची प्रणाली सेकंदात आपल्यासाठी लागू असणाऱ्या योजनांची गणना करेल.'
            : 'Answer basic demographic questions to instantly calculate all welfare benefits and scholarships you qualify for.'}
        </p>

        {savedProfile && (
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs px-4 py-2 rounded-xl mt-2 font-medium shadow-sm">
            <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified_user</span>
            <span>
              Loaded from your verified profile ({savedProfile.fullName} • {savedProfile.district} • {savedProfile.category}). You can adjust parameters below to preview eligibility dynamically.
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Questionnaire (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 shadow-gov border border-slate-200 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-[#003b5a] flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-amber-500">tune</span>
              <span>{language === 'mr' ? 'आपली माहिती निवडा' : 'Citizen Demographics'}</span>
            </h3>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{language === 'mr' ? 'थेट गणना' : 'Live Calculated'}</span>
            </span>
          </div>

          {/* Question 1: Social Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. {language === 'mr' ? 'सामाजिक प्रवर्ग (Caste Category)' : 'Social Category (Caste Group)'}
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {['OBC', 'SC', 'ST', 'VJNT', 'SBC', 'EWS', 'OPEN'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-bold transition border ${
                    category === cat
                      ? 'bg-[#003b5a] text-white border-[#003b5a] shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Annual Family Income */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              2. {language === 'mr' ? 'वार्षिक कौटुंबिक उत्पन्न (Family Income)' : 'Annual Family Income Range'}
            </label>
            <div className="space-y-2">
              {[
                { id: 'under-2.5L', label: '< ₹2,50,000 (Low Income / BPL)' },
                { id: '2.5L-8L', label: '₹2,50,000 - ₹8,00,000 (Non-Creamy Layer)' },
                { id: 'above-8L', label: '> ₹8,00,000 (Above Creamy Layer)' },
              ].map((item) => (
                <label
                  key={item.id}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-xs font-semibold cursor-pointer transition ${
                    incomeRange === item.id
                      ? 'bg-[#e5eeff] border-[#003b5a] text-[#003b5a]'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="income"
                    checked={incomeRange === item.id}
                    onChange={() => handleRangeChange(item.id)}
                    className="text-[#003b5a]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>

            {/* Exact Income Input */}
            <div className="mt-3 pt-3 border-t border-slate-100">
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                {language === 'mr' ? 'किंवा अचूक वार्षिक उत्पन्न प्रविष्ट करा (₹):' : 'Or enter exact annual income (₹):'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-slate-400">₹</span>
                <input
                  type="text"
                  value={exactIncome}
                  onChange={(e) => handleExactIncomeChange(e.target.value)}
                  placeholder="e.g. 1,50,000 or 5,00,000"
                  className="w-full h-10 pl-7 pr-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003b5a] focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Question 3: Occupation / Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              3. {language === 'mr' ? 'सध्याची स्थिती / व्यवसाय' : 'Current Role / Occupation'}
            </label>
            <select
              value={occupation}
              onChange={(e) => handleOccupationChange(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a]"
            >
              <option value="student">Higher Education / College Student (पदवी/पदविका विद्यार्थी)</option>
              <option value="farmer">Farmer / Agricultural Landholder (शेतकरी / खातेदार)</option>
              <option value="woman">Woman / Homemaker (महिला / गृहिणी)</option>
              <option value="senior">Senior Citizen (ज्येष्ठ नागरिक)</option>
              <option value="destitute">Destitute / Disadvantaged Person (निराधार व्यक्ती)</option>
              <option value="salaried">Salaried / Private Worker (वेतनधारक कामगार)</option>
              <option value="unemployed">Job Seeker / Unemployed (बेरोजगार)</option>
            </select>
          </div>

          {/* Question 4: Age & Education (Combined Row) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                4. {language === 'mr' ? 'वय (Age in Yrs)' : 'Age (in Years)'}
              </label>
              <input
                type="number"
                min="5"
                max="105"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003b5a]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                5. {language === 'mr' ? 'शिक्षण पातळी' : 'Education Stage'}
              </label>
              <select
                value={educationLevel}
                onChange={(e) => setEducationLevel(e.target.value)}
                className="w-full h-11 px-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a]"
              >
                <option value="Undergraduate">Degree / Professional</option>
                <option value="Diploma">Diploma / Polytechnic</option>
                <option value="Postgraduate">Post Graduate / Master</option>
                <option value="School">School / 10th-12th</option>
                <option value="None">None / Other</option>
              </select>
            </div>
          </div>

          {/* Question 6: Disability & Residency Special Toggles */}
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <label className="block text-xs font-bold text-slate-700">
              6. {language === 'mr' ? 'विशेष वर्ग / अतिरिक्त पात्रता' : 'Special Inclusions & Status'}
            </label>
            <div className="grid grid-cols-1 gap-2">
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={hasDisability}
                  onChange={(e) => setHasDisability(e.target.checked)}
                  className="w-4 h-4 text-[#003b5a] rounded border-slate-300"
                />
                <span>
                  {language === 'mr'
                    ? 'दिव्यांग व्यक्ती (Persons with Disabilities / Divyang)'
                    : 'Person with Disability (Divyang / PwD - 40%+)'}
                </span>
              </label>
              <label className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer text-xs font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={isMaharashtraResident}
                  onChange={(e) => setIsMaharashtraResident(e.target.checked)}
                  className="w-4 h-4 text-[#003b5a] rounded border-slate-300"
                />
                <span>
                  {language === 'mr'
                    ? 'महाराष्ट्र राज्याचे रहिवासी (Maharashtra Resident)'
                    : 'Permanent Resident of Maharashtra'}
                </span>
              </label>
            </div>
          </div>

          {/* Question 7: District */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              7. {language === 'mr' ? 'जिल्हा (District)' : 'District of Residence'}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a]"
            >
              <option value="Pune">Pune (पुणे)</option>
              <option value="Mumbai">Mumbai Suburban (मुंबई उपनगर)</option>
              <option value="Nagpur">Nagpur (नागपूर)</option>
              <option value="Nashik">Nashik (नाशिक)</option>
              <option value="Chhatrapati Sambhajinagar">Chhatrapati Sambhajinagar (छत्रपती संभाजीनगर)</option>
              <option value="Kolhapur">Kolhapur (कोल्हापूर)</option>
              <option value="Amravati">Amravati (अमरावती)</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full h-11 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">bolt</span>
            <span>{language === 'mr' ? 'योजनांची गणना करा' : 'Calculate Matched Schemes'}</span>
          </button>
        </div>

        {/* Right Column: Matched Schemes Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Result Banner */}
          <div className="bg-gradient-to-r from-emerald-800 to-[#005b14] text-white rounded-2xl p-6 shadow-gov-lg flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-xs font-bold uppercase tracking-wider">
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>{language === 'mr' ? 'कायदेशीर पात्रता गणना' : 'Statutory Match Engine'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                {language === 'mr'
                  ? `आपण ${eligibleList.length} शासकीय योजनांसाठी पात्र आहात!`
                  : `You appear to be eligible for ${eligibleList.length} government schemes.`}
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                {language === 'mr'
                  ? `अंदाजे वार्षिक लाभ: `
                  : `Estimated direct benefits: `}
                <strong className="text-amber-300 text-sm">{totalEstimatedBenefits}</strong>{' '}
                {language === 'mr' ? 'थेट बँक खात्यात.' : 'directly to verified bank account.'}
              </p>
            </div>
            <span className="w-14 h-14 rounded-full bg-white/15 text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0">
              {eligibleList.length}
            </span>
          </div>

          {/* Filter Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
            <button
              onClick={() => setActiveTab('eligible')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'eligible'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              <span>{language === 'mr' ? 'पात्र योजना' : 'Eligible Schemes'} ({eligibleList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('possible')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'possible'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">info</span>
              <span>{language === 'mr' ? 'अधिक माहिती आवश्यक' : 'Needs Review'} ({possibleList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('ineligible')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'ineligible'
                  ? 'bg-red-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              <span>{language === 'mr' ? 'अपात्र योजना' : 'Not Eligible'} ({ineligibleList.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#003b5a] text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>{language === 'mr' ? 'सर्व योजना' : 'All Evaluated'} ({allEvaluated.length})</span>
            </button>
          </div>

          {/* Matched Scheme Cards */}
          <div className="space-y-4">
            {displayedList.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 p-8 text-center space-y-2 shadow-gov">
                <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
                <h4 className="text-sm font-bold text-slate-700">
                  {language === 'mr' ? 'या श्रेणीत कोणतीही योजना नाही.' : 'No schemes in this category.'}
                </h4>
                <p className="text-xs text-slate-500">
                  {language === 'mr'
                    ? 'डावीकडील माहिती तपासून पहा किंवा इतर टॅब निवडा.'
                    : 'Try adjusting your income, category, or age in the demographic form.'}
                </p>
              </div>
            ) : (
              displayedList.map((item) => {
                const isExpanded = expandedSchemeId === item.scheme.id;
                const isEligible = item.status === 'eligible';
                const isPossible = item.status === 'possible';
                const isIneligible = item.status === 'ineligible';

                return (
                  <div
                    key={item.scheme.id}
                    className={`bg-white rounded-xl border p-5 shadow-gov hover:shadow-gov-lg transition space-y-3 ${
                      isEligible
                        ? 'border-slate-200'
                        : isPossible
                        ? 'border-amber-200 bg-amber-50/20'
                        : 'border-red-200 bg-slate-50/40 opacity-90'
                    }`}
                  >
                    {/* Header Row */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-2 py-0.5 rounded">
                            {language === 'mr' ? item.scheme.departmentMr : item.scheme.department}
                          </span>
                          {item.scheme.category && (
                            <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                              {language === 'mr' ? item.scheme.categoryMr : item.scheme.category}
                            </span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-[#003b5a] mt-1.5">
                          {language === 'mr' ? item.scheme.nameMr : item.scheme.name}
                        </h3>
                      </div>

                      {/* Status / Score Badge */}
                      <span
                        className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full flex-shrink-0 border flex items-center gap-1 ${
                          isEligible
                            ? 'text-emerald-800 bg-emerald-50 border-emerald-300'
                            : isPossible
                            ? 'text-amber-800 bg-amber-50 border-amber-300'
                            : 'text-red-700 bg-red-50 border-red-200'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {isEligible ? 'check_circle' : isPossible ? 'warning' : 'cancel'}
                        </span>
                        <span>
                          {isEligible
                            ? `${item.matchScore}% Match`
                            : isPossible
                            ? `${item.matchScore}% Possible`
                            : language === 'mr' ? 'अपात्र' : 'Not Eligible'}
                        </span>
                      </span>
                    </div>

                    {/* Benefit Box */}
                    <div className="bg-[#f8f9ff] border border-slate-100 rounded-lg p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        {language === 'mr' ? 'अंदाजे थेट लाभ:' : 'Estimated Direct Benefit:'}
                      </span>
                      <span className="font-extrabold text-[#003b5a] text-sm">
                        {language === 'mr' ? item.scheme.benefitsMr : item.scheme.benefits}
                      </span>
                    </div>

                    {/* Qualification Drivers (Eligible) / Missing Requirements (Ineligible) */}
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-600">
                          {isEligible
                            ? (language === 'mr' ? 'पात्रतेची मुख्य कारणे:' : 'Why you may be eligible:')
                            : isIneligible
                            ? (language === 'mr' ? 'अपात्रतेची कारणे:' : 'Eligibility requirements not met:')
                            : (language === 'mr' ? 'पडताळणी निकष:' : 'Verification required:')}
                        </span>
                        <span className="text-[10px] text-slate-400 italic">
                          {isEligible
                            ? (language === 'mr' ? 'प्राथमिक निकष पूर्ण' : 'You appear to meet basic criteria')
                            : ''}
                        </span>
                      </div>

                      {/* Reasons list */}
                      {isEligible && (
                        <div className="space-y-1 text-slate-700">
                          {item.passedReasonsEn.slice(0, 3).map((r, i) => (
                            <p key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="material-symbols-outlined text-[14px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                              <span>{language === 'mr' ? item.passedReasonsMr[i] || r : r}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {isIneligible && (
                        <div className="space-y-1 text-red-700">
                          {item.failedReasonsEn.map((r, i) => (
                            <p key={i} className="flex items-start gap-1.5 text-[11px] font-medium">
                              <span className="material-symbols-outlined text-[14px] text-red-600 flex-shrink-0 mt-0.5">cancel</span>
                              <span>{language === 'mr' ? item.failedReasonsMr[i] || r : r}</span>
                            </p>
                          ))}
                          {/* Also show passing conditions to provide transparency */}
                          {item.passedReasonsEn.slice(0, 2).map((r, i) => (
                            <p key={i} className="flex items-start gap-1.5 text-[11px] text-slate-500">
                              <span className="material-symbols-outlined text-[14px] text-emerald-600 flex-shrink-0 mt-0.5">done</span>
                              <span>{language === 'mr' ? item.passedReasonsMr[i] || r : r}</span>
                            </p>
                          ))}
                        </div>
                      )}

                      {isPossible && (
                        <div className="space-y-1 text-amber-800">
                          {item.failedReasonsEn.map((r, i) => (
                            <p key={i} className="flex items-start gap-1.5 text-[11px]">
                              <span className="material-symbols-outlined text-[14px] text-amber-600 flex-shrink-0 mt-0.5">info</span>
                              <span>{language === 'mr' ? item.failedReasonsMr[i] || r : r}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Collapsible All Criteria Inspector */}
                    <div className="border-t border-slate-100 pt-2">
                      <button
                        type="button"
                        onClick={() => setExpandedSchemeId(isExpanded ? null : item.scheme.id)}
                        className="text-[11px] font-semibold text-[#003b5a] hover:underline flex items-center gap-1"
                      >
                        <span>{isExpanded ? (language === 'mr' ? 'तपशील लपवा' : 'Hide detailed checklist') : (language === 'mr' ? 'सर्व निकष पडताळणी पहा' : 'View all criteria checks')}</span>
                        <span className="material-symbols-outlined text-[14px]">
                          {isExpanded ? 'expand_less' : 'expand_more'}
                        </span>
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                          <p className="font-bold text-slate-700 text-[11px]">
                            {language === 'mr' ? 'निकष पडताळणी तपशील:' : 'Detailed Criteria Breakdown:'}
                          </p>
                          <div className="space-y-1.5">
                            {item.criteriaChecks.map((chk, ci) => (
                              <div key={ci} className="flex items-start justify-between gap-2 text-[11px] pb-1 border-b border-slate-200/60 last:border-0">
                                <div className="flex items-center gap-1.5">
                                  <span className={`material-symbols-outlined text-[14px] ${chk.passed ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {chk.passed ? 'check_circle' : 'cancel'}
                                  </span>
                                  <span className="font-semibold text-slate-700">
                                    {language === 'mr' ? chk.nameMr : chk.name}
                                  </span>
                                </div>
                                <div className="text-right text-slate-600">
                                  <span className="text-[10px] text-slate-400 mr-1">Your:</span>
                                  <span className="font-bold text-[#003b5a]">{chk.userValue}</span>
                                  <span className="text-[10px] text-slate-400 mx-1">/ Req:</span>
                                  <span className="text-[10px] text-slate-500">{chk.requiredValue}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Recommended Services for Missing Documents (Integration) */}
                    {item.recommendedServices.length > 0 && isEligible && (
                      <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                          <span className="material-symbols-outlined text-[16px] text-amber-600">notification_important</span>
                          <span>{language === 'mr' ? 'आवश्यक दस्तऐवज गहाळ आहे' : 'Required Document Missing'}</span>
                        </div>
                        {item.recommendedServices.map((srv, si) => (
                          <div key={si} className="flex items-center justify-between gap-2 pt-1 border-t border-amber-200/50">
                            <div>
                              <p className="text-[11px] font-bold text-slate-800">
                                {language === 'mr' ? srv.serviceNameMr : srv.serviceName}
                              </p>
                              <span className="text-[10px] text-slate-500">
                                {language === 'mr' ? srv.departmentMr : srv.department}
                              </span>
                            </div>
                            <Link
                              href="/documents"
                              className="text-[10px] font-bold text-[#003b5a] bg-white border border-[#003b5a]/30 px-2 py-1 rounded hover:bg-[#003b5a] hover:text-white transition"
                            >
                              {language === 'mr' ? 'अर्ज करा' : 'Apply Service'}
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Action Row */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500">
                        {item.availableDocuments.length > 0
                          ? `${item.availableDocuments.length} ${language === 'mr' ? 'कागदपत्रे डिजिलॉकरमध्ये उपलब्ध' : 'documents ready via DigiLocker'}`
                          : (language === 'mr' ? 'डिजिटल कागदपत्र पडताळणी' : 'Paperless DigiLocker Verification')}
                      </span>
                      {isEligible ? (
                        <Link
                          href={item.actionUrl}
                          className="bg-[#f47920] hover:bg-[#d86815] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                        >
                          <span>{language === 'mr' ? 'अर्ज सुरू करा' : 'Apply with DigiLocker'}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </Link>
                      ) : (
                        <Link
                          href="/scheme-finder"
                          className="text-[#003b5a] border border-slate-300 hover:bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1"
                        >
                          <span>{language === 'mr' ? 'तपशील तपासा' : 'View Scheme Details'}</span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
