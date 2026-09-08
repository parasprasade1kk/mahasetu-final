'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { normalizeMobileNumber, findAccount, SEED_ACCOUNTS } from '@/lib/authConfig';

// ─── Tab Type ─────────────────────────────────────────────────────────────────
type ActiveTab = 'login' | 'register';

// ─── Registration Step ────────────────────────────────────────────────────────
type RegStep = 'mobile' | 'details';

// ─── CAPTCHA Generator ────────────────────────────────────────────────────────
function genCaptcha(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let r = '';
  for (let i = 0; i < 5; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
  return r;
}

// ─── Mock OTP Generator ───────────────────────────────────────────────────────
function genOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function LoginPage() {
  const router = useRouter();
  const { language, loginWithMobile, registerUser, isLoggedIn, isProfileComplete } = useApp();

  const [activeTab, setActiveTab] = useState<ActiveTab>('login');

  // ── Login form state ──────────────────────────────────────────────────────
  const [loginMobile, setLoginMobile] = useState('');
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpGenerated, setLoginOtpGenerated] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);
  const [loginCaptchaCode, setLoginCaptchaCode] = useState('');
  const [loginCaptchaInput, setLoginCaptchaInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // ── Register form state ───────────────────────────────────────────────────
  const [regStep, setRegStep] = useState<RegStep>('mobile');
  const [regMobile, setRegMobile] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regOtpGenerated, setRegOtpGenerated] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regName, setRegName] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [regLoading, setRegLoading] = useState(false);

  // ── Init captcha on mount ─────────────────────────────────────────────────
  const refreshCaptcha = useCallback(() => {
    setLoginCaptchaCode(genCaptcha());
    setLoginCaptchaInput('');
  }, []);

  useEffect(() => { refreshCaptcha(); }, [refreshCaptcha]);

  // ── Redirect if already authenticated ────────────────────────────────────
  useEffect(() => {
    if (isLoggedIn) {
      router.replace(isProfileComplete ? '/dashboard' : '/onboarding');
    }
  }, [isLoggedIn, isProfileComplete, router]);

  // ─── Tab switch resets ────────────────────────────────────────────────────
  const switchTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setLoginError(''); setLoginSuccess('');
    setRegError(''); setRegSuccess('');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // LOGIN HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleLoginGetOtp = () => {
    setLoginError(''); setLoginSuccess('');
    const clean = normalizeMobileNumber(loginMobile);
    if (!clean || clean.length !== 10) {
      setLoginError(language === 'mr'
        ? 'कृपया १० अंकी वैध मोबाईल क्रमांक प्रविष्ट करा.'
        : 'Please enter a valid 10-digit mobile number.');
      return;
    }
    // Check if account exists
    const account = findAccount(clean);
    if (!account) {
      setLoginError(language === 'mr'
        ? 'हा मोबाईल क्रमांक नोंदणीकृत नाही. कृपया नवीन खाते तयार करा.'
        : 'This mobile number is not registered. Please create a new account.');
      return;
    }
    const otp = genOtp();
    setLoginOtpGenerated(otp);
    setLoginOtp(otp);
    setLoginOtpSent(true);
    setLoginSuccess(language === 'mr'
      ? `${account.name} यांच्यासाठी OTP तयार केला आहे.`
      : `OTP generated for ${account.name}. Check the code below.`);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(''); setLoginSuccess('');

    const clean = normalizeMobileNumber(loginMobile);
    if (!clean || clean.length !== 10) {
      setLoginError('Please enter a valid 10-digit mobile number.'); return;
    }
    if (!loginCaptchaInput || loginCaptchaInput.trim().toUpperCase() !== loginCaptchaCode.toUpperCase()) {
      setLoginError('Security CAPTCHA verification failed. Please check the code and try again.');
      refreshCaptcha(); return;
    }
    if (!loginOtp || loginOtp.length < 6) {
      setLoginError('Please enter the 6-digit OTP.'); return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      const result = loginWithMobile(clean);
      setLoginLoading(false);
      if (result.success) {
        const profileKey = `mahasetu_user_profile_${clean}`;
        const hasProfile = Boolean(localStorage.getItem(profileKey));
        router.push(hasProfile ? '/dashboard' : '/onboarding');
      } else {
        setLoginError(result.error || 'Login failed. Please try again.');
      }
    }, 600);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // REGISTER HANDLERS
  // ═══════════════════════════════════════════════════════════════════════════

  const handleRegGetOtp = () => {
    setRegError(''); setRegSuccess('');
    const clean = normalizeMobileNumber(regMobile);
    if (!clean || clean.length !== 10) {
      setRegError('Please enter a valid 10-digit mobile number.'); return;
    }
    // Check if already registered
    const existing = findAccount(clean);
    if (existing) {
      setRegError(`This mobile number is already registered as "${existing.name}". Please use the Login tab.`);
      return;
    }
    const otp = genOtp();
    setRegOtpGenerated(otp);
    setRegOtp(otp);
    setRegOtpSent(true);
    setRegSuccess('OTP sent! Verify to continue. Check the code below.');
  };

  const handleRegVerifyOtp = () => {
    setRegError(''); setRegSuccess('');
    if (!regOtp || regOtp.length < 6) {
      setRegError('Please enter the 6-digit OTP.'); return;
    }
    // In demo mode OTP auto-fills — verification always passes with correct code
    // PRODUCTION: call real OTP verification API here
    setRegStep('details');
    setRegSuccess('');
  };

  const handleRegCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(''); setRegSuccess('');

    if (!regName || regName.trim().length < 2) {
      setRegError('Please enter your full name (at least 2 characters).'); return;
    }

    setRegLoading(true);
    setTimeout(() => {
      const result = registerUser(regName.trim(), regMobile);
      setRegLoading(false);
      if (result.success) {
        router.push('/onboarding');
      } else {
        setRegError(result.error || 'Failed to create account. Please try again.');
      }
    }, 700);
  };

  // ─── Shared Alert Components ──────────────────────────────────────────────
  const ErrorBox = ({ msg }: { msg: string }) => msg ? (
    <div className="mb-4 p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
      <span className="material-symbols-outlined text-[20px] text-red-600 flex-shrink-0 mt-0.5">error</span>
      <p className="font-semibold leading-relaxed">{msg}</p>
    </div>
  ) : null;

  const SuccessBox = ({ msg }: { msg: string }) => msg ? (
    <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
      <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
      <p className="font-medium mt-0.5">{msg}</p>
    </div>
  ) : null;

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-stretch">
      <div className="flex w-full">

        {/* ── Left Panel: Branding ─────────────────────────────────────────── */}
        <div className="hidden lg:flex w-5/12 bg-[#003b5a] text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Subtle dot grid */}
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 30%, #ffffff 1px, transparent 1px), radial-gradient(circle at 80% 70%, #ffffff 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/10 text-amber-400 flex items-center justify-center p-2 border border-amber-400/40">
                <span className="material-symbols-outlined text-[28px]">account_balance</span>
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight text-white">MahaSetu</span>
                <span className="text-amber-400 font-medium text-lg ml-2">| महासेतू</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              {language === 'mr'
                ? 'महाराष्ट्र शासन • नागरिक ओळख व सेवा वितरण व्यासपीठ'
                : 'Government of Maharashtra • Citizen Identity & Service Delivery'}
            </p>
          </div>

          <div className="relative z-10 space-y-6 max-w-md my-auto py-10">
            {/* Open access badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-emerald-400/30">
              <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
              <span>Open Citizen Registration</span>
            </div>

            <h2 className="text-3xl font-extrabold leading-tight text-white">
              {language === 'mr' ? (
                <>
                  एक नागरिक.<br />
                  एक संमती.<br />
                  एकच डिजिटल प्रवास.
                </>
              ) : (
                <>
                  One Citizen.<br />
                  One Consent.<br />
                  One Digital Journey.
                </>
              )}
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed">
              {language === 'mr'
                ? 'महाराष्ट्रातील कोणताही नागरिक नोंदणी करू शकतो. ४००+ शासकीय सेवा व कल्याणकारी योजनांमध्ये अखंड प्रवेश.'
                : 'Any citizen of Maharashtra can register and access 400+ government services and welfare schemes — instantly and securely.'}
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <span>Mobile OTP Verification</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">lock</span>
                <span>Per-User Isolated Profile & Data</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">security</span>
                <span>Digital Personal Data Protection (DPDP) 2023 Compliant</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">auto_awesome</span>
                <span>Personalized Scheme Recommendations</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-400">
            © 2026 Government of Maharashtra. Trusted Digital Public Infrastructure.
          </div>
        </div>

        {/* ── Right Panel: Auth Forms ──────────────────────────────────────── */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#f8f9ff]">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center p-2 border border-amber-400/30">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div>
                <span className="text-xl font-bold text-[#003b5a]">MahaSetu | महासेतू</span>
                <p className="text-[10px] text-slate-500">Government of Maharashtra</p>
              </div>
            </div>

            {/* Card */}
            <div className="bg-white rounded-2xl shadow-gov-lg border border-slate-200 overflow-hidden">

              {/* Tab Bar */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => switchTab('login')}
                  className={`flex-1 py-4 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'login'
                      ? 'text-[#003b5a] border-b-2 border-[#003b5a] bg-white'
                      : 'text-slate-500 hover:text-slate-700 bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  {language === 'mr' ? 'लॉगिन' : 'Login'}
                </button>
                <button
                  onClick={() => switchTab('register')}
                  className={`flex-1 py-4 text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'register'
                      ? 'text-[#003b5a] border-b-2 border-[#003b5a] bg-white'
                      : 'text-slate-500 hover:text-slate-700 bg-slate-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">person_add</span>
                  {language === 'mr' ? 'नवीन खाते तयार करा' : 'Create Account'}
                </button>
              </div>

              <div className="p-8 sm:p-10">

                {/* ══════════════════════════════════════════════════════════ */}
                {/* LOGIN TAB                                                  */}
                {/* ══════════════════════════════════════════════════════════ */}
                {activeTab === 'login' && (
                  <div>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                          {language === 'mr' ? 'नागरिक ओळख पडताळणी' : 'Existing Citizen Login'}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                          MahaSetu SSO
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-[#003b5a]">
                        {language === 'mr' ? 'महासेतू लॉगिन' : 'Sign In to MahaSetu'}
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        {language === 'mr'
                          ? 'आपल्या नोंदणीकृत मोबाईल क्रमांकासह प्रवेश करा'
                          : 'Enter your registered mobile number to receive an OTP'}
                      </p>
                    </div>

                    <ErrorBox msg={loginError} />
                    <SuccessBox msg={loginSuccess} />

                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      {/* Mobile */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs font-bold text-slate-700" htmlFor="login-mobile">
                            {language === 'mr' ? 'नोंदणीकृत मोबाईल क्रमांक' : 'Registered Mobile Number'}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <span className="text-[10px] text-slate-500">10 Digits</span>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-xs border-r border-slate-200 pr-2">
                            +91
                          </span>
                          <input
                            id="login-mobile"
                            type="tel"
                            maxLength={10}
                            value={loginMobile}
                            onChange={(e) => {
                              setLoginMobile(e.target.value.replace(/\D/g, ''));
                              setLoginError(''); setLoginSuccess('');
                              setLoginOtpSent(false); setLoginOtp('');
                            }}
                            placeholder="Enter 10-digit mobile number"
                            className="w-full h-11 pl-14 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-wider focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                            required
                          />
                        </div>
                      </div>

                      {/* OTP */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs font-bold text-slate-700" htmlFor="login-otp">
                            {language === 'mr' ? 'वन-टाईम पासवर्ड (OTP)' : 'One-Time Password (OTP)'}
                            <span className="text-red-500 ml-1">*</span>
                          </label>
                          <button
                            type="button"
                            onClick={handleLoginGetOtp}
                            className="text-xs font-bold text-[#003b5a] hover:text-[#f47920] hover:underline"
                          >
                            {loginOtpSent
                              ? (language === 'mr' ? 'पुन्हा पाठवा' : 'Resend OTP')
                              : (language === 'mr' ? 'OTP मिळवा' : 'Get OTP')}
                          </button>
                        </div>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                            <span className="material-symbols-outlined text-[18px]">dialpad</span>
                          </span>
                          <input
                            id="login-otp"
                            type="text"
                            maxLength={6}
                            value={loginOtp}
                            onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, ''))}
                            placeholder={loginOtpSent ? "Enter 6-digit OTP" : "Click 'Get OTP' to continue"}
                            className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-widest focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                            required
                          />
                        </div>
                        {loginOtpSent && loginOtpGenerated && (
                          <div className="mt-1.5 p-2 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px] text-blue-600">sms</span>
                              Demo OTP: <strong className="font-mono tracking-wider">{loginOtpGenerated}</strong>
                            </span>
                            <button type="button" onClick={() => setLoginOtp(loginOtpGenerated)}
                              className="text-[10px] font-bold text-blue-700 underline hover:text-blue-900">
                              Auto-fill
                            </button>
                          </div>
                        )}
                      </div>

                      {/* CAPTCHA */}
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="login-captcha">
                          {language === 'mr' ? 'सुरक्षा कॅप्चा' : 'Security CAPTCHA'}
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="flex items-center gap-3">
                          <div className="flex-1">
                            <input
                              id="login-captcha"
                              type="text"
                              maxLength={6}
                              value={loginCaptchaInput}
                              onChange={(e) => setLoginCaptchaInput(e.target.value.toUpperCase())}
                              placeholder="Enter captcha text"
                              className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 tracking-wider uppercase focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                              required
                            />
                          </div>
                          <div className="h-11 px-3 bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center gap-2 select-none">
                            <span className="font-mono text-base font-extrabold tracking-widest text-slate-800 italic transform -skew-x-6">
                              {loginCaptchaCode}
                            </span>
                            <button type="button" onClick={refreshCaptcha} title="Refresh Captcha"
                              className="text-slate-600 hover:text-slate-900 p-1">
                              <span className="material-symbols-outlined text-[18px]">refresh</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={loginLoading}
                        className="w-full h-11 mt-2 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                      >
                        {loginLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span>{language === 'mr' ? 'ओळख पडताळा व प्रवेश करा' : 'Verify & Sign In'}</span>
                            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Demo Accounts Quick-Select */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      <details className="text-slate-600 group">
                        <summary className="text-[11px] font-semibold text-[#003b5a] hover:underline cursor-pointer list-none flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px] text-amber-600">badge</span>
                            Demo Citizen Accounts — Click to fill mobile
                          </span>
                          <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-180">expand_more</span>
                        </summary>
                        <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">
                            Pre-registered demo citizens:
                          </p>
                          {SEED_ACCOUNTS.map((acc) => (
                            <button
                              key={acc.mobile}
                              type="button"
                              onClick={() => {
                                setLoginMobile(acc.mobile);
                                setLoginError(''); setLoginSuccess('');
                                setLoginOtpSent(false); setLoginOtp('');
                              }}
                              className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white hover:border-slate-300 border border-transparent transition flex items-center justify-between"
                            >
                              <span className="font-semibold text-slate-800">{acc.name}</span>
                              <span className="font-mono text-slate-600">{acc.mobile}</span>
                            </button>
                          ))}
                        </div>
                      </details>
                    </div>

                    {/* Switch to register */}
                    <p className="mt-5 text-center text-xs text-slate-500">
                      New to MahaSetu?{' '}
                      <button onClick={() => switchTab('register')}
                        className="text-[#003b5a] font-bold hover:underline">
                        Create a free account →
                      </button>
                    </p>
                  </div>
                )}

                {/* ══════════════════════════════════════════════════════════ */}
                {/* CREATE ACCOUNT TAB                                         */}
                {/* ══════════════════════════════════════════════════════════ */}
                {activeTab === 'register' && (
                  <div>
                    {/* Step indicator */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        regStep === 'mobile' ? 'bg-[#003b5a] text-white border-[#003b5a]' : 'bg-emerald-500 text-white border-emerald-500'
                      }`}>
                        {regStep === 'mobile' ? '1' : <span className="material-symbols-outlined text-[14px]">check</span>}
                      </div>
                      <div className="flex-1 h-0.5 bg-slate-200 relative">
                        <div className={`absolute inset-y-0 left-0 bg-[#003b5a] transition-all duration-300 ${regStep === 'details' ? 'w-full' : 'w-0'}`} />
                      </div>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                        regStep === 'details' ? 'bg-[#003b5a] text-white border-[#003b5a]' : 'bg-slate-200 text-slate-500 border-slate-300'
                      }`}>
                        2
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {regStep === 'mobile' ? 'Step 1 of 2 — Verify Mobile' : 'Step 2 of 2 — Create Account'}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold text-[#003b5a]">
                        {regStep === 'mobile'
                          ? (language === 'mr' ? 'मोबाईल क्रमांक पडताळणी' : 'Verify Your Mobile')
                          : (language === 'mr' ? 'नागरिक खाते तयार करा' : 'Create Your Account')}
                      </h1>
                      <p className="text-xs text-slate-500 mt-1">
                        {regStep === 'mobile'
                          ? 'Enter your 10-digit mobile number to receive a verification OTP'
                          : `Mobile +91 ${regMobile} is verified ✓  —  Enter your name to finish`}
                      </p>
                    </div>

                    <ErrorBox msg={regError} />
                    <SuccessBox msg={regSuccess} />

                    {/* ── Step 1: Mobile OTP ──────────────────────────────── */}
                    {regStep === 'mobile' && (
                      <div className="space-y-4">
                        {/* Mobile */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-mobile">
                            Mobile Number<span className="text-red-500 ml-1">*</span>
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-semibold text-xs border-r border-slate-200 pr-2">
                              +91
                            </span>
                            <input
                              id="reg-mobile"
                              type="tel"
                              maxLength={10}
                              value={regMobile}
                              onChange={(e) => {
                                setRegMobile(e.target.value.replace(/\D/g, ''));
                                setRegError(''); setRegSuccess('');
                                setRegOtpSent(false); setRegOtp('');
                              }}
                              placeholder="Enter 10-digit mobile number"
                              className="w-full h-11 pl-14 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-wider focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                            />
                          </div>
                        </div>

                        {/* OTP */}
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="text-xs font-bold text-slate-700" htmlFor="reg-otp">
                              Verification OTP<span className="text-red-500 ml-1">*</span>
                            </label>
                            <button type="button" onClick={handleRegGetOtp}
                              className="text-xs font-bold text-[#003b5a] hover:text-[#f47920] hover:underline">
                              {regOtpSent ? 'Resend OTP' : 'Send OTP →'}
                            </button>
                          </div>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                              <span className="material-symbols-outlined text-[18px]">dialpad</span>
                            </span>
                            <input
                              id="reg-otp"
                              type="text"
                              maxLength={6}
                              value={regOtp}
                              onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                              placeholder={regOtpSent ? 'Enter 6-digit OTP' : "Click 'Send OTP' to continue"}
                              className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-widest focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                            />
                          </div>
                          {regOtpSent && regOtpGenerated && (
                            <div className="mt-1.5 p-2 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                              <span className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-[14px] text-blue-600">sms</span>
                                Demo OTP: <strong className="font-mono tracking-wider">{regOtpGenerated}</strong>
                              </span>
                              <button type="button" onClick={() => setRegOtp(regOtpGenerated)}
                                className="text-[10px] font-bold text-blue-700 underline hover:text-blue-900">
                                Auto-fill
                              </button>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          disabled={!regOtpSent}
                          onClick={handleRegVerifyOtp}
                          className="w-full h-11 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span>Verify Mobile & Continue</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </button>
                      </div>
                    )}

                    {/* ── Step 2: Account Details ──────────────────────────── */}
                    {regStep === 'details' && (
                      <form onSubmit={handleRegCreateAccount} className="space-y-4">
                        {/* Verified mobile badge */}
                        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs">
                          <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                          <span className="font-semibold text-emerald-800">Mobile +91 {regMobile} Verified</span>
                        </div>

                        {/* Full Name */}
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="reg-name">
                            Your Full Name<span className="text-red-500 ml-1">*</span>
                          </label>
                          <input
                            id="reg-name"
                            type="text"
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder="Enter your full name as per records"
                            className="w-full h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                            required
                            autoFocus
                          />
                          <p className="mt-1 text-[11px] text-slate-500">
                            This name will be used across all MahaSetu services.
                          </p>
                        </div>

                        {/* Consent notice */}
                        <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
                          <span className="material-symbols-outlined text-amber-700 text-[16px] flex-shrink-0 mt-0.5">shield</span>
                          <span>Your profile will be used solely for personalized scheme eligibility checks under MahaSetu (DPDP Act 2023).</span>
                        </div>

                        {/* Submit */}
                        <button
                          type="submit"
                          disabled={regLoading || !regName.trim()}
                          className="w-full h-11 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {regLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Creating Account...</span>
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">how_to_reg</span>
                              <span>{language === 'mr' ? 'खाते तयार करा' : 'Create My MahaSetu Account'}</span>
                            </>
                          )}
                        </button>

                        <button type="button" onClick={() => { setRegStep('mobile'); setRegError(''); }}
                          className="w-full text-xs text-slate-500 hover:text-[#003b5a] font-medium py-1">
                          ← Back to mobile verification
                        </button>
                      </form>
                    )}

                    {/* Switch to login */}
                    <p className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
                      Already have an account?{' '}
                      <button onClick={() => switchTab('login')}
                        className="text-[#003b5a] font-bold hover:underline">
                        Sign In →
                      </button>
                    </p>
                  </div>
                )}

              </div>
            </div>

            {/* Footer info */}
            <div className="mt-4 flex items-center justify-between text-xs text-slate-500 px-1">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                Official Government Portal
              </span>
              <span className="font-medium">
                Helpline: <a href="tel:18001208040" className="text-[#003b5a] font-bold hover:underline">1800-120-8040</a>
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
