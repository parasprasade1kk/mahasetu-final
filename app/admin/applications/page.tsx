'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface AppItem {
  _id: string;
  applicationId: string;
  userId: string;
  applicantName: string;
  serviceId?: string;
  schemeId?: string;
  serviceName: string;
  serviceNameMr?: string;
  department: string;
  appliedDate: string;
  status: string;
  statusColor?: string;
  district: string;
  applicationRoute?: string;
  applicationType?: 'scheme' | 'service';
  remarks?: string;
  lastUpdated: string;
  smartDocumentPack?: any[];
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Status Update Modal
  const [updatingApp, setUpdatingApp] = useState<AppItem | null>(null);
  const [newStatus, setNewStatus] = useState('Approved');
  const [remarks, setRemarks] = useState('');
  const [savingStatus, setSavingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getApplications({
        status: statusFilter !== 'All' ? statusFilter : undefined,
        type: typeFilter !== 'All' ? typeFilter : undefined,
        search: search || undefined,
      });
      if (res.success && Array.isArray(res.applications)) {
        setApplications(res.applications);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [statusFilter, typeFilter]);

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatingApp) return;

    setSavingStatus(true);
    try {
      const res = await adminApi.updateApplicationStatus(updatingApp.applicationId, newStatus, remarks);
      setSavingStatus(false);
      if (res.success) {
        setToastMessage(`Application ${updatingApp.applicationId} updated to "${newStatus}" and logged to audit trail.`);
        setUpdatingApp(null);
        fetchApplications();
        setTimeout(() => setToastMessage(''), 5000);
      } else {
        alert(res.error || 'Failed to update status.');
      }
    } catch (err: any) {
      setSavingStatus(false);
      alert(err.message || 'Error updating status.');
    }
  };

  const statuses = [
    'All',
    'Draft',
    'Submitted',
    'Under Review',
    'Documents Required',
    'Approved',
    'Rejected',
    'Completed',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 border border-indigo-200">
              Department Workflow Registry
            </span>
            <span className="text-xs text-slate-500 font-mono">MongoDB Applications Collection</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            Application Processing & Adjudication
          </h1>
          <p className="text-xs text-slate-600">
            Process citizen certificate requests and welfare scheme applications. Status changes generate verified AuditLogs.
          </p>
        </div>

        <span className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm self-start sm:self-center">
          Total Applications: <strong className="text-[#002840]">{applications.length}</strong>
        </span>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-sm">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
            placeholder="Search by Application ID, Citizen Name, or Service..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#003b5a]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Type filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All Types</option>
              <option value="scheme">Welfare Schemes</option>
              <option value="service">Government Services</option>
            </select>
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Application ID</th>
                <th className="py-3.5 px-4">Citizen</th>
                <th className="py-3.5 px-4">Scheme / Service</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Applied Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading applications from MongoDB...
                  </td>
                </tr>
              ) : applications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No applications found matching filter criteria.
                  </td>
                </tr>
              ) : (
                applications.map((app) => (
                  <tr key={app.applicationId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#002840] text-[11px]">
                      {app.applicationId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{app.applicantName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{app.userId}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{app.serviceName}</div>
                      {app.applicationRoute && (
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">
                          Route: {app.applicationRoute}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          app.applicationType === 'service'
                            ? 'bg-amber-50 text-amber-900 border border-amber-200'
                            : 'bg-purple-50 text-purple-900 border border-purple-200'
                        }`}
                      >
                        {app.applicationType === 'service' ? 'Service' : 'Scheme'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {app.department}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {app.appliedDate}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                          app.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : app.status === 'Rejected'
                            ? 'bg-red-100 text-red-800 border-red-300'
                            : app.status === 'Under Review'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : app.status === 'Documents Required'
                            ? 'bg-purple-100 text-purple-800 border-purple-300'
                            : 'bg-blue-100 text-blue-800 border-blue-300'
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => {
                          setUpdatingApp(app);
                          setNewStatus(app.status);
                          setRemarks(app.remarks || '');
                        }}
                        className="bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 ml-auto shadow-xs"
                      >
                        <span className="material-symbols-outlined text-[14px]">edit_note</span>
                        <span>Update Status</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Update Status Modal */}
      {updatingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-fadeIn">
            <div className="bg-[#002840] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Update Application Status</h3>
                <p className="text-[11px] text-slate-300 font-mono">
                  {updatingApp.applicationId} • {updatingApp.applicantName}
                </p>
              </div>
              <button
                onClick={() => setUpdatingApp(null)}
                className="text-slate-300 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-700 block mb-1">Service / Scheme</span>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800">
                  {updatingApp.serviceName} ({updatingApp.department})
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1" htmlFor="modal-status">
                  New Status Decision <span className="text-red-500">*</span>
                </label>
                <select
                  id="modal-status"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-[#003b5a]"
                  required
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Documents Required">Documents Required</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1" htmlFor="modal-remarks">
                  Official Remarks / Justification
                </label>
                <textarea
                  id="modal-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Verified against Revenue 7/12 Land registry and eKYC database."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#003b5a] h-20"
                />
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
                <span className="material-symbols-outlined text-blue-700 text-[16px] mt-0.5">verified_user</span>
                <span>
                  This decision will be timestamped, associated with your Admin ID, and saved permanently to the state AuditLog repository.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUpdatingApp(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingStatus}
                  className="bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white px-5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {savingStatus ? 'Saving Decision...' : 'Commit Status Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
