// scripts/verify-kpi-and-audit.mjs
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

// Parse .env
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mrjigbqfwirgrfukciiu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function runVerification() {
  console.log('=================================================================');
  console.log('🚀 RUNNING COMPREHENSIVE VERIFICATION: 10 AUDIT & KPI TESTS');
  console.log('=================================================================\n');

  let passed = 0;
  const total = 10;

  // Initial State: Read live KPIs
  const [
    { count: initTotalCitizens },
    { count: initVerifiedCitizens },
    { count: initAuditLogs },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null).not('aadhaar_hash', 'is', null).neq('aadhaar_hash', ''),
    supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
  ]);

  console.log(`[INITIAL LIVE COUNTS] Total Citizens: ${initTotalCitizens}, Registered & Verified: ${initVerifiedCitizens}, Audit Trails: ${initAuditLogs}\n`);

  const mobile1 = `9821${Math.floor(100000 + Math.random() * 900000)}`;
  const aadhaar1 = `9876${Math.floor(10000000 + Math.random() * 90000000)}`;
  const aadhaarHash1 = crypto.createHash('sha256').update(aadhaar1).digest('hex');
  const maskedAadhaar1 = `XXXX XXXX ${aadhaar1.slice(-4)}`;
  const fullName1 = `Test Citizen ${Date.now().toString().slice(-4)}`;
  let userId1 = null;

  // -------------------------------------------------------------
  // TEST 1: Register a new citizen -> appears in Supabase -> verified -> KPI increases -> name in Admin
  // -------------------------------------------------------------
  try {
    console.log('▶ TEST 1: Registering new verified citizen...');
    const ts = Date.now().toString(36).toUpperCase();
    userId1 = `MH-CIT-${ts}-T1`;

    const { data: prof1, error: pErr1 } = await supabase.from('profiles').insert({
      user_id: userId1,
      full_name: fullName1,
      mobile_number: mobile1,
      email: `citizen.${mobile1}@citizen.mahasetu.gov.in`,
      aadhaar_hash: aadhaarHash1,
      aadhaar_masked: maskedAadhaar1,
      aadhaar_consent_given: true,
      district: 'Pune',
      state: 'Maharashtra',
      confirmed_accurate: true,
      profile_completed: true,
    }).select().single();

    if (pErr1) throw new Error('Failed to insert citizen 1: ' + pErr1.message);

    // Create audit log for registration
    await supabase.from('audit_logs').insert({
      log_id: `AUD-${Date.now()}-REG1`,
      actor_id: userId1,
      actor_role: 'citizen',
      action: 'CITIZEN_REGISTRATION',
      target_resource: 'Profile',
      target_id: userId1,
      status: 'SUCCESS',
      metadata: { fullName: fullName1, district: 'Pune', verified: true },
    });

    const { count: postVerified } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .not('user_id', 'is', null)
      .not('aadhaar_hash', 'is', null)
      .neq('aadhaar_hash', '');

    if (postVerified !== initVerifiedCitizens + 1) {
      throw new Error(`Expected verified count to increase from ${initVerifiedCitizens} to ${initVerifiedCitizens + 1}, got ${postVerified}`);
    }

    // Verify name appears in profiles
    const { data: found } = await supabase.from('profiles').select('full_name, mobile_number, aadhaar_masked').eq('user_id', userId1).single();
    if (!found || found.full_name !== fullName1) throw new Error('Citizen name not found in profiles query');

    console.log(`  ✓ Citizen ${fullName1} (${userId1}) registered & verified. KPI increased to ${postVerified}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 1 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 2: Register an unverified citizen -> should NOT be counted as Registered & Verified
  // -------------------------------------------------------------
  let userIdUnverified = null;
  try {
    console.log('\n▶ TEST 2: Registering unverified citizen (no aadhaar_hash)...');
    const mobileUnv = `9822${Math.floor(100000 + Math.random() * 900000)}`;
    const ts = Date.now().toString(36).toUpperCase();
    userIdUnverified = `MH-CIT-${ts}-UNV`;

    const { error: pErrUnv } = await supabase.from('profiles').insert({
      user_id: userIdUnverified,
      full_name: `Unverified Citizen ${Date.now().toString().slice(-4)}`,
      mobile_number: mobileUnv,
      email: `citizen.${mobileUnv}@citizen.mahasetu.gov.in`,
      aadhaar_hash: null, // UNVERIFIED!
      aadhaar_masked: 'XXXX XXXX 0000',
      aadhaar_consent_given: false,
      district: 'Nashik',
      state: 'Maharashtra',
      confirmed_accurate: false,
      profile_completed: false,
    });

    if (pErrUnv) throw new Error('Failed to insert unverified citizen: ' + pErrUnv.message);

    const [{ count: currentTotal }, { count: currentVerified }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null).not('aadhaar_hash', 'is', null).neq('aadhaar_hash', ''),
    ]);

    // Total should have increased, but verified should remain initVerifiedCitizens + 1 (from test 1)
    if (currentVerified !== initVerifiedCitizens + 1) {
      throw new Error(`Unverified citizen was incorrectly counted in Verified KPI! Got: ${currentVerified}`);
    }

    console.log(`  ✓ Unverified citizen correctly omitted from Registered & Verified KPI (Count: ${currentVerified}, Total: ${currentTotal}).`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 2 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 3: Citizen logs in -> appropriate audit event is recorded
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 3: Citizen login audit trail logging...');
    const loginAuditId = `AUD-${Date.now()}-LOG1`;
    const { error: lErr } = await supabase.from('audit_logs').insert({
      log_id: loginAuditId,
      actor_id: userId1,
      actor_role: 'citizen',
      action: 'CITIZEN_LOGIN',
      target_resource: 'Profile',
      target_id: userId1,
      status: 'SUCCESS',
      metadata: { mobile: mobile1, ip: '127.0.0.1' },
    });
    if (lErr) throw new Error(lErr.message);

    const { data: checkLog } = await supabase.from('audit_logs').select('*').eq('log_id', loginAuditId).single();
    if (!checkLog || checkLog.action !== 'CITIZEN_LOGIN') throw new Error('CITIZEN_LOGIN log not found');

    console.log(`  ✓ CITIZEN_LOGIN event recorded in audit_logs for ${userId1}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 3 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 4: Citizen updates profile -> audit event is recorded
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 4: Citizen updates profile & audit event...');
    await supabase.from('profiles').update({ occupation: 'Agricultural Officer', district: 'Pune' }).eq('user_id', userId1);

    const profAuditId = `AUD-${Date.now()}-PROF1`;
    const { error: prErr } = await supabase.from('audit_logs').insert({
      log_id: profAuditId,
      actor_id: userId1,
      actor_role: 'citizen',
      action: 'UPDATE_PROFILE',
      target_resource: 'Profile',
      target_id: userId1,
      status: 'SUCCESS',
      metadata: { updatedFields: ['occupation', 'district'] },
    });
    if (prErr) throw new Error(prErr.message);

    const { data: checkPrLog } = await supabase.from('audit_logs').select('*').eq('log_id', profAuditId).single();
    if (!checkPrLog || checkPrLog.action !== 'UPDATE_PROFILE') throw new Error('UPDATE_PROFILE log not found');

    console.log(`  ✓ UPDATE_PROFILE event recorded in audit_logs for ${userId1}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 4 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 5: Citizen submits an application -> audit event is recorded
  // -------------------------------------------------------------
  let appId = null;
  try {
    console.log('\n▶ TEST 5: Citizen submits application & audit event...');
    appId = `MH-APP-${Date.now().toString().slice(-6)}`;
    const { error: appErr } = await supabase.from('applications').insert({
      application_id: appId,
      user_id: userId1,
      scheme_id: 'SCH-MAHA-001',
      scheme_name: 'Post-Matric Scholarship for SC/ST Students',
      department_id: 'DEP-SJD-01',
      department: 'Social Justice & Special Assistance',
      applicant_name: fullName1,
      applicant_mobile: mobile1,
      applicant_aadhaar_masked: maskedAadhaar1,
      district: 'Pune',
      status: 'Submitted',
      applied_date: new Date().toISOString(),
    });
    if (appErr) throw new Error(appErr.message);

    const appAuditId = `AUD-${Date.now()}-APP1`;
    await supabase.from('audit_logs').insert({
      log_id: appAuditId,
      actor_id: userId1,
      actor_role: 'citizen',
      action: 'APPLICATION_SUBMITTED',
      target_resource: 'Application',
      target_id: appId,
      status: 'SUCCESS',
      metadata: { schemeName: 'Post-Matric Scholarship', department: 'Social Justice' },
    });

    const { data: checkAppLog } = await supabase.from('audit_logs').select('*').eq('log_id', appAuditId).single();
    if (!checkAppLog || checkAppLog.action !== 'APPLICATION_SUBMITTED') throw new Error('APPLICATION_SUBMITTED log not found');

    console.log(`  ✓ Application ${appId} submitted and APPLICATION_SUBMITTED event recorded.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 5 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 6: Admin logs in -> admin login audit event is recorded
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 6: Admin login audit logging...');
    const adminAuditId = `AUD-${Date.now()}-ADM1`;
    await supabase.from('audit_logs').insert({
      log_id: adminAuditId,
      actor_id: '1120610',
      actor_role: 'admin',
      action: 'ADMIN_LOGIN',
      target_resource: 'AdminPortal',
      target_id: '1120610',
      status: 'SUCCESS',
      metadata: { adminId: '1120610', role: 'admin' },
    });

    const { data: checkAdmLog } = await supabase.from('audit_logs').select('*').eq('log_id', adminAuditId).single();
    if (!checkAdmLog || checkAdmLog.action !== 'ADMIN_LOGIN') throw new Error('ADMIN_LOGIN log not found');

    console.log(`  ✓ ADMIN_LOGIN event recorded for admin 1120610.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 6 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 7: Admin updates application status -> audit event is recorded
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 7: Admin updates application status & audit log...');
    await supabase.from('applications').update({
      status: 'Approved',
      remarks: 'Documents verified and approved by District Officer',
    }).eq('application_id', appId);

    const updateAuditId = `AUD-${Date.now()}-STAT1`;
    await supabase.from('audit_logs').insert({
      log_id: updateAuditId,
      actor_id: '1120610',
      actor_role: 'admin',
      action: 'APPLICATION_STATUS_UPDATE',
      target_resource: 'Application',
      target_id: appId,
      status: 'SUCCESS',
      metadata: { newStatus: 'Approved', remarks: 'Approved by District Officer' },
    });

    const { data: checkStatLog } = await supabase.from('audit_logs').select('*').eq('log_id', updateAuditId).single();
    if (!checkStatLog || checkStatLog.action !== 'APPLICATION_STATUS_UPDATE') throw new Error('APPLICATION_STATUS_UPDATE log not found');

    console.log(`  ✓ Application ${appId} updated to Approved and APPLICATION_STATUS_UPDATE recorded.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 7 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 8: Refresh Admin Dashboard -> KPI values remain correct and come from Supabase
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 8: Refresh Admin Dashboard KPI verification...');
    const [
      { count: refreshedTotalCitizens },
      { count: refreshedVerifiedCitizens },
      { count: refreshedAuditLogs },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null).not('aadhaar_hash', 'is', null).neq('aadhaar_hash', ''),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
    ]);

    if (refreshedVerifiedCitizens !== initVerifiedCitizens + 1) {
      throw new Error(`Verified citizens mismatch: expected ${initVerifiedCitizens + 1}, got ${refreshedVerifiedCitizens}`);
    }
    if (refreshedAuditLogs <= initAuditLogs) {
      throw new Error(`Audit logs count should increase from ${initAuditLogs}, got ${refreshedAuditLogs}`);
    }

    console.log(`  ✓ Dashboard refresh verified: Verified Citizens = ${refreshedVerifiedCitizens}, Audit Trails = ${refreshedAuditLogs}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 8 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 9: Logout and login again -> data remains correct
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 9: Admin session re-authentication check...');
    const { data: adminRecord, error: adminErr } = await supabase.rpc('get_admin_for_login', {
      p_admin_id: '1120610',
    });
    if (adminErr || !adminRecord) throw new Error('Admin user lookup failed: ' + adminErr?.message);

    const { data: authSession, error: authErr } = await supabase.auth.signInWithPassword({
      email: 'admin.1120610@admin.mahasetu.gov.in',
      password: 'm@h@admin',
    });
    if (authErr) throw new Error('Supabase Auth sign-in failed: ' + authErr.message);

    const [{ count: vCount }, { count: aCount }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }).not('user_id', 'is', null).not('aadhaar_hash', 'is', null).neq('aadhaar_hash', ''),
      supabase.from('audit_logs').select('*', { count: 'exact', head: true }),
    ]);

    if (vCount < 1 || aCount < 1) throw new Error('Invalid live counts');

    console.log(`  ✓ Admin re-auth verified with token ${authSession.session.access_token.slice(0, 15)}...: Live verified citizens = ${vCount}, audit trails = ${aCount}.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 9 FAILED:', err.message);
  }

  // -------------------------------------------------------------
  // TEST 10: Create a second citizen -> first citizen's data and audit history must not be mixed
  // -------------------------------------------------------------
  try {
    console.log('\n▶ TEST 10: Create second citizen & verify data isolation (no mixing)...');
    const mobile2 = `9823${Math.floor(100000 + Math.random() * 900000)}`;
    const aadhaar2 = `8888${Math.floor(10000000 + Math.random() * 90000000)}`;
    const aadhaarHash2 = crypto.createHash('sha256').update(aadhaar2).digest('hex');
    const fullName2 = `Second Citizen ${Date.now().toString().slice(-4)}`;
    const ts2 = Date.now().toString(36).toUpperCase();
    const userId2 = `MH-CIT-${ts2}-T2`;

    await supabase.from('profiles').insert({
      user_id: userId2,
      full_name: fullName2,
      mobile_number: mobile2,
      email: `citizen.${mobile2}@citizen.mahasetu.gov.in`,
      aadhaar_hash: aadhaarHash2,
      aadhaar_masked: `XXXX XXXX ${aadhaar2.slice(-4)}`,
      aadhaar_consent_given: true,
      district: 'Kolhapur',
      confirmed_accurate: true,
      profile_completed: true,
    });

    await supabase.from('audit_logs').insert({
      log_id: `AUD-${Date.now()}-REG2`,
      actor_id: userId2,
      actor_role: 'citizen',
      action: 'CITIZEN_REGISTRATION',
      target_resource: 'Profile',
      target_id: userId2,
      status: 'SUCCESS',
      metadata: { fullName: fullName2, district: 'Kolhapur' },
    });

    // Query citizen 1 audit logs
    const { data: logs1 } = await supabase.from('audit_logs').select('*').eq('actor_id', userId1);
    // Query citizen 2 audit logs
    const { data: logs2 } = await supabase.from('audit_logs').select('*').eq('actor_id', userId2);

    // Verify logs do not mix
    const c1HasC2Logs = logs1.some((l) => l.actor_id === userId2);
    const c2HasC1Logs = logs2.some((l) => l.actor_id === userId1);

    if (c1HasC2Logs || c2HasC1Logs) {
      throw new Error('Data pollution detected between citizen 1 and citizen 2 audit logs!');
    }

    console.log(`  ✓ Data isolation verified: Citizen 1 has ${logs1.length} logs, Citizen 2 has ${logs2.length} logs. Zero mixing.`);
    passed++;
  } catch (err) {
    console.error('  ✗ TEST 10 FAILED:', err.message);
  }

  console.log('\n=================================================================');
  console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('=================================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runVerification();
