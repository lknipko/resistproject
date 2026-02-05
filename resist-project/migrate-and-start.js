#!/usr/bin/env node
/**
 * Runs database migrations before starting the Next.js server
 * This ensures migrations run in Railway's environment with proper database access
 */

const { execSync } = require('child_process');

console.log('🔄 Running database migrations...');

// Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

// Show connection info (masked for security)
const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
console.log('📊 Database URL (masked):', maskedUrl);

try {
  // Run Prisma migrations
  execSync('npx prisma migrate deploy', {
    stdio: 'inherit',
    env: process.env
  });

  console.log('✅ Migrations completed successfully');
  console.log('🚀 Starting Next.js application...');

  // Start the Next.js server
  execSync('npm start', {
    stdio: 'inherit',
    env: process.env
  });

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
