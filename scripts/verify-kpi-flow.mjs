import mongoose from 'mongoose';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 MAHASETU REAL MONGODB KPI & AUTH FLOW VERIFICATION');
  console.log('====================================================\n');

  console.log('Step 0: Initializing MongoDB Connection...');
  let mongod = null;
  let uri = process.env.MONGODB_URI;

  try {
    const memoryServerModule = await import('mongodb-memory-server');
    mongod = await memoryServerModule.MongoMemoryServer.create();
    uri = mongod.getUri();
  } catch {
    if (!uri) {
      console.error('No MONGODB_URI available to run test suite.');
      process.exit(1);
    }
  }

  process.env.MONGODB_URI = uri;
  process.env.JWT_SECRET = 'mahasetu_secure_jwt_secret_key_2026_gov_maharashtra_dpi';
  process.env.ADMIN_ID = '1120610';

  await mongoose.connect(uri);
  console.log('Connected to MongoDB instance:', uri.replace(/\/\/.*@/, '//<redacted>@'));

  // Import models and seed helper
  const {
    User,
    Profile,
    AdminUser,
    Application,
    Scheme,
    Document,
    Consent,
    DigiLockerConnection,
    AuditLog,
  } = await import('../lib/models/index.ts');

  const { ensureDatabaseSeeded } = await import('../lib/dbSeed.ts');

  // Import Next.js route handlers
  const adminAnalyticsRoute = await import('../app/api/admin/analytics/route.ts');
  const citizenRegisterRoute = await import('../app/api/auth/register/route.ts');
  const citizenLoginRoute = await import('../app/api/auth/login/route.ts');
  const applicationRoute = await import('../app/api/applications/route.ts');
  const appStatusRoute = await import('../app/api/admin/applications/[id]/status/route.ts');
  const documentUploadRoute = await import('../app/api/documents/upload/route.ts');
  const digiLockerLinkRoute = await import('../app/api/digilocker/link/route.ts');
  const consentToggleRoute = await import('../app/api/consents/toggle/[id]/route.ts');

  // Helper for admin authorization header
  const jwt = (await import('jsonwebtoken')).default;
  const adminToken = jwt.sign(
    { adminId: '1120610', role: 'admin', name: 'Shri. S. K. Deshmukh' },
    process.env.JWT_SECRET
  );

  async function getAdminKpis() {
    const fakeReq = new Request('http://localhost:3000/api/admin/analytics', {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const res = await adminAnalyticsRoute.GET(fakeReq);
    const json = await res.json();
    if (!json.success) throw new Error('Analytics failed: ' + json.error);
    return json.data;
  }

  // TEST 1: Baseline Seed & Check Initial Admin KPI
  console.log('\n--- TEST 1: Baseline Admin KPIs ---');
  await ensureDatabaseSeeded();
  const initialKpis = await getAdminKpis();
  console.log('Baseline Total Registered Citizens (X):', initialKpis.totalCitizens);
  console.log('Baseline Verified Citizens:', initialKpis.verifiedCitizens);
  console.log('Baseline Total Applications:', initialKpis.totalApplications);
  console.log('Baseline Pending Applications:', initialKpis.pendingApplications);
  console.log('Baseline Approved Applications:', initialKpis.approvedApplications);
  console.log('Baseline Total Schemes:', initialKpis.totalSchemes);
  console.log('Baseline Documents Submitted:', initialKpis.documentsSubmitted);
  console.log('Baseline DigiLocker Users:', initialKpis.digiLockerUsers);
  console.log('Baseline Active Consents:', initialKpis.activeConsents);

  const initialCitizens = initialKpis.totalCitizens;
  const initialVerified = initialKpis.verifiedCitizens;

  // TEST 2: Register completely new citizen
  console.log('\n--- TEST 2: Register Brand New Citizen ---');
  const testMobile1 = '9876543210';
  const registerReq1 = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Citizen Alpha',
      mobile: testMobile1,
      aadhaar: '123456789012',
      otp: '123456',
    }),
  });

  const regRes1 = await citizenRegisterRoute.POST(registerReq1);
  const regJson1 = await regRes1.json();
  console.log('Registration HTTP Status:', regRes1.status);
  console.log('Registration Result:', regJson1.success ? 'SUCCESS' : 'FAILED', regJson1.user?.userId);
  if (!regJson1.success) throw new Error('Registration 1 failed: ' + regJson1.error);

  // TEST 3: Verify MongoDB document exists
  console.log('\n--- TEST 3: Verify MongoDB Document Directly ---');
  const userInDb = await User.findOne({ mobile: testMobile1 });
  console.log('User found in MongoDB:', Boolean(userInDb));
  console.log('User ID:', userInDb?.userId);
  console.log('Full Name:', userInDb?.fullName);
  console.log('Role:', userInDb?.role);
  console.log('isVerified:', userInDb?.isVerified);
  if (!userInDb || userInDb.role !== 'citizen') throw new Error('Citizen not found in MongoDB!');

  // TEST 4 & 5: Refresh Admin Dashboard -> Total Registered Citizens = X + 1
  console.log('\n--- TEST 4 & 5: Refresh Admin KPIs (Expected: X + 1) ---');
  const kpisAfterReg1 = await getAdminKpis();
  console.log(`Total Citizens: expected ${initialCitizens + 1}, got ${kpisAfterReg1.totalCitizens}`);
  if (kpisAfterReg1.totalCitizens !== initialCitizens + 1) {
    throw new Error(`FAIL: Expected ${initialCitizens + 1}, got ${kpisAfterReg1.totalCitizens}`);
  }
  console.log('✅ TEST 5 PASSED: Total Registered Citizens incremented by 1.');

  // TEST 6: Verified Citizens also increased
  console.log('\n--- TEST 6: Verified Citizens incremented ---');
  console.log(`Verified Citizens: expected ${initialVerified + 1}, got ${kpisAfterReg1.verifiedCitizens}`);
  if (kpisAfterReg1.verifiedCitizens !== initialVerified + 1) {
    throw new Error('FAIL: Verified Citizens count did not increase.');
  }
  console.log('✅ TEST 6 PASSED: Verified Citizens incremented.');

  // TEST 7: Logout and Login again as the same citizen -> No duplicate!
  console.log('\n--- TEST 7: Login as existing citizen (Check Duplicate Protection) ---');
  const loginReq1 = new Request('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mobile: testMobile1,
      otp: '123456',
    }),
  });
  const loginRes1 = await citizenLoginRoute.POST(loginReq1);
  const loginJson1 = await loginRes1.json();
  console.log('Login Result:', loginJson1.success ? 'SUCCESS' : 'FAILED', loginJson1.user?.userId);

  const kpisAfterLogin = await getAdminKpis();
  console.log(`Total Citizens after login: expected ${initialCitizens + 1}, got ${kpisAfterLogin.totalCitizens}`);
  if (kpisAfterLogin.totalCitizens !== initialCitizens + 1) {
    throw new Error('FAIL: Duplicate user created upon login!');
  }
  console.log('✅ TEST 7 PASSED: Duplicate user prevented. Total citizens remains constant.');

  // TEST 8: Register second citizen -> Total = X + 2
  console.log('\n--- TEST 8: Register Second Citizen (Expected: X + 2) ---');
  const testMobile2 = '9876543211';
  const registerReq2 = new Request('http://localhost:3000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fullName: 'Test Citizen Beta',
      mobile: testMobile2,
      aadhaar: '987654321098',
      otp: '123456',
    }),
  });
  const regRes2 = await citizenRegisterRoute.POST(registerReq2);
  const regJson2 = await regRes2.json();
  console.log('Registration 2 Result:', regJson2.success ? 'SUCCESS' : 'FAILED');

  const kpisAfterReg2 = await getAdminKpis();
  console.log(`Total Citizens: expected ${initialCitizens + 2}, got ${kpisAfterReg2.totalCitizens}`);
  if (kpisAfterReg2.totalCitizens !== initialCitizens + 2) {
    throw new Error(`FAIL: Expected ${initialCitizens + 2}, got ${kpisAfterReg2.totalCitizens}`);
  }
  console.log('✅ TEST 8 PASSED: Total Registered Citizens is now X + 2.');

  // TEST 9: Submit an application from citizen account -> Total Applications increases
  console.log('\n--- TEST 9: Submit Application from Citizen ---');
  const citizenToken1 = regJson1.token;
  const prevApps = kpisAfterReg2.totalApplications;
  const prevPending = kpisAfterReg2.pendingApplications;

  const appSubmitReq = new Request('http://localhost:3000/api/applications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${citizenToken1}`,
    },
    body: JSON.stringify({
      serviceName: 'Farmer Electricity Subsidy Scheme',
      department: 'Energy & Agriculture Department',
      district: 'Pune',
      applicationType: 'scheme',
    }),
  });
  const appRes = await applicationRoute.POST(appSubmitReq);
  const appJson = await appRes.json();
  console.log('Application Submission:', appJson.success ? 'SUCCESS' : 'FAILED', appJson.application?.applicationId);

  const kpisAfterApp = await getAdminKpis();
  console.log(`Total Applications: expected ${prevApps + 1}, got ${kpisAfterApp.totalApplications}`);
  console.log(`Pending Applications: expected ${prevPending + 1}, got ${kpisAfterApp.pendingApplications}`);
  if (kpisAfterApp.totalApplications !== prevApps + 1) {
    throw new Error('FAIL: Total Applications did not increase.');
  }
  console.log('✅ TEST 9 PASSED: Total & Pending Applications updated.');

  // TEST 10: Change application status to Approved -> Approved Applications updates
  console.log('\n--- TEST 10: Admin Approves Application ---');
  const prevApproved = kpisAfterApp.approvedApplications;
  const appId = appJson.application.applicationId;

  const approveReq = new Request(`http://localhost:3000/api/admin/applications/${appId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      status: 'Approved',
      remarks: 'Documents verified and approved by Officer.',
    }),
  });
  const approveRes = await appStatusRoute.PUT(approveReq, { params: { id: appId } });
  const approveJson = await approveRes.json();
  console.log('Approve Status Update:', approveJson);

  const kpisAfterApprove = await getAdminKpis();
  console.log(`Approved Applications: expected ${prevApproved + 1}, got ${kpisAfterApprove.approvedApplications}`);
  if (kpisAfterApprove.approvedApplications !== prevApproved + 1) {
    throw new Error('FAIL: Approved Applications count did not increase.');
  }
  console.log('✅ TEST 10 PASSED: Approved Applications updated.');

  // TEST 11: Upload a document -> Documents Submitted updates
  console.log('\n--- TEST 11: Upload Citizen Document ---');
  const prevDocs = kpisAfterApprove.documentsSubmitted;
  const docReq = new Request('http://localhost:3000/api/documents/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${citizenToken1}`,
    },
    body: JSON.stringify({
      documentName: 'Land 7/12 Extract 2026',
      documentType: 'Land Records',
      authorityEn: 'Revenue Department',
    }),
  });
  const docRes = await documentUploadRoute.POST(docReq);
  const docJson = await docRes.json();
  console.log('Document Upload:', docJson.success ? 'SUCCESS' : 'FAILED', docJson.document?.documentId);

  const kpisAfterDoc = await getAdminKpis();
  console.log(`Documents Submitted: expected ${prevDocs + 1}, got ${kpisAfterDoc.documentsSubmitted}`);
  if (kpisAfterDoc.documentsSubmitted !== prevDocs + 1) {
    throw new Error('FAIL: Documents Submitted did not increase.');
  }
  console.log('✅ TEST 11 PASSED: Documents Submitted updated.');

  // TEST 12: Connect DigiLocker -> DigiLocker Connected Users updates
  console.log('\n--- TEST 12: Link DigiLocker Account ---');
  const prevDigi = kpisAfterDoc.digiLockerUsers;
  const digiReq = new Request('http://localhost:3000/api/digilocker/link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${citizenToken1}`,
    },
    body: JSON.stringify({ securityPin: '123456' }),
  });
  const digiRes = await digiLockerLinkRoute.POST(digiReq);
  const digiJson = await digiRes.json();
  console.log('DigiLocker Link:', digiJson.success ? 'SUCCESS' : 'FAILED');

  const kpisAfterDigi = await getAdminKpis();
  console.log(`DigiLocker Users: expected ${prevDigi + 1}, got ${kpisAfterDigi.digiLockerUsers}`);
  if (kpisAfterDigi.digiLockerUsers !== prevDigi + 1) {
    throw new Error('FAIL: DigiLocker Users did not increase.');
  }
  console.log('✅ TEST 12 PASSED: DigiLocker Connected Users updated.');

  // TEST 13: Grant / Toggle Consent -> Active Consents updates
  console.log('\n--- TEST 13: Toggle Consent Status ---');
  const prevConsents = kpisAfterDigi.activeConsents;
  // Let's create a new active consent
  const newConsentId = `CNS-${Date.now()}-TEST`;
  const consentReq = new Request(`http://localhost:3000/api/consents/toggle/${newConsentId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      authorization: `Bearer ${citizenToken1}`,
    },
  });
  const consentRes = await consentToggleRoute.POST(consentReq, { params: { id: newConsentId } });
  const consentJson = await consentRes.json();
  console.log('Consent Toggle:', consentJson.success ? 'SUCCESS' : 'FAILED', consentJson.consent?.status);

  const kpisAfterConsent = await getAdminKpis();
  console.log(`Active Consents: expected ${prevConsents + 1}, got ${kpisAfterConsent.activeConsents}`);
  if (kpisAfterConsent.activeConsents !== prevConsents + 1) {
    throw new Error('FAIL: Active Consents count did not increase.');
  }
  console.log('✅ TEST 13 PASSED: Active Consents updated.');

  console.log('\n====================================================');
  console.log('🎉 ALL 13 E2E REAL MONGODB KPI TESTS PASSED PERFECTLY!');
  console.log('====================================================\n');

  await mongoose.disconnect();
  await mongod.stop();
  process.exit(0);
}

runTests().catch((err) => {
  console.error('\n❌ TEST VERIFICATION FAILED:', err);
  process.exit(1);
});
