'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthLoaded, isLoggedIn, isProfileComplete } = useApp();

  useEffect(() => {
    if (!isAuthLoaded) return;

    // Case 1: Citizen is NOT logged in
    if (!isLoggedIn) {
      if (pathname !== '/login') {
        router.replace('/login');
      }
      return;
    }

    // Case 2: Citizen IS logged in, but has not completed Basic Profile Setup
    if (isLoggedIn && !isProfileComplete) {
      if (pathname !== '/onboarding') {
        router.replace('/onboarding');
      }
      return;
    }

    // Case 3: Citizen IS logged in and profile IS complete
    if (isLoggedIn && isProfileComplete) {
      if (pathname === '/login' || pathname === '/onboarding') {
        router.replace('/dashboard');
      }
    }
  }, [isAuthLoaded, isLoggedIn, isProfileComplete, pathname, router]);

  // While auth state is hydrating from localStorage, render a clean official loader
  if (!isAuthLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9ff]">
        <div className="w-14 h-14 rounded-full bg-[#003b5a] text-amber-400 flex items-center justify-center shadow-lg animate-pulse mb-4 border border-amber-400/30">
          <span className="material-symbols-outlined text-[32px]">account_balance</span>
        </div>
        <p className="text-xs font-bold text-[#003b5a] tracking-wider uppercase">MahaSetu • Government of Maharashtra</p>
        <p className="text-[11px] text-slate-500 mt-1">Verifying Sovereign Citizen Session...</p>
      </div>
    );
  }

  // Prevent rendering protected content before redirection executes
  if (!isLoggedIn && pathname !== '/login') {
    return null;
  }

  if (isLoggedIn && !isProfileComplete && pathname !== '/onboarding') {
    return null;
  }

  return <>{children}</>;
}
