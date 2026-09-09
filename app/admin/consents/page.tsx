'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface ConsentItem {
  _id: string;
  consentId: string;
  userId: string;
  requestingDept: string;
  sourceDept: string;
  purpose: string;
  dataFields: string[];
  status: 'Active' | 'Revoked' | 'Pending Approval';
  validUntil: string;
  source: string;
  actor: string;
  createdAt: string;
}

export default function AdminConsentsPage() {
  const [consents, setConsents] = useState<ConsentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getConsents({
        status: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (res.success && Array.isArray(res.consents)) {
        setConsents(res.consents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, [statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
              DPDP Act 2023 Statutory Compliance
            </span>
            <span className="text-xs text-slate-500 font-mono">MongoDB Consents Collection</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            Inter-Departmental Data Consent Registry
          </h1>
          <p className="text-xs text-slate-600">
            Audit and verify citizen data authorizations, statutory validity periods, and sharing revocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            Active Authorizations: <strong className="text-emerald-700">{consents.filter(c => c.status === 'Active').length}</strong>
          </span>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-700">Filter Consent Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none"
          >
            <option value="All">All Authorizations</option>
            <option value="Active">Active Only</option>
            <option value="Revoked">Revoked Only</option>
            <option value="Pending Approval">Pending Approval</option>
          </select>
        </div>
        <button
          onClick={fetchConsents}
          className="text-xs font-bold text-[#002840] hover:underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">refresh</span>
          Refresh
        </button>
      </div>

      {/* Consents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Consent ID</th>
                <th className="py-3.5 px-4">Citizen User ID</th>
                <th className="py-3.5 px-4">Requesting Department</th>
                <th className="py-3.5 px-4">Source Department / Repository</th>
                <th className="py-3.5 px-4">Authorized Purpose</th>
                <th className="py-3.5 px-4">Shared Fields</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Validity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading consent records from MongoDB...
                  </td>
                </tr>
              ) : consents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No consent records found.
                  </td>
                </tr>
              ) : (
                consents.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#002840] text-[11px]">
                      {c.consentId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {c.userId}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {c.requestingDept}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {c.sourceDept}
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      {c.purpose}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1">
                        {c.dataFields && c.dataFields.map((f, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          c.status === 'Active'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : c.status === 'Revoked'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {c.validUntil}
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
