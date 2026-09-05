'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

export default function Footer() {
  const { language } = useApp();

  return (
    <footer className="bg-[#00253d] text-slate-300 pt-12 pb-8 border-t-4 border-[#003b5a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About MahaSetu */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-full bg-white/10 text-amber-400 flex items-center justify-center p-1.5 border border-amber-400/30">
                <span className="material-symbols-outlined text-22px">account_balance</span>
              </div>
              <span className="text-xl font-bold text-white tracking-wide">
                MahaSetu <span className="text-amber-400 font-normal">| महासेतू</span>
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              {language === 'mr'
                ? 'महाराष्ट्र शासनाचे अधिकृत एकात्मिक नागरिक सेवा पोर्टल. येथे सर्व शासकीय योजना, दाखले, थेट लाभ वितरण (DBT) आणि डेटा संमती व्यवस्थापन एकाच ठिकाणी उपलब्ध आहे.'
                : 'The official unified citizen portal of the Government of Maharashtra providing end-to-end delivery of welfare schemes, certificates, DBT disbursements, and sovereign data sharing.'}
            </p>
            <div className="flex items-center gap-3 text-xs text-amber-400 font-semibold">
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>ISO 27001 & STQC Certified</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">apps</span>
              {language === 'mr' ? 'महत्त्वाच्या नागरिक सेवा' : 'Key Citizen Services'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/services" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  {language === 'mr' ? 'महसूल दाखले (उत्पन्न / जात / अधिवास)' : 'Revenue Certificates (Income / Caste / Domicile)'}
                </Link>
              </li>
              <li>
                <Link href="/schemes" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  {language === 'mr' ? 'महाडीबीटी शिष्यवृत्ती योजना' : 'MahaDBT Scholarship Schemes'}
                </Link>
              </li>
              <li>
                <Link href="/eligibility-checker" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  {language === 'mr' ? 'योजना पात्रता कॅल्क्युलेटर' : 'Scheme Eligibility Calculator'}
                </Link>
              </li>
              <li>
                <Link href="/track" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  {language === 'mr' ? 'थेट अर्ज स्थिती ट्रॅकिंग' : 'Real-Time Application Tracking'}
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  {language === 'mr' ? 'डिजिलॉकर कागदपत्रे संकलन' : 'DigiLocker Document Vault'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Participating Departments */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">domain</span>
              {language === 'mr' ? 'सहभागी प्रशासकीय विभाग' : 'Government Departments'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                {language === 'mr' ? 'महसूल व वन विभाग' : 'Revenue & Forest Department'}
              </li>
              <li className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                {language === 'mr' ? 'उच्च व तंत्रशिक्षण विभाग' : 'Higher & Technical Education Department'}
              </li>
              <li className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                {language === 'mr' ? 'कृषी व पदुम विभाग' : 'Agriculture & Farmers Welfare Department'}
              </li>
              <li className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                {language === 'mr' ? 'सामाजिक न्याय व विशेष सहाय्य विभाग' : 'Social Justice & Special Assistance'}
              </li>
              <li className="hover:text-amber-400 cursor-pointer flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                {language === 'mr' ? 'सार्वजनिक आरोग्य विभाग' : 'Public Health & Family Welfare'}
              </li>
            </ul>
          </div>

          {/* Col 4: Helpdesk & Grievance */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-white/10 pb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-400 text-[18px]">support_agent</span>
              {language === 'mr' ? 'मदत व तक्रार निवारण' : 'Support & Grievance'}
            </h4>
            <div className="bg-[#003b5a]/60 p-3.5 rounded-lg border border-[#004f7a] text-xs space-y-2 mb-3">
              <p className="text-slate-200">
                <strong className="text-amber-400 block mb-0.5">Toll-Free Citizen Helpline:</strong>
                1800-120-8040 (9:00 AM - 7:00 PM)
              </p>
              <p className="text-slate-200">
                <strong className="text-amber-400 block mb-0.5">Email Support:</strong>
                support.mahasetu@maharashtra.gov.in
              </p>
            </div>
            <p className="text-[11px] text-slate-400">
              {language === 'mr'
                ? 'जवळचे आपले सरकार सेवा केंद्र (CSC) शोधण्यासाठी जिल्हा किंवा पिनकोड प्रविष्ट करा.'
                : 'Visit your nearest Aaple Sarkar Seva Kendra (CSC) for physical biometric assistance.'}
            </p>
          </div>
        </div>

        {/* Sovereign Tricolor Divider */}
        <div className="sovereign-tricolor w-full my-6 rounded" />

        {/* Bottom Bar: Copyright & Compliance */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © 2026 Government of Maharashtra. All rights reserved. MahaSetu Portal is compliant with GIGW 3.0.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Hyperlink Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Accessibility Statement</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[12px]">security</span> Data Protection Act 2023 Compliant
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
