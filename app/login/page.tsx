'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function LoginPage() {
  const router = useRouter();
  const { language, login } = useApp();

  const [activeTab, setActiveTab] = useState<'otp' | 'password'>('otp');
  const [mobile, setMobile] = useState('9823048210');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSendOtp = () => {
    if (!mobile || mobile.length < 10) {
      setErrorMsg(language === 'mr' ? 'कृपया वैध १०-अंकी मोबाईल क्रमांक टाका' : 'Please enter a valid 10-digit mobile number');
      return;
    }
    setErrorMsg('');
    setOtpSent(true);
    setOtp('482190'); // Pre-fill mock OTP for smooth demo
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      login();
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-stretch">
      <div className="flex w-full">
        {/* Left Panel: Branding & Security Badge (Desktop) */}
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
              <div className="w-10 h-10 rounded-full bg-white/10 text-amber-400 flex items-center justify-center p-2 border border-amber-400/30">
                <span className="material-symbols-outlined text-[24px]">account_balance</span>
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">MahaSetu</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6 max-w-md my-auto py-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold border border-white/15">
              <span className="material-symbols-outlined text-[14px]">shield</span>
              <span>Sovereign Identity Authentication</span>
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
                ? '४००+ शासकीय सेवांमध्ये अखंड प्रवेश. महाराष्ट्रातील सर्व नागरिकांसाठी अधिकृत, सुरक्षित आणि विश्‍वासार्ह प्रवेश.'
                : 'Access over 400+ government services seamlessly. Institutional, reliable, and secure access for all citizens of Maharashtra.'}
            </p>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/15 space-y-3">
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
                <span>Aadhaar & DigiLocker eKYC Compliant</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">lock</span>
                <span>256-Bit Hardware Security Module (HSM)</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200">
                <span className="material-symbols-outlined text-emerald-400 text-[18px]">security</span>
                <span>Digital Personal Data Protection (DPDP) 2023</span>
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
              <div className="w-9 h-9 rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center p-1.5">
                <span className="material-symbols-outlined text-[20px]">account_balance</span>
              </div>
              <span className="text-xl font-bold text-[#003b5a]">MahaSetu</span>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-gov-lg border border-slate-200 p-8 sm:p-10">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#003b5a]">
                  {language === 'mr' ? 'महासेतू पोर्टलवर लॉगिन करा' : 'Login to MahaSetu'}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  {language === 'mr'
                    ? 'आपल्या नागरिक डॅशबोर्डमध्ये सुरक्षित प्रवेश करा'
                    : 'Securely access your citizen dashboard & applications'}
                </p>
              </div>

              {/* Login Method Tabs */}
              <div className="flex p-1 bg-slate-100 rounded-lg mb-6 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setActiveTab('otp')}
                  className={`flex-1 py-2 rounded-md transition ${
                    activeTab === 'otp' ? 'bg-white text-[#003b5a] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'mr' ? 'ओटीपी द्वारे (OTP)' : 'OTP Authentication'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('password')}
                  className={`flex-1 py-2 rounded-md transition ${
                    activeTab === 'password' ? 'bg-white text-[#003b5a] shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {language === 'mr' ? 'पासवर्ड / आयडी' : 'Password / Citizen ID'}
                </button>
              </div>

              {errorMsg && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {activeTab === 'otp' ? (
                  <>
                    {/* Mobile Number Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="mobile">
                        {language === 'mr' ? 'नोंदणीकृत मोबाईल क्रमांक / आधार' : 'Mobile Number / Aadhaar Number'}
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                          <span className="material-symbols-outlined text-[18px]">call</span>
                        </span>
                        <input
                          id="mobile"
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="Enter 10-digit mobile number"
                          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                          required
                        />
                      </div>
                    </div>

                    {/* OTP Field */}
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs font-bold text-slate-700" htmlFor="otp">
                          {language === 'mr' ? 'वन-टाईम पासवर्ड (OTP)' : 'One-Time Password (OTP)'}
                        </label>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          className="text-xs font-bold text-[#003b5a] hover:text-[#f47920] hover:underline"
                        >
                          {otpSent
                            ? language === 'mr'
                              ? 'पुन्हा पाठवा (Resend)'
                              : 'Resend OTP'
                            : language === 'mr'
                            ? 'ओटीपी मिळवा'
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
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP (e.g. 482190)"
                          className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                          required
                        />
                      </div>
                      {otpSent && (
                        <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          {language === 'mr' ? 'ओटीपी पाठवला गेला आहे (चाचणी कोड: 482190)' : 'OTP sent to mobile (Demo code: 482190)'}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {/* Username Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="username">
                        {language === 'mr' ? 'वापरकर्ता नाव / नागरिक आयडी' : 'Citizen ID / Username'}
                      </label>
                      <input
                        id="username"
                        type="text"
                        defaultValue="rajesh.patil"
                        className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                        required
                      />
                    </div>

                    {/* Password Field */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="password">
                        {language === 'mr' ? 'पासवर्ड' : 'Password'}
                      </label>
                      <input
                        id="password"
                        type="password"
                        defaultValue="••••••••"
                        className="w-full h-11 px-3 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a]"
                        required
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 mt-4 bg-[#003b5a] hover:bg-[#002840] text-white rounded-lg text-xs font-bold shadow-gov transition flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span>Authenticating...</span>
                  ) : (
                    <>
                      <span>{language === 'mr' ? 'पोर्टलवर प्रवेश करा' : 'Login to Portal'}</span>
                      <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </form>

              {/* DigiLocker Alternative */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    login();
                    router.push('/dashboard');
                  }}
                  className="w-full h-11 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <span className="material-symbols-outlined text-blue-600 text-[18px]">cloud</span>
                  <span>{language === 'mr' ? 'डिजिलॉकर द्वारे थेट लॉगिन करा' : 'Sign in with DigiLocker'}</span>
                </button>
              </div>

              {/* Links */}
              <div className="mt-6 flex items-center justify-between text-xs pt-4 border-t border-slate-100 text-slate-600">
                <span className="hover:text-[#003b5a] cursor-pointer">Forgot Password?</span>
                <span className="text-[#f47920] font-bold hover:underline cursor-pointer">New User? Register</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
