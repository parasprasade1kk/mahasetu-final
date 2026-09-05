'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function EligibilityCheckerPage() {
  const { language } = useApp();

  const [category, setCategory] = useState('OBC');
  const [incomeRange, setIncomeRange] = useState('2.5L-8L');
  const [occupation, setOccupation] = useState('student');
  const [district, setDistrict] = useState('Pune');
  const [isCalculated, setIsCalculated] = useState(true);

  const matchedSchemes = [
    {
      titleEn: 'Post-Matric Scholarship for OBC Students',
      titleMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
      dept: 'Higher & Technical Education',
      grant: '₹45,000 / year (100% Tuition Fee)',
      matchScore: '100% Match',
      reasonsEn: ['Category OBC matches', 'Income under ₹8,00,000 ceiling', 'Student status verified'],
      reasonsMr: ['इमाव प्रवर्ग जुळतो', 'उत्पन्न ₹८,००,००० मर्यादेत', 'महाविद्यालयीन विद्यार्थी स्थिती'],
      actionUrl: '/scholarship-application'
    },
    {
      titleEn: 'Dr. Punjabrao Deshmukh Vastigruh Nirvah Bhatta Yojna',
      titleMr: 'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना',
      dept: 'Higher & Technical Education',
      grant: '₹30,000 / year (Hostel Allowance)',
      matchScore: '95% Match',
      reasonsEn: ['Income under ₹8,00,000', 'Enrolled in Professional Higher Degree Course'],
      reasonsMr: ['उत्पन्न ₹८,००,००० च्या आत', 'व्यावसायिक पदवी अभ्यासक्रमात प्रवेशित'],
      actionUrl: '/scholarship-application'
    },
    {
      titleEn: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Yojna',
      titleMr: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क योजना',
      dept: 'Higher & Technical Education',
      grant: '50% Exam & Tuition Waiver',
      matchScore: '90% Match',
      reasonsEn: ['Maharashtra Domicile verified', 'Income ceiling compliant'],
      reasonsMr: ['महाराष्ट्र अधिवास प्रमाणित', 'उत्पन्न निकष सुसंगत'],
      actionUrl: '/scholarship-application'
    }
  ];

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
            : 'Answer 4 basic demographic questions to instantly calculate all welfare benefits and scholarships you qualify for.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Questionnaire (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 shadow-gov border border-slate-200 space-y-5">
          <h3 className="text-base font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-amber-500">tune</span>
            {language === 'mr' ? 'आपली माहिती निवडा' : 'Citizen Demographics'}
          </h3>

          {/* Question 1: Social Category */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              1. {language === 'mr' ? 'सामाजिक प्रवर्ग (Caste Category)' : 'Social Category (Caste Group)'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['OBC', 'SC', 'ST', 'VJNT', 'EWS', 'OPEN'].map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition border ${
                    category === cat
                      ? 'bg-[#003b5a] text-white border-[#003b5a]'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Question 2: Annual Income */}
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
                    onChange={() => setIncomeRange(item.id)}
                    className="text-[#003b5a]"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Question 3: Occupation / Role */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              3. {language === 'mr' ? 'सध्याची स्थिती / व्यवसाय' : 'Current Role / Occupation'}
            </label>
            <select
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              className="w-full h-11 px-3 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a]"
            >
              <option value="student">Higher Education / College Student (पदवी/पदविका विद्यार्थी)</option>
              <option value="farmer">Farmer / Agricultural Landholder (शेतकरी / खातेदार)</option>
              <option value="woman">Woman / Homemaker (महिला / गृहिणी)</option>
              <option value="senior">Senior Citizen / Destitute (ज्येष्ठ नागरिक / निराधार)</option>
            </select>
          </div>

          {/* Question 4: District */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              4. {language === 'mr' ? 'जिल्हा (District)' : 'District of Residence'}
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
            onClick={() => setIsCalculated(true)}
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
                <span>Statutory Match Engine</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                {language === 'mr'
                  ? 'आपण ३ शासकीय योजनांसाठी पात्र आहात!'
                  : 'You may be eligible for 3 government schemes.'}
              </h2>
              <p className="text-xs text-emerald-100 mt-1">
                Estimated annual benefits: <strong className="text-amber-300 text-sm">₹75,000+</strong> directly to bank account.
              </p>
            </div>
            <span className="w-14 h-14 rounded-full bg-white/15 text-white flex items-center justify-center font-extrabold text-2xl flex-shrink-0">
              3
            </span>
          </div>

          {/* Matched Scheme Cards */}
          <div className="space-y-4">
            {matchedSchemes.map((scm, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-gov hover:shadow-gov-lg transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-2 py-0.5 rounded">
                      {scm.dept}
                    </span>
                    <h3 className="text-base font-bold text-[#003b5a] mt-1.5">
                      {language === 'mr' ? scm.titleMr : scm.titleEn}
                    </h3>
                  </div>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex-shrink-0">
                    {scm.matchScore}
                  </span>
                </div>

                <div className="bg-[#f8f9ff] border border-slate-100 rounded-lg p-3 flex items-center justify-between text-xs">
                  <span className="text-slate-600 font-medium">Estimated Direct Benefit:</span>
                  <span className="font-extrabold text-[#003b5a] text-sm">{scm.grant}</span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <span className="text-[11px] font-bold text-slate-500 block">Qualification Drivers:</span>
                  {(language === 'mr' ? scm.reasonsMr : scm.reasonsEn).map((r, i) => (
                    <p key={i} className="flex items-center gap-1.5 text-[11px]">
                      <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span>
                      <span>{r}</span>
                    </p>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">Zero physical documents required</span>
                  <Link
                    href={scm.actionUrl}
                    className="bg-[#f47920] hover:bg-[#d86815] text-white px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <span>{language === 'mr' ? 'अर्ज सुरू करा' : 'Apply with DigiLocker'}</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
