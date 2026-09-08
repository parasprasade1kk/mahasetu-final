'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

interface Scheme {
  id: string;
  category: 'education' | 'farmer' | 'social' | 'women';
  nameEn: string;
  nameMr: string;
  deptEn: string;
  deptMr: string;
  benefitEn: string;
  benefitMr: string;
  incomeLimitEn: string;
  incomeLimitMr: string;
  deadline: string;
  targetGroupEn: string;
  targetGroupMr: string;
  /** Route for the application form — must match a serviceId in servicesConfig */
  applicationRoute: string;
}

const schemesData: Scheme[] = [
  {
    id: 'scm-1',
    category: 'education',
    nameEn: 'Post-Matric Scholarship & Freeship Scheme',
    nameMr: 'मॅट्रिकोत्तर शिष्यवृत्ती व शिक्षण शुल्क प्रतिपूर्ती योजना',
    deptEn: 'Higher & Technical Education Department',
    deptMr: 'उच्च व तंत्रशिक्षण विभाग',
    benefitEn: '100% Tuition & Exam Fee paid directly to Institute + Maintenance allowance',
    benefitMr: '१००% शिक्षण व परीक्षा शुल्क थेट महाविद्यालयास अदा + निर्वाह भत्ता',
    incomeLimitEn: 'Up to ₹8,00,000 / annum',
    incomeLimitMr: 'वार्षिक ₹८,००,००० पर्यंत',
    deadline: '31 Oct 2026',
    targetGroupEn: 'OBC, EBC, SEBC, SC, ST College Students',
    targetGroupMr: 'इमाव, ईबीसी, एसईबीसी, अजा, अज महाविद्यालयीन विद्यार्थी',
    applicationRoute: '/apply/scheme/post-matric-scholarship'
  },
  {
    id: 'scm-2',
    category: 'education',
    nameEn: 'Disability Scholarship & Education Support',
    nameMr: 'दिव्यांग शिष्यवृत्ती व शिक्षण सहाय्य योजना',
    deptEn: 'Social Justice & Special Assistance Department',
    deptMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    benefitEn: 'Monthly education stipend, reader allowance, and assistive devices grant',
    benefitMr: 'मासिक शिक्षण विद्यावेतन, वाचक भत्ता व सहाय्यक साधने अनुदान',
    incomeLimitEn: 'Up to ₹2,50,000 / annum',
    incomeLimitMr: 'वार्षिक ₹२,५०,००० पर्यंत',
    deadline: '31 Dec 2026',
    targetGroupEn: 'Students with 40%+ certified disability (Divyangjan)',
    targetGroupMr: '४०% पेक्षा जास्त प्रमाणित दिव्यांगत्व असलेले विद्यार्थी',
    applicationRoute: '/apply/scheme/disability-scholarship'
  },
  {
    id: 'scm-3',
    category: 'social',
    nameEn: 'Senior Citizen Scheme (Shravanbal Yojana)',
    nameMr: 'ज्येष्ठ नागरिक सहाय्य योजना (श्रावणबाळ योजना)',
    deptEn: 'Social Justice & Special Assistance Department',
    deptMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    benefitEn: '₹1,500 / month direct pension to senior citizens aged 65+',
    benefitMr: '६५ वर्षे व त्यावरील ज्येष्ठ नागरिकांना ₹१,५०० प्रति महिना थेट निवृत्तीवेतन',
    incomeLimitEn: 'Family income up to ₹21,000 / annum or BPL',
    incomeLimitMr: 'कौटुंबिक वार्षिक उत्पन्न ₹२१,००० पर्यंत किंवा दारिद्र्यरेषेखालील',
    deadline: 'Open Throughout Year',
    targetGroupEn: 'Senior citizens aged 65 years and above in Maharashtra',
    targetGroupMr: 'महाराष्ट्रातील ६५ वर्षे व त्यावरील ज्येष्ठ नागरिक',
    applicationRoute: '/apply/scheme/senior-citizen-scheme'
  },
  {
    id: 'scm-4',
    category: 'social',
    nameEn: 'Financial Assistance Scheme for Low-Income Families',
    nameMr: 'अल्प उत्पन्न कुटुंबांसाठी आर्थिक सहाय्य योजना',
    deptEn: 'Social Justice & Special Assistance Department',
    deptMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    benefitEn: 'Direct one-time or recurring economic distress grant to bank account',
    benefitMr: 'बँक खात्यात थेट एकरकमी किंवा आवर्ती आर्थिक संकट निवारण अनुदान',
    incomeLimitEn: 'Family income up to ₹1,00,000 / annum',
    incomeLimitMr: 'कौटुंबिक वार्षिक उत्पन्न ₹१,००,००० पर्यंत',
    deadline: 'Open Throughout Year',
    targetGroupEn: 'Low-income and distressed citizens',
    targetGroupMr: 'अल्प उत्पन्न व संकटात सापडलेले नागरिक',
    applicationRoute: '/apply/scheme/financial-assistance-scheme'
  },
  {
    id: 'scm-5',
    category: 'women',
    nameEn: 'Women Welfare Scheme & Empowerment Grant',
    nameMr: 'महिला कल्याण व सक्षमीकरण अनुदान योजना',
    deptEn: 'Women & Child Development Department',
    deptMr: 'महिला व बालविकास विभाग',
    benefitEn: 'Financial security and self-help livelihood grant for women',
    benefitMr: 'महिलांसाठी आर्थिक सुरक्षा व स्वयंसहाय्यता उपजीविका अनुदान',
    incomeLimitEn: 'Family income up to ₹2,50,000 / annum',
    incomeLimitMr: 'कौटुंबिक वार्षिक उत्पन्न ₹२,५०,००० पर्यंत',
    deadline: 'Ongoing Enrollment',
    targetGroupEn: 'Women aged 18-65 years in Maharashtra',
    targetGroupMr: 'महाराष्ट्रातील १८ ते ६५ वयोगटातील महिला',
    applicationRoute: '/apply/scheme/women-welfare-scheme'
  },
  {
    id: 'scm-6',
    category: 'women',
    nameEn: 'Mukhyamantri Majhi Ladki Bahin Yojana',
    nameMr: 'मुख्यमंत्री माझी लाडकी बहीण योजना',
    deptEn: 'Women & Child Development Department',
    deptMr: 'महिला व बालविकास विभाग',
    benefitEn: '₹1,500 / month financial assistance directly in Aadhaar account',
    benefitMr: 'पात्र महिलांच्या आधार जोडणी बँक खात्यात दरमहा ₹१,५००',
    incomeLimitEn: 'Family income up to ₹2,50,000 / annum',
    incomeLimitMr: 'कौटुंबिक वार्षिक उत्पन्न ₹२,५०,००० पर्यंत',
    deadline: 'Ongoing Enrollment',
    targetGroupEn: 'Women aged 21-65 years in Maharashtra',
    targetGroupMr: 'महाराष्ट्रातील २१ ते ६५ वयोगटातील महिला',
    applicationRoute: '/apply/scheme/majhi-ladki-bahin'
  },
  {
    id: 'scm-7',
    category: 'farmer',
    nameEn: 'Namo Shetkari Mahasanman Nidhi Yojana',
    nameMr: 'नमो शेतकरी महासन्मान निधी योजना',
    deptEn: 'Agriculture Department',
    deptMr: 'कृषी विभाग',
    benefitEn: '₹6,000 / year in 3 direct bank installments',
    benefitMr: '₹६,००० प्रति वर्ष थेट बँक खात्यात ३ हप्त्यांमध्ये',
    incomeLimitEn: 'All eligible landholding farmer families',
    incomeLimitMr: 'सर्व पात्र जमीनधारक शेतकरी कुटुंबे',
    deadline: 'Open Throughout Year',
    targetGroupEn: 'Small and Marginal Farmers with 7/12 land records',
    targetGroupMr: '७/१२ नोंदणी असलेले अल्प व अत्यल्प भूधारक शेतकरी',
    applicationRoute: '/apply/scheme/namo-shetkari'
  },
  {
    id: 'scm-8',
    category: 'farmer',
    nameEn: 'Magel Tyala Saur Krushi Pump Yojana (Mukhyamantri Saur Krushi)',
    nameMr: 'मागेल त्याला सौर कृषी पंप योजना',
    deptEn: 'Energy & Agriculture Department',
    deptMr: 'ऊर्जा व कृषी विभाग',
    benefitEn: 'Up to 90-95% government subsidy on Solar Agricultural Pumps',
    benefitMr: 'सौर कृषी पंपावर ९० ते ९५% पर्यंत शासकीय अनुदान',
    incomeLimitEn: 'Farmers with verified agricultural water source',
    incomeLimitMr: 'शेतात खात्रीशीर पाण्याचा स्रोत असलेले शेतकरी',
    deadline: '15 Nov 2026',
    targetGroupEn: 'Farmers requiring day-time solar power irrigation',
    targetGroupMr: 'दिवसा सिंचनासाठी वीज आवश्यक असलेले शेतकरी',
    applicationRoute: '/apply/scheme/saur-krushi-pump'
  },
  {
    id: 'scm-9',
    category: 'education',
    nameEn: 'Dr. Punjabrao Deshmukh Vastigruh Nirvah Bhatta Yojna',
    nameMr: 'डॉ. पंजाबराव देशमुख वसतिगृह निर्वाह भत्ता योजना',
    deptEn: 'Higher & Technical Education Department',
    deptMr: 'उच्च व तंत्रशिक्षण विभाग',
    benefitEn: '₹30,000 / year hostel allowance for professional courses',
    benefitMr: 'व्यावसायिक अभ्यासक्रमांसाठी ₹३०,००० प्रति वर्ष वसतिगृह भत्ता',
    incomeLimitEn: 'Children of registered alpabhudharak farmers or income < ₹8L',
    incomeLimitMr: 'अल्पभूधारक शेतकरी कुटुंबे किंवा उत्पन्न < ₹८ लाख',
    deadline: '31 Oct 2026',
    targetGroupEn: 'Children of Marginal Farmers & Laborers',
    targetGroupMr: 'अल्पभूधारक शेतकरी व शेतमजूर यांची मुले',
    applicationRoute: '/apply/scheme/rcsm-scholarship'
  },
  {
    id: 'scm-10',
    category: 'social',
    nameEn: 'Sanjay Gandhi Niradhar Anudan Yojana',
    nameMr: 'संजय गांधी निराधार अनुदान योजना',
    deptEn: 'Social Justice & Special Assistance Department',
    deptMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    benefitEn: '₹1,500 / month direct pension to destitute citizens & widows',
    benefitMr: 'निराधार व्यक्ती व विधवा महिलांना ₹१,५०० प्रति महिना थेट पेन्शन',
    incomeLimitEn: 'Family income up to ₹21,000 / annum',
    incomeLimitMr: 'कौटुंबिक वार्षिक उत्पन्न ₹२१,००० पर्यंत',
    deadline: 'Open Throughout Year',
    targetGroupEn: 'Destitute Persons, Widows, Physically Challenged',
    targetGroupMr: 'निराधार, विधवा, दिव्यांग व गंभीर आजारी नागरिक',
    applicationRoute: '/apply/scheme/sanjay-gandhi-niradhar'
  }
];

