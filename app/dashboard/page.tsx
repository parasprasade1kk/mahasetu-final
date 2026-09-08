'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { evaluateAllSchemes, UserProfile } from '@/lib/eligibilityEngine';

export default function DashboardPage() {
  const { language, user, currentUser, userProfile, applications, consents } = useApp();

  const pendingConsent = consents.find((c) => c.status === 'Pending Approval');

  // Dynamically evaluate schemes if userProfile is available
  const evaluatedSchemes = useMemo(() => {
    if (!userProfile) return [];

    // Normalize occupation for rule engine
    let occ = (userProfile.occupation || '').toLowerCase();
    if (occ.includes('farmer') || occ.includes('agricultural')) occ = 'farmer';
    else if (occ.includes('student')) occ = 'student';
    else if (occ.includes('private') || occ.includes('salaried') || occ.includes('business') || occ.includes('employee')) occ = 'salaried';
    else if (occ.includes('unemployed')) occ = 'unemployed';
    else if (occ.includes('retired')) occ = 'senior';

    // Normalize education for rule engine
    let edu = 'Undergraduate';
    const rawEdu = (userProfile.educationLevel || '').toLowerCase();
    if (rawEdu.includes('post') || rawEdu.includes('doctorate')) edu = 'Postgraduate';
    else if (rawEdu.includes('diploma')) edu = 'Diploma';
    else if (rawEdu.includes('school') || rawEdu.includes('10th') || rawEdu.includes('12th')) edu = 'School';
    else if (rawEdu.includes('illiterate')) edu = 'None';
    else if (rawEdu.includes('grad')) edu = 'Undergraduate';

    const engineProfile: UserProfile = {
      category: userProfile.category === 'General/Open' ? 'OPEN' : userProfile.category,
      annualIncome: userProfile.annualIncomeAmount,
      age: userProfile.age,
      occupation: occ,
      educationLevel: edu,
      isStudent: Boolean(userProfile.isStudent),
      hasDisability: Boolean(userProfile.hasDisability),
      isMaharashtraResident: true,
      gender: userProfile.gender === 'Male' ? 'male' : userProfile.gender === 'Female' ? 'female' : 'any',
      district: userProfile.district,
    };
    return evaluateAllSchemes(engineProfile);
  }, [userProfile]);

  const eligibleCount = useMemo(() => {
    if (evaluatedSchemes.length > 0) {
      return evaluatedSchemes.filter(s => s.status === 'eligible' || s.status === 'possible').length.toString();
    }
    return '6';
  }, [evaluatedSchemes]);

  const stats = [
    {
      labelEn: 'Active Applications',
      labelMr: 'सक्रिय अर्ज',
      count: '2',
      icon: 'pending_actions',
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200'
    },
    {
      labelEn: 'Issued Certificates',
      labelMr: 'वितरित दाखले',
      count: '5',
      icon: 'verified',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200'
    },
    {
      labelEn: 'Pending Consent',
      labelMr: 'प्रलंबित संमती',
      count: pendingConsent ? '1' : '0',
      icon: 'lock_person',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200'
    },
    {
      labelEn: 'Eligible Schemes',
      labelMr: 'पात्र योजना',
      count: eligibleCount,
      icon: 'military_tech',
      color: 'text-[#f47920]',
      bg: 'bg-orange-50 border-orange-200'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Welcome Citizen Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-gov border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#003b5a] text-white flex items-center justify-center text-2xl font-bold border-2 border-amber-400 flex-shrink-0">
            {user.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#003b5a]">
                {language === 'mr' ? `स्वागत आहे, ${user.name}` : `Welcome, ${user.name}`}
              </h1>
              <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                {language === 'mr' ? 'आधार व मोबाईल प्रमाणीकृत' : 'Verified Citizen'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
              <span className="font-semibold text-slate-700">
                {userProfile ? `${userProfile.district}, ${userProfile.taluka}` : user.district}
              </span>
              <span>•</span>
              <span className="font-mono text-slate-600">Mobile: {currentUser ? currentUser.mobile : user.mobile}</span>
              <span>•</span>
              <span className="text-blue-600 font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">cloud_done</span> DigiLocker Active
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/scheme-finder"
            className="bg-[#f47920] hover:bg-[#d86815] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
            <span>{language === 'mr' ? 'एआय योजना शोधा' : 'Find Schemes'}</span>
          </Link>
          <Link
            href="/profile"
            className="bg-[#003b5a] hover:bg-[#002840] text-white px-4 py-2.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">edit</span>
            <span>{language === 'mr' ? 'प्रोफाइल अद्ययावत करा' : 'Update Profile'}</span>
          </Link>
        </div>
      </div>

      {/* Citizen Profile Status & Snapshot Details */}
      {userProfile ? (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/50 rounded-2xl p-5 border border-blue-200 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-[#003b5a] text-amber-400 flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[20px]">assignment_ind</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#003b5a]">
                    {language === 'mr' ? 'नागरिक प्रोफाइल तपशील सक्रिय' : 'Active Citizen Profile Details'}
                  </p>
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                    <span className="material-symbols-outlined text-[12px]">check_circle</span>
                    Profile Status: Complete
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Category: <strong className="text-slate-800">{userProfile.category}</strong> • Occupation: <strong className="text-slate-800">{userProfile.occupation}</strong> • Age: <strong className="text-slate-800">{userProfile.age} yrs</strong> • Income: <strong className="text-slate-800">{userProfile.annualIncomeTier}</strong>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="text-xs font-bold text-[#003b5a] hover:bg-[#003b5a] hover:text-white px-3 py-1.5 rounded-lg border border-[#003b5a] transition flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                <span>Update Profile</span>
              </Link>
              <Link
                href="/eligibility-checker"
                className="text-xs font-bold text-white bg-[#003b5a] hover:bg-[#002840] px-3 py-1.5 rounded-lg transition flex items-center gap-1"
              >
                <span>Check Eligibility</span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-600 text-[24px]">warning</span>
            <div>
              <p className="text-xs font-bold text-amber-900">Your profile is incomplete.</p>
              <p className="text-[11px] text-amber-800">
                Please complete your citizen profile to unlock personalized scheme recommendations and eligibility checks.
              </p>
            </div>
          </div>
          <Link
            href="/profile"
            className="px-4 py-2 bg-[#003b5a] text-white rounded-xl text-xs font-bold hover:bg-[#002840] transition"
          >
            Complete Profile
          </Link>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`rounded-xl p-5 border shadow-gov bg-white ${stat.bg} flex items-center justify-between`}>
            <div>
              <p className="text-xs font-semibold text-slate-600">
                {language === 'mr' ? stat.labelMr : stat.labelEn}
              </p>
              <p className={`text-3xl font-extrabold mt-1 ${stat.color}`}>{stat.count}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-100 ${stat.color}`}>
              <span className="material-symbols-outlined text-[26px]">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Pending Consent Action Box */}
      {pendingConsent && (
        <div className="bg-gradient-to-r from-blue-900 to-[#003b5a] text-white rounded-2xl p-6 shadow-gov-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-8 border-[#f47920]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider">
              <span className="material-symbols-outlined text-[18px]">notifications_active</span>
              <span>Action Required: Consent Authorization</span>
            </div>
            <h3 className="text-lg font-bold">
              {language === 'mr' ? pendingConsent.requestingDeptMr : pendingConsent.requestingDept}
            </h3>
            <p className="text-xs text-slate-200 max-w-2xl">
              {language === 'mr' ? pendingConsent.purposeMr : pendingConsent.purpose}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/consent/authorize"
              className="bg-[#f47920] hover:bg-[#d86815] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-1.5 flex-shrink-0"
            >
              <span>{language === 'mr' ? 'संमती द्या किंवा तपासा' : 'Review & Authorize'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Grid: Active Applications & DigiLocker Sync */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Applications Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 shadow-gov border border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#003b5a]">
                {language === 'mr' ? 'माझे सक्रिय अर्ज' : 'My Applications'}
              </h2>
              <p className="text-xs text-slate-500">Track current status of submitted requests</p>
            </div>
            <Link href="/track" className="text-xs font-bold text-[#003b5a] hover:underline flex items-center gap-1">
              <span>View All</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>

          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="border border-slate-200 rounded-xl p-4.5 hover:border-[#003b5a]/40 transition bg-[#f8f9ff]/60"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#003b5a] bg-slate-100 px-2 py-0.5 rounded">
                        {app.id}
                      </span>
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${app.statusColor}`}>
                        {app.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800 mt-2">
                      {language === 'mr' ? app.serviceNameMr : app.serviceName}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'mr' ? app.departmentMr : app.department} • Applied on {app.appliedDate}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/track?id=${app.id}`}
                      className="text-xs font-bold text-[#003b5a] hover:bg-[#003b5a] hover:text-white border border-[#003b5a] px-3.5 py-1.5 rounded-lg transition"
                    >
                      {language === 'mr' ? 'तपशील ट्रॅक करा' : 'Track Details'}
                    </Link>
                    {app.status === 'Approved / Issued' && (
                      <button
                        onClick={() => alert(`Downloading official certificate for ${app.id}...`)}
                        className="bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold px-3.5 py-1.5 rounded-lg transition flex items-center gap-1"
                        title="Download Certificate"
                      >
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        <span>Download</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Quick Links & DigiLocker Vault (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* DigiLocker Vault Card */}
          <div className="bg-white rounded-2xl p-6 shadow-gov border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-[22px]">cloud_sync</span>
                <h3 className="text-sm font-bold text-slate-800">DigiLocker Vault</h3>
              </div>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">Synced</span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Your official certificates issued by Maharashtra state authorities are pre-fetched and verified.
            </p>
            <div className="space-y-2.5 mb-5 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">Income Certificate (2025-26)</span>
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">
                  Caste Certificate ({userProfile ? userProfile.category : 'OBC'})
                </span>
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <span className="font-medium text-slate-700">
                  Domicile Certificate ({userProfile ? userProfile.district : 'Maharashtra'})
                </span>
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
              </div>
            </div>
            <Link
              href="/documents"
              className="w-full block text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-lg text-xs transition"
            >
              {language === 'mr' ? 'सर्व कागदपत्रे पहा' : 'Manage Digital Locker'}
            </Link>
          </div>

          {/* Citizen Assistance Help Box */}
          <div className="bg-[#e5eeff] rounded-2xl p-5 border border-[#9bccf6] text-xs space-y-3">
            <h4 className="font-bold text-[#003b5a] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">help</span>
              Need Help with an Application?
            </h4>
            <p className="text-slate-700 leading-relaxed">
              If your application is pending beyond statutory SLA (7 days), you may raise an instant grievance or contact your district revenue officer.
            </p>
            <a
              href="tel:18001208040"
              className="inline-flex items-center gap-1.5 font-bold text-[#003b5a] hover:underline"
            >
              <span className="material-symbols-outlined text-[16px]">call</span>
              Call Helpline: 1800-120-8040
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
