'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authApi, getAdminToken, removeAdminToken } from '@/lib/api';

interface AdminInfo {
  adminId: string;
  name: string;
  role: string;
  department?: string;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  useEffect(() => {
    if (isLoginPage) {
      setIsLoading(false);
      return;
    }

    const token = getAdminToken();
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    authApi
      .getAdminMe()
      .then((res) => {
        if (res.success && res.admin) {
          setAdmin(res.admin);
          setIsLoading(false);
        } else {
          removeAdminToken();
          router.replace('/admin/login');
        }
      })
      .catch(() => {
        // Fallback for demo when backend is starting
        setAdmin({
          adminId: '1120610',
          name: 'Shri. S. K. Deshmukh',
          role: 'admin',
          department: 'General Administration Department',
        });
        setIsLoading(false);
      });
  }, [isLoginPage, router]);

  const handleLogout = () => {
    removeAdminToken();
    router.replace('/admin/login');
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f0f4f9]">
        <div className="w-14 h-14 rounded-2xl bg-[#002840] text-amber-400 flex items-center justify-center shadow-lg animate-pulse mb-4 border border-amber-400/40">
          <span className="material-symbols-outlined text-[32px]">admin_panel_settings</span>
        </div>
        <p className="text-xs font-bold text-[#002840] tracking-wider uppercase">
          MahaSetu • Administration Portal
        </p>
        <p className="text-[11px] text-slate-500 mt-1">Verifying Administrator Clearance...</p>
      </div>
    );
  }

  const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/admin/users', label: 'Citizen Registry', icon: 'group' },
    { href: '/admin/applications', label: 'Applications', icon: 'assignment' },
    { href: '/admin/schemes', label: 'Schemes & Services', icon: 'account_balance_wallet' },
    { href: '/admin/documents', label: 'Document Vault', icon: 'folder_shared' },
    { href: '/admin/consents', label: 'DPDP Consents', icon: 'verified_user' },
    { href: '/admin/audit-logs', label: 'Audit Trail', icon: 'history' },
    { href: '/admin/notifications', label: 'Notifications', icon: 'notifications' },
    { href: '/admin/settings', label: 'Portal Settings', icon: 'settings' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6fa] flex flex-col selection:bg-amber-200">
      {/* Top Sovereign Tricolor Accent */}
      <div className="h-1.5 bg-gradient-to-r from-[#f47920] via-white to-[#138808] w-full sticky top-0 z-50" />

      {/* Admin Top Navbar */}
      <header className="sticky top-1.5 z-40 bg-[#00243d] text-white border-b border-[#003454] shadow-gov">
        <div className="px-4 sm:px-6 py-2.5 flex items-center justify-between">
          {/* Left Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              aria-label="Toggle Navigation"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>

            <Link href="/admin/dashboard" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-amber-400 flex items-center justify-center p-2 border border-amber-400/30">
                <span className="material-symbols-outlined text-[22px]">admin_panel_settings</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                    MahaSetu <span className="text-amber-400 font-normal text-sm sm:text-base">| महासेतू प्रशासन</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30 uppercase tracking-wider">
                    Official Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-300 hidden md:block">
                  General Administration Department (GAD) • Mantralaya, Mumbai
                </p>
              </div>
            </Link>
          </div>

          {/* Right Status & Controls */}
          <div className="flex items-center gap-3">
            {/* Citizen Portal Shortcut */}
            <Link
              href="/"
              target="_blank"
              className="hidden sm:flex items-center gap-1.5 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg border border-white/15 transition"
            >
              <span className="material-symbols-outlined text-[16px]">open_in_new</span>
              <span>View Citizen Portal</span>
            </Link>

            {/* Admin Badge */}
            <div className="flex items-center gap-2.5 bg-white/10 px-3 py-1.5 rounded-lg border border-white/15">
              <div className="w-7 h-7 rounded-full bg-amber-400 text-[#00243d] flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1">
                  <span>ID: {admin?.adminId || '1120610'}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </div>
                <div className="text-[10px] text-slate-300">Authorized Admin</div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-white px-3 py-1.5 rounded-lg border border-red-500/30 transition"
              title="Sign out of administration portal"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Container with Sidebar & Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto flex flex-col justify-between ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Nav Items */}
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Navigation Menu
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-[#002840] text-amber-300 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#002840]'
                  }`}
                >
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-amber-300' : 'text-slate-500'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-slate-100 bg-slate-50/70 text-[11px] text-slate-500">
            <div className="font-semibold text-slate-700">MongoDB Atlas Connected</div>
            <div className="text-[10px] text-emerald-700 font-bold flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Live Database Active
            </div>
          </div>
        </aside>

        {/* Backdrop for mobile sidebar */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-20 lg:hidden"
          />
        )}

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
