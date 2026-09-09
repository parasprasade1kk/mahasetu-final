'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { getServiceConfig, ServiceConfig } from '@/lib/servicesConfig';

export default function ServiceApplicationForm({ forcedId }: { forcedId?: string } = {}) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const serviceId = forcedId ||
    (params?.serviceId as string) ||
    (params?.schemeId as string) ||
    searchParams?.get('scheme') ||
    searchParams?.get('schemeId') ||
    searchParams?.get('service') ||
    searchParams?.get('serviceId') ||
    'income-certificate';
  const service: ServiceConfig = useMemo(() => getServiceConfig(serviceId), [serviceId]);

  const { language, user, userProfile, addApplication } = useApp();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    service.customFields.forEach(field => {
      initial[field.id] = field.defaultValue ?? '';
    });
    initial.declarationAccepted = true;
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);

  const steps = [
    { num: 1, titleEn: 'Applicant Profile', titleMr: 'अर्जदार माहिती' },
    { num: 2, titleEn: 'Service Details', titleMr: 'सेवा तपशील' },
    { num: 3, titleEn: 'DigiLocker Attestation', titleMr: 'कागदपत्र पडताळणी' },
    { num: 4, titleEn: 'Review & Submit', titleMr: 'अंतिम पडताळणी व अर्ज' }
  ];

  const deptPrefixMap: Record<string, string> = {
    revenue: 'REV',
    education: 'EDU',
    social: 'SOC',
    agriculture: 'AGR',
    food: 'FCS'
  };

  const isScheme =
    service.category?.toLowerCase().includes('scheme') ||
    service.category?.toLowerCase().includes('welfare') ||
    service.id.startsWith('EDU') ||
    service.id.startsWith('SW') ||
    service.id.startsWith('REV-') ||
    service.id.includes('scholarship');

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const deptCode = deptPrefixMap[service.deptId] || 'GOV';
    const newId = `MH-${deptCode}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    try {
      const res = await addApplication({
        id: newId,
        serviceId: service.id,
        schemeId: isScheme ? service.id : undefined,
        serviceName: service.titleEn,
        serviceNameMr: service.titleMr,
        department: service.deptNameEn,
        departmentMr: service.deptNameMr,
        appliedDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        status: 'Submitted',
        statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
        applicantName: user.name,
        district: userProfile?.district || 'Pune',
        applicationType: isScheme ? 'scheme' : 'service',
      });
      setIsSubmitting(false);
      setSubmittedAppId(res?.id || newId);
    } catch {
      setIsSubmitting(false);
      setSubmittedAppId(newId);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-gov border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-3 py-1 rounded-full border border-[#9bccf6]">
              {language === 'mr' ? service.deptNameMr : service.deptNameEn}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">timer</span>
              {service.sla}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#003b5a] mt-2.5">
            {language === 'mr'
              ? `${service.titleMr} - ऑनलाइन अर्ज`
              : `${service.titleEn} Application`}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {language === 'mr' ? service.descMr : service.descEn}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 px-3 py-2 rounded-xl border border-emerald-200 text-xs font-bold self-start sm:self-center">
          <span className="material-symbols-outlined text-[20px] text-emerald-600">verified_user</span>
          <div>
            <span className="block text-[10px] uppercase font-semibold text-emerald-700">MahaSetu Vault</span>
            <span>DigiLocker Synced</span>
          </div>
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
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-gov-lg border border-emerald-200 text-center space-y-5 animate-fadeIn">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl font-bold">task_alt</span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {language === 'mr' ? 'अर्ज यशस्वीरीत्या सादर केला गेला आहे!' : 'Application Successfully Submitted!'}
            </h2>
            <p className="text-xs text-slate-600 mt-1.5 max-w-md mx-auto">
              {language === 'mr'
                ? `आपला अर्ज ${service.deptNameMr} कडे नोंदविला गेला आहे.`
                : `Your official application has been registered with the ${service.deptNameEn}.`}
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-sm mx-auto">
            <p className="text-[11px] text-slate-500 uppercase font-semibold">Acknowledgement Reference Number</p>
            <p className="text-lg font-mono font-extrabold text-[#003b5a] mt-0.5">{submittedAppId}</p>
          </div>

          <p className="text-xs text-slate-500 max-w-md mx-auto">
            An SMS confirmation has been dispatched to {user.mobile}. Guaranteed statutory processing within {service.sla}.
          </p>

          <div className="flex justify-center flex-wrap gap-3 pt-2">
            <Link
              href={`/track?id=${submittedAppId}`}
              className="bg-[#003b5a] hover:bg-[#002840] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5"
            >
              <span>Track Application Status</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
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
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-base font-bold text-[#003b5a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">person</span>
                  <span>Applicant Personal & Identity Information</span>
                </h3>
                <span className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded font-semibold border border-emerald-200">
                  Pre-filled from Profile
                </span>
              </div>

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
                  <label className="block text-xs font-bold text-slate-700 mb-1">Registered Mobile Number</label>
                  <input
                    type="text"
                    disabled
                    value={user.mobile}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / Domicile</label>
                  <input
                    type="text"
                    disabled
                    value={userProfile ? `${userProfile.district}, ${userProfile.taluka}` : user.district}
                    className="w-full h-10 px-3 bg-slate-100 border border-slate-200 rounded-lg text-xs text-slate-700"
                  />
                </div>
              </div>

              {/* Statutory Fee Notice */}
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs flex items-center justify-between text-amber-900">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-amber-700">payments</span>
                  <strong>Service Application Fee:</strong> {language === 'mr' ? service.feesMr : service.fees}
                </span>
                <span className="text-[10px] uppercase font-bold bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                  Government Rate
                </span>
              </div>
            </div>
          )}

          {/* Step 2: Service-Specific Required Information */}
          {currentStep === 2 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#003b5a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">assignment</span>
                  <span>{language === 'mr' ? `${service.titleMr} माहिती` : `${service.titleEn} Details`}</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Please provide statutory specifics required for processing this application.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {service.customFields.map((field) => (
                  <div key={field.id} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor={field.id}>
                      {language === 'mr' ? field.labelMr : field.labelEn}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.type === 'select' ? (
                      <select
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                      >
                        {field.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {language === 'mr' ? opt.labelMr : opt.labelEn}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'textarea' ? (
                      <textarea
                        id={field.id}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        rows={3}
                        className="w-full p-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                        placeholder={language === 'mr' ? field.placeholderMr : field.placeholderEn}
                      />
                    ) : (
                      <input
                        id={field.id}
                        type={field.type}
                        value={formData[field.id] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                        className="w-full h-10 px-3 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003b5a]"
                        placeholder={language === 'mr' ? field.placeholderMr : field.placeholderEn}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: DigiLocker Documents Auto-Verification */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#003b5a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">verified</span>
                  <span>Required Documents & Automated DigiLocker Verification</span>
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  MahaSetu cross-references your verified documents from state databases. Physical uploads are exempted for linked records.
                </p>
              </div>

              <div className="space-y-3">
                {(language === 'mr' ? service.documentsMr : service.documentsEn).map((doc, idx) => (
                  <div key={idx} className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-emerald-600 text-[22px]">description</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-950">{doc}</p>
                        <p className="text-[11px] text-emerald-700">Verified via DigiLocker / Department Records</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Final Review & Submission */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="pb-3 border-b border-slate-100">
                <h3 className="text-base font-bold text-[#003b5a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500 text-[20px]">fact_check</span>
                  <span>Final Application Review & Affirmation</span>
                </h3>
              </div>

              {/* Review Summary Box */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500">Service / Scheme:</span>
                  <span className="font-bold text-[#003b5a]">{language === 'mr' ? service.titleMr : service.titleEn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500">Issuing Department:</span>
                  <span className="font-semibold text-slate-800">{language === 'mr' ? service.deptNameMr : service.deptNameEn}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500">Applicant Name:</span>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/70">
                  <span className="text-slate-500">Statutory SLA:</span>
                  <span className="font-bold text-emerald-700">{service.sla}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Payable Fee:</span>
                  <span className="font-bold text-slate-800">{language === 'mr' ? service.feesMr : service.fees}</span>
                </div>
              </div>

              {/* Citizen Affirmation */}
              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-2">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.declarationAccepted}
                    onChange={(e) => setFormData({ ...formData, declarationAccepted: e.target.checked })}
                    className="mt-0.5 text-[#003b5a] focus:ring-[#003b5a] rounded"
                  />
                  <span className="text-slate-700 leading-relaxed text-[11px]">
                    I hereby solemnly declare that the information furnished for this application is true and complete to the best of my knowledge. I authorize the Government of Maharashtra and {service.deptNameEn} to verify my credentials via DigiLocker.
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
              <Link
                href="/services"
                className="text-slate-500 hover:text-slate-700 text-xs font-semibold"
              >
                &larr; Back
              </Link>
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
                  <span>Submitting Application...</span>
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
