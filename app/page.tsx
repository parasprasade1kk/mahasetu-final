'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function HomePage() {
  const { language } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    {
      id: 'revenue',
      titleEn: 'Revenue & Forest Department',
      titleMr: 'महसूल व वन विभाग',
      icon: 'account_balance',
      descEn: 'Essential civic documents and land records processing streamlined for quick issuance.',
      descMr: 'महसूल दाखले, जमिनीच्या नोंदी (७/१२ उतारा) आणि नागरिकांची प्रमाणपत्रे जलद वितरणासाठी.',
      servicesEn: ['Income Certificate (1/3 Years)', 'Caste & Non-Creamy Layer', 'Age, Nationality & Domicile', '7/12 & 8A Land Extract'],
      servicesMr: ['उत्पन्नाचा दाखला (१/३ वर्षे)', 'जात व नॉन-क्रीमीलेअर प्रमाणपत्र', 'वय, राष्ट्रीयत्व व अधिवास दाखला', '७/१२ व ८-अ जमीन उतारा'],
      link: '/services?dept=revenue'
    },
    {
      id: 'education',
      titleEn: 'Higher & Technical Education',
      titleMr: 'उच्च व तंत्रशिक्षण विभाग',
      icon: 'school',
      descEn: 'MahaDBT scholarship grants, tuition fee waivers, and direct student disbursements.',
      descMr: 'महाडीबीटी शिष्यवृत्ती योजना, शिक्षण शुल्क प्रतिपूर्ती आणि थेट विद्यार्थी लाभ वितरण.',
      servicesEn: ['Post-Matric Scholarship (OBC/EBC)', 'Rajarshi Shahu Maharaj Fee Waiver', 'Hostel Maintenance Allowance', 'Dr. Punjabrao Deshmukh Hostel Scheme'],
      servicesMr: ['मॅट्रिकोत्तर शिष्यवृत्ती (इमाव/ईबीसी)', 'राजर्षी शाहू महाराज शिक्षण शुल्क योजना', 'वसतिगृह निर्वाह भत्ता', 'डॉ. पंजाबराव देशमुख वसतिगृह योजना'],
      link: '/services?dept=education'
    },
    {
      id: 'social-welfare',
      titleEn: 'Social Justice & Special Assistance',
      titleMr: 'सामाजिक न्याय व विशेष सहाय्य',
      icon: 'diversity_3',
      descEn: 'Caste validity certification, disability welfare schemes, and social security pensions.',
      descMr: 'जात वैधता प्रमाणपत्र, दिव्यांग कल्याण योजना आणि सामाजिक सुरक्षा पेन्शन योजना.',
      servicesEn: ['Caste Validity Verification', 'Sanjay Gandhi Niradhar Yojana', 'Shravanbal Seva State Pension', 'Divyangjan Assistive Aid Scheme'],
      servicesMr: ['जात पडताळणी वैधता प्रमाणपत्र', 'संजय गांधी निराधार योजना', 'श्रावणबाळ सेवा राज्य निवृत्तीवेतन', 'दिव्यांग सहाय्यक उपकरण योजना'],
      link: '/services?dept=social'
    }
  ];

  const quickStats = [
    { labelEn: 'Integrated Services', labelMr: 'एकात्मिक सेवा', val: '400+' },
    { labelEn: 'Verified Citizens', labelMr: 'नोंदणीकृत नागरिक', val: '1.2 Cr+' },
    { labelEn: 'DBT Disbursed', labelMr: 'थेट लाभ हस्तांतरण', val: '₹4,850 Cr+' },
    { labelEn: 'Avg Processing Time', labelMr: 'सरासरी वितरण वेळ', val: '48 Hours' }
  ];

  const howItWorksSteps = [
    {
      step: '01',
      icon: 'fingerprint',
      titleEn: 'Aadhaar & DigiLocker Link',
      titleMr: 'आधार व डिजिलॉकर जोडणी',
      descEn: 'Authenticate once using mobile OTP to sync existing state documents automatically.',
      descMr: 'आपली अधिकृत कागदपत्रे स्वयंचलित जोडण्यासाठी एकदाच मोबाईल ओटीपीने पडताळणी करा.'
    },
    {
      step: '02',
      icon: 'manage_search',
      titleEn: 'Smart Eligibility Check',
      titleMr: 'स्मार्ट पात्रता तपासणी',
      descEn: 'Our rule engine instantly matches you with welfare schemes and grants you qualify for.',
      descMr: 'आमची प्रणाली आपण पात्र असलेल्या सर्व शासकीय योजना व शिष्यवृत्ती त्वरित शोधून देते.'
    },
    {
      step: '03',
      icon: 'verified_user',
      titleEn: 'Consent-Driven Data Pull',
      titleMr: 'संमती आधारित डेटा देवाणघेवाण',
      descEn: 'Grant explicit permission for departments to verify your records without manual paperwork.',
      descMr: 'कागदपत्रांच्या झेरॉक्स प्रतींशिवाय विभागांना सुरक्षित डेटा तपासण्याची संमती द्या.'
    },
    {
      step: '04',
      icon: 'payments',
      titleEn: 'Instant DBT & Certificate',
      titleMr: 'थेट लाभ व डिजिटल दाखला',
      descEn: 'Receive digitally signed QR-verifiable certificates and direct bank deposits.',
      descMr: 'डिजिटल स्वाक्षरी असलेले क्युआर कोड दाखले आणि थेट बँक खात्यात अनुदान प्राप्त करा.'
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#e5eeff]/60 via-[#f8f9ff] to-[#f8f9ff] pt-8 md:pt-14 pb-12 border-b border-[#cbd5e1]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 bg-[#dce9ff] text-[#003b5a] px-3.5 py-1.5 rounded-full border border-[#9bccf6] shadow-sm">
                <span className="material-symbols-outlined text-[18px] text-emerald-700" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {language === 'mr' ? 'एकात्मिक डिजिटल शासन प्रणाली' : 'Connected Sovereign Governance'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#003b5a] tracking-tight leading-[1.15]">
                {language === 'mr' ? (
                  <>
                    महाराष्ट्र शासनाच्या सर्व सेवांचे{' '}
                    <span className="text-[#f47920] underline decoration-[#f47920]/40">एकच डिजिटल प्रवेशद्वार</span>
                  </>
                ) : (
                  <>
                    One Digital Gateway to{' '}
                    <span className="text-[#f47920]">Maharashtra</span> Government Services
                  </>
                )}
              </h1>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                {language === 'mr'
                  ? 'दाखले, शिष्यवृत्ती, शेतकरी अनुदान आणि सामाजिक कल्याण योजना—आता कागदपत्रांशिवाय, थेट नागरिक संमतीवर आधारित जलद वितरणासह उपलब्ध.'
                  : 'Access services from multiple government departments through one simple, secure, and transparent digital experience. Designed for every citizen with zero physical paperwork.'}
              </p>

              {/* Search Box */}
              <div className="bg-white p-2 rounded-xl shadow-gov-md border border-slate-200 max-w-xl">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/services?q=${encodeURIComponent(searchQuery)}`;
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-slate-400 pl-2">search</span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      language === 'mr'
                        ? 'सेवा, शिष्यवृत्ती किंवा योजना शोधा (उदा. उत्पन्न दाखला, महाडीबीटी)...'
                        : 'Search services, certificates or schemes (e.g. Income, Scholarship)...'
                    }
                    className="w-full text-sm text-slate-800 placeholder-slate-400 focus:outline-none py-2 px-1"
                  />
                  <button
                    type="submit"
                    className="bg-[#003b5a] hover:bg-[#002840] text-white px-5 py-2.5 rounded-lg text-xs font-bold transition shadow-sm flex-shrink-0"
                  >
                    {language === 'mr' ? 'शोधा' : 'Search'}
                  </button>
                </form>
              </div>

              {/* CTA Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/services"
                  className="bg-[#f47920] hover:bg-[#d86815] text-white px-6 py-3 rounded-lg text-sm font-bold shadow-gov transition flex items-center gap-2"
                >
                  <span>{language === 'mr' ? 'सर्व सेवा एक्सप्लोर करा' : 'Explore Services'}</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>

                <Link
                  href="/eligibility-checker"
                  className="bg-white hover:bg-slate-50 text-[#003b5a] border border-[#003b5a] px-6 py-3 rounded-lg text-sm font-bold shadow-sm transition flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#003b5a]">fact_check</span>
                  <span>{language === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility'}</span>
                </Link>

                <Link
                  href="/track"
                  className="text-xs font-semibold text-[#003b5a] hover:underline flex items-center gap-1 ml-2"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-600">track_changes</span>
                  <span>{language === 'mr' ? 'अर्जाची स्थिती ट्रॅक करा' : 'Track Application Status'}</span>
                </Link>
              </div>
            </div>

            {/* Right Visual Banner / Architecture Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl p-6 shadow-gov-lg border border-slate-200 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-100/40 rounded-full blur-2xl"></div>

                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-emerald-600 text-[20px]">hub</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      {language === 'mr' ? 'नागरिक-केंद्रित डेटा प्रवाह' : 'Citizen-Centric Data Flow'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Live Interop
                  </span>
                </div>

                {/* Illustrated Flow Nodes */}
                <div className="space-y-3 relative z-10">
                  <div className="bg-[#f8f9ff] border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#003b5a] text-white flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">person</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#003b5a]">Citizen Consent Vault</h4>
                        <p className="text-[11px] text-slate-500">Rajesh Patil (Aadhaar Verified)</p>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-[#e5eeff] border border-[#9bccf6] rounded-lg p-2.5 text-center">
                      <span className="material-symbols-outlined text-[#003b5a] text-[20px] mb-1">account_balance</span>
                      <p className="text-[10px] font-bold text-[#003b5a]">Revenue</p>
                      <p className="text-[9px] text-slate-500">Income / 7/12</p>
                    </div>
                    <div className="bg-[#e5eeff] border border-[#9bccf6] rounded-lg p-2.5 text-center">
                      <span className="material-symbols-outlined text-[#003b5a] text-[20px] mb-1">school</span>
                      <p className="text-[10px] font-bold text-[#003b5a]">Education</p>
                      <p className="text-[9px] text-slate-500">Scholarships</p>
                    </div>
                    <div className="bg-[#e5eeff] border border-[#9bccf6] rounded-lg p-2.5 text-center">
                      <span className="material-symbols-outlined text-[#003b5a] text-[20px] mb-1">diversity_3</span>
                      <p className="text-[10px] font-bold text-[#003b5a]">Social Justice</p>
                      <p className="text-[9px] text-slate-500">Caste Validity</p>
                    </div>
                  </div>

                  <div className="flex justify-center text-slate-400">
                    <span className="material-symbols-outlined text-[20px]">arrow_downward</span>
                  </div>

                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-700 text-[20px]">payments</span>
                      <div>
                        <p className="text-xs font-bold text-emerald-900">Direct Benefit Transfer (DBT)</p>
                        <p className="text-[10px] text-emerald-700">Bank Account Credited: ₹25,000</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded">Success</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">lock</span>
                    End-to-End Encrypted
                  </span>
                  <Link href="/consent" className="text-[#003b5a] font-bold hover:underline">
                    Manage Consent &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Statistics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-xl shadow-gov border border-slate-200 p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {quickStats.map((stat, i) => (
              <div key={i} className={`pt-4 md:pt-0 ${i > 0 ? 'md:pl-6' : ''}`}>
                <p className="text-2xl sm:text-3xl font-extrabold text-[#003b5a] tracking-tight">{stat.val}</p>
                <p className="text-xs font-semibold text-slate-600 mt-1">
                  {language === 'mr' ? stat.labelMr : stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#f47920] bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
            {language === 'mr' ? 'एकात्मिक सेवा सूची' : 'Unified Service Portfolio'}
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#003b5a] mt-3">
            {language === 'mr' ? 'तीन विभाग. एकच व्यासपीठ.' : 'Three Departments. One Platform.'}
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            {language === 'mr'
              ? 'आम्ही सर्वाधिक वापरल्या जाणाऱ्या सेवांचे एकत्रीकरण केले आहे जेणेकरून आपला वेळ वाचेल आणि प्रशासकीय प्रक्रिया सुलभ होईल.'
              : 'We have unified the most frequently accessed civic services to eliminate redundant document submissions and expedite approvals.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-xl border border-slate-200 shadow-gov hover:shadow-gov-lg transition-all p-7 flex flex-col justify-between group"
            >
              <div>
                <div className="w-14 h-14 rounded-full bg-[#e5eeff] text-[#003b5a] flex items-center justify-center mb-5 group-hover:scale-105 group-hover:bg-[#003b5a] group-hover:text-white transition">
                  <span className="material-symbols-outlined text-[28px]">{dept.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-[#003b5a] mb-2">
                  {language === 'mr' ? dept.titleMr : dept.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {language === 'mr' ? dept.descMr : dept.descEn}
                </p>
                <div className="border-t border-slate-100 pt-4 mb-6">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    {language === 'mr' ? 'प्रमुख सेवा:' : 'Popular Services:'}
                  </p>
                  <ul className="space-y-2">
                    {(language === 'mr' ? dept.servicesMr : dept.servicesEn).map((srv, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                        <span>{srv}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <Link
                href={dept.link}
                className="w-full bg-[#f8f9ff] hover:bg-[#003b5a] hover:text-white text-[#003b5a] border border-[#003b5a]/30 font-bold py-2.5 px-4 rounded-lg text-xs transition text-center flex items-center justify-center gap-1.5"
              >
                <span>{language === 'mr' ? 'सर्व सेवा पहा' : 'View Services'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-[#e5eeff]/40 py-16 border-y border-[#cbd5e1]/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#003b5a]">
              {language === 'mr' ? 'प्रणाली कशी कार्य करते?' : 'How It Works'}
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              {language === 'mr'
                ? 'कागदपत्रे अपलोड करण्याच्या त्रासातून मुक्ती—४ सोप्या टप्प्यांत थेट लाभ मिळवा.'
                : 'A seamless, transparent journey from identification to benefit realization.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorksSteps.map((step, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-[#003b5a] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">{step.icon}</span>
                  </div>
                  <span className="text-2xl font-black text-slate-200">{step.step}</span>
                </div>
                <h3 className="text-sm font-bold text-[#003b5a] mb-2">
                  {language === 'mr' ? step.titleMr : step.titleEn}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {language === 'mr' ? step.descMr : step.descEn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Citizen Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="bg-[#003b5a] text-white rounded-2xl p-8 sm:p-12 shadow-gov-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2 text-center md:text-left">
              <h3 className="text-2xl sm:text-3xl font-bold tracking-tight">
                {language === 'mr'
                  ? 'आपल्या पात्रतेनुसार शासकीय योजनांचा लाभ आजच मिळवा'
                  : 'Empowering Every Citizen of Maharashtra'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {language === 'mr'
                  ? 'फक्त २ मिनिटांत आपली पात्रता तपासा आणि थेट आपल्या बँक खात्यात शिष्यवृत्ती व योजनांचा लाभ मिळवा.'
                  : 'Check your eligibility across 50+ welfare schemes in under 2 minutes with instant DigiLocker document verification.'}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/eligibility-checker"
                className="bg-[#f47920] hover:bg-[#d86815] text-white px-6 py-3 rounded-lg text-xs sm:text-sm font-bold shadow-md transition"
              >
                {language === 'mr' ? 'पात्रता कॅल्क्युलेटर सुरू करा' : 'Launch Eligibility Checker'}
              </Link>
              <Link
                href="/login"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-5 py-3 rounded-lg text-xs sm:text-sm font-bold transition"
              >
                {language === 'mr' ? 'नागरिक लॉगिन' : 'Citizen Sign In'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
