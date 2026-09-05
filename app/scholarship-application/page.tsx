'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function ScholarshipApplicationPage() {
  const router = useRouter();
  const { language, user, addApplication } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    collegeName: 'Government College of Engineering, Pune (COEP)',
    courseName: 'B.Tech Computer Engineering (Year 2)',
    annualFees: '85,000',
    category: 'OBC',
    subCaste: 'Kunbi / Maratha-Kunbi',
    incomeCertNo: 'MH-REV-2025-88319',
    casteCertNo: 'MH-CST-2024-51092',
    bankAccount: 'State Bank of India (A/C: ****3910)',
    ifsc: 'SBIN0001110',
    declarationAccepted: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const steps = [
    { num: 1, titleEn: 'Applicant Profile', titleMr: 'अर्जदार माहिती' },
    { num: 2, titleEn: 'Course & College', titleMr: 'महाविद्यालय व अभ्यासक्रम' },
    { num: 3, titleEn: 'DigiLocker Documents', titleMr: 'कागदपत्र पडताळणी' },
    { num: 4, titleEn: 'Bank & Review', titleMr: 'बँक व अंतिम अर्ज' }
  ];

  const handleSubmit = () => {
    setIsSubmitting(true);
    const newId = `MH-EDU-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    setTimeout(() => {
      addApplication({
        id: newId,
        serviceName: 'Post-Matric Scholarship for OBC Students',
        serviceNameMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
        department: 'Higher & Technical Education',
        departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
        appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Submitted',
        statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
        applicantName: user.name,
        district: 'Pune'
      });
      setIsSubmitting(false);
      setSubmittedAppId(newId);
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-gov border border-slate-200 flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-3 py-1 rounded-full border border-[#9bccf6]">
            {language === 'mr' ? 'उच्च व तंत्रशिक्षण विभाग' : 'Higher & Technical Education'}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-[#003b5a] mt-2">
            {language === 'mr'
              ? 'मॅट्रिकोत्तर शिष्यवृत्ती ऑनलाइन अर्ज (MahaDBT)'
              : 'Post-Matric Scholarship Application'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Government of Maharashtra • Automated Citizen Consent Verification
          </p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-bold">
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>DigiLocker Synced</span>
        </div>
      </div>

      {/* Progress Stepper */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-gov border border-slate-200">
        <div className="grid grid-cols-4 gap-2 text-center">
          {steps.map((s) => {
            const isCompleted = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition mb-1.5 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-[#003b5a] text-white ring-4 ring-[#003b5a]/20'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isCompleted ? <span className="material-symbols-outlined text-[16px]">check</span> : s.num}
                </div>
                <span className={`text-[11px] font-semibold hidden sm:inline ${isCurrent ? 'text-[#003b5a]' : 'text-slate-500'}`}>
                  {language === 'mr' ? s.titleMr : s.titleEn}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success Modal / Banner when submitted */}
      {submittedAppId ? (
        <div className="bg-white rounded-2xl p-8 shadow-gov-lg border border-emerald-200 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl font-bold">task_alt</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {language === 'mr' ? 'अर्ज यशस्वीरीत्या सादर केला गेला आहे!' : 'Application Successfully Submitted!'}
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Your scholarship claim has been registered with the Directorate of Higher Education.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Acknowledgement Number</p>
            <p className="text-lg font-mono font-extrabold text-[#003b5a] mt-0.5">{submittedAppId}</p>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            An SMS confirmation has been sent to {user.mobile}. No hard copies need to be submitted to your college.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <Link
              href={`/track?id=${submittedAppId}`}
              className="bg-[#003b5a] hover:bg-[#002840] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
            >
              Track Application Status &rarr;
            </Link>
            <Link
              href="/dashboard"
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-lg text-xs font-bold transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      ) : (
        /* Multi-Step Wizard Body */
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-gov border border-slate-200">
          {/* Step 1: Personal Profile */}
          {currentStep === 1 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">person</span>
                <span>Applicant Personal & Identity Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name (As per Aadhaar)</label>
                  <input
                    type="text"
                    disabled
                    value={user.name}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Aadhaar Reference Number</label>
                  <input
                    type="text"
                    disabled
                    value={user.aadhaarMasked}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    disabled
                    value={user.mobile}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Domicile State</label>
                  <input
                    type="text"
                    disabled
                    value="Maharashtra State (15+ Years Resident)"
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Course & College */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">school</span>
                <span>Current Educational Enrollment Details</span>
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Institute / College Name</label>
                  <input
                    type="text"
                    value={formData.collegeName}
                    onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                    className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Course & Branch</label>
                    <input
                      type="text"
                      value={formData.courseName}
                      onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Approved Tuition Fees (₹)</label>
                    <input
                      type="text"
                      value={formData.annualFees}
                      onChange={(e) => setFormData({ ...formData, annualFees: e.target.value })}
                      className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: DigiLocker Documents Auto-Verification */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">verified</span>
                <span>Automated Document Attestation via DigiLocker</span>
              </h3>

              <p className="text-xs text-slate-600">
                Because your account is linked with DigiLocker and the Revenue Department database, your eligibility documents are pre-verified with zero physical upload required.
              </p>

              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">description</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Income Certificate (Year 2025-26)</p>
                      <p className="text-[11px] text-emerald-700 font-mono">Issued by Tehsildar Pune • Ref: {formData.incomeCertNo}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">badge</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Caste Certificate (OBC - Kunbi)</p>
                      <p className="text-[11px] text-emerald-700 font-mono">Sub-Divisional Officer Haveli • Ref: {formData.casteCertNo}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Verified</span>
                </div>

                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-emerald-600 text-[24px]">home_pin</span>
                    <div>
                      <p className="text-xs font-bold text-emerald-950">Domicile & Nationality Certificate</p>
                      <p className="text-[11px] text-emerald-700 font-mono">Competent Authority Pune • Ref: MH-DOM-2023-99120</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Bank Account & Final Review */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <h3 className="text-base font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-500 text-[20px]">payments</span>
                <span>Aadhaar Seeded DBT Bank Account & Final Submission</span>
              </h3>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-2">
                <p className="font-bold text-[#003b5a] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  Active NPCI Aadhaar-Seeded Bank Account
                </p>
                <p className="text-slate-700 font-mono">{formData.bankAccount} • IFSC: {formData.ifsc}</p>
                <p className="text-[11px] text-slate-500">
                  Direct Benefit Transfer (DBT) funds will be automatically credited to this active account upon scrutiny approval.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-0.5 text-[#003b5a]"
                  />
                  <span className="text-slate-700 leading-relaxed text-[11px]">
                    I hereby solemnly affirm that all details submitted are authentic. I authorize the Higher & Technical Education Department to verify my income and caste validity with the Revenue Department via MahaSetu.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Step Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2 rounded-lg text-xs font-bold transition"
              >
                &larr; Previous Step
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="bg-[#003b5a] hover:bg-[#002840] text-white px-6 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-sm"
              >
                <span>Continue</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !formData.declarationAccepted}
                className="bg-[#f47920] hover:bg-[#d86815] disabled:opacity-50 text-white px-8 py-2.5 rounded-lg text-xs font-bold transition shadow-gov flex items-center gap-2"
              >
                {isSubmitting ? (
                  <span>Submitting to Department...</span>
                ) : (
                  <>
                    <span>Submit Official Application</span>
                    <span className="material-symbols-outlined text-[18px]">send</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
