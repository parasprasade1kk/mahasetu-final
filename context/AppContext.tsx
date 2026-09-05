'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'mr';
type FontSize = 'normal' | 'large' | 'xlarge';

export interface ApplicationRecord {
  id: string;
  serviceName: string;
  serviceNameMr: string;
  department: string;
  departmentMr: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Scrutiny' | 'Field Verification' | 'Approved / Issued' | 'Action Required';
  statusColor: string;
  downloadUrl?: string;
  applicantName: string;
  district: string;
}

export interface ConsentItem {
  id: string;
  requestingDept: string;
  requestingDeptMr: string;
  sourceDept: string;
  sourceDeptMr: string;
  purpose: string;
  purposeMr: string;
  dataFields: string[];
  status: 'Active' | 'Revoked' | 'Pending Approval';
  validUntil: string;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;
  isLoggedIn: boolean;
  user: {
    name: string;
    aadhaarMasked: string;
    mobile: string;
    email: string;
    district: string;
    digiLockerLinked: boolean;
  };
  login: () => void;
  logout: () => void;
  applications: ApplicationRecord[];
  addApplication: (app: ApplicationRecord) => void;
  consents: ConsentItem[];
  toggleConsent: (id: string) => void;
}

const initialApplications: ApplicationRecord[] = [
  {
    id: 'MH-REV-2025-88319',
    serviceName: 'Income Certificate (1 Year)',
    serviceNameMr: 'उत्पन्नाचा दाखला (१ वर्ष)',
    department: 'Revenue Department',
    departmentMr: 'महसूल विभाग',
    appliedDate: '02 Sep 2026',
    status: 'Approved / Issued',
    statusColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    downloadUrl: '#',
    applicantName: 'Rajesh Patil',
    district: 'Pune'
  },
  {
    id: 'MH-EDU-2026-44102',
    serviceName: 'Post-Matric Scholarship for OBC Students',
    serviceNameMr: 'इतर मागासवर्गीय विद्यार्थ्यांसाठी मॅट्रिकोत्तर शिष्यवृत्ती',
    department: 'Higher & Technical Education',
    departmentMr: 'उच्च व तंत्रशिक्षण विभाग',
    appliedDate: '04 Sep 2026',
    status: 'Under Scrutiny',
    statusColor: 'bg-amber-100 text-amber-800 border-amber-300',
    applicantName: 'Rajesh Patil',
    district: 'Pune'
  },
  {
    id: 'MH-SOC-2026-11928',
    serviceName: 'Caste Validity Certificate Verification',
    serviceNameMr: 'जात पडताळणी प्रमाणपत्र पडताळणी',
    department: 'Social Justice & Special Assistance',
    departmentMr: 'सामाजिक न्याय व विशेष सहाय्य विभाग',
    appliedDate: '28 Aug 2026',
    status: 'Field Verification',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-300',
    applicantName: 'Rajesh Patil',
    district: 'Pune'
  }
];

const initialConsents: ConsentItem[] = [
  {
    id: 'CNS-2026-001',
    requestingDept: 'Higher & Technical Education Department',
    requestingDeptMr: 'उच्च व तंत्रशिक्षण विभाग',
    sourceDept: 'Revenue Department (e-Mahabhumi / DigiLocker)',
    sourceDeptMr: 'महसूल विभाग (ई-महाभूमी / डिजिलॉकर)',
    purpose: 'Automatic income tier verification for MahaDBT scholarship disbursal',
    purposeMr: 'महाडीबीटी शिष्यवृत्ती वितरणासाठी स्वयंचलित उत्पन्न पडताळणी',
    dataFields: ['Income Certificate 2025-26', 'Aadhaar Masked Ref', 'Caste Certificate Ref'],
    status: 'Active',
    validUntil: '31 Mar 2027'
  },
  {
    id: 'CNS-2026-002',
    requestingDept: 'Agriculture Department (e-Pik Pahani)',
    requestingDeptMr: 'कृषी विभाग (ई-पीक पाहणी)',
    sourceDept: 'Revenue Department (7/12 Land Registry)',
    sourceDeptMr: 'महसूल विभाग (७/१२ जमीन नोंदणी)',
    purpose: 'Verification of land ownership for PM Kisan & Namo Shetkari Mahasanman Yojana',
    purposeMr: 'पीएम किसान आणि नमो शेतकरी महासन्मान योजनेसाठी जमिनीच्या मालकीची पडताळणी',
    dataFields: ['7/12 Extract (Record of Rights)', 'Gat Number', 'Crop Survey 2026'],
    status: 'Active',
    validUntil: '31 Dec 2026'
  },
  {
    id: 'CNS-2026-003',
    requestingDept: 'Food & Civil Supplies Department',
    requestingDeptMr: 'अन्न व नागरी पुरवठा विभाग',
    sourceDept: 'Social Justice Department',
    sourceDeptMr: 'सामाजिक न्याय विभाग',
    purpose: 'Ration card category update with welfare beneficiary registry',
    purposeMr: 'कल्याणकारी लाभार्थी नोंदणीसह शिधापत्रिका वर्गवारी अद्ययावतीकरण',
    dataFields: ['BPL / Antyodaya Category Attestation'],
    status: 'Pending Approval',
    validUntil: 'Expires in 3 days'
  }
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [consents, setConsents] = useState<ConsentItem[]>(initialConsents);

  const user = {
    name: language === 'mr' ? 'राजेश पाटिल' : 'Rajesh Patil',
    aadhaarMasked: 'XXXX-XXXX-4821',
    mobile: '+91 98230 *****',
    email: 'rajesh.patil@example.in',
    district: language === 'mr' ? 'पुणे (महाराष्ट्र)' : 'Pune (Maharashtra)',
    digiLockerLinked: true
  };

  const login = () => setIsLoggedIn(true);
  const logout = () => setIsLoggedIn(false);

  const addApplication = (app: ApplicationRecord) => {
    setApplications(prev => [app, ...prev]);
  };

  const toggleConsent = (id: string) => {
    setConsents(prev =>
      prev.map(item => {
        if (item.id === id) {
          const nextStatus = item.status === 'Active' ? 'Revoked' : 'Active';
          return { ...item, status: nextStatus };
        }
        return item;
      })
    );
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        fontSize,
        setFontSize,
        isHighContrast,
        setIsHighContrast,
        isLoggedIn,
        user,
        login,
        logout,
        applications,
        addApplication,
        consents,
        toggleConsent
      }}
    >
      <div
        className={`min-h-screen ${
          fontSize === 'large' ? 'text-lg' : fontSize === 'xlarge' ? 'text-xl' : 'text-base'
        } ${isHighContrast ? 'contrast-125 saturate-150' : ''}`}
      >
        {children}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
