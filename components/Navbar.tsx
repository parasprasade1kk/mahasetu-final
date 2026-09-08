'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, isLoggedIn, user, logout } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const navItems = [
    { href: '/', labelEn: 'Home', labelMr: 'मुख्यपृष्ठ', icon: 'home' },
    { href: '/services', labelEn: 'Services Portal', labelMr: 'नागरिक सेवा', icon: 'category' },
    { href: '/schemes', labelEn: 'Schemes', labelMr: 'शासकीय योजना', icon: 'policy' },
    { href: '/scheme-finder', labelEn: 'AI Scheme Finder', labelMr: 'एआय योजना शोध', icon: 'auto_awesome' },
    { href: '/eligibility-checker', labelEn: 'Eligibility Checker', labelMr: 'पात्रता तपासणी', icon: 'fact_check' },
    { href: '/track', labelEn: 'Track Status', labelMr: 'अर्ज स्थिती', icon: 'track_changes' },
    { href: '/documents', labelEn: 'My Documents', labelMr: 'माझी कागदपत्रे', icon: 'folder_shared' },
    { href: '/consent', labelEn: 'Consent Center', labelMr: 'संमती केंद्र', icon: 'verified_user' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-gov border-b border-slate-200">
      {/* Sovereign Tricolor Band */}
      <div className="sovereign-tricolor w-full" />

      {/* Main Branding Strip */}
      <div className="bg-white px-4 sm:px-6 py-3 border-b border-slate-100">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Emblem & Portal Title */}
          <Link href="/" className="flex items-center gap-3.5 group">
            {/* Government Emblem Seal */}
            <div className="w-12 h-12 rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center p-2 shadow-sm border border-amber-400/40 flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="material-symbols-outlined text-28px font-bold">account_balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#003b5a]">
                  MahaSetu <span className="text-[#f47920] font-normal text-lg sm:text-xl">| महासेतू</span>
                </span>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {language === 'mr' ? 'शासकीय पोर्टल' : 'Official Portal'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium leading-tight">
                {language === 'mr'
                  ? 'एकात्मिक नागरिक सेवा आणि कल्याणकारी वितरण व्यासपीठ • महाराष्ट्र शासन'
                  : 'Unified Citizen Services & Welfare Delivery Platform • Government of Maharashtra'}
              </p>
            </div>
          </Link>

          {/* Quick Contact Helpline & Citizen Status */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Citizen Helpline 1800 */}
            <div className="text-right border-r border-slate-200 pr-5">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold block">
                {language === 'mr' ? 'नागरिक हेल्पलाईन (टोल फ्री)' : 'Toll-Free Citizen Helpline'}
              </span>
              <a href="tel:18001208040" className="text-sm font-bold text-[#003b5a] hover:text-[#f47920] flex items-center gap-1 justify-end">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">call</span>
                1800-120-8040
              </a>
            </div>

            {/* Auth / Citizen Profile Badge */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 bg-[#e5eeff] hover:bg-[#dce9ff] border border-[#9bccf6] px-3.5 py-1.5 rounded-lg transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-full bg-[#003b5a] text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#003b5a]">{user.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-[11px] text-slate-600 font-mono flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px] text-emerald-700 font-bold">verified</span>
                      {user.aadhaarMasked}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-slate-500">expand_more</span>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-gov-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-800">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                      <span className="inline-flex items-center gap-1 mt-1 text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                        <span className="material-symbols-outlined text-[12px]">cloud_done</span> DigiLocker Linked
                      </span>
                    </div>
                    <Link
                      href="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#003b5a]">dashboard</span>
                      {language === 'mr' ? 'नागरिक डॅशबोर्ड' : 'Citizen Dashboard'}
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#003b5a]">manage_accounts</span>
                      {language === 'mr' ? 'माझी प्रोफाइल अद्ययावत करा' : 'Update Profile'}
                    </Link>
                    <Link
                      href="/documents"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#003b5a]">folder_shared</span>
                      {language === 'mr' ? 'माझी कागदपत्रे' : 'My Documents'}
                    </Link>
                    <Link
                      href="/consent"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#003b5a]">security</span>
                      {language === 'mr' ? 'डेटा संमती व्यवस्थापन' : 'Consent & Privacy'}
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                        router.push('/login');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[16px]">logout</span>
                      {language === 'mr' ? 'लॉगआउट' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-2 bg-[#003b5a] hover:bg-[#002840] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-sm transition"
              >
                <span className="material-symbols-outlined text-[16px]">lock</span>
                {language === 'mr' ? 'नागरिक लॉगिन' : 'Citizen Login'}
              </Link>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            {isLoggedIn && (
              <Link
                href="/dashboard"
                className="p-2 rounded-lg bg-slate-100 text-[#003b5a]"
                title="Dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
              </Link>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined text-[26px]">
                {mobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <nav className="bg-[#003b5a] text-white border-t border-[#004f7a] hidden lg:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <ul className="flex items-center gap-1 py-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-100 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                    {language === 'mr' ? item.labelMr : item.labelEn}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <Link
              href="/scholarship-application"
              className="flex items-center gap-1 bg-[#f47920] hover:bg-[#d86815] text-white px-3 py-1.5 rounded-md text-xs font-bold transition shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">school</span>
              {language === 'mr' ? 'शिष्यवृत्ती अर्ज करा' : 'Apply Scholarship'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#003b5a] text-white border-t border-[#004f7a] px-4 py-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-semibold transition ${
                  isActive ? 'bg-amber-500 text-slate-950' : 'text-slate-200 hover:bg-white/10'
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                {language === 'mr' ? item.labelMr : item.labelEn}
              </Link>
            );
          })}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              href="/scholarship-application"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 bg-[#f47920] text-white py-2 rounded-md font-bold text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">school</span>
              {language === 'mr' ? 'शिष्यवृत्ती अर्ज करा' : 'Apply Scholarship'}
            </Link>
            {!isLoggedIn && (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 bg-white text-[#003b5a] py-2 rounded-md font-bold text-sm"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {language === 'mr' ? 'नागरिक लॉगिन' : 'Citizen Login'}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
