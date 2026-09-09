'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface LogItem {
  _id: string;
  logId: string;
  actorId: string;
  actorRole: string;
  action: string;
  targetResource: string;
  targetId?: string;
  metadata?: any;
  ipAddress?: string;
  status: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [roleFilter, setRoleFilter] = useState('All');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAuditLogs({
        action: actionFilter !== 'All' ? actionFilter : undefined,
        actorRole: roleFilter !== 'All' ? roleFilter : undefined,
        limit: 100,
      });
      if (res.success && Array.isArray(res.logs)) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [actionFilter, roleFilter]);

  const actions = [
    'All',
    'CITIZEN_REGISTRATION',
    'CITIZEN_LOGIN',
    'ADMIN_LOGIN_SUCCESS',
    'ADMIN_LOGIN_FAILED',
    'PROFILE_UPDATE',
    'AI_SCHEME_SEARCH',
    'ELIGIBILITY_EVALUATION',
    'DOCUMENT_UPLOAD',
    'DIGILOCKER_SYNC',
    'DIGILOCKER_CONNECTED',
    'CONSENT_GRANTED',
    'CONSENT_REVOKED',
    'APPLICATION_SUBMITTED',
    'APPLICATION_STATUS_UPDATE',
    'SCHEME_CREATED',
    'SCHEME_UPDATED',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
              Immutable System Audit Trail
            </span>
            <span className="text-xs text-slate-500 font-mono">MongoDB AuditLogs Collection</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            System Activity & Security Audit Trail
          </h1>
          <p className="text-xs text-slate-600">
            Tamper-evident logs of citizen interactions, administrative decisions, authentication attempts, and consent transactions.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          <span>Refresh Trail</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Filter Event Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {actions.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600">Actor Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Actors</option>
            <option value="citizen">Citizen</option>
            <option value="admin">Administrator</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Audit ID</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Actor ID (Role)</th>
                <th className="py-3.5 px-4">Resource Target</th>
                <th className="py-3.5 px-4">Audit Metadata</th>
                <th className="py-3.5 px-4">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                    Loading audit trail from MongoDB...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                    No audit logs found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-bold text-[#002840]">
                      {l.logId}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-sans font-bold text-slate-900">
                      {l.action}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      <span>{l.actorId}</span>
                      <span className={`ml-1 text-[9px] px-1.5 py-0.2 rounded uppercase ${
                        l.actorRole === 'admin' ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {l.actorRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {l.targetResource} {l.targetId ? `(${l.targetId})` : ''}
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate font-sans">
                      {l.metadata ? JSON.stringify(l.metadata) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        l.status === 'SUCCESS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
