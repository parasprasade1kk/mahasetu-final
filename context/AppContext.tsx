'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CitizenAccount,
  CitizenProfile,
  findAccount,
  registerAccount,
  loadAccounts,
  SEED_ACCOUNTS,
  maskAadhaar,
} from '@/lib/authConfig';
import {
  authApi,
  profileApi,
  applicationApi,
  consentApi,
  setCitizenToken,
  removeCitizenToken,
  getCitizenToken,
} from '@/lib/api';

type Language = 'en' | 'mr';
type FontSize = 'normal' | 'large' | 'xlarge';

export interface ApplicationRecord {
  id: string;
  serviceName: string;
  serviceNameMr: string;
  department: string;
  departmentMr: string;
  appliedDate: string;
  status: 'Submitted' | 'Under Scrutiny' | 'Field Verification' | 'Approved / Issued' | 'Action Required' | 'Approved' | 'Under Review' | 'Document Verification' | 'Rejected' | 'Completed' | string;
  statusColor: string;
  downloadUrl?: string;
  applicantName: string;
  district: string;
  serviceId?: string;
  schemeId?: string;
  applicationType?: 'scheme' | 'service';
  updatedAt?: string;
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
  currentUser: CitizenAccount | null;
  userProfile: CitizenProfile | null;
  isProfileComplete: boolean;

  // Auth Actions
  loginWithMobile: (mobile: string, aadhaar?: string) => Promise<{ success: boolean; user?: CitizenAccount; error?: string }>;
  registerUser: (name: string, mobile: string, aadhaar?: string, consent?: boolean) => Promise<{ success: boolean; user?: CitizenAccount; error?: string }>;
  saveUserProfile: (profile: CitizenProfile) => void;
  login: () => void; // Legacy fallback
  logout: () => void;

  // Dynamic user object for backward compatibility
  user: AppUser;

  // Applications & Consents
  applications: ApplicationRecord[];
  addApplication: (app: Partial<ApplicationRecord> & { serviceName: string; department: string }) => Promise<ApplicationRecord>;
  refreshApplications: () => Promise<void>;
  consents: ConsentItem[];
  toggleConsent: (id: string) => void;
}

