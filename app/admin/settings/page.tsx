'use client';

import React from 'react';

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
            System & Infrastructure
          </span>
          <span className="text-xs text-slate-500 font-mono">Environment & Security Policies</span>
        </div>
        <h1 className="text-2xl font-black text-[#002840] mt-1 tracking-tight">
          Portal Administration & Security Settings
        </h1>
        <p className="text-xs text-slate-600">
          System operational configurations, cryptographic parameters, MongoDB Atlas status, and statutory DPDP compliance.
        </p>
      </div>

      {/* Database Status Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">database</span>
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Database Engine: MongoDB Atlas</h2>
              <p className="text-xs text-slate-500">Persistent Cloud Database Cluster</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Operational (Mongoose ODM)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Connection URI</span>
            <span className="font-mono font-bold text-[#002840]">Configured in .env (MONGODB_URI)</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-bold block text-[10px] uppercase">Collections Maintained</span>
            <span className="font-bold text-slate-800">
              Users, Profiles, Schemes, Applications, Documents, Consents, AuditLogs, Notifications, DigiLocker
            </span>
          </div>
        </div>
      </div>

      {/* Security & Access Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#002840] text-amber-400 flex items-center justify-center">
            <span className="material-symbols-outlined text-[24px]">lock</span>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Security & Access Management</h2>
            <p className="text-xs text-slate-500">Cryptographic tokens, password hashes, and rate limiting</p>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">Administrator Credentials</div>
              <div className="text-[11px] text-slate-500">Admin ID: 1120610 (Stored as bcrypt hash with salt rounds = 10)</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              BCrypt Hash Protected
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">Session JWT Token Validity</div>
              <div className="text-[11px] text-slate-500">Citizen: 7 Days • Administrator: 12 Hours</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              HMAC-SHA256 Signed
            </span>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <div className="font-bold text-slate-800">Aadhaar Privacy Guarantee</div>
              <div className="text-[11px] text-slate-500">Full Aadhaar numbers are never logged or stored in plain text</div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200">
              Masked (XXXX XXXX 1234)
            </span>
          </div>
        </div>
      </div>

      {/* Deployment & Architecture Specs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-3 text-xs">
        <h3 className="font-bold text-slate-800 text-sm">Target Cloud Architecture</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Frontend Layer</span>
            <div className="font-bold text-[#002840]">Vercel Edge Network</div>
            <div className="text-[11px] text-slate-500">Next.js 14 App Router</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Backend API</span>
            <div className="font-bold text-[#002840]">Render Cloud Service</div>
            <div className="text-[11px] text-slate-500">Node.js / Express.js REST APIs</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold block uppercase">Database Layer</span>
            <div className="font-bold text-[#002840]">MongoDB Atlas Cluster</div>
            <div className="text-[11px] text-slate-500">Mongoose ODM 8.8+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
