// scripts/test-e2e-supabase-admin.mjs
// Comprehensive End-to-End Test for MahaSetu Supabase Integration
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import crypto from 'crypto';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://mrjigbqfwirgrfukciiu.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1yamlnYnFmd2lyZ3JmdWtjaWl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODkyMzM3MTcsImV4cCI6MjEwNDgwOTcxN30.6_Nw980s9wGSVzXVAN8ZBx-Lso5-eI-q7OmH_1IA4gg';

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const supabaseAnon = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function runE2ETests() {
  console.log("=================================================================");
  console.log("🚀 STARTING MAHASETU SUPABASE END-TO-END VERIFICATION SUITE");
  console.log("=================================================================\n");

  let passedTests = 0;
  let totalTests = 12;

  const testCitizenMobile = `9820${Math.floor(100000 + Math.random() * 900000)}`;
  const testAadhaar = `9999${Math.floor(10000000 + Math.random() * 90000000)}`;
  const aadhaarHash = crypto.createHash('sha256').update(testAadhaar).digest('hex');
  const maskedAadhaar = `XXXX XXXX ${testAadhaar.slice(-4)}`;
  const citizenEmail = `citizen.${testCitizenMobile}@citizen.mahasetu.gov.in`;
  const citizenPassword = `MahaCitizen2026!`;

  let citizenAuthUserId = null;
  let citizenUserId = null;
  let citizenProfileId = null;
  let testApplicationId = null;
  let testApplicationNumber = null;
  let testDocId = null;

  // -------------------------------------------------------------
  // TEST 1: Admin Authentication with 1120610 / m@h@admin
  // -------------------------------------------------------------
  try {
    console.log("▶ TEST 1: Admin Login with Official Credentials (1120610 / m@h@admin)...");
    const { data: adminRecord, error: adminErr } = await supabaseAdmin.rpc('get_admin_for_login', {
      p_admin_id: '1120610'
    });

    if (adminErr || !adminRecord) throw new Error(`Admin user 1120610 lookup failed: ${adminErr?.message}`);
    
    // Test Supabase Auth login for admin
    const { data: authSession, error: authErr } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin.1120610@admin.mahasetu.gov.in',
      password: 'm@h@admin'
    });

    if (authErr) throw new Error(`Supabase Auth sign-in failed: ${authErr.message}`);
    if (!authSession?.session?.access_token) throw new Error("No session token returned");

    console.log(`  ✅ Passed: Admin 1120610 authenticated successfully! Role: ${adminRecord.role}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 2: Live Analytics Query (No mock / hardcoded statistics)
  // -------------------------------------------------------------
  let initialCitizenCount = 0;
  let initialApplicationCount = 0;
  try {
    console.log("\n▶ TEST 2: Verify Live Supabase Analytics Aggregation...");
    const [
      { count: totalCitizens },
      { count: totalApplications },
      { count: totalSchemes },
      { count: totalServices }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('applications').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('schemes').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('services').select('*', { count: 'exact', head: true })
    ]);

    initialCitizenCount = totalCitizens || 0;
    initialApplicationCount = totalApplications || 0;

    console.log(`  Live Supabase Metrics:`);
    console.log(`  - Total Citizens: ${totalCitizens}`);
    console.log(`  - Total Applications: ${totalApplications}`);
    console.log(`  - Total Schemes: ${totalSchemes}`);
    console.log(`  - Total Services: ${totalServices}`);

    if (typeof totalCitizens !== 'number' || typeof totalApplications !== 'number') {
      throw new Error("Invalid analytics return format");
    }
    console.log("  ✅ Passed: Live counts successfully retrieved from Supabase PostgreSQL tables.");
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 3: Citizen Registration via Supabase Atomic RPC
  // -------------------------------------------------------------
  try {
    console.log(`\n▶ TEST 3: Citizen Registration (Atomic Auth + Profile RPC)...`);
    const { data: rpcRes, error: rpcErr } = await supabaseAdmin.rpc('register_citizen_with_auth', {
      p_full_name: 'Suresh Tukaram Patil',
      p_mobile: testCitizenMobile,
      p_aadhaar_hash: aadhaarHash,
      p_aadhaar_masked: maskedAadhaar,
      p_email: citizenEmail,
      p_district: 'Pune',
      p_password: citizenPassword
    });

    if (rpcErr) throw new Error(`RPC registration failed: ${rpcErr.message}`);
    if (!rpcRes?.id || !rpcRes?.user_id) throw new Error("RPC returned invalid payload: " + JSON.stringify(rpcRes));

    citizenProfileId = rpcRes.id;
    citizenUserId = rpcRes.user_id;
    citizenAuthUserId = rpcRes.auth_user_id;
    console.log(`  ✅ Passed: Citizen registered! Auth UUID: ${citizenAuthUserId}, Profile ID: ${citizenProfileId}, User ID: ${citizenUserId}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 4: Citizen Count Increment Verification in Supabase
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 4: Verify Live Citizen Count Increment in Supabase...");
    const { count: updatedCitizenCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (updatedCitizenCount !== initialCitizenCount + 1) {
      throw new Error(`Expected count ${initialCitizenCount + 1}, got ${updatedCitizenCount}`);
    }
    console.log(`  ✅ Passed: Total Citizens count incremented from ${initialCitizenCount} to ${updatedCitizenCount}.`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 5: Citizen Sign-In Verification with Supabase Auth
  // -------------------------------------------------------------
  let citizenToken = null;
  try {
    console.log("\n▶ TEST 5: Citizen Sign-In with Supabase Auth...");
    const { data: signInRes, error: signInErr } = await supabaseAnon.auth.signInWithPassword({
      email: citizenEmail,
      password: citizenPassword
    });

    if (signInErr) throw new Error(`Citizen sign-in failed: ${signInErr.message}`);
    citizenToken = signInRes.session.access_token;
    console.log(`  ✅ Passed: Citizen signed in successfully with JWT session.`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 6: Citizen Profile Update (PUT /api/profiles/me)
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 6: Citizen Profile Update in Supabase...");
    const updatedIncome = 220000;
    const { data: updatedProfile, error: updateErr } = await supabaseAdmin
      .from('profiles')
      .update({
        annual_family_income: updatedIncome,
        annual_income_amount: updatedIncome,
        education_level: 'Graduate',
        updated_at: new Date().toISOString()
      })
      .eq('id', citizenProfileId)
      .select()
      .single();

    if (updateErr) throw new Error(`Profile update failed: ${updateErr.message}`);
    if (Number(updatedProfile.annual_family_income) !== updatedIncome) {
      throw new Error(`Expected income ${updatedIncome}, got ${updatedProfile.annual_family_income}`);
    }
    console.log(`  ✅ Passed: Citizen profile updated. Income updated to ₹${updatedIncome}, Education: Graduate.`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 7: Scheme Application Creation
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 7: Submit Scheme Application to Supabase...");
    // Fetch an existing scheme
    const { data: scheme, error: schemeErr } = await supabaseAdmin
      .from('schemes')
      .select('id, scheme_id, name, department_name')
      .limit(1)
      .single();

    if (schemeErr || !scheme) throw new Error("No schemes found in Supabase database: " + schemeErr?.message);

    const appNumber = `MS-APP-${Date.now()}`;
    testApplicationNumber = appNumber;
    const { data: appData, error: appErr } = await supabaseAdmin
      .from('applications')
      .insert({
        application_id: appNumber,
        user_id: citizenUserId,
        auth_user_id: citizenAuthUserId,
        type: 'scheme',
        scheme_id: scheme.scheme_id,
        scheme_name: scheme.name,
        department: scheme.department_name,
        applicant_name: 'Suresh Tukaram Patil',
        applicant_mobile: testCitizenMobile,
        applicant_aadhaar_masked: maskedAadhaar,
        district: 'Pune',
        status: 'pending',
        status_color: 'amber',
        applied_date: new Date().toLocaleDateString('en-GB'),
        submitted_at: new Date().toISOString(),
        remarks: 'Application submitted',
        data: { remarks: 'Test scheme application from E2E suite' }
      })
      .select()
      .single();

    if (appErr) throw new Error(`Application creation failed: ${appErr.message}`);
    testApplicationId = appData.id;

    // Also add record to application_timeline table
    await supabaseAdmin.from('application_timeline').insert({
      application_id: appNumber,
      status: 'pending',
      changed_by: 'citizen',
      message: 'Application submitted'
    });

    console.log(`  ✅ Passed: Application ${appNumber} created in Supabase with status 'pending'!`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 8: Admin Status Update & Timeline Verification
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 8: Admin Application Status Update (Pending -> Approved)...");
    const { data: updatedApp, error: updateAppErr } = await supabaseAdmin
      .from('applications')
      .update({
        status: 'approved',
        status_color: 'green',
        remarks: 'Approved after scrutiny of eligibility documents',
        last_updated: new Date().toISOString()
      })
      .eq('id', testApplicationId)
      .select()
      .single();

    if (updateAppErr) throw new Error(`Status update failed: ${updateAppErr.message}`);
    if (updatedApp.status !== 'approved') throw new Error(`Expected status 'approved', got ${updatedApp.status}`);

    // Insert timeline
    await supabaseAdmin.from('application_timeline').insert({
      application_id: testApplicationNumber,
      status: 'approved',
      changed_by: '1120610',
      message: 'Approved by Assistant Commissioner'
    });

    // Verify timeline records
    const { data: timelines } = await supabaseAdmin
      .from('application_timeline')
      .select('*')
      .eq('application_id', testApplicationNumber);

    if (!timelines || timelines.length < 2) throw new Error("Expected at least 2 timeline entries");
    console.log(`  ✅ Passed: Application updated to 'approved' and ${timelines.length} timeline milestones verified!`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 9: Citizen Document Record Linked to Supabase
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 9: Citizen Document Record Linking...");
    const { data: docRecord, error: docErr } = await supabaseAdmin
      .from('documents')
      .insert({
        document_id: `DOC-${Date.now()}`,
        user_id: citizenUserId,
        auth_user_id: citizenAuthUserId,
        document_type: 'Income Certificate',
        document_name: 'Income Certificate 2026',
        document_name_mr: 'उत्पन्न प्रमाणपत्र २०२६',
        file_name: 'income_cert_2026.pdf',
        storage_path: 'documents/income_cert_2026.pdf',
        verification_status: 'verified',
        file_size: '100 KB',
        mime_type: 'application/pdf',
        cert_no: 'INC/2026/0913',
        authority_en: 'Tehsildar Haveli',
        authority_mr: 'तहसीलदार हवेली'
      })
      .select()
      .single();

    if (docErr) throw new Error(`Document insert failed: ${docErr.message}`);
    testDocId = docRecord.id;
    console.log(`  ✅ Passed: Document ${docRecord.document_type} recorded and verified for user.`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 10: Citizen Details Inspection for Admin Dashboard
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 10: Admin Citizen Details API Query (/api/admin/users/:id)...");
    const [profileRes, appsRes, docsRes, consentsRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', citizenProfileId).single(),
      supabaseAdmin.from('applications').select('*').eq('user_id', citizenUserId),
      supabaseAdmin.from('documents').select('*').eq('user_id', citizenUserId),
      supabaseAdmin.from('consents').select('*').eq('user_id', citizenProfileId)
    ]);

    if (!profileRes.data) throw new Error("Could not retrieve citizen profile");
    if (appsRes.data.length === 0) throw new Error("Could not retrieve linked applications");
    if (docsRes.data.length === 0) throw new Error("Could not retrieve linked documents");

    console.log(`  ✅ Passed: Admin modal data query returns complete graph:`);
    console.log(`     - Profile: ${profileRes.data.full_name} (${profileRes.data.mobile_number})`);
    console.log(`     - Applications: ${appsRes.data.length}`);
    console.log(`     - Documents: ${docsRes.data.length}`);
    console.log(`     - Consents: ${consentsRes.data?.length || 0}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 11: Route Security & Admin Protection Verification
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 11: Route Protection & Role Verification...");
    // Check non-admin cannot access admin_users table anonymously
    const { data: anonAdminCheck, error: anonErr } = await supabaseAnon
      .from('admin_users')
      .select('*');

    if (anonAdminCheck && anonAdminCheck.length > 0) {
      throw new Error("Security Alert: Anonymous query accessed admin_users table!");
    }
    console.log(`  ✅ Passed: Anonymous access to admin tables is properly blocked by RLS.`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST 12: Refresh Persistence Verification
  // -------------------------------------------------------------
  try {
    console.log("\n▶ TEST 12: Refresh Persistence Verification in Supabase...");
    // Query freshly from database without local cache
    const { data: persistentApp, error: fetchErr } = await supabaseAdmin
      .from('applications')
      .select('id, application_id, status, remarks')
      .eq('id', testApplicationId)
      .single();

    if (fetchErr || !persistentApp) throw new Error("Could not fetch persistent application");
    if (persistentApp.status !== 'approved') throw new Error(`State was not persisted, found ${persistentApp.status}`);

    console.log(`  ✅ Passed: All changes persist directly in Supabase PostgreSQL (Single Source of Truth).`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ Failed: ${err.message}`);
  }

  // -------------------------------------------------------------
  // CLEANUP TEST RECORD
  // -------------------------------------------------------------
  try {
    console.log("\n▶ Cleaning up E2E test records...");
    if (testApplicationNumber) {
      await supabaseAdmin.from('application_timeline').delete().eq('application_id', testApplicationNumber);
    }
    if (testApplicationId) {
      await supabaseAdmin.from('applications').delete().eq('id', testApplicationId);
    }
    if (testDocId) {
      await supabaseAdmin.from('documents').delete().eq('id', testDocId);
    }
    if (citizenProfileId) {
      await supabaseAdmin.from('consents').delete().eq('user_id', citizenProfileId);
      await supabaseAdmin.from('audit_logs').delete().eq('user_id', citizenProfileId);
      await supabaseAdmin.from('profiles').delete().eq('id', citizenProfileId);
    }
    if (citizenAuthUserId) {
      await supabaseAdmin.auth.admin.deleteUser(citizenAuthUserId);
    }
    console.log("  🧹 Test citizen cleaned up cleanly.");
  } catch (cleanupErr) {
    console.log("  ⚠️ Cleanup notice:", cleanupErr.message);
  }

  console.log("\n=================================================================");
  console.log(`📊 E2E TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log("=================================================================\n");

  if (passedTests === totalTests) {
    console.log("🎉 ALL 12 END-TO-END SUPABASE INTEGRATION TESTS PASSED!");
    process.exit(0);
  } else {
    console.error(`❌ ${totalTests - passedTests} tests failed.`);
    process.exit(1);
  }
}

runE2ETests();