export default function SchemesPage() {
  const { language } = useApp();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = schemesData.filter((scm) => {
    const matchesCat = activeCategory === 'all' || scm.category === activeCategory;
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      scm.nameEn.toLowerCase().includes(q) ||
      scm.nameMr.toLowerCase().includes(q) ||
      scm.deptEn.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Hero */}
      <div className="bg-gradient-to-r from-[#003b5a] via-[#1a5276] to-[#00253d] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {language === 'mr' ? 'शासकीय कल्याणकारी योजना' : 'Maharashtra State Welfare Schemes'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr'
              ? 'आपण पात्र असलेल्या शासकीय योजना शोधा'
              : 'Find Government Schemes You May Be Eligible For'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {language === 'mr'
              ? 'विद्यार्थी, शेतकरी, महिला आणि सामाजिक घटकांसाठी महाराष्ट्र शासनाच्या विविध कल्याणकारी योजना एकाच ठिकाणी.'
              : 'Discover grants, direct benefit transfers (DBT), education fee waivers, and subsidies tailored to your family profile.'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 max-w-xl bg-white rounded-xl p-1.5 flex items-center shadow-md">
          <span className="material-symbols-outlined text-slate-400 pl-3">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'mr' ? 'योजनेचे नाव शोधा...' : 'Search by scheme name or department...'}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-3 py-2 focus:outline-none"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'all', labelEn: 'All Schemes (6)', labelMr: 'सर्व योजना (६)' },
          { id: 'education', labelEn: 'Education & Students', labelMr: 'शिक्षण व विद्यार्थी' },
          { id: 'farmer', labelEn: 'Agriculture & Farmers', labelMr: 'कृषी व शेतकरी' },
          { id: 'women', labelEn: 'Women & Child Welfare', labelMr: 'महिला व बालविकास' },
          { id: 'social', labelEn: 'Social Justice & Pension', labelMr: 'सामाजिक न्याय व पेन्शन' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCategory(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border ${
              activeCategory === tab.id
                ? 'bg-[#003b5a] text-white border-[#003b5a] shadow-sm'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            {language === 'mr' ? tab.labelMr : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((scm) => (
          <div
            key={scm.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-gov hover:shadow-gov-lg transition-all p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-2.5 py-0.5 rounded-full border border-[#9bccf6]">
                    {language === 'mr' ? scm.deptMr : scm.deptEn}
                  </span>
                  <h3 className="text-base font-bold text-[#003b5a] mt-2 leading-snug">
                    {language === 'mr' ? scm.nameMr : scm.nameEn}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md whitespace-nowrap">
                  {scm.deadline}
                </span>
              </div>

              {/* Benefit Box */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3">
                <span className="material-symbols-outlined text-emerald-700 text-[24px]">payments</span>
                <div>
                  <p className="text-[11px] text-emerald-800 font-semibold uppercase tracking-wider">
                    {language === 'mr' ? 'शासकीय लाभ / अनुदान:' : 'Financial Grant / Benefit:'}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-emerald-950">
                    {language === 'mr' ? scm.benefitMr : scm.benefitEn}
                  </p>
                </div>
              </div>

              {/* Criteria details */}
              <div className="grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {language === 'mr' ? 'उत्पन्न मर्यादा:' : 'Income Ceiling:'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {language === 'mr' ? scm.incomeLimitMr : scm.incomeLimitEn}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 block">
                    {language === 'mr' ? 'पात्र लाभार्थी:' : 'Eligible Group:'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {language === 'mr' ? scm.targetGroupMr : scm.targetGroupEn}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Link
                href="/eligibility-checker"
                className="text-xs font-bold text-[#003b5a] hover:underline flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">fact_check</span>
                <span>{language === 'mr' ? 'पात्रता तपासा' : 'Check Eligibility'}</span>
              </Link>

              <Link
                href={scm.applicationRoute}
                className="bg-[#f47920] hover:bg-[#d86815] text-white font-bold py-2 px-5 rounded-lg text-xs transition shadow-sm flex items-center gap-1"
              >
                <span>{language === 'mr' ? 'थेट अर्ज करा' : 'Apply Now'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
