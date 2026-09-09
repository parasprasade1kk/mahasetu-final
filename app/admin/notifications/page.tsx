'use client';

import React, { useState } from 'react';
import { adminApi } from '@/lib/api';

export default function AdminNotificationsPage() {
  const [title, setTitle] = useState('');
  const [titleMr, setTitleMr] = useState('');
  const [message, setMessage] = useState('');
  const [messageMr, setMessageMr] = useState('');
  const [type, setType] = useState<'info' | 'success' | 'warning' | 'action_required'>('info');
  const [targetUserId, setTargetUserId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    setSubmitting(true);
    try {
      const res = await adminApi.broadcastNotification({
        title,
        titleMr: titleMr || title,
        message,
        messageMr: messageMr || message,
        type,
        targetUserId: targetUserId.trim() || undefined,
      });

      setSubmitting(false);
      if (res.success) {
        setToast(`Broadcast successfully delivered to ${res.count} citizen(s).`);
        setTitle('');
        setTitleMr('');
        setMessage('');
        setMessageMr('');
        setTargetUserId('');
        setTimeout(() => setToast(''), 5000);
      } else {
        alert(res.error || 'Failed to dispatch notification.');
      }
    } catch (err: any) {
      setSubmitting(false);
      alert(err.message || 'Dispatch error.');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            Citizen Alert Gateway
          </span>
          <span className="text-xs text-slate-500 font-mono">Push & Dashboard Notices</span>
        </div>
        <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
          Broadcast Official Notifications
        </h1>
        <p className="text-xs text-slate-600">
          Publish statutory notices, scheme application deadline reminders, and welfare disbursal alerts to citizens across Maharashtra.
        </p>
      </div>

      {toast && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm animate-fadeIn">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{toast}</span>
        </div>
      )}

      {/* Broadcast Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#002840] text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[22px]">campaign</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#002840]">Compose State Announcement</h2>
            <p className="text-[11px] text-slate-500">
              Notices will appear on citizen dashboards upon login.
            </p>
          </div>
        </div>

        <form onSubmit={handleBroadcast} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Notice Title (English) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. MahaDBT Scholarship Deadline Extended"
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
                required
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Notice Title (Marathi)
              </label>
              <input
                type="text"
                value={titleMr}
                onChange={(e) => setTitleMr(e.target.value)}
                placeholder="उदा. महाडीबीटी शिष्यवृत्ती मुदतवाढ"
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Alert Category</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                <option value="info">General Information (Blue)</option>
                <option value="success">Benefit Disbursed / Approval (Green)</option>
                <option value="warning">Deadline Warning / Verification (Amber)</option>
                <option value="action_required">Action Required / Documents (Red)</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Target Recipient</label>
              <input
                type="text"
                value={targetUserId}
                onChange={(e) => setTargetUserId(e.target.value)}
                placeholder="Leave blank for ALL registered citizens, or enter Citizen ID"
                className="w-full h-10 px-3 border border-slate-300 rounded-xl text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Detailed Message Content (English) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter comprehensive notice text..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs h-24"
              required
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Detailed Message Content (Marathi)
            </label>
            <textarea
              value={messageMr}
              onChange={(e) => setMessageMr(e.target.value)}
              placeholder="सविस्तर सूचना प्रविष्ट करा..."
              className="w-full p-3 border border-slate-300 rounded-xl text-xs h-20"
            />
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
            <span>
              Broadcasting to all citizens will generate individual verified notification records stored in MongoDB.
            </span>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-[#002840] hover:bg-[#001c30] text-amber-300 hover:text-white px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-gov"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
              <span>{submitting ? 'Dispatching...' : 'Broadcast Notice Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
