#!/usr/bin/env node

/**
 * Generate bcrypt password hash for SOCI authentication
 *
 * Usage:
 *   node scripts/generate-password-hash.js yourpassword
 */

import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Error: Password argument required');
  console.log('\nUsage:');
  console.log('  node scripts/generate-password-hash.js <password>');
  console.log('\nExample:');
  console.log('  node scripts/generate-password-hash.js MySecurePassword123');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Error: Password must be at least 8 characters');
  process.exit(1);
}

console.log('Generating secure bcrypt hash...\n');

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('Error generating hash:', err);
    process.exit(1);
  }

  console.log('✅ Password hash generated successfully!\n');
  console.log('Add this to your Vercel environment variables:');
  console.log('━'.repeat(60));
  console.log(`PASSWORD_HASH=${hash}`);
  console.log('━'.repeat(60));
  console.log('\nSteps:');
  console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
  console.log('2. Add a new variable:');
  console.log('   Name: PASSWORD_HASH');
  console.log('   Value: (paste the hash above)');
  console.log('3. Redeploy your application\n');
});
