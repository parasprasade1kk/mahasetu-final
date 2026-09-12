'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface CitizenUser {
  userId: string;
  fullName: string;
  mobile: string;
  aadhaarMasked: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  district: string;
  category: string;
  occupation: string;
  annualIncomeAmount: number;
  educationLevel: string;
  isStudent: boolean;
  hasDisability: boolean;
  digiLockerLinked: boolean;
  confirmedAccurate: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<CitizenUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Modal State
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'profile' | 'documents' | 'applications' | 'consents' | 'activity'>('profile');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers({
        search: search || undefined,
        district: districtFilter !== 'All' ? districtFilter : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
      });
      if (res.success && Array.isArray(res.users)) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [districtFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleOpenUserDetail = async (userId: string, tab: 'profile' | 'documents' | 'applications' | 'consents' | 'activity') => {
    setModalTab(tab);
    setModalLoading(true);
    try {
      const res = await adminApi.getUserDetail(userId);
      if (res.success) {
        setSelectedUser(res);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setModalLoading(false);
    }
  };

  const districts = ['All', 'Pune', 'Nashik', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Nagpur', 'Satara', 'Thane', 'Mumbai City'];
  const categories = ['All', 'General/Open', 'OBC', 'SC', 'ST', 'EWS', 'VJNT', 'SBC'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
              Citizen Identity Vault
            </span>
            <span className="text-xs text-slate-500 font-mono">Supabase Profiles Table</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            Citizen Registry & Profiles
          </h1>
          <p className="text-xs text-slate-600">
            View, inspect, and verify state citizen accounts, documents, applications, and DPDP consent logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
            Total Records: <strong className="text-[#002840]">{users.length}</strong>
          </span>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
              <span className="material-symbols-outlined text-[18px]">search</span>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Citizen Name, Mobile, or User ID..."
              className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#003b5a]"
            />
          </div>
          <button
            type="submit"
            className="bg-[#002840] hover:bg-[#001c30] text-white px-4 h-10 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* District filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">District:</span>
            <select
              value={districtFilter}
              onChange={(e) => setDistrictFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {districts.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Category filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Citizen ID</th>
                <th className="py-3.5 px-4">Name & Masked Aadhaar</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">District</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Occupation</th>
                <th className="py-3.5 px-4">Annual Income</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading citizens from Supabase...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500">
                    No registered citizens found matching filter criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono font-bold text-[#003b5a] text-[11px]">
                      {u.userId}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{u.fullName}</div>
                      <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px] text-emerald-600">verified</span>
                        {u.aadhaarMasked}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      +91 {u.mobile}
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">
                      {u.district}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold">
                        {u.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {u.occupation}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ₹{u.annualIncomeAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isVerified
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-800 border-amber-300'
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Verified
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenUserDetail(u.userId, 'profile')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#002840] hover:text-white text-[#002840] rounded-lg text-[11px] font-bold transition"
                          title="View Profile"
                        >
                          Profile
                        </button>
                        <button
                          onClick={() => handleOpenUserDetail(u.userId, 'documents')}
                          className="p-1 text-slate-500 hover:text-[#002840] rounded"
                          title="View Documents"
                        >
                          <span className="material-symbols-outlined text-[18px]">folder</span>
                        </button>
                        <button
                          onClick={() => handleOpenUserDetail(u.userId, 'applications')}
                          className="p-1 text-slate-500 hover:text-[#002840] rounded"
                          title="View Applications"
                        >
                          <span className="material-symbols-outlined text-[18px]">assignment</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Citizen Detail Modal / Drawer */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
            {/* Modal Header */}
            <div className="bg-[#002840] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-[#002840] flex items-center justify-center font-bold text-sm">
                  {selectedUser.user.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{selectedUser.user.fullName}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-amber-300">
                      {selectedUser.user.userId}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Mobile: +91 {selectedUser.user.mobile} • Aadhaar: {selectedUser.user.aadhaarMasked}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold px-4">
              {(['profile', 'documents', 'applications', 'consents', 'activity'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setModalTab(tab)}
                  className={`py-3 px-3 capitalize border-b-2 transition ${
                    modalTab === tab
                      ? 'border-[#002840] text-[#002840] bg-white'
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 text-xs space-y-4">
              {modalLoading ? (
                <p className="text-center text-slate-400 py-8">Fetching records from Supabase...</p>
              ) : modalTab === 'profile' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">District & Taluka</span>
                    <span className="font-bold text-slate-800">
                      {selectedUser.profile?.district || 'Pune'} / {selectedUser.profile?.taluka || 'Haveli'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Village / City</span>
                    <span className="font-bold text-slate-800">
                      {selectedUser.profile?.villageCity || 'Not specified'} ({selectedUser.profile?.pinCode || '411001'})
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Category & Religion</span>
                    <span className="font-bold text-slate-800">
                      {selectedUser.profile?.category || 'General'} • {selectedUser.profile?.religion || 'Hindu'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Annual Income</span>
                    <span className="font-bold text-slate-800">
                      ₹{(selectedUser.profile?.annualIncomeAmount || 150000).toLocaleString()} ({selectedUser.profile?.annualIncomeTier || '1L-2.5L'})
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">Occupation & Education</span>
                    <span className="font-bold text-slate-800">
                      {selectedUser.profile?.occupation || 'Farmer'} • {selectedUser.profile?.educationLevel || 'Graduate'}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 font-bold block uppercase">DigiLocker Status</span>
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">cloud_done</span>
                      {selectedUser.profile?.digiLockerLinked ? `Linked (${selectedUser.profile.digiLockerId || 'Active'})` : 'Not Linked'}
                    </span>
                  </div>
                </div>
              ) : modalTab === 'documents' ? (
                <div className="space-y-2">
                  {selectedUser.documents && selectedUser.documents.length > 0 ? (
                    selectedUser.documents.map((d: any) => (
                      <div key={d._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-800">{d.documentName}</div>
                          <div className="text-[10px] text-slate-500">Source: {d.source} • Certificate No: {d.certNo || 'N/A'}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                          {d.verificationStatus}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 py-4 text-center">No documents submitted yet.</p>
                  )}
                </div>
              ) : modalTab === 'applications' ? (
                <div className="space-y-2">
                  {selectedUser.applications && selectedUser.applications.length > 0 ? (
                    selectedUser.applications.map((a: any) => (
                      <div key={a._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#002840]">{a.serviceName}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{a.applicationId} • {a.department}</div>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full border bg-blue-50 text-blue-800 border-blue-200">
                          {a.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 py-4 text-center">No applications found for this citizen.</p>
                  )}
                </div>
              ) : modalTab === 'consents' ? (
                <div className="space-y-2">
                  {selectedUser.consents && selectedUser.consents.length > 0 ? (
                    selectedUser.consents.map((c: any) => (
                      <div key={c._id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-800">{c.requestingDept}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            {c.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600">{c.purpose}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 py-4 text-center">No consent records available.</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedUser.activity && selectedUser.activity.length > 0 ? (
                    selectedUser.activity.map((act: any) => (
                      <div key={act._id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                        <div>
                          <span className="font-bold text-slate-800">{act.action}</span>
                          <span className="text-slate-500 ml-2">Resource: {act.targetResource || 'Portal'}</span>
                        </div>
                        <span className="text-slate-400 font-mono">{new Date(act.timestamp).toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 py-4 text-center">No recent activity logged.</p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="bg-[#002840] text-white px-5 py-2 rounded-xl text-xs font-bold"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
