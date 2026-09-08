'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { ALL_SERVICES, ServiceConfig } from '@/lib/servicesConfig';

function ServicesContent() {
  const { language } = useApp();
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('dept') || 'all';

  const [selectedDept, setSelectedDept] = useState<string>(initialDept);
  const [searchQuery, setSearchQuery] = useState('');

  const departments = [
    { id: 'all', nameEn: 'All Departments', nameMr: 'सर्व विभाग', icon: 'grid_view' },
    { id: 'revenue', nameEn: 'Revenue Dept', nameMr: 'महसूल विभाग', icon: 'account_balance' },
    { id: 'education', nameEn: 'Higher Education', nameMr: 'उच्च शिक्षण', icon: 'school' },
    { id: 'social', nameEn: 'Social Justice', nameMr: 'सामाजिक न्याय', icon: 'diversity_3' },
    { id: 'agriculture', nameEn: 'Agriculture', nameMr: 'कृषी विभाग', icon: 'agriculture' },
    { id: 'food', nameEn: 'Food & Supplies', nameMr: 'नागरी पुरवठा', icon: 'local_dining' },
  ];

  const filteredServices = useMemo(() => {
    return ALL_SERVICES.filter((srv) => {
      const matchesDept = selectedDept === 'all' || srv.deptId === selectedDept;
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        !query ||
        srv.titleEn.toLowerCase().includes(query) ||
        srv.titleMr.toLowerCase().includes(query) ||
        srv.descEn.toLowerCase().includes(query) ||
        srv.deptNameEn.toLowerCase().includes(query);
      return matchesDept && matchesQuery;
    });
  }, [selectedDept, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#003b5a] to-[#1a5276] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg">
        <div className="max-w-3xl space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
            {language === 'mr' ? 'शासकीय सेवा निर्देशिका' : 'Citizen Service Directory'}
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr' ? 'महाराष्ट्र शासन नागरिक सेवा' : 'Government Services Portal'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {language === 'mr'
              ? 'सर्व शासकीय दाखले, प्रमाणपत्रे आणि परवानग्यांसाठी थेट ऑनलाइन अर्ज करा. आपल्या कागदपत्रांचे स्वयंचलित मूल्यमापन आणि जलद मंजुरी.'
              : 'Apply online for verified certificates, student scholarships, and land extracts with automated statutory clearances.'}
          </p>
        </div>

        {/* Search Input */}
        <div className="mt-6 max-w-xl bg-white rounded-xl p-1.5 flex items-center shadow-md">
          <span className="material-symbols-outlined text-slate-400 pl-3">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'mr' ? 'दाखला किंवा सेवेचे नाव शोधा...' : 'Search by service name, certificate, or keyword...'}
            className="w-full text-xs sm:text-sm text-slate-800 placeholder-slate-400 px-3 py-2 focus:outline-none"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600 px-2 text-xs">
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Department Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {departments.map((dept) => {
          const isSelected = selectedDept === dept.id;
          return (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition border ${
                isSelected
                  ? 'bg-[#003b5a] text-white border-[#003b5a] shadow-sm'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">{dept.icon}</span>
              <span>{language === 'mr' ? dept.nameMr : dept.nameEn}</span>
            </button>
          );
        })}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((srv) => (
          <div
            key={srv.id}
            className="bg-white rounded-2xl border border-slate-200 shadow-gov hover:shadow-gov-lg transition-all p-6 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#e5eeff] text-[#003b5a] px-2.5 py-0.5 rounded-full border border-[#9bccf6]">
                  {language === 'mr' ? srv.deptNameMr : srv.deptNameEn}
                </span>
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <span className="material-symbols-outlined text-[14px]">timer</span>
                  {srv.sla}
                </span>
              </div>

              <h3 className="text-base font-bold text-[#003b5a] leading-snug">
                {language === 'mr' ? srv.titleMr : srv.titleEn}
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                {language === 'mr' ? srv.descMr : srv.descEn}
              </p>

              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 text-xs">
                <p className="font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-amber-600">description</span>
                  {language === 'mr' ? 'आवश्यक कागदपत्रे:' : 'Required Documents:'}
                </p>
                <ul className="space-y-1 text-slate-600">
                  {(language === 'mr' ? srv.documentsMr : srv.documentsEn).map((doc, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center gap-3">
              <Link
                href={srv.applicationRoute}
                className="flex-1 bg-[#f47920] hover:bg-[#d86815] text-white text-center font-bold py-2.5 px-4 rounded-lg text-xs transition shadow-sm flex items-center justify-center gap-1"
              >
                <span>{language === 'mr' ? 'ऑनलाइन अर्ज करा' : 'Apply Online'}</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Link>

              <Link
                href="/eligibility-checker"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 p-2.5 rounded-lg text-xs font-bold transition"
                title="Check Eligibility"
              >
                <span className="material-symbols-outlined text-[18px]">fact_check</span>
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <span className="material-symbols-outlined text-4xl text-slate-400">search_off</span>
          <h3 className="text-base font-bold text-slate-700">No Services Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search terms or selecting a different department category.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDept('all');
            }}
            className="bg-[#003b5a] text-white px-4 py-2 rounded-lg text-xs font-bold"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-500 text-xs">Loading Services Directory...</div>}>
      <ServicesContent />
    </Suspense>
  );
}
