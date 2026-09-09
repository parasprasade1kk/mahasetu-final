const { spawn } = require('child_process');
const path = require('path');

console.log('\n================================================================');
console.log('🏛️  MahaSetu Integrated Development Environment');
console.log('   Starting Express Backend (:5000) & Next.js Frontend (:3000)...');
console.log('================================================================\n');

const rootDir = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const nextBin = path.resolve(rootDir, 'node_modules', '.bin', isWin ? 'next.cmd' : 'next');

// 1. Start Express Backend
const backend = spawn('node', ['server/index.js'], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: true,
});

// 2. Start Next.js Frontend
const frontend = spawn(isWin ? 'npm.cmd' : 'npm', ['run', 'next:dev'], {
  stdio: 'inherit',
  cwd: rootDir,
  shell: true,
});

function terminate() {
  console.log('\n🛑 Shutting down MahaSetu servers...');
  try {
    backend.kill('SIGINT');
  } catch {}
  try {
    frontend.kill('SIGINT');
  } catch {}
  process.exit(0);
}

process.on('SIGINT', terminate);
process.on('SIGTERM', terminate);
backend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️  Backend process exited with code ${code}`);
  }
});
frontend.on('exit', (code) => {
  if (code !== 0 && code !== null) {
    console.error(`⚠️  Frontend process exited with code ${code}`);
  }
});