// ─── Default Seed Applications (shown for first-time sessions) ───────────────
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
    applicantName: 'Citizen',
    district: 'Maharashtra'
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
    applicantName: 'Citizen',
    district: 'Maharashtra'
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
    applicantName: 'Citizen',
    district: 'Maharashtra'
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
  const [currentUser, setCurrentUser] = useState<CitizenAccount | null>(null);
  const [userProfile, setUserProfile] = useState<CitizenProfile | null>(null);

  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [consents, setConsents] = useState<ConsentItem[]>([]);

  // ─── Hydrate session on mount (from MongoDB API / localStorage) ───────────
  useEffect(() => {
    loadAccounts();

    async function hydrate() {
      const token = getCitizenToken();
      if (token) {
        try {
          const res = await authApi.getMe();
          if (res.success && res.user) {
            const citizenAccount: CitizenAccount = {
              id: res.user.userId,
              name: res.user.fullName,
              nameMr: res.user.fullNameMr || res.user.fullName,
              mobile: res.user.mobile,
              email: res.user.email,
              aadhaarMasked: res.user.aadhaarMasked,
              createdAt: res.user.createdAt,
              role: 'citizen',
            };
            setCurrentUser(citizenAccount);
            setIsLoggedIn(true);

            if (res.profile) {
              setUserProfile(res.profile);
            }

            // Load user's applications and consents from MongoDB
            const [appsRes, consentsRes] = await Promise.all([
              applicationApi.getMy(),
              consentApi.getMy(),
            ]);

            if (appsRes.success && Array.isArray(appsRes.applications)) {
              setApplications(
                appsRes.applications.map((a: any) => ({
                  id: a.applicationId,
                  serviceName: a.serviceName,
                  serviceNameMr: a.serviceNameMr || a.serviceName,
                  department: a.department,
                  departmentMr: a.departmentMr || a.department,
                  appliedDate: a.appliedDate,
                  status: a.status,
                  statusColor: a.statusColor,
                  downloadUrl: a.downloadUrl,
                  applicantName: a.applicantName,
                  district: a.district,
                  serviceId: a.serviceId,
                  schemeId: a.schemeId,
                  applicationType: a.applicationType,
                  updatedAt: a.updatedAt || a.lastUpdated,
                }))
              );
            } else {
              setApplications([]);
            }

            if (consentsRes.success && Array.isArray(consentsRes.consents)) {
              setConsents(
                consentsRes.consents.map((c: any) => ({
                  id: c.consentId,
                  requestingDept: c.requestingDept,
                  requestingDeptMr: c.requestingDeptMr || c.requestingDept,
                  sourceDept: c.sourceDept,
                  sourceDeptMr: c.sourceDeptMr || c.sourceDept,
                  purpose: c.purpose,
                  purposeMr: c.purposeMr || c.purpose,
                  dataFields: c.dataFields || [],
                  status: c.status,
                  validUntil: c.validUntil,
                }))
              );
            } else {
              setConsents([]);
            }
            setIsAuthLoaded(true);
            return;
          }
        } catch {
          // Fallback to local storage
        }
      }

      // Local storage fallback
      try {
        const savedUserStr = localStorage.getItem(STORAGE_KEY_AUTH_USER);
        if (savedUserStr) {
          const savedUser: CitizenAccount = JSON.parse(savedUserStr);
          const verified = findAccount(savedUser.mobile);
          if (verified) {
            setCurrentUser(verified);
            setIsLoggedIn(true);
            const savedProfileStr = localStorage.getItem(`${STORAGE_KEY_USER_PROFILE}${verified.mobile}`);
            if (savedProfileStr) {
              setUserProfile(JSON.parse(savedProfileStr));
            }
          }
        }
      } catch {
        // Ignore JSON error
      } finally {
        setIsAuthLoaded(true);
      }
    }

    hydrate();
  }, []);

  const isProfileComplete = Boolean(userProfile && userProfile.confirmedAccurate);

  // ─── Login (existing registered citizen) ─────────────────────────────────
  const loginWithMobile = async (
    mobile: string,
    aadhaar?: string
  ): Promise<{ success: boolean; user?: CitizenAccount; error?: string }> => {
    const clean = mobile.replace(/\D/g, '');

    try {
      const res = await authApi.login(clean, aadhaar, '123456');

      if (res.success && res.user) {
        const citizenAccount: CitizenAccount = {
          id: res.user.userId,
          name: res.user.fullName,
          nameMr: res.user.fullNameMr || res.user.fullName,
          mobile: res.user.mobile,
          email: res.user.email,
          aadhaarMasked: res.user.aadhaarMasked,
          createdAt: res.user.createdAt,
          role: 'citizen',
        };

        if (res.token) setCitizenToken(res.token);
        setCurrentUser(citizenAccount);
        setIsLoggedIn(true);

        if (res.profile) {
          setUserProfile(res.profile);
        }

        try {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(citizenAccount));
          const profileKey = `${STORAGE_KEY_USER_PROFILE}${citizenAccount.mobile}`;
          if (res.profile) {
            localStorage.setItem(profileKey, JSON.stringify(res.profile));
          }
        } catch {}

        // Hydrate applications and consents from MongoDB
        try {
          const [appsRes, consentsRes] = await Promise.all([
            applicationApi.getMy(),
            consentApi.getMy(),
          ]);
          if (appsRes.success && Array.isArray(appsRes.applications)) {
            setApplications(
              appsRes.applications.map((a: any) => ({
                id: a.applicationId,
                serviceName: a.serviceName,
                serviceNameMr: a.serviceNameMr || a.serviceName,
                department: a.department,
                departmentMr: a.departmentMr || a.department,
                appliedDate: a.appliedDate,
                status: a.status,
                statusColor: a.statusColor,
                downloadUrl: a.downloadUrl,
                applicantName: a.applicantName,
                district: a.district,
                serviceId: a.serviceId,
                schemeId: a.schemeId,
                applicationType: a.applicationType,
                updatedAt: a.updatedAt || a.lastUpdated,
              }))
            );
          } else {
            setApplications([]);
          }
          if (consentsRes.success && Array.isArray(consentsRes.consents)) {
            setConsents(
              consentsRes.consents.map((c: any) => ({
                id: c.consentId,
                requestingDept: c.requestingDept,
                requestingDeptMr: c.requestingDeptMr || c.requestingDept,
                sourceDept: c.sourceDept,
                sourceDeptMr: c.sourceDeptMr || c.sourceDept,
                purpose: c.purpose,
                purposeMr: c.purposeMr || c.purpose,
                dataFields: c.dataFields || [],
                status: c.status,
                validUntil: c.validUntil,
              }))
            );
          } else {
            setConsents([]);
          }
        } catch {}

        return { success: true, user: citizenAccount };
      }

      // If backend fails or not found, check local account
      const localAccount = findAccount(clean);
      if (localAccount) {
        if (aadhaar && aadhaar.replace(/\D/g, '').length === 12) {
          localAccount.aadhaarMasked = maskAadhaar(aadhaar);
        }
        setCurrentUser(localAccount);
        setIsLoggedIn(true);
        try {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(localAccount));
        } catch {}
        return { success: true, user: localAccount };
      }

      return {
        success: false,
        error: res.error || 'No account found for this mobile number. Please create a new account.',
      };
    } catch (err: any) {
      const localAccount = findAccount(clean);
      if (localAccount) {
        setCurrentUser(localAccount);
        setIsLoggedIn(true);
        return { success: true, user: localAccount };
      }
      return {
        success: false,
        error: err.message || 'Login failed. Please try again.',
      };
    }
  };

  // ─── Register (new citizen) ───────────────────────────────────────────────
  const registerUser = async (
    name: string,
    mobile: string,
    aadhaar?: string,
    consent: boolean = true
  ): Promise<{ success: boolean; user?: CitizenAccount; error?: string }> => {
    if (!name || name.trim().length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }
    const clean = mobile.replace(/\D/g, '');
    if (clean.length !== 10) {
      return { success: false, error: 'Please enter a valid 10-digit mobile number.' };
    }

    try {
      // 1. Persist new citizen in MongoDB Atlas via /api/auth/register
      const res = await authApi.register(name.trim(), clean, aadhaar, '123456', consent);

      if (res.success && res.user) {
        const citizenAccount: CitizenAccount = {
          id: res.user.userId,
          name: res.user.fullName,
          nameMr: res.user.fullNameMr || res.user.fullName,
          mobile: res.user.mobile,
          email: res.user.email,
          aadhaarMasked: res.user.aadhaarMasked,
          createdAt: res.user.createdAt,
          role: 'citizen',
        };

        if (res.token) setCitizenToken(res.token);
        setCurrentUser(citizenAccount);
        setIsLoggedIn(true);
        setUserProfile(res.profile || null);
        setApplications([]);
        setConsents([]);

        try {
          localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(citizenAccount));
          registerAccount(name, clean, aadhaar);
        } catch {}

        return { success: true, user: citizenAccount };
      }

      return {
        success: false,
        error: res.error || 'Failed to create account. Please try again.',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to create account. Please try again.',
      };
    }
  };

  // ─── Save / Update Citizen Profile ────────────────────────────────────────
  const saveUserProfile = (profile: CitizenProfile) => {
    setUserProfile(profile);
    if (currentUser) {
      try {
        localStorage.setItem(`${STORAGE_KEY_USER_PROFILE}${currentUser.mobile}`, JSON.stringify(profile));
      } catch {
        // Handle quota errors gracefully
      }
      // Save to MongoDB Atlas via backend API
      profileApi.updateProfile(profile).catch((err) => {
        console.warn('Backend profile update deferred:', err);
      });
    }
  };

  // ─── Legacy Fallback Login (backward compat) ──────────────────────────────
  const login = () => {
    const firstSeed = SEED_ACCOUNTS[0];
    setCurrentUser(firstSeed);
    setIsLoggedIn(true);
    try {
      localStorage.setItem(STORAGE_KEY_AUTH_USER, JSON.stringify(firstSeed));
    } catch {
      // Ignore
    }
  };

  // ─── Logout ───────────────────────────────────────────────────────────────
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    setUserProfile(null);
    setApplications([]);
    setConsents([]);
    removeCitizenToken();
    try {
      localStorage.removeItem(STORAGE_KEY_AUTH_USER);
    } catch {
      // Ignore
    }
  };

  const refreshApplications = async () => {
    try {
      const res = await applicationApi.getMy();
      if (res.success && Array.isArray(res.applications)) {
        setApplications(
          res.applications.map((a: any) => ({
            id: a.applicationId,
            serviceName: a.serviceName,
            serviceNameMr: a.serviceNameMr || a.serviceName,
            department: a.department,
            departmentMr: a.departmentMr || a.department,
            appliedDate: a.appliedDate,
            status: a.status,
            statusColor: a.statusColor,
            downloadUrl: a.downloadUrl,
            applicantName: a.applicantName,
            district: a.district,
            serviceId: a.serviceId,
            schemeId: a.schemeId,
            applicationType: a.applicationType,
            updatedAt: a.updatedAt || a.lastUpdated,
          }))
        );
      }
    } catch {}
  };

  const addApplication = async (app: Partial<ApplicationRecord> & { serviceName: string; department: string }): Promise<ApplicationRecord> => {
    const fallbackRecord: ApplicationRecord = {
      id: app.id || `MH-GEN-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      serviceName: app.serviceName,
      serviceNameMr: app.serviceNameMr || app.serviceName,
      department: app.department,
      departmentMr: app.departmentMr || app.department,
      appliedDate: app.appliedDate || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      status: app.status || 'Submitted',
      statusColor: app.statusColor || 'bg-blue-100 text-blue-800 border-blue-300',
      applicantName: app.applicantName || user.name,
      district: app.district || 'Maharashtra',
      serviceId: app.serviceId,
      schemeId: app.schemeId,
      applicationType: app.applicationType || (app.schemeId ? 'scheme' : 'service'),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await applicationApi.submit({
        applicationId: app.id,
        serviceId: app.serviceId || app.schemeId,
        schemeId: app.schemeId,
        serviceName: app.serviceName,
        serviceNameMr: app.serviceNameMr,
        department: app.department,
        departmentMr: app.departmentMr,
        district: app.district,
        appliedDate: app.appliedDate,
        status: app.status || 'Submitted',
        applicationType: app.applicationType || (app.schemeId ? 'scheme' : 'service'),
      });

      if (res.success && res.application) {
        const dbApp: ApplicationRecord = {
          id: res.application.applicationId,
          serviceName: res.application.serviceName,
          serviceNameMr: res.application.serviceNameMr || res.application.serviceName,
          department: res.application.department,
          departmentMr: res.application.departmentMr || res.application.department,
          appliedDate: res.application.appliedDate,
          status: res.application.status,
          statusColor: res.application.statusColor || 'bg-blue-100 text-blue-800 border-blue-300',
          applicantName: res.application.applicantName,
          district: res.application.district,
          serviceId: res.application.serviceId,
          schemeId: res.application.schemeId,
          applicationType: res.application.applicationType,
          updatedAt: res.application.updatedAt || res.application.lastUpdated,
        };
        setApplications(prev => [dbApp, ...prev.filter(a => a.id !== dbApp.id)]);
        return dbApp;
      }
    } catch {}

    setApplications(prev => [fallbackRecord, ...prev.filter(a => a.id !== fallbackRecord.id)]);
    return fallbackRecord;
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
    consentApi.toggle(id).catch(() => {});
  };

  // ─── Backward-Compatible User Object ─────────────────────────────────────
  // Prefer the profile's fullName if it exists, then account name, then fallback.
  const displayName = userProfile?.fullName || currentUser?.name || (language === 'mr' ? 'नागरिक' : 'Citizen');
  const displayNameMr = currentUser?.nameMr || displayName;

  const user: AppUser = {
    name: language === 'mr' ? displayNameMr : displayName,
    aadhaarMasked: currentUser?.aadhaarMasked || 'XXXX XXXX 0000',
    mobile: currentUser ? `+91 ${currentUser.mobile}` : '+91 XXXXX XXXXX',
    email: currentUser?.email || 'citizen@mahasetu.gov.in',
    district: userProfile
      ? (language === 'mr' ? `${userProfile.district} (महाराष्ट्र)` : `${userProfile.district} (Maharashtra)`)
      : (language === 'mr' ? 'महाराष्ट्र' : 'Maharashtra'),
    digiLockerLinked: Boolean(userProfile?.digiLockerLinked)
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
        registerUser,
        saveUserProfile,
        login,
        logout,
        user,
        applications,
        addApplication,
        refreshApplications,
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
