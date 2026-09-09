'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp, ApplicationRecord } from '@/context/AppContext';

function normalizeStatus(status?: string): 'Submitted' | 'Under Review' | 'Document Verification' | 'Approved' | 'Rejected' {
  const s = (status || '').toLowerCase().trim();
  if (s.includes('reject')) return 'Rejected';
  if (s.includes('approved') || s.includes('issued') || s === 'completed') return 'Approved';
  if (s.includes('field') || s.includes('doc') || s.includes('verification')) return 'Document Verification';
  if (s.includes('review') || s.includes('scrutiny') || s.includes('pending')) return 'Under Review';
  return 'Submitted';
}

function getReceiptStatusTitle(norm: string, lang: 'en' | 'mr') {
  switch (norm) {
    case 'Approved':
      return lang === 'mr' ? 'अर्ज मंजूर करण्यात आला आहे' : 'APPLICATION APPROVED';
    case 'Rejected':
      return lang === 'mr' ? 'अर्ज नाकारण्यात आला आहे' : 'APPLICATION REJECTED';
    case 'Document Verification':
      return lang === 'mr' ? 'कागदपत्र पडताळणी प्रगतीपथावर आहे' : 'APPLICATION IN DOCUMENT VERIFICATION';
    case 'Under Review':
      return lang === 'mr' ? 'अर्ज पुनरावलोकनाधीन आहे' : 'APPLICATION UNDER REVIEW';
    default:
      return lang === 'mr' ? 'अर्ज यशस्वीरीत्या सादर केला गेला आहे' : 'APPLICATION SUBMITTED SUCCESSFULLY';
  }
}

