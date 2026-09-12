import fs from 'fs';
import path from 'path';

// Parse .env manually
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
} catch {}
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase credentials missing in environment.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false },
});

function assert(condition, message, detail = '') {
  if (!condition) {
    console.error(`❌ ASSERTION FAILED: ${message}`, detail);
    throw new Error(`Assertion failed: ${message} - ${detail}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runVerification() {
  console.log('================================================================');
  console.log('🚀 MAHASETU FULL SUPABASE MIGRATION VERIFICATION SUITE');
  console.log(`Supabase Project: ${SUPABASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('================================================================\n');

  // ── TEST 1: Database Connectivity & Table Check ─────────────────────────────
  console.log('--- TEST 1: Supabase Database Connectivity & Schema ---');
  const { data: deptData, error: deptErr } = await supabase.from('departments').select('*');
  assert(!deptErr && Array.isArray(deptData) && deptData.length >= 5, 'Departments table accessible & seeded with 5 departments', `Count: ${deptData?.length}`);

  const { data: schemesData, error: schemesErr } = await supabase.from('schemes').select('*');
  assert(!schemesErr && Array.isArray(schemesData) && schemesData.length >= 6, 'Schemes table accessible & seeded with schemes', `Count: ${schemesData?.length}`);

  const { data: servicesData, error: servicesErr } = await supabase.from('services').select('*');
  assert(!servicesErr && Array.isArray(servicesData) && servicesData.length >= 5, 'Services table accessible & seeded with services', `Count: ${servicesData?.length}`);

  // ── TEST 2: Admin Authentication ────────────────────────────────────────────
  console.log('\n--- TEST 2: Admin Authentication (1120610 / m@h@admin) ---');
  const { data: adminUser, error: adminErr } = await supabase
    .from('admin_users')
    .select('*')
    .eq('admin_id', '1120610')
    .maybeSingle();

  assert(!adminErr && adminUser, 'Admin record exists in admin_users table');
  const passwordMatches = bcrypt.compareSync('m@h@admin', adminUser.password_hash);
  assert(passwordMatches, 'Admin password matches bcrypt hash in Supabase');

  // ── TEST 3: Live Analytics Calculation ──────────────────────────────────────
  console.log('\n--- TEST 3: Supabase Live Analytics Calculation ---');
  const [
    { count: totalCitizens },
    { count: totalApps },
    { count: totalSchemes },
    { count: totalServices },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('schemes').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('active', true),
  ]);

  assert(typeof totalCitizens === 'number' && totalCitizens >= 6, 'Citizen profiles count is positive', `Count: ${totalCitizens}`);
  assert(typeof totalApps === 'number' && totalApps >= 3, 'Applications count is positive', `Count: ${totalApps}`);
  assert(typeof totalSchemes === 'number' && totalSchemes >= 6, 'Active schemes count is positive', `Count: ${totalSchemes}`);
  assert(typeof totalServices === 'number' && totalServices >= 5, 'Active services count is positive', `Count: ${totalServices}`);

  // ── TEST 4: Fresh Citizen Registration & Strict 0-State Isolation ──────────
  console.log('\n--- TEST 4: Fresh Citizen Registration & 0-State Baseline Verification ---');
  const testMobile = '98' + Math.floor(10000000 + Math.random() * 90000000);
  const testAadhaar = '55' + Math.floor(1000000000 + Math.random() * 9000000000);
  const aadhaarHash = crypto.createHash('sha256').update(testAadhaar).digest('hex');
  const testUserId = `MH-CIT-TEST-${Date.now().toString(36).toUpperCase()}`;

  const { data: newProfile, error: regErr } = await supabase
    .from('profiles')
    .insert({
      user_id: testUserId,
      full_name: 'Shri Testing Citizen',
      mobile_number: testMobile,
      email: `citizen.${testMobile}@mahasetu.gov.in`,
      aadhaar_hash: aadhaarHash,
      aadhaar_masked: `XXXX XXXX ${testAadhaar.slice(-4)}`,
      aadhaar_consent_given: true,
      confirmed_accurate: false,
      profile_completed: false,
    })
    .select()
    .single();

  assert(!regErr && newProfile, 'Fresh citizen registered in Supabase profiles', `UserId: ${testUserId}`);

  // Check 0 applications, 0 user documents for fresh citizen
  const { data: freshApps } = await supabase.from('applications').select('*').eq('user_id', testUserId);
  assert(Array.isArray(freshApps) && freshApps.length === 0, 'New citizen strictly starts with ZERO applications', `Count: ${freshApps?.length}`);

  const { data: freshDocs } = await supabase.from('documents').select('*').eq('user_id', testUserId);
  assert(Array.isArray(freshDocs) && freshDocs.length === 0, 'New citizen strictly starts with ZERO documents', `Count: ${freshDocs?.length}`);

  // ── TEST 5: Profile Update ──────────────────────────────────────────────────
  console.log('\n--- TEST 5: Citizen Demographic Profile Update ---');
  const { data: updatedProfile, error: updateErr } = await supabase
    .from('profiles')
    .update({
      district: 'Pune',
      taluka: 'Haveli',
      annual_income_amount: 180000,
      annual_income: '₹1,50,000 - ₹3,00,000',
      caste_category: 'OBC',
      occupation: 'Farmer / Agriculturist',
      confirmed_accurate: true,
      profile_completed: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', testUserId)
    .select()
    .single();

  if (updateErr) {
    console.error('  Update profile error details:', updateErr);
  }
  assert(!updateErr && updatedProfile?.confirmed_accurate === true, 'Profile updated and confirmed in Supabase', `District: ${updatedProfile?.district}`);

  // ── TEST 6: DigiLocker Document Sync ────────────────────────────────────────
  console.log('\n--- TEST 6: DigiLocker Integration & Certificate Synchronization ---');
  const testDocId = `DOC-TEST-${Date.now()}`;
  const { data: syncedDoc, error: docErr } = await supabase
    .from('documents')
    .insert({
      document_id: testDocId,
      user_id: testUserId,
      document_type: 'Income Proof',
      document_name: 'Annual Income Certificate (1 Year)',
      source: 'DigiLocker',
      verification_status: 'Verified',
      file_size: '250 KB',
      file_name: 'income_cert.pdf',
    })
    .select()
    .single();

  assert(!docErr && syncedDoc, 'DigiLocker certificate inserted into Supabase documents', `DocId: ${syncedDoc?.document_id}`);

  // ── TEST 7: Application Submission (Separate Scheme vs Service) ─────────────
  console.log('\n--- TEST 7: Application Submission (Scheme vs Service Isolation) ---');
  const schemeAppId = `MH-SCH-2026-${Math.floor(10000 + Math.random() * 90000)}`;
  const { data: schemeApp, error: appErr } = await supabase
    .from('applications')
    .insert({
      application_id: schemeAppId,
      user_id: testUserId,
      type: 'scheme',
      scheme_id: 'SCH-001',
      scheme_name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna',
      service_name: 'Rajarshi Chhatrapati Shahu Maharaj Shikshan Shulkh Shishyavrutti Yojna',
      department_id: 'education',
      department: 'Higher & Technical Education Department',
      applicant_name: 'Shri Testing Citizen',
      district: 'Pune',
      status: 'Submitted',
      status_color: 'bg-blue-100 text-blue-800 border-blue-300',
      applied_date: '13 Sep 2026',
    })
    .select()
    .single();

  if (appErr) {
    console.error('  Scheme application insert error details:', appErr);
  }
  assert(!appErr && schemeApp?.type === 'scheme', 'Scheme application submitted successfully to Supabase', `AppId: ${schemeApp?.application_id}`);

  // Add timeline entry
  const { error: timelineErr } = await supabase.from('application_timeline').insert({
    application_id: schemeAppId,
    status: 'Submitted',
    message: 'Application submitted through MahaSetu Portal.',
    changed_by: 'Citizen',
  });
  assert(!timelineErr, 'Application timeline event logged in Supabase application_timeline');

  // ── TEST 8: Application Status Transition & Workflow ────────────────────────
  console.log('\n--- TEST 8: Administrative Status Transition & Audit Trail ---');
  const { data: reviewedApp, error: statusErr } = await supabase
    .from('applications')
    .update({
      status: 'Under Scrutiny',
      status_color: 'bg-amber-100 text-amber-800 border-amber-300',
      remarks: 'Documents verified by Desk Officer. Forwarded to Tahsildar.',
      last_updated: new Date().toISOString(),
    })
    .eq('application_id', schemeAppId)
    .select()
    .single();

  assert(!statusErr && reviewedApp.status === 'Under Scrutiny', 'Application status transitioned to Under Scrutiny', `Remarks: ${reviewedApp?.remarks}`);

  // Create audit log
  const { error: auditErr } = await supabase.from('audit_logs').insert({
    log_id: `AUD-TEST-${Date.now()}`,
    actor_id: '1120610',
    actor_role: 'admin',
    action: 'APPLICATION_STATUS_UPDATED',
    target_resource: 'Application',
    target_id: schemeAppId,
    status: 'SUCCESS',
    metadata: { newStatus: 'Under Scrutiny' },
  });
  assert(!auditErr, 'Audit log persisted in Supabase audit_logs');

  // ── TEST 9: DPDP Consent Lifecycle ──────────────────────────────────────────
  console.log('\n--- TEST 9: DPDP Consent Lifecycle (Active -> Revoked -> Active) ---');
  const consentId = `CNS-TEST-${Date.now()}`;
  const { data: createdConsent, error: consentErr } = await supabase
    .from('consents')
    .insert({
      consent_id: consentId,
      user_id: testUserId,
      requesting_dept: 'Higher & Technical Education Department',
      source_dept: 'Revenue Department',
      purpose: 'Scholarship Income Tier Verification',
      status: 'Active',
      granted: true,
      valid_until: '31 Mar 2027',
    })
    .select()
    .single();

  assert(!consentErr && createdConsent.status === 'Active', 'Consent record created as Active', `ConsentId: ${consentId}`);

  const { data: revokedConsent } = await supabase
    .from('consents')
    .update({ status: 'Revoked', granted: false, revoked_at: new Date().toISOString() })
    .eq('consent_id', consentId)
    .select()
    .single();

  assert(revokedConsent?.status === 'Revoked', 'Consent revoked under citizen statutory DPDP rights');

  // Clean up test user
  await supabase.from('application_timeline').delete().eq('application_id', schemeAppId);
  await supabase.from('applications').delete().eq('user_id', testUserId);
  await supabase.from('documents').delete().eq('user_id', testUserId);
  await supabase.from('consents').delete().eq('user_id', testUserId);
  await supabase.from('profiles').delete().eq('user_id', testUserId);
  console.log('  🧹 Cleaned up temporary test citizen data.');

  console.log('\n================================================================');
  console.log('🎉 ALL 9 MAHASETU SUPABASE MIGRATION VERIFICATION SUITES PASSED!');
  console.log('================================================================\n');
}

runVerification().catch((err) => {
  console.error('Fatal Verification Error:', err);
  process.exit(1);
});
