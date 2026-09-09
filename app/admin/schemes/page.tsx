'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface SchemeItem {
  _id: string;
  schemeId: string;
  name: string;
  nameMr?: string;
  department: string;
  departmentMr?: string;
  category: string;
  description: string;
  benefits: string;
  incomeCriteria?: string;
  incomeLimit?: number;
  ageCriteria?: string;
  minAge?: number;
  maxAge?: number;
  applicationRoute: string;
  applicationType?: 'scheme' | 'service';
  active: boolean;
  requiredDocuments?: any[];
  keywords?: string[];
  problemTypes?: string[];
}

export default function AdminSchemesPage() {
  const [schemes, setSchemes] = useState<SchemeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [activeFilter, setActiveFilter] = useState('All');

  // Modal State for Add / Edit
  const [editingScheme, setEditingScheme] = useState<Partial<SchemeItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getSchemes({
        department: departmentFilter !== 'All' ? departmentFilter : undefined,
        active: activeFilter !== 'All' ? activeFilter : undefined,
        search: search || undefined,
      });
      if (res.success && Array.isArray(res.schemes)) {
        setSchemes(res.schemes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, [departmentFilter, activeFilter]);

  const handleToggleActive = async (scheme: SchemeItem) => {
    try {
      const res = await adminApi.updateScheme(scheme.schemeId, {
        active: !scheme.active,
      });
      if (res.success) {
        setToastMessage(`Scheme "${scheme.name}" ${!scheme.active ? 'activated' : 'deactivated'}.`);
        fetchSchemes();
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteScheme = async (schemeId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete scheme: ${name}?`)) return;
    try {
      const res = await adminApi.deleteScheme(schemeId);
      if (res.success) {
        setToastMessage(`Scheme "${name}" removed from database.`);
        fetchSchemes();
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSaveScheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;

    setSaving(true);
    try {
      if (isNew) {
        const res = await adminApi.createScheme(editingScheme);
        if (res.success) {
          setToastMessage(`New scheme "${editingScheme.name}" added to repository.`);
          setEditingScheme(null);
          fetchSchemes();
        } else {
          alert(res.error || 'Failed to create scheme.');
        }
      } else {
        const res = await adminApi.updateScheme(editingScheme.schemeId!, editingScheme);
        if (res.success) {
          setToastMessage(`Scheme "${editingScheme.name}" updated successfully.`);
          setEditingScheme(null);
          fetchSchemes();
        } else {
          alert(res.error || 'Failed to update scheme.');
        }
      }
    } catch (err: any) {
      alert(err.message || 'Save failed.');
    } finally {
      setSaving(false);
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  const departments = [
    'All',
    'Higher & Technical Education Department',
    'Agriculture Department',
    'Revenue Department',
    'Social Justice & Special Assistance Department',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
              State Welfare Registry
            </span>
            <span className="text-xs text-slate-500 font-mono">MongoDB Schemes Collection</span>
          </div>
          <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
            Scheme & Government Service Management
          </h1>
          <p className="text-xs text-slate-600">
            Configure state schemes, income limits, eligibility criteria, required documents, and dedicated application routes.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNew(true);
            setEditingScheme({
              schemeId: '',
              name: '',
              nameMr: '',
              department: 'Higher & Technical Education Department',
              category: 'Scholarship',
              description: '',
              benefits: '',
              incomeCriteria: 'Below ₹8,00,000 per annum',
              incomeLimit: 800000,
              minAge: 18,
              maxAge: 35,
              applicationRoute: '/apply/scheme/new-scheme',
              applicationType: 'scheme',
              active: true,
            });
          }}
          className="bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-center"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          <span>Add New Scheme</span>
        </button>
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
            onKeyDown={(e) => e.key === 'Enter' && fetchSchemes()}
            placeholder="Search by Scheme Name, ID, or Keywords..."
            className="w-full h-10 pl-10 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:border-[#003b5a]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">Department:</span>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-bold">Status:</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="All">All</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schemes Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f0f4f9] text-[#002840] border-b border-slate-200 uppercase font-bold text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Scheme / Service Name</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Income Limit</th>
                <th className="py-3.5 px-4">Age Range</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Loading schemes from MongoDB...
                  </td>
                </tr>
              ) : schemes.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No schemes found matching search criteria.
                  </td>
                </tr>
              ) : (
                schemes.map((s) => (
                  <tr key={s.schemeId} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#002840]">{s.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{s.schemeId}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">
                      {s.department}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold">
                        {s.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                      {s.incomeLimit && s.incomeLimit > 0 ? `≤ ₹${s.incomeLimit.toLocaleString()}` : 'No Limit'}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">
                      {s.minAge || 0} - {s.maxAge || 100} yrs
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-500 truncate max-w-[150px]">
                      {s.applicationRoute}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition ${
                          s.active
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-red-50 hover:text-red-700 hover:border-red-300'
                            : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
                        }`}
                        title="Click to toggle Active / Inactive"
                      >
                        {s.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => {
                            setIsNew(false);
                            setEditingScheme(s);
                          }}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-[#002840] hover:text-white text-[#002840] rounded-lg font-bold transition text-[11px]"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteScheme(s.schemeId, s.name)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Scheme"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
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

      {/* Add / Edit Scheme Modal */}
      {editingScheme && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-slate-200 overflow-hidden flex flex-col animate-fadeIn">
            <div className="bg-[#002840] text-white p-5 flex items-center justify-between">
              <h3 className="text-sm font-bold">
                {isNew ? 'Register New Welfare Scheme / Service' : `Edit Scheme: ${editingScheme.name}`}
              </h3>
              <button
                onClick={() => setEditingScheme(null)}
                className="text-slate-300 hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Scheme Name (English) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingScheme.name || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, name: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Scheme Name (Marathi)
                  </label>
                  <input
                    type="text"
                    value={editingScheme.nameMr || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, nameMr: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Department <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingScheme.department || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, department: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <input
                    type="text"
                    value={editingScheme.category || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, category: e.target.value })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={editingScheme.description || ''}
                  onChange={(e) => setEditingScheme({ ...editingScheme, description: e.target.value })}
                  className="w-full p-2.5 border border-slate-300 rounded-xl text-xs h-16"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Financial Benefits & Grants</label>
                <input
                  type="text"
                  value={editingScheme.benefits || ''}
                  onChange={(e) => setEditingScheme({ ...editingScheme, benefits: e.target.value })}
                  className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Income Ceiling (₹)</label>
                  <input
                    type="number"
                    value={editingScheme.incomeLimit || 0}
                    onChange={(e) => setEditingScheme({ ...editingScheme, incomeLimit: Number(e.target.value) })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Min Age</label>
                  <input
                    type="number"
                    value={editingScheme.minAge || 0}
                    onChange={(e) => setEditingScheme({ ...editingScheme, minAge: Number(e.target.value) })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Max Age</label>
                  <input
                    type="number"
                    value={editingScheme.maxAge || 100}
                    onChange={(e) => setEditingScheme({ ...editingScheme, maxAge: Number(e.target.value) })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Application Route <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editingScheme.applicationRoute || ''}
                    onChange={(e) => setEditingScheme({ ...editingScheme, applicationRoute: e.target.value })}
                    placeholder="/apply/scheme/..."
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Type</label>
                  <select
                    value={editingScheme.applicationType || 'scheme'}
                    onChange={(e) => setEditingScheme({ ...editingScheme, applicationType: e.target.value as any })}
                    className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="scheme">Welfare Scheme</option>
                    <option value="service">Statutory Government Service</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingScheme(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white px-5 py-2 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  {saving ? 'Saving...' : 'Save Scheme to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
