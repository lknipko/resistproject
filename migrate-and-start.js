#!/usr/bin/env node
/**
 * Runs database migrations before starting the Next.js server
 * This ensures migrations run in Railway's environment with proper database access
 */

const { execSync } = require('child_process');

console.log('🔄 Running database migrations...');

try {
  // Run Prisma migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('✅ Migrations completed successfully');
  console.log('🚀 Starting Next.js application...');

  // Start the Next.js server
  require('./server.js');

} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}
