'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
  totalCitizens: number;
  verifiedCitizens: number;
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  totalSchemes: number;
  documentsSubmitted: number;
  digiLockerUsers: number;
  activeConsents: number;
  departmentStats: { _id: string; count: number }[];
  statusStats: { _id: string; count: number }[];
  districtStats: { _id: string; count: number }[];
  recentActivity: any[];
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getAnalytics();
      if (res.success && (res.data || res.kpis)) {
        const payload: AnalyticsData = res.data || {
          totalCitizens: res.kpis?.totalRegisteredCitizens ?? 0,
          verifiedCitizens: res.kpis?.verifiedCitizens ?? 0,
          totalApplications: res.kpis?.totalApplications ?? 0,
          pendingApplications: res.kpis?.pendingApplications ?? 0,
          approvedApplications: res.kpis?.approvedApplications ?? 0,
          rejectedApplications: res.kpis?.rejectedApplications ?? 0,
          totalSchemes: res.kpis?.totalSchemes ?? 0,
          documentsSubmitted: res.kpis?.documentsSubmitted ?? 0,
          digiLockerUsers: res.kpis?.digilockerConnectedUsers ?? 0,
          activeConsents: res.kpis?.activeConsents ?? 0,
          departmentStats: [],
          statusStats: [],
          districtStats: [],
          recentActivity: [],
        };
        setData(payload);
        setError('');
        const now = new Date();
        setLastUpdated(
          now.toLocaleTimeString('en-IN', {
            hour: 'numeric',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
          })
        );
      } else {
        setError(res.error || 'Unable to load live dashboard data.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to load live dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-200 animate-pulse rounded"></div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!data && error) {
    return (
      <div className="space-y-6">
        <div className="p-8 bg-red-50 border-2 border-red-200 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-[32px]">cloud_off</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-950">Unable to load live dashboard data.</h3>
            <p className="text-xs text-red-700 mt-1 max-w-md mx-auto">{error}</p>
          </div>
          <button
            onClick={fetchAnalytics}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#002840] hover:bg-[#001c30] text-white rounded-xl text-xs font-bold transition shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Retry Loading Database Data</span>
          </button>
        </div>
      </div>
    );
  }

  const d = data || {
    totalCitizens: 0,
    verifiedCitizens: 0,
    totalApplications: 0,
    pendingApplications: 0,
    approvedApplications: 0,
    rejectedApplications: 0,
    totalSchemes: 0,
    documentsSubmitted: 0,
    digiLockerUsers: 0,
    activeConsents: 0,
    departmentStats: [],
    statusStats: [],
    districtStats: [],
    recentActivity: [],
  };

  const statCards = [
    {
      title: 'Total Registered Citizens',
      value: d.totalCitizens,
      icon: 'people',
      color: 'text-blue-700',
      bg: 'bg-blue-50 border-blue-200',
      link: '/admin/users',
    },
    {
      title: 'Verified Citizens',
      value: d.verifiedCitizens,
      icon: 'verified',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      link: '/admin/users',
    },
    {
      title: 'Total Applications',
      value: d.totalApplications,
      icon: 'description',
      color: 'text-indigo-700',
      bg: 'bg-indigo-50 border-indigo-200',
      link: '/admin/applications',
    },
    {
      title: 'Pending Applications',
      value: d.pendingApplications,
      icon: 'pending_actions',
      color: 'text-amber-700',
      bg: 'bg-amber-50 border-amber-200',
      link: '/admin/applications?status=Submitted',
    },
    {
      title: 'Approved Applications',
      value: d.approvedApplications,
      icon: 'check_circle',
      color: 'text-teal-700',
      bg: 'bg-teal-50 border-teal-200',
      link: '/admin/applications?status=Approved',
    },
    {
      title: 'Rejected Applications',
      value: d.rejectedApplications,
      icon: 'cancel',
      color: 'text-red-700',
      bg: 'bg-red-50 border-red-200',
      link: '/admin/applications?status=Rejected',
    },
    {
      title: 'Total State Schemes',
      value: d.totalSchemes,
      icon: 'policy',
      color: 'text-purple-700',
      bg: 'bg-purple-50 border-purple-200',
      link: '/admin/schemes',
    },
    {
      title: 'Documents Submitted',
      value: d.documentsSubmitted,
      icon: 'folder_shared',
      color: 'text-cyan-700',
      bg: 'bg-cyan-50 border-cyan-200',
      link: '/admin/documents',
    },
    {
      title: 'DigiLocker Connected',
      value: d.digiLockerUsers,
      icon: 'cloud_done',
      color: 'text-sky-700',
      bg: 'bg-sky-50 border-sky-200',
      link: '/admin/users',
    },
    {
      title: 'Active DPDP Consents',
      value: d.activeConsents,
      icon: 'security',
      color: 'text-emerald-700',
      bg: 'bg-emerald-50 border-emerald-200',
      link: '/admin/consents',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#002840] text-amber-300 border border-amber-400/30">
              Mantralaya Executive View
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Live Database: MongoDB Atlas
            </span>
            {lastUpdated && (
              <span className="text-xs text-slate-500 font-mono">
                • Last updated: {lastUpdated}
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#002840] mt-1.5 tracking-tight">
            Government Administration Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Real-time monitoring of citizen registrations, applications, welfare disbursement, and DPDP consents.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAnalytics}
            className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">refresh</span>
            <span>Refresh Data</span>
          </button>
          <Link
            href="/admin/applications"
            className="bg-[#002840] hover:bg-[#001c30] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">assignment</span>
            <span>Review Applications</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-600">info</span>
            <span>{error}</span>
          </div>
          <button onClick={fetchAnalytics} className="font-bold underline text-amber-800">
            Retry Connection
          </button>
        </div>
      )}

      {/* 10 Dashboard Metric Cards */}
      <section>
        <h2 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px] text-[#002840]">analytics</span>
          Key Performance Indicators (KPIs)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {statCards.map((c, i) => (
            <Link
              key={i}
              href={c.link}
              className={`bg-white rounded-2xl border p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between group ${c.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`material-symbols-outlined text-[24px] ${c.color} group-hover:scale-110 transition-transform`}>
                  {c.icon}
                </span>
                <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-700">
                  View →
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-[#002840]">{c.value}</div>
                <div className="text-[11px] font-semibold text-slate-600 leading-tight mt-0.5">
                  {c.title}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Analytics Breakdown & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Department Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-[#002840] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#003b5a]">account_balance</span>
              Applications by Department
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Real Data</span>
          </div>

          {d.departmentStats && d.departmentStats.length > 0 ? (
            <div className="space-y-3">
              {d.departmentStats.map((item, idx) => {
                const pct = Math.round((item.count / Math.max(d.totalApplications, 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 truncate max-w-[200px]">
                        {item._id || 'General Administration'}
                      </span>
                      <span className="font-bold text-[#002840]">{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#003b5a] rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No departmental applications yet.</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-[#002840] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-amber-600">donut_large</span>
              Application Status Breakdown
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Real Data</span>
          </div>

          {d.statusStats && d.statusStats.length > 0 ? (
            <div className="space-y-3">
              {d.statusStats.map((item, idx) => {
                const colorMap: Record<string, string> = {
                  Submitted: 'bg-blue-500',
                  'Under Review': 'bg-amber-500',
                  'Documents Required': 'bg-purple-500',
                  Approved: 'bg-emerald-500',
                  Rejected: 'bg-red-500',
                  Completed: 'bg-teal-500',
                };
                const pct = Math.round((item.count / Math.max(d.totalApplications, 1)) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${colorMap[item._id] || 'bg-slate-400'}`} />
                        {item._id}
                      </span>
                      <span className="font-bold text-[#002840]">{item.count}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorMap[item._id] || 'bg-slate-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No status data available.</p>
          )}
        </div>

        {/* District Distribution */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-bold text-[#002840] uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-teal-600">map</span>
              Citizen Geographic Spread
            </h3>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Maharashtra</span>
          </div>

          {d.districtStats && d.districtStats.length > 0 ? (
            <div className="space-y-2.5">
              {d.districtStats.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <span className="font-semibold text-slate-800">{item._id}</span>
                  <span className="font-bold text-[#002840] bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.count} citizen(s)
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-4 text-center">No district profile data yet.</p>
          )}
        </div>
      </div>

      {/* Recent System Audit Activity */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#002840]">history</span>
            <h3 className="text-sm font-bold text-[#002840]">Recent System & Audit Trail Activity</h3>
          </div>
          <Link href="/admin/audit-logs" className="text-xs font-bold text-[#003b5a] hover:underline">
            View All Audit Logs →
          </Link>
        </div>

        {d.recentActivity && d.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100 text-xs">
            {d.recentActivity.slice(0, 6).map((log: any, i: number) => (
              <div key={i} className="py-2.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                    {log.logId}
                  </span>
                  <div>
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-slate-500 ml-2">by {log.actorId} ({log.actorRole})</span>
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-2">No recent audit logs recorded.</p>
        )}
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-gradient-to-r from-[#002035] via-[#00344f] to-[#001828] text-white rounded-2xl p-6 shadow-gov-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-base font-bold text-amber-300">Administrative Tasks & Workflows</h3>
          <p className="text-xs text-slate-200">
            Process citizen certificate requests, add welfare schemes, broadcast notices, or audit DPDP compliance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/admin/users"
            className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20 transition"
          >
            Manage Citizens
          </Link>
          <Link
            href="/admin/schemes"
            className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold border border-white/20 transition"
          >
            Add New Scheme
          </Link>
          <Link
            href="/admin/notifications"
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition"
          >
            Broadcast Notification
          </Link>
        </div>
      </div>
    </div>
  );
}
