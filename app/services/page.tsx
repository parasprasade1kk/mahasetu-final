'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';

interface ServiceItem {
  id: string;
  deptId: 'revenue' | 'education' | 'social' | 'agriculture' | 'food';
  deptNameEn: string;
  deptNameMr: string;
  titleEn: string;
  titleMr: string;
  descEn: string;
  descMr: string;
  sla: string;
  documentsEn: string[];
  documentsMr: string[];
  applyLink: string;
}

const allServices: ServiceItem[] = [
  {
    id: 'srv-1',
    deptId: 'revenue',
    deptNameEn: 'Revenue Department',
    deptNameMr: 'महसूल विभाग',
    titleEn: 'Income Certificate (1/3 Years)',
    titleMr: 'उत्पन्नाचा दाखला (१ किंवा ३ वर्षे)',
    descEn: 'Statutory certificate certifying annual family income issued by the Tehsildar office for educational and welfare benefits.',
    descMr: 'तहसीलदार कार्यालयामार्फत जारी करण्यात येणारा वार्षिक कौटुंबिक उत्पन्नाचा दाखला.',
    sla: '3 Days',
    documentsEn: ['Ration Card', 'Salary Slip / Talathi Income Report', 'Aadhaar Card'],
    documentsMr: ['रेशन कार्ड', 'पगार पावती / तलाठी अहवाल', 'आधार कार्ड'],
    applyLink: '/scholarship-application'
  },
  {
    id: 'srv-2',
    deptId: 'revenue',
    deptNameEn: 'Revenue Department',
    deptNameMr: 'महसूल विभाग',
    titleEn: 'Caste Certificate (SC / ST / VJNT / OBC / SEBC)',
    titleMr: 'जात प्रमाणपत्र (अजा / अज / विजाभज / इमाव / एसईबीसी)',
    descEn: 'Official certification of caste category for reservations and educational schemes under Maharashtra state quota.',
    descMr: 'महाराष्ट्र राज्यातील आरक्षण व शैक्षणिक योजनांसाठी अधिकृत जात प्रमाणपत्र.',
    sla: '7 Days',
    documentsEn: ['School Leaving Certificate', 'Father/Relative Caste Proof prior to 1967', 'Aadhaar Card'],
    documentsMr: ['शाळा सोडल्याचा दाखला', '१९६७ पूर्वीचा वडिलांचा जात पुरावा', 'आधार कार्ड'],
    applyLink: '/scholarship-application'
  },
  {
    id: 'srv-3',
    deptId: 'revenue',
    deptNameEn: 'Revenue Department',
    deptNameMr: 'महसूल विभाग',
    titleEn: '7/12 & 8A Digital Land Extract (e-Mahabhumi)',
    titleMr: 'डिजिटल स्वाक्षरीत ७/१२ व ८-अ उतारा (ई-महाभूमी)',
    descEn: 'Digitally signed land record extract depicting survey numbers, land ownership, and crop inspection details.',
    descMr: 'जमीन मालकी, गट क्रमांक आणि पीक पाहणी दर्शविणारा डिजिटल स्वाक्षरी असलेला ७/१२ उतारा.',
    sla: 'Instant Download',
    documentsEn: ['District / Taluka / Village Selection', 'Gat / Survey Number'],
    documentsMr: ['जिल्हा / तालुका / गाव निवड', 'गट / सर्व्हे क्रमांक'],
    applyLink: '/documents'
  },
  {
    id: 'srv-4',
    deptId: 'education',
    deptNameEn: 'Higher & Technical Education',
    deptNameMr: 'उच्च व तंत्रशिक्षण विभाग',
    titleEn: 'Post-Matric Scholarship for OBC / EBC Students',
    titleMr: 'इतर मागासवर्गीय व ईबीसी विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
    descEn: '100% Tuition fee and examination fee reimbursement disbursed directly through DBT into student Aadhaar-seeded bank account.',
    descMr: 'विद्यार्थ्यांच्या आधार जोडणी असलेल्या बँक खात्यात १००% शिक्षण व परीक्षा शुल्क थेट परतावा.',
    sla: '14 Days',
    documentsEn: ['Income Certificate (< ₹8 Lakhs)', 'Caste Certificate', 'College Allotment Letter', 'HSC / SSC Marksheet'],
    documentsMr: ['उत्पन्न दाखला (< ₹८ लाख)', 'जात प्रमाणपत्र', 'महाविद्यालय वाटप पत्र', 'गुणपत्रिका'],
    applyLink: '/scholarship-application'
  },
  {
    id: 'srv-5',
    deptId: 'education',
    deptNameEn: 'Higher & Technical Education',
    deptNameMr: 'उच्च व तंत्रशिक्षण विभाग',
    titleEn: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Yojna',
    titleMr: 'राजर्षी छत्रपती शाहू महाराज शिक्षण शुल्क शिष्यवृत्ती योजना',
    descEn: '50% tuition and exam fee waiver for Economically Weaker Section (EWS/Open) students in professional colleges.',
    descMr: 'व्यावसायिक अभ्यासक्रमांमधील ईडब्ल्यूएस व खुल्या प्रवर्गातील विद्यार्थ्यांसाठी ५०% शिक्षण शुल्क सवलत.',
    sla: '14 Days',
    documentsEn: ['Income Certificate (< ₹8 Lakh)', 'CAP Admission Letter', 'Maharashtra Domicile Certificate'],
    documentsMr: ['उत्पन्न दाखला (< ₹८ लाख)', 'कॅप प्रवेश पत्र', 'महाराष्ट्र अधिवास दाखला'],
    applyLink: '/scholarship-application'
  },
  {
    id: 'srv-6',
    deptId: 'social',
    deptNameEn: 'Social Justice & Special Assistance',
    deptNameMr: 'सामाजिक न्याय व विशेष सहाय्य',
    titleEn: 'Caste Validity Certificate (Scrutiny Committee)',
    titleMr: 'जात पडताळणी वैधता प्रमाणपत्र (छाननी समिती)',
    descEn: 'Mandatory verification certificate for admissions to professional medical/engineering colleges and government employment.',
    descMr: 'व्यावसायिक महाविद्यालये व शासकीय नोकऱ्यांसाठी अनिवार्य जात वैधता प्रमाणपत्र.',
    sla: '21 Days',
    documentsEn: ['Affidavit Form 3', 'Genealogy Tree (वंशावळ)', 'Oldest available family records (1950/1961)'],
    documentsMr: ['प्रतिज्ञापत्र (नमुना ३)', 'वंशावळ', 'कुटुंबातील जुने पुरावे (१९५०/१९६१)'],
    applyLink: '/scholarship-application'
  },
  {
    id: 'srv-7',
    deptId: 'agriculture',
    deptNameEn: 'Agriculture & Farmers Welfare',
    deptNameMr: 'कृषी विभाग',
    titleEn: 'Namo Shetkari Mahasanman Nidhi Yojana',
    titleMr: 'नमो शेतकरी महासन्मान निधी योजना',
    descEn: 'Annual ₹6,000 direct income support disbursed in three equal installments to verified landholder farmers.',
    descMr: 'शेतकऱ्यांना वार्षिक ₹६,००० थेट बँक अनुदान तीन समान हप्त्यांमध्ये.',
    sla: '7 Days',
    documentsEn: ['Aadhaar Number', 'e-Pik Pahani Crop Survey', '7/12 Land Record'],
    documentsMr: ['आधार क्रमांक', 'ई-पीक पाहणी', '७/१२ उतारा'],
    applyLink: '/schemes'
  },
  {
    id: 'srv-8',
    deptId: 'food',
    deptNameEn: 'Food & Civil Supplies',
    deptNameMr: 'अन्न व नागरी पुरवठा विभाग',
    titleEn: 'Addition / Modification of Member in Ration Card',
    titleMr: 'शिधापत्रिकेत (रेशन कार्ड) नवीन नाव समाविष्ट करणे',
    descEn: 'Add newborn or spouse to family digital ration card for subsidised food grains under NFSA.',
    descMr: 'राष्ट्रीय अन्न सुरक्षा योजनेअंतर्गत कुटुंबाच्या रेशन कार्डवर नवीन सदस्याचे नाव जोडणे.',
    sla: '5 Days',
    documentsEn: ['Existing Ration Card', 'Birth / Marriage Certificate', 'Aadhaar Card of Member'],
    documentsMr: ['मूळ रेशन कार्ड', 'जन्म / विवाह नोंदणी दाखला', 'सदस्याचे आधार कार्ड'],
    applyLink: '/track'
  }
];

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
    return allServices.filter((srv) => {
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
                href={srv.applyLink}
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
