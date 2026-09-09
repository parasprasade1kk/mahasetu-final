// Automated Comprehensive Audit for MahaSetu Portal
const BASE_URL = process.env.TEST_URL || 'https://mahasetu-six.vercel.app';

console.log('================================================================');
console.log(`🌐 MAHASETU FULL WEBSITE AUDIT & INTEGRITY SUITE`);
console.log(`Target URL: ${BASE_URL}`);
console.log(`Time: ${new Date().toISOString()}`);
console.log('================================================================\n');

const FRONTEND_PAGES = [
  { path: '/', name: 'Citizen Landing Page (Home)' },
  { path: '/login', name: 'Citizen Mobile/Aadhaar Login' },
  { path: '/onboarding', name: 'Citizen 4-Step Onboarding' },
  { path: '/dashboard', name: 'Citizen Unified Dashboard' },
  { path: '/schemes', name: 'Welfare Schemes Directory' },
  { path: '/services', name: 'Government Services Directory' },
  { path: '/eligibility-checker', name: 'Interactive Eligibility Checker' },
  { path: '/scheme-finder', name: 'AI Voice/Text Scheme Finder' },
  { path: '/apply', name: 'Universal Application Portal' },
  { path: '/track', name: 'Application Tracking Subsystem' },
  { path: '/documents', name: 'Smart Document Locker' },
  { path: '/consent', name: 'DPDP Digital Consent Center' },
  { path: '/profile', name: 'Citizen Family & Demographic Profile' },
  { path: '/admin/login', name: 'Dedicated Administrator Login' },
  { path: '/admin/dashboard', name: 'Government Administration Dashboard' },
  { path: '/admin/users', name: 'Admin: Citizen Registry' },
  { path: '/admin/applications', name: 'Admin: Application Workflow Review' },
  { path: '/admin/schemes', name: 'Admin: Scheme Lifecycle & Quotas' },
  { path: '/admin/documents', name: 'Admin: Document Verification Vault' },
  { path: '/admin/consents', name: 'Admin: DPDP Consent Audit Trail' },
  { path: '/admin/audit-logs', name: 'Admin: Security & Audit Logging' },
  { path: '/admin/notifications', name: 'Admin: Department Notifications' },
  { path: '/admin/settings', name: 'Admin: System Settings & Config' },
];

async function checkUrl(path) {
  const url = `${BASE_URL}${path}`;
  const start = Date.now();
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MahaSetu-Automated-Audit/1.0' },
      redirect: 'manual',
    });
    const duration = Date.now() - start;
    return {
      path,
      status: res.status,
      duration,
      ok: res.status >= 200 && res.status < 400,
    };
  } catch (err) {
    return {
      path,
      status: 'ERR',
      duration: Date.now() - start,
      error: err.message,
      ok: false,
    };
  }
}

async function runAudit() {
  console.log('--- SECTION 1: FRONTEND ROUTE AUDIT (All Pages) ---');
  let passedPages = 0;

  for (const page of FRONTEND_PAGES) {
    const result = await checkUrl(page.path);
    const statusLabel = result.ok ? '✅ PASS' : '❌ FAIL';
    console.log(
      `${statusLabel} [${result.status}] ${page.path.padEnd(25)} - ${page.name} (${result.duration}ms)`
    );
    if (result.ok) passedPages++;
  }

  console.log(`\nFrontend Audit Result: ${passedPages}/${FRONTEND_PAGES.length} pages passed HTTP 200.\n`);

  console.log('--- SECTION 2: API HEALTH & CONNECTIVITY ---');
  const healthRes = await checkUrl('/api/health');
  console.log(`Health Endpoint [/api/health]: HTTP ${healthRes.status} (${healthRes.duration}ms)`);

  const adminHealthRes = await checkUrl('/api/admin/health');
  console.log(`Admin Health Endpoint [/api/admin/health]: HTTP ${adminHealthRes.status} (${adminHealthRes.duration}ms)`);

  console.log('\n--- SECTION 3: ADMINISTRATOR AUTHENTICATION API TEST ---');
  let adminToken = null;
  try {
    const loginRes = await fetch(`${BASE_URL}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adminId: '1120610', password: 'password123' }),
    });
    const loginData = await loginRes.json();
    console.log(`Admin Login Status: HTTP ${loginRes.status}`);
    console.log(`Admin Login Success: ${loginData.success}`);
    if (loginData.success && loginData.token) {
      adminToken = loginData.token;
      console.log(`Admin Auth Token Generated: SUCCESS`);
    } else {
      console.log(`Admin Login Note: ${loginData.error || 'Check credentials'}`);
    }
  } catch (err) {
    console.error('Admin Login Network Error:', err.message);
  }

  console.log('\n--- SECTION 4: ADMIN ANALYTICS KPI ENDPOINT TEST ---');
  if (adminToken) {
    try {
      const analyticsRes = await fetch(`${BASE_URL}/api/admin/analytics`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      });
      const analyticsData = await analyticsRes.json().catch(() => ({}));
      console.log(`Admin Analytics Status: HTTP ${analyticsRes.status}`);
      console.log(`Analytics Success: ${analyticsData.success}`);
      if (analyticsData.kpis) {
        console.log('Live KPIs Retrieved:');
        console.table(analyticsData.kpis);
      } else {
        console.log(`Analytics Note: ${analyticsData.error || 'Check database connection'}`);
      }
    } catch (err) {
      console.error('Analytics Request Error:', err.message);
    }
  } else {
    console.log('Skipping authenticated analytics test (No valid token).');
  }

  console.log('\n================================================================');
  console.log('🏁 WEBSITE AUDIT COMPLETE');
  console.log('================================================================');
}

runAudit();
