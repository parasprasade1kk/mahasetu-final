'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function ConsentAuthorizePage() {
  const router = useRouter();
  const { language, user, toggleConsent } = useApp();

  const [consentChecked, setConsentChecked] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleGrantConsent = () => {
    setIsProcessing(true);
    setTimeout(() => {
      toggleConsent('CNS-2026-003');
      setIsProcessing(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="bg-white rounded-2xl shadow-gov-lg border border-slate-200 overflow-hidden">
        {/* Top Sovereign Band */}
        <div className="bg-[#003b5a] text-white p-6 sm:p-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center p-2 border border-amber-400/30">
              <span className="material-symbols-outlined text-[28px]">verified_user</span>
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                Statutory Citizen Consent Request
              </span>
              <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
                {language === 'mr' ? 'डेटा देवाणघेवाण संमती मंजुरी' : 'Inter-Departmental Data Authorization'}
              </h1>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-amber-500 text-slate-950 text-xs font-bold rounded-full">
            Action Required
          </span>
        </div>

        {success ? (
          <div className="p-8 sm:p-12 text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <span className="material-symbols-outlined text-4xl font-bold">check_circle</span>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                {language === 'mr' ? 'संमती यशस्वीरीत्या नोंदवण्यात आली आहे!' : 'Consent Granted Successfully!'}
              </h2>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                The requesting department has been granted temporary, purpose-bound read access to your verified state records.
              </p>
            </div>

            <div className="bg-[#f8f9ff] border border-slate-200 rounded-xl p-4 max-w-sm mx-auto text-xs space-y-1 text-slate-700">
              <p><strong>Consent Token:</strong> CNS-2026-AUTH-8821</p>
              <p><strong>Status:</strong> Active & Enforced</p>
              <p><strong>Valid Until:</strong> 31 March 2027</p>
            </div>

            <div className="flex justify-center gap-3 pt-3">
              <Link
                href="/consent"
                className="bg-[#003b5a] hover:bg-[#002840] text-white px-6 py-2.5 rounded-lg text-xs font-bold transition shadow-sm"
              >
                Back to Consent Center
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
          <div className="p-6 sm:p-8 space-y-6">
            {/* Request Summary */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-amber-700 text-[22px] flex-shrink-0 mt-0.5">info</span>
              <div className="text-xs text-amber-900 space-y-1">
                <p className="font-bold">
                  Higher & Technical Education Department is requesting access to your Income Certificate.
                </p>
                <p className="text-amber-800">
                  This electronic attestation replaces the requirement to submit physical notarized copies for scholarship grant verification.
                </p>
              </div>
            </div>

            {/* Granular Parameters */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Request Parameters</h3>
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Requesting Authority:</span>
                  <span className="font-bold text-[#003b5a]">Directorate of Higher Education, Maharashtra</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Source Repository:</span>
                  <span className="font-bold text-slate-800">Revenue Dept (e-Mahabhumi / Haveli Tehsil)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Specific Records:</span>
                  <span className="font-bold text-emerald-800">Income Certificate 2025-26 (Ref: MH-REV-2025-88319)</span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Declared Purpose:</span>
                  <span className="font-bold text-slate-800 text-right max-w-xs">
                    MahaDBT Scholarship income qualification & direct fee reimbursement
                  </span>
                </div>
                <div className="p-3.5 flex justify-between">
                  <span className="text-slate-500">Access Expiry:</span>
                  <span className="font-bold text-slate-800">31 March 2027 (End of Academic Year)</span>
                </div>
              </div>
            </div>

            {/* DPDP Legal Checkbox */}
            <div className="bg-[#f8f9ff] border border-slate-200 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentChecked}
                  onChange={(e) => setConsentChecked(e.target.checked)}
                  className="mt-0.5 text-[#003b5a] rounded"
                />
                <span className="text-xs text-slate-700 leading-relaxed">
                  I, <strong>{user.name}</strong>, hereby grant free, specific, informed, and unambiguous consent under Section 6 of the Digital Personal Data Protection Act 2023 for the specified processing. I understand I have the right to revoke this consent at any time via the MahaSetu Consent Center.
                </span>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => router.push('/consent')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
              >
                Decline Request
              </button>

              <button
                type="button"
                onClick={handleGrantConsent}
                disabled={!consentChecked || isProcessing}
                className="w-full sm:w-auto bg-[#003b5a] hover:bg-[#002840] disabled:opacity-50 text-white px-8 py-2.5 rounded-lg text-xs font-bold transition shadow-gov flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <span>Recording Digital Consent...</span>
                ) : (
                  <>
                    <span>Grant Sovereign Consent & Authorize</span>
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
