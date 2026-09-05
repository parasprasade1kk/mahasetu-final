'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';

export default function AccessibilityBar() {
  const { language, setLanguage, fontSize, setFontSize, isHighContrast, setIsHighContrast } = useApp();
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setCurrentDateTime(now.toLocaleString(language === 'mr' ? 'mr-IN' : 'en-IN', options));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [language]);

  return (
    <div className="bg-[#00253d] text-white text-xs border-b border-[#003b5a]/40 px-4 py-1.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        {/* Left Side: Official identity & Screen reader skip */}
        <div className="flex items-center gap-3">
          <span className="font-semibold text-amber-400 tracking-wide flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            {language === 'mr' ? 'महाराष्ट्र शासन • अधिकृत नागरिक पोर्टल' : 'Government of Maharashtra • Official Citizen Portal'}
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:inline font-mono">{currentDateTime}</span>
        </div>

        {/* Right Side: Accessibility Controls & Vernacular Toggle */}
        <div className="flex items-center gap-4">
          <a href="#main-content" className="sr-only focus:not-sr-only text-amber-300 underline font-semibold">
            {language === 'mr' ? 'मुख्य मजकुराकडे जा' : 'Skip to main content'}
          </a>

          {/* Text Size Scale */}
          <div className="flex items-center gap-1 bg-[#003b5a]/60 px-2 py-0.5 rounded border border-[#004f7a]">
            <span className="text-[11px] text-slate-300 mr-1 hidden sm:inline">Text Size:</span>
            <button
              onClick={() => setFontSize('normal')}
              className={`px-1.5 py-0.5 text-xs rounded transition ${fontSize === 'normal' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10 text-white'}`}
              title="Standard Font Size"
            >
              A-
            </button>
            <button
              onClick={() => setFontSize('large')}
              className={`px-1.5 py-0.5 text-xs rounded transition ${fontSize === 'large' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10 text-white'}`}
              title="Large Font Size"
            >
              A
            </button>
            <button
              onClick={() => setFontSize('xlarge')}
              className={`px-1.5 py-0.5 text-xs rounded transition ${fontSize === 'xlarge' ? 'bg-amber-500 text-slate-950 font-bold' : 'hover:bg-white/10 text-white'}`}
              title="Extra Large Font Size"
            >
              A+
            </button>
          </div>

          {/* High Contrast */}
          <button
            onClick={() => setIsHighContrast(!isHighContrast)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded border border-[#004f7a] text-xs transition ${
              isHighContrast ? 'bg-amber-500 text-slate-950 font-semibold' : 'bg-[#003b5a]/60 hover:bg-white/10 text-slate-200'
            }`}
            title="Toggle High Contrast"
          >
            <span className="material-symbols-outlined text-[14px]">contrast</span>
            <span className="hidden sm:inline">{language === 'mr' ? 'कॉन्ट्रास्ट' : 'Contrast'}</span>
          </button>

          {/* Vernacular Language Switcher */}
          <div className="flex items-center bg-[#003b5a] rounded border border-[#005b8e] p-0.5">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition ${
                language === 'en' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('mr')}
              className={`px-2 py-0.5 text-xs font-semibold rounded transition ${
                language === 'mr' ? 'bg-amber-500 text-slate-950 shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              मराठी
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