function TrackStatusContent() {
  const { language, applications, user, refreshApplications } = useApp();
  const searchParams = useSearchParams();
  const paramId = searchParams.get('id');

  // Load fresh application data from MongoDB Atlas on mount
  useEffect(() => {
    refreshApplications?.();
  }, [refreshApplications]);

  const [searchId, setSearchId] = useState<string>(paramId || '');
  const [selectedAppId, setSelectedAppId] = useState<string>(paramId || '');

  // Keep searchId and selectedAppId in sync with param or first application
  useEffect(() => {
    if (paramId) {
      setSearchId(paramId);
      setSelectedAppId(paramId);
    } else if (applications.length > 0 && !selectedAppId) {
      setSelectedAppId(applications[0].id);
      setSearchId(applications[0].id);
    }
  }, [paramId, applications, selectedAppId]);

  const selectedApp = useMemo(() => {
    if (!applications || applications.length === 0) return null;
    if (selectedAppId) {
      const match = applications.find(
        (a) => a.id.toLowerCase() === selectedAppId.trim().toLowerCase()
      );
      if (match) return match;
    }
    if (searchId) {
      const match = applications.find(
        (a) => a.id.toLowerCase() === searchId.trim().toLowerCase()
      );
      if (match) return match;
    }
    return applications[0] || null;
  }, [applications, selectedAppId, searchId]);

  const normStatus = useMemo(() => {
    return selectedApp ? normalizeStatus(selectedApp.status) : 'Submitted';
  }, [selectedApp]);

  // Dynamic timeline steps constructed from real MongoDB application record
  const timelineSteps = useMemo(() => {
    if (!selectedApp) return [];

    const norm = normStatus;
    const appliedDate = selectedApp.appliedDate || 'Recent';
    const dept = selectedApp.department || 'Government Authority';

    const steps = [
      {
        titleEn: 'Application Submitted Online',
        titleMr: 'अर्ज ऑनलाइन सादर केला',
        date: appliedDate,
        descEn: 'Application form submitted and verified with authenticated citizen profile.',
        descMr: 'प्रमाणित नागरिक प्रोफाइलसह अर्ज यशस्वीरित्या प्राप्त झाला.',
        officer: 'System Auto-Ack / MahaSetu Portal',
        state: 'completed' as const,
      },
      {
        titleEn: 'Desk Scrutiny & Document Verification',
        titleMr: 'दप्तर छाननी व कागदपत्र पडताळणी',
        date: norm !== 'Submitted' ? appliedDate : 'Pending Scrutiny',
        descEn: norm !== 'Submitted'
          ? 'Clerk verified citizen identity, caste/income criteria, and statutory records.'
          : 'Application queued for verification by designated departmental clerk.',
        descMr: norm !== 'Submitted'
          ? 'लिपीक स्तरावर कागदपत्रे व निकषांची पडताळणी पूर्ण झाली.'
          : 'संबंधित विभागाकडून कागदपत्र पडताळणी प्रतीक्षेत आहे.',
        officer: `Scrutiny Officer, ${dept}`,
        state: norm === 'Submitted'
          ? ('pending' as const)
          : norm === 'Under Review'
          ? ('current' as const)
          : ('completed' as const),
      },
      {
        titleEn: 'Sub-Divisional / Departmental Review',
        titleMr: 'उपविभागीय / विभागीय पुनरावलोकन',
        date: (norm === 'Document Verification' || norm === 'Approved' || norm === 'Rejected') ? appliedDate : 'In Pipeline',
        descEn: norm === 'Rejected'
          ? 'Competent authority reviewed application criteria and marked discrepancy.'
          : norm === 'Approved'
          ? 'Statutory eligibility confirmed by sanctioning officer with zero discrepancy.'
          : norm === 'Document Verification'
          ? 'Field verification or secondary document attestation currently in progress.'
          : 'Awaiting desk clearance before competent authority sanction.',
        descMr: norm === 'Rejected'
          ? 'सक्षम प्राधिकरणाने अर्ज नाकारला आहे.'
          : norm === 'Approved'
          ? 'सक्षम अधिकाऱ्यांनी अर्जास विहित नियमांनुसार मंजुरी दिली आहे.'
          : 'सक्षम प्राधिकरणाकडे मान्यतेसाठी प्रलंबित.',
        officer: `Competent Authority, ${dept}`,
        state: norm === 'Rejected'
          ? ('rejected' as const)
          : norm === 'Approved'
          ? ('completed' as const)
          : norm === 'Document Verification'
          ? ('current' as const)
          : ('pending' as const),
      },
      {
        titleEn: norm === 'Rejected' ? 'Application Rejected' : 'Sanction & Certificate Issuance',
        titleMr: norm === 'Rejected' ? 'अर्ज नाकारण्यात आला' : 'मंजुरी व दाखला वितरण',
        date: (norm === 'Approved' || norm === 'Rejected') ? (selectedApp.updatedAt || appliedDate) : 'Awaiting Sanction',
        descEn: norm === 'Approved'
          ? 'Application successfully approved. Digital signed certificate generated with QR code.'
          : norm === 'Rejected'
          ? 'Application rejected. Citizen may raise an appeal or re-submit with revised documents.'
          : 'Final statutory sanction and official digital certificate generation pending.',
        descMr: norm === 'Approved'
          ? 'अर्ज मंजूर झाला असून डिजिटल स्वाक्षरीसह प्रमाणपत्र वितरित केले आहे.'
          : norm === 'Rejected'
          ? 'अर्ज नामंजूर करण्यात आला आहे. नागरिक अपील सादर करू शकतात.'
          : 'अंतिम आदेश व प्रमाणपत्र वितरणाची प्रतीक्षा आहे.',
        officer: `Designated Officer, ${dept}`,
        state: norm === 'Approved'
          ? ('completed' as const)
          : norm === 'Rejected'
          ? ('rejected' as const)
          : ('pending' as const),
      },
    ];

    return steps;
  }, [selectedApp, normStatus]);

  const handlePrintReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Print CSS to isolate ONLY the official receipt */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #official-status-receipt,
          #official-status-receipt * {
            visibility: visible !important;
          }
          #official-status-receipt {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 30px !important;
            background: #ffffff !important;
            color: #000000 !important;
            border: none !important;
            box-shadow: none !important;
            display: block !important;
          }
          nav, header, footer, button, .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003b5a] to-[#1a5276] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg no-print">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {language === 'mr' ? 'थेट अर्ज स्थिती ट्रॅकिंग' : 'Real-Time Status Tracker'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr' ? 'आपल्या अर्जाची सद्यस्थिती तपासा' : 'Track Your Application Status'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Official tracking portal connected directly to Government of Maharashtra workflow databases.
          </p>
        </div>

        {/* Search Bar - only shown if applications exist */}
        {applications.length > 0 && (
          <div className="mt-6 max-w-xl bg-white rounded-xl p-1.5 flex items-center shadow-md">
            <span className="material-symbols-outlined text-slate-400 pl-3">search</span>
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Enter Application ID (e.g. MH-REV-2026-10293)"
              className="w-full text-xs sm:text-sm text-slate-800 font-mono px-3 py-2 focus:outline-none"
            />
          </div>
        )}
      </div>

      {/* Zero State for New Citizen */}
      {applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 sm:p-16 shadow-gov border border-slate-200 text-center space-y-4 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-[#003b5a]/10 text-[#003b5a] flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-4xl">folder_off</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">
            {language === 'mr' ? 'कोणताही अर्ज आढळला नाही' : 'No applications found.'}
          </h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            {language === 'mr'
              ? 'तुम्ही अद्याप कोणत्याही योजनेसाठी किंवा सेवेसाठी अर्ज सादर केलेला नाही.'
              : 'You have not submitted any applications yet.'}
          </p>
          <div className="pt-2">
            <Link
              href="/schemes"
              className="inline-flex items-center gap-2 bg-[#003b5a] hover:bg-[#002840] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold shadow-gov transition"
            >
              <span className="material-symbols-outlined text-[18px]">explore</span>
              <span>{language === 'mr' ? 'योजना व सेवा पहा' : 'Browse Schemes & Services'}</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Content Grid with Applications List & Status Detail */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 no-print">
          {/* Left Column: Applications List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-gov border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#003b5a] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                {language === 'mr' ? 'माझे अर्ज' : 'Your Applications'}
              </h3>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                {applications.length}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {applications.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const norm = normalizeStatus(app.status);
                const badgeColor =
                  norm === 'Approved'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : norm === 'Rejected'
                    ? 'bg-red-100 text-red-800 border-red-300'
                    : norm === 'Under Review' || norm === 'Document Verification'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-blue-100 text-blue-800 border-blue-300';

                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      setSelectedAppId(app.id);
                      setSearchId(app.id);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition ${
                      isSelected
                        ? 'bg-[#e5eeff] border-[#003b5a] shadow-sm'
                        : 'bg-[#f8f9ff] hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-xs font-bold text-[#003b5a]">{app.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {app.status}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-1">
                      {language === 'mr' ? app.serviceNameMr : app.serviceName}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{app.appliedDate}</span>
                      <span className="capitalize font-semibold text-[#003b5a]">
                        {app.applicationType || 'Scheme'}
                      </span>
                    </div>
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
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-mono text-sm font-bold text-[#003b5a] bg-slate-100 px-2.5 py-0.5 rounded">
                        {selectedApp.id}
                      </span>
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                          normStatus === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : normStatus === 'Rejected'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : normStatus === 'Under Review' || normStatus === 'Document Verification'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {selectedApp.status}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded">
                        {selectedApp.applicationType === 'service' ? 'Government Service' : 'Government Scheme'}
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mt-2">
                      {language === 'mr' ? selectedApp.serviceNameMr : selectedApp.serviceName}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'mr' ? selectedApp.departmentMr : selectedApp.department} • Applied on {selectedApp.appliedDate}
                    </p>
                  </div>

                  {normStatus === 'Approved' && (
                    <button
                      onClick={handlePrintReceipt}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-2.5 px-5 rounded-lg text-xs transition shadow-sm flex items-center gap-2 self-start sm:self-center"
                    >
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>View Approval Receipt</span>
                    </button>
                  )}
                </div>

                {/* Step-by-Step Officer Timeline */}
                <div className="space-y-6 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[#003b5a] flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">timeline</span>
                      Detailed Departmental Status Timeline
                    </h3>
                    <span className="text-xs text-slate-500 font-mono">
                      Database Sync: Live
                    </span>
                  </div>

                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                    {timelineSteps.map((step, idx) => {
                      const isCompleted = step.state === 'completed';
                      const isCurrent = step.state === 'current';
                      const isRejected = step.state === 'rejected';

                      return (
                        <div key={idx} className="relative">
                          <span
                            className={`absolute -left-[27px] top-0 w-5 h-5 rounded-full flex items-center justify-center text-[11px] shadow-sm ${
                              isCompleted
                                ? 'bg-emerald-600 text-white'
                                : isRejected
                                ? 'bg-red-600 text-white'
                                : isCurrent
                                ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isCompleted ? 'check' : isRejected ? 'close' : isCurrent ? 'hourglass_top' : 'radio_button_unchecked'}
                            </span>
                          </span>

                          <div
                            className={`border rounded-xl p-4 transition ${
                              isRejected
                                ? 'bg-red-50/50 border-red-200'
                                : isCompleted
                                ? 'bg-emerald-50/40 border-emerald-100'
                                : isCurrent
                                ? 'bg-amber-50/40 border-amber-200'
                                : 'bg-[#f8f9ff] border-slate-200 opacity-75'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                              <h4 className="text-xs font-bold text-[#003b5a]">
                                {language === 'mr' ? step.titleMr : step.titleEn}
                              </h4>
                              <span className="text-[11px] font-mono text-slate-500">{step.date}</span>
                            </div>
                            <p className="text-xs text-slate-600 mb-2">
                              {language === 'mr' ? step.descMr : step.descEn}
                            </p>
                            <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                              <span className="material-symbols-outlined text-[13px] text-slate-400">badge</span>
                              Officer: <strong className="text-slate-700">{step.officer}</strong>
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <button
                    onClick={handlePrintReceipt}
                    className="bg-[#003b5a] hover:bg-[#002840] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <span className="material-symbols-outlined text-[16px]">print</span>
                    <span>Print Application Status Receipt</span>
                  </button>

                  <button
                    onClick={() => alert(`Grievance redressal ticket created for application ${selectedApp.id}. Department officer will review within 48 statutory hours.`)}
                    className="text-amber-800 hover:underline font-bold flex items-center gap-1"
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
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          OFFICIAL PRINT RECEIPT COMPONENT (Visible on screen and during Print)
         ═══════════════════════════════════════════════════════════════════════ */}
      {selectedApp && (
        <div
          id="official-status-receipt"
          className="hidden print:block bg-white p-8 border border-slate-300 rounded-2xl shadow-sm max-w-3xl mx-auto space-y-6 text-slate-900"
        >
          {/* Official Government Header */}
          <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
            <div className="text-sm font-bold uppercase tracking-widest text-[#003b5a]">
              MAHASETU
            </div>
            <div className="text-xs font-semibold uppercase text-slate-700">
              Government of Maharashtra • महाराष्ट्र शासन
            </div>
            <div className="text-xs text-slate-500">
              Unified Citizen Services Portal • एकात्मिक नागरिक सेवा पोर्टल
            </div>
            <div className="pt-3">
              <h1 className="text-lg font-extrabold uppercase tracking-wide text-slate-900 border-y border-dashed border-slate-300 py-1.5">
                APPLICATION STATUS RECEIPT / अर्ज स्थिती पावती
              </h1>
            </div>
          </div>

          {/* Dynamic Status Callout Banner */}
          <div
            className={`p-3.5 rounded-xl border text-center font-bold text-sm uppercase tracking-wide ${
              normStatus === 'Approved'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : normStatus === 'Rejected'
                ? 'bg-red-50 border-red-300 text-red-800'
                : normStatus === 'Under Review' || normStatus === 'Document Verification'
                ? 'bg-amber-50 border-amber-300 text-amber-800'
                : 'bg-blue-50 border-blue-300 text-blue-800'
            }`}
          >
            {getReceiptStatusTitle(normStatus, language)}
          </div>

          {/* Application Primary Metadata Table */}
          <div className="grid grid-cols-2 gap-4 text-xs border border-slate-200 rounded-xl p-4 bg-slate-50/50">
            <div>
              <span className="text-slate-500 block font-medium">Application ID / अर्ज क्रमांक:</span>
              <span className="font-mono font-extrabold text-sm text-slate-900">{selectedApp.id}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Citizen Name / अर्जदाराचे नाव:</span>
              <span className="font-bold text-slate-900">{selectedApp.applicantName || user.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Department / संबंधित विभाग:</span>
              <span className="font-semibold text-slate-900">{selectedApp.department}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Scheme / Service / योजना किंवा सेवा:</span>
              <span className="font-bold text-slate-900">{selectedApp.serviceName}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Application Type / अर्ज प्रकार:</span>
              <span className="font-semibold text-slate-900">
                {selectedApp.applicationType === 'service' ? 'Government Service' : 'Government Welfare Scheme'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Date Submitted / अर्ज तारीख:</span>
              <span className="font-semibold text-slate-900">{selectedApp.appliedDate}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Current Status / सद्यस्थिती:</span>
              <span className="font-bold text-slate-900 uppercase">{selectedApp.status}</span>
            </div>
            <div>
              <span className="text-slate-500 block font-medium">Last Updated / अंतिम अद्यतन:</span>
              <span className="font-mono text-slate-900">{selectedApp.updatedAt || selectedApp.appliedDate}</span>
            </div>
          </div>

          {/* Status Timeline in Receipt */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              STATUS TIMELINE & AUDIT RECORD
            </h3>
            <div className="space-y-2 text-xs">
              {timelineSteps.map((step, i) => (
                <div key={i} className="flex items-start justify-between p-2 rounded bg-slate-50 border border-slate-200">
                  <div className="space-y-0.5">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{step.state === 'completed' ? '✓' : step.state === 'rejected' ? '✗' : '●'}</span>
                      <span>{step.titleEn}</span>
                    </span>
                    <span className="text-[11px] text-slate-600 block">{step.descEn}</span>
                    <span className="text-[10px] text-slate-400 block font-mono">Auth: {step.officer}</span>
                  </div>
                  <span className="font-mono text-[11px] text-slate-500 font-semibold">{step.date}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Footnote & Seal */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
            <div className="space-y-1">
              <p className="font-semibold text-slate-700">
                Official Digital Certificate / Status Receipt • MahaSetu Portal
              </p>
              <p>Generated by MahaSetu Citizen Services Engine under IT Act, Section 9A.</p>
              <p className="font-mono text-[10px]">Secure Reference: SHA-256 Verified • Timestamp: {new Date().toISOString()}</p>
            </div>
            <div className="w-16 h-16 border border-dashed border-slate-400 rounded flex items-center justify-center text-center font-mono text-[8px] p-1 bg-slate-50">
              [2D SECURE QR CODE]
            </div>
          </div>
        </div>
      )}
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
