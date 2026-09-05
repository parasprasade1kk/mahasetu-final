'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp, ApplicationRecord } from '@/context/AppContext';

function TrackStatusContent() {
  const { language, applications } = useApp();
  const searchParams = useSearchParams();
  const initialId = searchParams.get('id') || applications[0]?.id || 'MH-REV-2025-88319';

  const [searchId, setSearchId] = useState(initialId);
  const [selectedApp, setSelectedApp] = useState<ApplicationRecord | null>(null);

  useEffect(() => {
    const found = applications.find(
      (a) => a.id.toLowerCase() === searchId.trim().toLowerCase()
    );
    setSelectedApp(found || applications[0] || null);
  }, [searchId, applications]);

  const timelineSteps = [
    {
      title: 'Application Submitted Online',
      date: '02 Sep 2026, 11:24 AM',
      desc: 'Form submitted via citizen portal with DigiLocker e-attestation.',
      status: 'completed',
      officer: 'System Auto-Ack'
    },
    {
      title: 'Desk Scrutiny & Identity Verification',
      date: '03 Sep 2026, 03:15 PM',
      desc: 'Clerk verified annual income report and land extract with Revenue database.',
      status: 'completed',
      officer: 'Senior Clerk (Desk 4), Haveli Tehsil'
    },
    {
      title: 'Sub-Divisional Officer Review',
      date: '04 Sep 2026, 09:40 AM',
      desc: 'Statutory compliance check completed. No objections raised.',
      status: 'completed',
      officer: 'SDO Haveli Sub-Division'
    },
    {
      title: 'Digital Signature & Issuance',
      date: '04 Sep 2026, 04:30 PM',
      desc: 'Digitally signed certificate issued with 2D secure QR code.',
      status: 'completed',
      officer: 'Tehsildar Haveli, Pune'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003b5a] to-[#1a5276] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {language === 'mr' ? 'थेट अर्ज स्थिती ट्रॅकिंग' : 'Real-Time Status Tracker'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr' ? 'आपल्या अर्जाची सद्यस्थिती तपासा' : 'Track Your Application Status'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Enter your acknowledgement number to view step-by-step progress, desk officer notes, and download certificates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-xl bg-white rounded-xl p-1.5 flex items-center shadow-md">
          <span className="material-symbols-outlined text-slate-400 pl-3">search</span>
          <input
            type="text"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            placeholder="Enter Application ID (e.g. MH-REV-2025-88319)"
            className="w-full text-xs sm:text-sm text-slate-800 font-mono px-3 py-2 focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Applications List (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-gov border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-[#003b5a] pb-3 border-b border-slate-100 flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">history</span>
            {language === 'mr' ? 'मागील सर्व अर्ज' : 'Your Applications History'}
          </h3>

          <div className="space-y-2.5">
            {applications.map((app) => {
              const isSelected = selectedApp?.id === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setSearchId(app.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition ${
                    isSelected
                      ? 'bg-[#e5eeff] border-[#003b5a] shadow-sm'
                      : 'bg-[#f8f9ff] hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#003b5a]">{app.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${app.statusColor}`}>
                      {app.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                    {language === 'mr' ? app.serviceNameMr : app.serviceName}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1">{app.appliedDate}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Detailed Tracker & Timeline (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-8 shadow-gov border border-slate-200 space-y-6">
          {selectedApp ? (
            <>
              {/* Application Details Summary */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-[#003b5a] bg-slate-100 px-2.5 py-0.5 rounded">
                      {selectedApp.id}
                    </span>
                    <span className={`text-xs font-bold px-3 py-0.5 rounded-full border ${selectedApp.statusColor}`}>
                      {selectedApp.status}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-slate-900 mt-2">
                    {language === 'mr' ? selectedApp.serviceNameMr : selectedApp.serviceName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {language === 'mr' ? selectedApp.departmentMr : selectedApp.department} • Applied on {selectedApp.appliedDate}
                  </p>
                </div>

                {selectedApp.status === 'Approved / Issued' && (
                  <button
                    onClick={() => alert(`Downloading digitally signed certificate for ${selectedApp.id}...`)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition shadow-sm flex items-center gap-2 self-start sm:self-center"
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    <span>Download Certificate</span>
                  </button>
                )}
              </div>

              {/* Step-by-Step Officer Timeline */}
              <div className="space-y-6 pt-2">
                <h3 className="text-sm font-bold text-[#003b5a] flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">timeline</span>
                  Detailed Departmental Audit Trail
                </h3>

                <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-600">
                  {timelineSteps.map((step, idx) => (
                    <div key={idx} className="relative">
                      <span className="absolute -left-[27px] top-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[11px] shadow-sm">
                        <span className="material-symbols-outlined text-[14px]">check</span>
                      </span>

                      <div className="bg-[#f8f9ff] border border-slate-200 rounded-xl p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-[#003b5a]">{step.title}</h4>
                          <span className="text-[11px] font-mono text-slate-500">{step.date}</span>
                        </div>
                        <p className="text-xs text-slate-600 mb-2">{step.desc}</p>
                        <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <span className="material-symbols-outlined text-[13px] text-slate-400">badge</span>
                          Officer: <strong className="text-slate-700">{step.officer}</strong>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                <button
                  onClick={() => window.print()}
                  className="text-slate-700 hover:text-[#003b5a] font-bold flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print Acknowledgement Slip
                </button>

                <button
                  onClick={() => alert('Grievance redressal ticket opened for officer review.')}
                  className="text-amber-700 hover:underline font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">report_problem</span>
                  Raise Discrepancy / Grievance
                </button>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-slate-500">
              No application found with ID: {searchId}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function TrackStatusPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Status Tracker...</div>}>
      <TrackStatusContent />
    </Suspense>
  );
}
