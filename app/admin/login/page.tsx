'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, setAdminToken, getAdminToken } from '@/lib/api';

export default function AdminLoginPage() {
  const router = useRouter();
  const [adminId, setAdminId] = useState('1120610');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // If already authenticated as admin, redirect directly to dashboard
    const existingToken = getAdminToken();
    if (existingToken) {
      authApi.getAdminMe().then((res) => {
        if (res.success) {
          router.replace('/admin/dashboard');
        }
      }).catch(() => {});
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || isSuccess) return;
    setError('');

    if (!adminId.trim()) {
      setError('Please enter your Government Administrator ID.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.adminLogin(adminId.trim(), password);

      if (res.success && res.token) {
        setAdminToken(res.token);
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/admin/dashboard');
        }, 400);
      } else {
        setLoading(false);
        setError(res.error || 'Invalid Administrator ID or password.');
      }
    } catch (err: any) {
      setLoading(false);
      setError('Unable to connect to the administration server. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f9] flex flex-col justify-between selection:bg-amber-200">
      {/* Sovereign Header Strip */}
      <div className="h-2 bg-gradient-to-r from-[#f47920] via-white to-[#138808] w-full" />

      {/* Top Government Navigation Header */}
      <header className="bg-white border-b border-slate-200 py-3 px-4 sm:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#002840] text-amber-400 flex items-center justify-center p-2 shadow-sm border border-amber-400/40">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold text-[#002840]">MahaSetu | महासेतू</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300 uppercase tracking-wider">
                  Admin Portal
                </span>
              </div>
              <p className="text-[11px] text-slate-500">Government of Maharashtra Administration</p>
            </div>
          </Link>

          <Link
            href="/login"
            className="flex items-center gap-1 text-xs text-[#003b5a] font-bold hover:underline"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Citizen Portal</span>
          </Link>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-gov-xl border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#00243d] via-[#003454] to-[#001c30] text-white p-6 sm:p-8 text-center relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-white/10 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-inner border border-amber-400/30">
              <span className="material-symbols-outlined text-[36px]">shield_person</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400 bg-white/10 px-3 py-1 rounded-full border border-white/20">
              Restricted Sovereign Access
            </span>
            <h1 className="text-xl sm:text-2xl font-black mt-2 tracking-tight">
              Administrator Login
            </h1>
            <p className="text-xs text-slate-300 mt-1">
              General Administration Department (GAD) • Mantralaya
            </p>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8 space-y-5">
            {error && (
              <div className="p-3.5 bg-red-50 border border-red-300 text-red-800 text-xs rounded-xl flex items-start gap-2.5 animate-shake">
                <span className="material-symbols-outlined text-red-600 text-[18px] flex-shrink-0 mt-0.5">
                  error
                </span>
                <span className="font-medium">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Admin ID */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1" htmlFor="admin-id">
                  Administrator ID
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </span>
                  <input
                    id="admin-id"
                    type="text"
                    value={adminId}
                    onChange={(e) => setAdminId(e.target.value)}
                    placeholder="Enter Admin ID (e.g. 1120610)"
                    className="w-full h-11 pl-10 pr-4 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold text-slate-800 tracking-wider focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700" htmlFor="admin-pass">
                    Secure Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Encrypted</span>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <span className="material-symbols-outlined text-[18px]">key</span>
                  </span>
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password"
                    className="w-full h-11 pl-10 pr-11 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-[#003b5a] focus:ring-1 focus:ring-[#003b5a]"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Notice */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex items-start gap-2">
                <span className="material-symbols-outlined text-emerald-600 text-[16px] flex-shrink-0 mt-0.5">
                  lock
                </span>
                <span>
                  All administrative actions are cryptographically signed and recorded in the audit trail.
                </span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || isSuccess}
                className="w-full h-11 bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white rounded-lg text-xs font-bold shadow-gov transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSuccess ? (
                  <>
                    <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
                    <span className="text-emerald-300">Authentication successful. Redirecting...</span>
                  </>
                ) : loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">login</span>
                    <span>Authenticate & Access Admin Portal</span>
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-[#002840] font-semibold"
              >
                ← Return to Citizen Login
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-[11px] text-slate-500">
        © 2026 Government of Maharashtra • MahaSetu Sovereign Administration Gateway
      </footer>
    </div>
  );
}
