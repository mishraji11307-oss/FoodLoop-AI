/**
 * FoodLoop AI Environment & Health Pre-flight Validator
 */
const fs = require('fs');
const path = require('path');

console.log('==================================================');
console.log('🔍 FoodLoop AI — Environment Pre-flight Check');
console.log('==================================================\n');

const checks = [
  { name: 'Root package.json', path: 'package.json' },
  { name: 'Frontend directory', path: 'frontend' },
  { name: 'Frontend .env.example', path: 'frontend/.env.example' },
  { name: 'Backend directory', path: 'backend' },
  { name: 'Backend .env.example', path: 'backend/.env.example' },
  { name: 'Database migrations', path: 'database/migrations/001_initial_schema.sql' },
  { name: 'Database seed', path: 'database/seed/seed.sql' },
  { name: 'Architecture docs', path: 'docs/ARCHITECTURE.md' },
  { name: 'API documentation', path: 'docs/API.md' },
  { name: 'License file', path: 'LICENSE' },
  { name: 'Third-party notices', path: 'THIRD_PARTY_NOTICES.md' }
];

let allPassed = true;
checks.forEach(check => {
  const fullPath = path.resolve(__dirname, '..', check.path);
  if (fs.existsSync(fullPath)) {
    console.log(`  ✅ [PASS] ${check.name} located`);
  } else {
    console.log(`  ❌ [FAIL] Missing: ${check.name} (${check.path})`);
    allPassed = false;
  }
});

console.log('\nNode version:', process.version);

if (allPassed) {
  console.log('\n🎉 All mandatory pre-flight checks passed! Platform is ready for execution.');
  process.exit(0);
} else {
  console.error('\n⚠️ Some required files are missing. Please inspect.');
  process.exit(1);
}
