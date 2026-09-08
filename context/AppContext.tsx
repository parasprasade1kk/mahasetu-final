'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { RegisteredUser, CitizenProfile, findAuthorizedUser, ACCESS_DENIED_ERROR_MESSAGE } from '@/lib/authConfig';

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

interface AppUser {
  name: string;
  aadhaarMasked: string;
  mobile: string;
  email: string;
  district: string;
  digiLockerLinked: boolean;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  isHighContrast: boolean;
  setIsHighContrast: (val: boolean) => void;

  // Authentication & Profile State
  isAuthLoaded: boolean;
  isLoggedIn: boolean;
  currentUser: RegisteredUser | null;
  userProfile: CitizenProfile | null;
  isProfileComplete: boolean;
  loginWithMobile: (mobile: string) => { success: boolean; user?: RegisteredUser; error?: string };
  saveUserProfile: (profile: CitizenProfile) => void;
  login: () => void; // Legacy fallback
  logout: () => void;

  // Dynamic user object for backward compatibility
  user: AppUser;

  // Applications & Consents
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
    applicantName: 'Paras Prasade',
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
    applicantName: 'Paras Prasade',
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
    applicantName: 'Paras Prasade',
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

const STORAGE_KEY_AUTH_USER = 'mahasetu_auth_user';
const STORAGE_KEY_USER_PROFILE = 'mahasetu_user_profile_';

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');
  const [fontSize, setFontSize] = useState<FontSize>('normal');
  const [isHighContrast, setIsHighContrast] = useState<boolean>(false);

  // Authentication State
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [userProfile, setUserProfile] = useState<CitizenProfile | null>(null);

  const [applications, setApplications] = useState<ApplicationRecord[]>(initialApplications);
  const [consents, setConsents] = useState<ConsentItem[]>(initialConsents);

  // Load authentication from localStorage on mount
  useEffect(() => {
    try {
      const savedUserStr = localStorage.getItem(STORAGE_KEY_AUTH_USER);
      if (savedUserStr) {
        const savedUser: RegisteredUser = JSON.parse(savedUserStr);
        // Verify user is legitimately authorized
        const verified = findAuthorizedUser(savedUser.mobile);
        if (verified) {
          setCurrentUser(verified);
          setIsLoggedIn(true);

          // Check if profile exists for this mobile
          const savedProfileStr = localStorage.getItem(`${STORAGE_KEY_USER_PROFILE}${verified.mobile}`);
          if (savedProfileStr) {
            setUserProfile(JSON.parse(savedProfileStr));
          }
        } else {
          localStorage.removeItem(STORAGE_KEY_AUTH_USER);
        }
      }
    } catch {
      // Ignore JSON parse errors on invalid storage
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  const isProfileComplete = Boolean(userProfile && userProfile.confirmedAccurate);

  const loginWithMobile = (mobile: string): { success: boolean; user?: RegisteredUser; error?: string } => {
    const authorized = findAuthorizedUser(mobile);
    if (!authorized) {
      return {
        success: false,
        error: ACCESS_DENIED_ERROR_MESSAGE
      };
    }

    setCurrentUser(authorized);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(authorized));
      const profileKey = `${STORAGE_KEY_USER_PROFILE}${authorized.mobile}`;
      const existingProfileStr = localStorage.getItem(profileKey);
      if (existingProfileStr) {
        setUserProfile(JSON.parse(existingProfileStr));
      } else {
        setUserProfile(null);
      }
    } catch {
      // Storage quota or browser privacy mode
    }

    return {
      success: true,
      user: authorized
    };
  };

  const saveUserProfile = (profile: CitizenProfile) => {
    setUserProfile(profile);
    if (currentUser) {
      try {
        localStorage.setItem(`${STORAGE_KEY_USER_PROFILE}${currentUser.mobile}`, JSON.stringify(profile));
      } catch {
        // Handle error gracefully
      }
    }
  };

  const login = () => {
    // Default fallback to first authorized citizen if called without args
    const defaultUser = findAuthorizedUser('7276218598');
    if (defaultUser) {
      setCurrentUser(defaultUser);
      setIsLoggedIn(true);
      try {
        localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(defaultUser));
      } catch {
        // Ignore
      }
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserProfile(null);
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch {
      // Ignore
    }
  };

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

  // Dynamically constructed backward-compatible user object
  const user: AppUser = {
    name: currentUser
      ? (language === 'mr' ? currentUser.nameMr : currentUser.name)
      : (language === 'mr' ? 'नागरिक' : 'Citizen'),
    aadhaarMasked: currentUser ? currentUser.aadhaarMasked : 'XXXX-XXXX-0000',
    mobile: currentUser ? `+91 ${currentUser.mobile}` : '+91 XXXXX XXXXX',
    email: currentUser ? currentUser.email : 'citizen@mahasetu.gov.in',
    district: userProfile
      ? (language === 'mr' ? `${userProfile.district} (महाराष्ट्र)` : `${userProfile.district} (Maharashtra)`)
      : (language === 'mr' ? 'पुणे (महाराष्ट्र)' : 'Pune (Maharashtra)'),
    digiLockerLinked: true
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
        isAuthLoaded,
        isLoggedIn,
        currentUser,
        userProfile,
        isProfileComplete,
        loginWithMobile,
        saveUserProfile,
        login,
        logout,
        user,
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
