'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';

interface DocItem {
  id: string;
  nameEn: string;
  nameMr: string;
  authorityEn: string;
  authorityMr: string;
  issueDate: string;
  certNo: string;
  verified: boolean;
  type: string;
}

const documentsList: DocItem[] = [
  {
    id: 'doc-1',
    nameEn: 'Annual Income Certificate (1 Year)',
    nameMr: 'वार्षिक उत्पन्नाचा दाखला (१ वर्ष)',
    authorityEn: 'Tehsildar Office, Haveli, Pune',
    authorityMr: 'तहसीलदार कार्यालय, हवेली, पुणे',
    issueDate: '04 Sep 2026',
    certNo: 'MH-REV-2025-88319',
    verified: true,
    type: 'Income Proof'
  },
  {
    id: 'doc-2',
    nameEn: 'Caste Certificate (OBC - Kunbi)',
    nameMr: 'जात प्रमाणपत्र (इमाव - कुणबी)',
    authorityEn: 'Sub-Divisional Officer, Pune Sub-Division',
    authorityMr: 'उपविभागीय अधिकारी, पुणे उपविभाग',
    issueDate: '12 Jan 2024',
    certNo: 'MH-CST-2024-51092',
    verified: true,
    type: 'Caste & Category'
  },
  {
    id: 'doc-3',
    nameEn: 'Age, Nationality & Domicile Certificate',
    nameMr: 'वय, अधिवास व राष्ट्रीयत्व प्रमाणपत्र',
    authorityEn: 'Executive Magistrate, Pune City',
    authorityMr: 'कार्यकारी दंडाधिकारी, पुणे शहर',
    issueDate: '18 Aug 2023',
    certNo: 'MH-DOM-2023-99120',
    verified: true,
    type: 'Identity & Domicile'
  },
  {
    id: 'doc-4',
    nameEn: '7/12 Land Record Extract (e-Mahabhumi)',
    nameMr: 'डिजिटल स्वाक्षरीत ७/१२ जमीन उतारा',
    authorityEn: 'Revenue Department & Settlement Commissioner',
    authorityMr: 'महसूल व भूमी अभिलेख विभाग',
    issueDate: '28 Aug 2026',
    certNo: 'MH-LND-2026-04218',
    verified: true,
    type: 'Land & Property'
  }
];

export default function DocumentsPage() {
  const { language, user } = useApp();
  const [activePreviewDoc, setActivePreviewDoc] = useState<DocItem | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#003b5a] via-[#1a5276] to-[#00253d] text-white rounded-2xl p-6 sm:p-10 shadow-gov-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-300 text-[24px]">cloud_done</span>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {language === 'mr' ? 'डिजिटल लॉकर व्हॉल्ट' : 'DigiLocker Integrated Vault'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            {language === 'mr' ? 'माझी अधिकृत डिजिटल कागदपत्रे' : 'My Digital Documents'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200">
            Official digitally signed records issued by Maharashtra state authorities. Valid under Section 9A of the IT Act.
          </p>
        </div>

        <button
          onClick={() => alert('Syncing latest certificates from DigiLocker repository... Done!')}
          className="bg-[#f47920] hover:bg-[#d86815] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 self-start md:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">sync</span>
          <span>{language === 'mr' ? 'डिजिलॉकर सिंक करा' : 'Pull from DigiLocker'}</span>
        </button>
      </div>

      {/* Document Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {documentsList.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-gov hover:shadow-gov-lg transition flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#e5eeff] text-[#003b5a] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[24px]">description</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                      {doc.type}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-[#003b5a]">
                      {language === 'mr' ? doc.nameMr : doc.nameEn}
                    </h3>
                  </div>
                </div>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
              </div>

              <div className="bg-[#f8f9ff] border border-slate-100 rounded-xl p-3.5 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Certificate Ref:</span>
                  <span className="font-mono font-bold text-slate-800">{doc.certNo}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Issuing Authority:</span>
                  <span className="font-semibold text-slate-800 text-right">
                    {language === 'mr' ? doc.authorityMr : doc.authorityEn}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span className="text-slate-500">Issue Date:</span>
                  <span className="font-semibold text-slate-800">{doc.issueDate}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => setActivePreviewDoc(doc)}
                className="bg-[#003b5a] hover:bg-[#002840] text-white text-xs font-bold py-2 px-4 rounded-lg transition flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                <span>View & Verify</span>
              </button>

              <button
                onClick={() => alert(`Downloading PDF for ${doc.certNo}...`)}
                className="px-3.5 py-2 text-slate-700 bg-slate-100 hover:bg-slate-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                title="Download Certificate"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Certificate Preview Modal */}
      {activePreviewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#003b5a] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-400">verified</span>
                <span className="text-xs font-bold uppercase tracking-wide">Government of Maharashtra Digital Record</span>
              </div>
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="text-slate-300 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Simulated Official Certificate Paper */}
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center p-2">
                <span className="material-symbols-outlined text-[26px]">account_balance</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'mr' ? activePreviewDoc.nameMr : activePreviewDoc.nameEn}
              </h3>
              <p className="text-xs text-slate-500 font-mono">Certificate No: {activePreviewDoc.certNo}</p>

              <div className="bg-[#f8f9ff] border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
                <p><strong>Citizen Name:</strong> {user.name}</p>
                <p><strong>Aadhaar Masked:</strong> {user.aadhaarMasked}</p>
                <p><strong>District:</strong> {user.district}</p>
                <p><strong>Issuing Officer:</strong> {activePreviewDoc.authorityEn}</p>
                <p><strong>Date of Issue:</strong> {activePreviewDoc.issueDate}</p>
                <p><strong>Validity:</strong> Statutory 3 Years (Valid till 2029)</p>
              </div>

              {/* QR Code Simulation */}
              <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-4">
                <div className="w-16 h-16 bg-slate-900 text-white rounded flex items-center justify-center font-mono text-[9px] p-1 text-center">
                  [2D SECURE QR CODE]
                </div>
                <div className="text-left text-[11px] text-slate-600">
                  <p className="font-bold text-emerald-800">✓ Cryptographically Signed</p>
                  <p>SHA-256: e8f9...391a</p>
                  <p>National e-Governance Division (NeGD)</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setActivePreviewDoc(null)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  alert(`Downloading digitally signed certificate ${activePreviewDoc.certNo}...`);
                  setActivePreviewDoc(null);
                }}
                className="bg-[#003b5a] hover:bg-[#002840] text-white px-5 py-2 rounded-lg text-xs font-bold flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
