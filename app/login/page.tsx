'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { findAuthorizedUser, normalizeMobileNumber, ACCESS_DENIED_ERROR_MESSAGE, ACCESS_DENIED_ERROR_MESSAGE_MR } from '@/lib/authConfig';

export default function LoginPage() {
  const router = useRouter();
  const { language, loginWithMobile, isLoggedIn, isProfileComplete } = useApp();

  // Form State
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaCode, setCaptchaCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Generate random 5-character alphanumeric captcha
  const generateNewCaptcha = () => {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let result = '';
    for (let i = 0; i < 5; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaCode(result);
    setCaptchaInput('');
  };

  useEffect(() => {
    generateNewCaptcha();
  }, []);

  // If already logged in, redirect accordingly
  useEffect(() => {
    if (isLoggedIn) {
      if (isProfileComplete) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isLoggedIn, isProfileComplete, router]);

  const handleSendOtp = () => {
    setErrorMsg('');
    setSuccessMsg('');

    const clean = normalizeMobileNumber(mobile);
    if (!clean || clean.length !== 10) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया १० अंकी वैध मोबाईल क्रमांक प्रविष्ट करा.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    // Verify authorized user
    const authorized = findAuthorizedUser(clean);
    if (!authorized) {
      setErrorMsg(language === 'mr' ? ACCESS_DENIED_ERROR_MESSAGE_MR : ACCESS_DENIED_ERROR_MESSAGE);
      return;
    }

    // Simulate OTP generation
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setOtpSent(true);
    setOtp(mockOtp); // Pre-fill mock OTP for effortless verification
    setSuccessMsg(
      language === 'mr'
        ? `नागरिक ${authorized.nameMr} यांच्यासाठी वन-टाईम पासवर्ड (OTP) पाठवला आहे.`
        : `One-Time Password (OTP) dispatched for citizen ${authorized.name}.`
    );
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const clean = normalizeMobileNumber(mobile);
    if (!clean || clean.length !== 10) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया १० अंकी वैध मोबाईल क्रमांक प्रविष्ट करा.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    // Verify against authorized registry
    const authorized = findAuthorizedUser(clean);
    if (!authorized) {
      setErrorMsg(language === 'mr' ? ACCESS_DENIED_ERROR_MESSAGE_MR : ACCESS_DENIED_ERROR_MESSAGE);
      return;
    }

    // Verify Captcha
    if (!captchaInput || captchaInput.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setErrorMsg(
        language === 'mr'
          ? 'कॅप्चा कोड जुळत नाही. कृपया पुन्हा प्रयत्न करा.'
          : 'Security CAPTCHA verification failed. Please check the code and try again.'
      );
      generateNewCaptcha();
      return;
    }

    // Verify OTP
    if (!otp || otp.length < 6) {
      setErrorMsg(
        language === 'mr'
          ? 'कृपया ६ अंकी ओटीपी (OTP) प्रविष्ट करा.'
          : 'Please enter the 6-digit OTP.'
      );
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const loginResult = loginWithMobile(clean);
      setIsLoading(false);

      if (loginResult.success) {
        // Check if user has already completed onboarding
        // Let's inspect localStorage for existing profile
        const profileKey = `mahasetu_user_profile_${clean}`;
        const existingProfile = localStorage.getItem(profileKey);

        if (existingProfile) {
          router.push('/dashboard');
        } else {
          router.push('/onboarding');
        }
      } else {
        setErrorMsg(loginResult.error || ACCESS_DENIED_ERROR_MESSAGE);
      }
    }, 500);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-stretch">
      <div className="flex w-full">
        {/* Left Panel: Maharashtra Sovereign Identity Badge */}
        <div className="hidden lg:flex w-5/12 bg-[#003b5a] text-white flex-col justify-between p-12 relative overflow-hidden">
          {/* Subtle Grid Pattern */}
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
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-400 px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/15">
              <span className="material-symbols-outlined text-[16px]">shield</span>
              <span>Authorized Citizen Access Only</span>
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
                ? '४००+ शासकीय सेवा व कल्याणकारी योजनांमध्ये अखंड प्रवेश. महाराष्ट्रातील अधिकृत नोंदणीकृत नागरिकांसाठी सुरक्षित, पारदर्शक आणि विश्वासार्ह डिजिटल मंच.'
                : 'Access 400+ government services and welfare schemes seamlessly. Institutional, transparent, and sovereign citizen portal for Maharashtra.'}
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <span>Mobile OTP & Sovereign Registry Verification</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">lock</span>
                <span>Role-Based Access Control & 256-Bit HSM</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">security</span>
                <span>Digital Personal Data Protection (DPDP) 2023 Compliant</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-xs text-slate-400">
            © 2026 Government of Maharashtra. Trusted Digital Public Infrastructure.
          </div>
        </div>

        {/* Right Panel: Login Form */}
        <div className="w-full lg:w-7/12 flex flex-col justify-center items-center p-6 sm:p-12 bg-[#f8f9ff]">
          <div className="w-full max-w-md">
            {/* Header Badge on Mobile */}
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center p-2 border border-amber-400/30">
                <span className="material-symbols-outlined text-[22px]">account_balance</span>
              </div>
              <div>
                <span className="text-xl font-bold text-[#003b5a]">MahaSetu | महासेतू</span>
                <p className="text-[10px] text-slate-500">Government of Maharashtra</p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-gov-lg border border-slate-200 p-8 sm:p-10">
              <div className="mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                    {language === 'mr' ? 'नागरिक ओळख पडताळणी' : 'Citizen Identity Verification'}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    MahaSetu SSO
                  </span>
                </div>

                <h1 className="text-2xl font-bold text-[#003b5a] mt-3">
                  {language === 'mr' ? 'महासेतू नागरिक लॉगिन' : 'Citizen Login to MahaSetu'}
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'mr'
                    ? 'आपल्या अधिकृत नोंदणीकृत मोबाईल क्रमांकासह सुरक्षित प्रवेश करा'
                    : 'Enter your registered 10-digit mobile number to proceed'}
                </p>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-start gap-2.5 shadow-sm animate-shake">
                  <span className="material-symbols-outlined text-[20px] text-red-600 flex-shrink-0 mt-0.5">error</span>
                  <div className="flex-grow">
                    <p className="font-bold">{errorMsg}</p>
                    {errorMsg === ACCESS_DENIED_ERROR_MESSAGE && (
                      <p className="text-[11px] text-red-700 mt-1">
                        Only registered citizens authorized by MahaSetu can log in to this portal.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Success Alert Box */}
              {successMsg && (
                <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-start gap-2.5 shadow-sm">
                  <span className="material-symbols-outlined text-[20px] text-emerald-600 flex-shrink-0 mt-0.5">check_circle</span>
                  <p className="font-medium mt-0.5">{successMsg}</p>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Mobile Number Field */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700" htmlFor="mobile">
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
                      id="mobile"
                      type="tel"
                      maxLength={10}
                      value={mobile}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        setMobile(val);
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder="Enter 10-digit mobile number"
                      className="w-full h-11 pl-14 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-wider focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                      required
                    />
                  </div>
                </div>

                {/* OTP Action & Field */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-700" htmlFor="otp">
                      {language === 'mr' ? 'वन-टाईम पासवर्ड (OTP)' : 'One-Time Password (OTP)'}
                      <span className="text-red-500 ml-1">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-xs font-bold text-[#003b5a] hover:text-[#f47920] hover:underline"
                    >
                      {otpSent
                        ? language === 'mr'
                          ? 'पुन्हा पाठवा (Resend OTP)'
                          : 'Resend OTP'
                        : language === 'mr'
                        ? 'ओटीपी मिळवा (Get OTP)'
                        : 'Get OTP'}
                    </button>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                      <span className="material-symbols-outlined text-[18px]">dialpad</span>
                    </span>
                    <input
                      id="otp"
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value.replace(/\D/g, ''));
                        if (errorMsg) setErrorMsg('');
                      }}
                      placeholder={otpSent ? "Enter 6-digit OTP" : "Click 'Get OTP' to generate code"}
                      className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 tracking-widest focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                      required
                    />
                  </div>
                  {otpSent && generatedOtp && (
                    <div className="mt-1.5 p-2 bg-blue-50/70 border border-blue-200 rounded text-[11px] text-blue-900 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px] text-blue-600">sms</span>
                        Demo OTP Code: <strong className="font-mono tracking-wider">{generatedOtp}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => setOtp(generatedOtp)}
                        className="text-[10px] font-bold text-blue-700 underline hover:text-blue-900"
                      >
                        Auto-fill
                      </button>
                    </div>
                  )}
                </div>

                {/* Security CAPTCHA Field */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="captcha">
                    {language === 'mr' ? 'सुरक्षा कॅप्चा कोड (CAPTCHA)' : 'Security CAPTCHA'}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <input
                        id="captcha"
                        type="text"
                        maxLength={6}
                        value={captchaInput}
                        onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                        placeholder="Enter captcha text"
                        className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 tracking-wider uppercase focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                        required
                      />
                    </div>
                    {/* Captcha Visual Box */}
                    <div className="h-11 px-3 bg-slate-200 border border-slate-300 rounded-lg flex items-center justify-center gap-2 select-none">
                      <span className="font-mono text-base font-extrabold tracking-widest text-slate-800 italic transform -skew-x-6">
                        {captchaCode}
                      </span>
                      <button
                        type="button"
                        onClick={generateNewCaptcha}
                        title="Refresh Captcha"
                        className="text-slate-600 hover:text-slate-900 p-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-4 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Verifying Citizen Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>{language === 'mr' ? 'ओळख पडताळा व पुढे जा' : 'Verify & Continue'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* Authorized Users Quick Demo Helper */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <details className="text-slate-600 group">
                  <summary className="text-[11px] font-semibold text-[#003b5a] hover:underline cursor-pointer list-none flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[15px] text-amber-600">badge</span>
                      View 6 Authorized Citizen Mobile Numbers
                    </span>
                    <span className="material-symbols-outlined text-[16px] transition-transform group-open:rotate-180">expand_more</span>
                  </summary>
                  <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 text-[11px]">
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mb-1">Click to select registered citizen:</p>
                    {[
                      { name: 'Paras Prasade', mobile: '7276218598' },
                      { name: 'Jay Sawale', mobile: '9588647927' },
                      { name: 'Aniruddha Nawale', mobile: '7447571077' },
                      { name: 'Anshul Patil', mobile: '7249517306' },
                      { name: 'Aman Chaudhary', mobile: '8329895972' },
                      { name: 'Shrushti Shinde', mobile: '8767867760' },
                    ].map((user) => (
                      <button
                        key={user.mobile}
                        type="button"
                        onClick={() => {
                          setMobile(user.mobile);
                          setErrorMsg('');
                          setSuccessMsg('');
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-white hover:border-slate-300 border border-transparent transition flex items-center justify-between"
                      >
                        <span className="font-semibold text-slate-800">{user.name}</span>
                        <span className="font-mono text-slate-600">{user.mobile}</span>
                      </button>
                    ))}
                  </div>
                </details>
              </div>

              {/* Help & Helpline */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
                  Official Gov Portal
                </span>
                <span className="font-medium">
                  Helpline: <a href="tel:18001208040" className="text-[#003b5a] font-bold hover:underline">1800-120-8040</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
