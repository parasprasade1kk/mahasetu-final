'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function ConsentCenterPage() {
  const { language, consents, toggleConsent } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003b5a] via-[#1a5276] to-[#00253d] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {language === 'mr' ? 'नागरिक डेटा गोपनीयता व संमती' : 'Digital Personal Data Protection (DPDP) 2023'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr' ? 'संमती केंद्र (Consent Center)' : 'Citizen Consent Center'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {language === 'mr'
              ? 'आपला डेटा कोणत्या शासकीय विभागांमध्ये शेअर केला जात आहे यावर आपले संपूर्ण नियंत्रण आहे. आपण कधीही संमती मागे घेऊ शकता.'
              : 'Empowering you with complete transparency and control over inter-departmental data sharing. Grant, inspect, or revoke sharing authorizations at any time.'}
          </p>
        </div>

        <Link
          href="/consent/authorize"
          className="bg-[#f47920] hover:bg-[#d86815] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 self-start md:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>{language === 'mr' ? 'प्रलंबित संमती मंजुरी' : 'Authorize Pending Requests'}</span>
        </Link>
      </div>

      {/* Trust & DPDP Statement Strip */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
          <span className="material-symbols-outlined text-[26px]">gavel</span>
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-slate-900">
            {language === 'mr' ? 'वैधानिक संमती हमी' : 'Statutory Data Minimization & Consent Guarantee'}
          </h4>
          <p className="text-slate-600 mt-0.5">
            Under Section 6 of the DPDP Act 2023, data is shared exclusively for the specified welfare purpose and cannot be retained beyond the validity period.
          </p>
        </div>
      </div>

      {/* Consents List */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#003b5a] flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">share_location</span>
          {language === 'mr' ? 'सक्रिय आंतर-विभागीय डेटा संमती' : 'Active Inter-Departmental Data Authorizations'}
        </h3>

        <div className="grid grid-cols-1 gap-4">
          {consents.map((item) => {
            const isActive = item.status === 'Active';
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-gov hover:shadow-gov-lg transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-[#003b5a] bg-slate-100 px-2.5 py-1 rounded">
                      {item.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                        item.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : item.status === 'Pending Approval'
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-slate-100 text-slate-600 border-slate-300'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <span className="text-xs text-slate-500">Valid Until: <strong>{item.validUntil}</strong></span>
                    {item.status !== 'Pending Approval' && (
                      <button
                        onClick={() => toggleConsent(item.id)}
                        className={`text-xs font-bold px-4 py-1.5 rounded-lg transition border ${
                          isActive
                            ? 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200'
                            : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {isActive ? 'Revoke Consent' : 'Re-activate Consent'}
                      </button>
                    )}
                    {item.status === 'Pending Approval' && (
                      <Link
                        href="/consent/authorize"
                        className="bg-[#f47920] hover:bg-[#d86815] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition"
                      >
                        Authorize
                      </Link>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Requesting Authority</span>
                    <p className="font-bold text-slate-900">
                      {language === 'mr' ? item.requestingDeptMr : item.requestingDept}
                    </p>
                  </div>
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Source Repository</span>
                    <p className="font-bold text-slate-900">
                      {language === 'mr' ? item.sourceDeptMr : item.sourceDept}
                    </p>
                  </div>
                </div>

                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-800">Declared Purpose of Data Processing:</p>
                  <p className="text-slate-600 bg-[#f8f9ff] p-3 rounded-lg border border-slate-100">
                    {language === 'mr' ? item.purposeMr : item.purpose}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2">
                  <span className="text-[11px] font-bold text-slate-500">Shared Data Fields:</span>
                  {item.dataFields.map((field, i) => (
                    <span
                      key={i}
                      className="bg-[#e5eeff] text-[#003b5a] text-[11px] font-semibold px-2.5 py-0.5 rounded border border-[#9bccf6]"
                    >
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
