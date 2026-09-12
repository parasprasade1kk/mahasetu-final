'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface DocItem {
  _id: string;
  documentId: string;
  userId: string;
  documentType: string;
  documentName: string;
  authorityEn: string;
  issueDate?: string;
  certNo?: string;
  source: string;
  verificationStatus: string;
  uploadedAt: string;
  expiryDate?: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getDocuments({
        source: sourceFilter !== 'All' ? sourceFilter : undefined,
        verificationStatus: statusFilter !== 'All' ? statusFilter : undefined,
      });
      if (res.success && Array.isArray(res.documents)) {
        setDocuments(res.documents);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [sourceFilter, statusFilter]);

  const sources = ['All', 'DigiLocker', 'Demo Government Connector', 'User Upload', 'Government API'];
  const statuses = ['All', 'Verified', 'Pending Verification', 'Citizen Uploaded', 'Rejected'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 border border-cyan-200">
              State Certificate Repository
            </span>
            <span className="text-xs text-slate-500 font-mono">Supabase Documents Table</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            Document Vault & Certificate Verification
          </h1>
          <p className="text-xs text-slate-600">
            Audit verified certificates, DigiLocker synced credentials, and citizen uploaded documents across Maharashtra.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-center">
          Total Documents: <strong className="text-[#002840]">{documents.length}</strong>
        </span>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Filter Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {sources.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-600">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            {statuses.map((st) => (
              <option key={st} value={st}>{st}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Document ID</th>
                <th className="py-3.5 px-4">Citizen User ID</th>
                <th className="py-3.5 px-4">Document Name & Certificate No</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Issuing Authority</th>
                <th className="py-3.5 px-4">Source</th>
                <th className="py-3.5 px-4">Verification Status</th>
                <th className="py-3.5 px-4">Date Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading documents from Supabase...
                  </td>
                </tr>
              ) : documents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No documents found matching filter criteria.
                  </td>
                </tr>
              ) : (
                documents.map((d) => (
                  <tr key={d.documentId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#002840] text-[11px]">
                      {d.documentId}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {d.userId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{d.documentName}</div>
                      {d.certNo && (
                        <div className="text-[10px] text-slate-500 font-mono">
                          Cert No: {d.certNo}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {d.documentType}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {d.authorityEn}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {d.source}
                        {d.source.includes('Demo') && (
                          <span className="text-[9px] bg-amber-200 text-amber-900 px-1 rounded">DEMO</span>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          d.verificationStatus === 'Verified'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-amber-100 text-amber-800 border-amber-300'
                        }`}
                      >
                        {d.verificationStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(d.uploadedAt).toLocaleDateString()}
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
