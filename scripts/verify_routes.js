const http = require('http');

const routes = [
  '/',
  '/login',
  '/dashboard',
  '/profile',
  '/onboarding',
  '/scheme-finder',
  '/eligibility-checker',
  '/services',
  '/schemes',
  '/scholarship-application',
  '/track',
  '/documents',
  '/consent',
  '/consent/authorize'
];

async function checkRoute(route) {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000${route}`, (res) => {
      resolve({ route, status: res.statusCode });
    }).on('error', (err) => {
      resolve({ route, error: err.message });
    });
  });
}

async function run() {
  console.log('Verifying all portal routes on dev server...\n');
  let allOk = true;
  for (const route of routes) {
    const result = await checkRoute(route);
    if (result.status === 200) {
      console.log(`✓ ${route.padEnd(26)} -> HTTP ${result.status} OK`);
    } else {
      console.log(`✗ ${route.padEnd(26)} -> HTTP ${result.status || result.error}`);
      allOk = false;
    }
  }
  console.log('\nResult:', allOk ? 'ALL 14 ROUTES SERVING HTTP 200 OK' : 'SOME ROUTES FAILED');
}

run();
