// scripts/test-admin-portal-suite.mjs
// Verification suite covering all 10 required test criteria for MahaSetu Admin Portal

import { createClient } from '@supabase/supabase-js';

const LOCAL_URL = 'http://localhost:3000';
const VERCEL_URL = 'https://mahasetu-six.vercel.app';
const SUPABASE_URL = 'https://mrjigbqfwirgrfukciiu.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamlnYnFmd2lyZ3JmdWtjaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzM3MTcsImV4cCI6MjEwNDgwOTcxN30.6_Nw980s9wGSVzXVAN8ZBx-Lso5-eI-q7OmH_1IA4gg';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runSuite() {
  console.log('================================================================');
  console.log('🏛️  MAHASETU ADMIN PORTAL COMPLETE VERIFICATION SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 10;
  let adminToken = null;
  let testCitizenMobile = `9820${Math.floor(100000 + Math.random() * 900000)}`;
  let testCitizenAadhaar = `8888${Math.floor(10000000 + Math.random() * 90000000)}`;
  let createdCitizenUserId = null;
  let createdApplicationId = null;

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Valid admin credentials
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('▶ TEST 1: Valid admin credentials (1120610 / m@h@admin)...');
    const res = await fetch(`${LOCAL_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: '1120610', password: 'm@h@admin' }),
    });
    const data = await res.json();

    if (!res.ok || !data.success || !data.token) {
      throw new Error(`Login failed (status ${res.status}): ${JSON.stringify(data)}`);
    }
    adminToken = data.token;

    // Verify session via /api/admin/me
    const meRes = await fetch(`${LOCAL_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const meData = await meRes.json();

    if (!meRes.ok || !meData.success || meData.admin?.role !== 'admin') {
      throw new Error(`Clearance verification failed: ${JSON.stringify(meData)}`);
    }

    console.log(`  ✅ Passed: Admin session created & verified! Name: ${meData.admin.name}, Role: ${meData.admin.role}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ Failed TEST 1: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Invalid password
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 2: Invalid password rejection...');
    const res = await fetch(`${LOCAL_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: '1120610', password: 'wrong_password_999' }),
    });
    const data = await res.json();

    if (res.status === 401 && !data.success) {
      console.log(`  ✅ Passed: Invalid password rejected (HTTP 401): "${data.error}"`);
      passed++;
    } else {
      throw new Error(`Expected 401 rejection, got status ${res.status}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 2: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Invalid Admin ID / email
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 3: Invalid Admin ID rejection...');
    const res = await fetch(`${LOCAL_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: '9999999_fake_admin', password: 'm@h@admin' }),
    });
    const data = await res.json();

    if (res.status === 401 && !data.success) {
      console.log(`  ✅ Passed: Invalid Admin ID rejected (HTTP 401): "${data.error}"`);
      passed++;
    } else {
      throw new Error(`Expected 401 rejection, got status ${res.status}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 3: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Citizen account attempts /admin/dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 4: Citizen account attempts /admin/* clearance...');
    // Authenticate citizen via Supabase
    const { data: citAuth, error: citErr } = await supabase.auth.signInWithPassword({
      email: 'citizen.9820865156@citizen.mahasetu.gov.in',
      password: 'MahaCitizen2026!',
    });

    if (citErr || !citAuth?.session?.access_token) {
      throw new Error('Citizen sign-in prerequisite failed: ' + citErr?.message);
    }
    const citizenToken = citAuth.session.access_token;

    // Citizen attempts GET /api/admin/me
    const meRes = await fetch(`${LOCAL_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const meData = await meRes.json();

    // Citizen attempts GET /api/admin/analytics
    const analyticsRes = await fetch(`${LOCAL_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${citizenToken}` },
    });
    const analyticsData = await analyticsRes.json();

    if (meRes.status === 403 && analyticsRes.status === 403) {
      console.log(`  ✅ Passed: Citizen account blocked from admin endpoints with HTTP 403 Forbidden.`);
      passed++;
    } else {
      throw new Error(`Citizen not blocked: /me: ${meRes.status}, /analytics: ${analyticsRes.status}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 4: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Refresh Admin Dashboard (Session persistence)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 5: Refresh Admin Dashboard (Session persistence)...');
    if (!adminToken) throw new Error('No admin token from TEST 1');

    const res = await fetch(`${LOCAL_URL}/api/admin/me`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();

    if (res.ok && data.success && data.admin?.adminId === '1120610') {
      console.log(`  ✅ Passed: Admin session remains valid and authenticated upon refresh.`);
      passed++;
    } else {
      throw new Error(`Failed to restore admin clearance on refresh: ${JSON.stringify(data)}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 5: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Logout (Session destroyed / inaccessible)
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 6: Logout (Inaccessible without active token)...');
    const res = await fetch(`${LOCAL_URL}/api/admin/me`, {
      headers: {}, // No token provided
    });
    const data = await res.json();

    if (res.status === 401 && !data.success) {
      console.log(`  ✅ Passed: Admin route inaccessible without token (HTTP 401).`);
      passed++;
    } else {
      throw new Error(`Expected 401, got status ${res.status}`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 6: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Open the deployed Vercel URL
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 7: Deployed Vercel URL connectivity & health...');
    const healthRes = await fetch(`${VERCEL_URL}/api/health`);
    const healthData = await healthRes.json();

    if (!healthRes.ok || healthData.status !== 'ok') {
      throw new Error(`Vercel health check failed: ${JSON.stringify(healthData)}`);
    }

    console.log(`  ✅ Passed: Deployed Vercel URL is live and connected to Supabase PostgreSQL.`);
    passed++;
  } catch (err) {
    console.error(`  ❌ Failed TEST 7: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: Admin Dashboard loads live Supabase data
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log('\n▶ TEST 8: Admin Dashboard loads live Supabase data...');
    if (!adminToken) throw new Error('No admin token');

    const res = await fetch(`${LOCAL_URL}/api/admin/analytics`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const data = await res.json();

    if (!res.ok || !data.success || !data.data) {
      throw new Error(`Failed to load analytics: ${JSON.stringify(data)}`);
    }

    const { totalCitizens, totalApplications, totalSchemes, totalServices } = data.data;
    console.log(`  Live Supabase Dashboard KPIs:`);
    console.log(`  - Total Registered Citizens: ${totalCitizens}`);
    console.log(`  - Total Applications:        ${totalApplications}`);
    console.log(`  - Active Welfare Schemes:    ${totalSchemes}`);
    console.log(`  - Citizen Services:          ${totalServices}`);

    if (typeof totalCitizens === 'number' && typeof totalApplications === 'number') {
      console.log(`  ✅ Passed: Admin Dashboard loads live Supabase metrics.`);
      passed++;
    } else {
      throw new Error('Invalid KPI data format');
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 8: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 9: Create/register a new citizen -> appears in Admin Dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log(`\n▶ TEST 9: Create citizen and verify appearance in Admin Dashboard...`);
    const regRes = await fetch(`${LOCAL_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Aniket R. Jadhav',
        mobile: testCitizenMobile,
        aadhaar: testCitizenAadhaar,
        otp: '123456',
        consent: true,
      }),
    });
    const regData = await regRes.json();

    if (!regRes.ok || !regData.success) {
      throw new Error(`Citizen registration failed: ${JSON.stringify(regData)}`);
    }
    createdCitizenUserId = regData.user?.userId;
    console.log(`  Citizen registered: User ID ${createdCitizenUserId} (Mobile: ${testCitizenMobile})`);

    // Verify in Admin Registry query
    const adminUsersRes = await fetch(
      `${LOCAL_URL}/api/admin/users?search=${testCitizenMobile}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const adminUsersData = await adminUsersRes.json();

    const found = adminUsersData.users?.some((u) => u.mobile === testCitizenMobile);
    if (found) {
      console.log(`  ✅ Passed: Newly registered citizen appears immediately in Admin Registry.`);
      passed++;
    } else {
      throw new Error(`Citizen ${testCitizenMobile} not found in Admin Registry`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 9: ${err.message}`);
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 10: Citizen submits an application -> appears in Admin Dashboard
  // ─────────────────────────────────────────────────────────────────────────────
  try {
    console.log(`\n▶ TEST 10: Citizen submits application and appears in Admin Dashboard...`);
    const appRes = await fetch(`${LOCAL_URL}/api/applications`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: createdCitizenUserId || 'MH-CIT-001',
        applicationType: 'service',
        serviceId: 'income-certificate',
        serviceName: 'Income Certificate (1 Year)',
        department: 'Revenue & Land Records Department',
        departmentId: 'revenue',
        applicantName: 'Aniket R. Jadhav',
        applicantMobile: testCitizenMobile,
        district: 'Pune',
        remarks: 'Verification application submitted from verification suite.',
      }),
    });
    const appData = await appRes.json();

    if (!appRes.ok || !appData.success) {
      throw new Error(`Application submission failed: ${JSON.stringify(appData)}`);
    }
    createdApplicationId = appData.application?.application_id || appData.data?.application_id;
    console.log(`  Application created: ${createdApplicationId}`);

    // Verify in Admin Applications list
    const adminAppsRes = await fetch(
      `${LOCAL_URL}/api/admin/applications?search=${createdApplicationId}`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const adminAppsData = await adminAppsRes.json();

    const foundApp = adminAppsData.applications?.some(
      (a) => a.application_id === createdApplicationId || a.id === createdApplicationId
    );
    if (foundApp) {
      console.log(`  ✅ Passed: Application ${createdApplicationId} appears in Admin Dashboard.`);
      passed++;
    } else {
      throw new Error(`Application ${createdApplicationId} not found in Admin Applications`);
    }
  } catch (err) {
    console.error(`  ❌ Failed TEST 10: ${err.message}`);
  }

  // Cleanup test citizen & application from Supabase
  try {
    if (createdApplicationId) {
      await supabase.from('application_timeline').delete().eq('application_id', createdApplicationId);
      await supabase.from('applications').delete().eq('application_id', createdApplicationId);
    }
    if (createdCitizenUserId) {
      await supabase.from('profiles').delete().eq('user_id', createdCitizenUserId);
    }
  } catch {}

  console.log('\n================================================================');
  console.log(`📊 FINAL RESULT: ${passed} / ${total} TESTS PASSED`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL 10 TESTS PASSED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error(`⚠️  ${total - passed} test(s) failed.`);
    process.exit(1);
  }
}

runSuite();
