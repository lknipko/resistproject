#!/usr/bin/env node
/**
 * Runs database migrations before starting the Next.js server
 * This ensures migrations run in Railway's environment with proper database access
 */

const { execSync } = require('child_process');

console.log('🔄 Running database migrations...');

// Debug: Check if DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL environment variable is not set!');
  process.exit(1);
}

// Debug: Show DATABASE_URL (masked for security)
const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/:([^:@]+)@/, ':***@');
console.log('📊 Database URL (masked):', maskedUrl);

// Test connection if TEST_PSQL is set
if (process.env.TEST_PSQL === 'true') {
  console.log('🧪 TEST_PSQL enabled - testing direct PostgreSQL connection...');

  // Parse the DATABASE_URL
  const url = new URL(dbUrl);
  console.log('🔍 Parsed connection details:');
  console.log('  Protocol:', url.protocol);
  console.log('  Username:', url.username);
  console.log('  Password length:', url.password.length, 'characters');
  console.log('  Password first 3 chars:', url.password.substring(0, 3) + '...');
  console.log('  Hostname:', url.hostname);
  console.log('  Port:', url.port);
  console.log('  Database:', url.pathname.substring(1));

  // Try direct connection using pg library
  try {
    const { Client } = require('pg');
    const client = new Client({
      connectionString: dbUrl,
      ssl: false // Try without SSL first
    });

    console.log('🔌 Attempting connection without SSL...');
    client.connect()
      .then(() => {
        console.log('✅ Connection successful without SSL!');
        return client.query('SELECT version()');
      })
      .then(result => {
        console.log('📊 PostgreSQL version:', result.rows[0].version);
        return client.end();
      })
      .then(() => {
        console.log('✅ Test connection complete - proceeding with migrations');
        runMigrations();
      })
      .catch(err => {
        console.log('❌ Connection failed without SSL:', err.message);
        console.log('🔌 Retrying with SSL...');

        const clientSSL = new Client({
          connectionString: dbUrl,
          ssl: { rejectUnauthorized: false }
        });

        return clientSSL.connect()
          .then(() => {
            console.log('✅ Connection successful with SSL!');
            return clientSSL.query('SELECT version()');
          })
          .then(result => {
            console.log('📊 PostgreSQL version:', result.rows[0].version);
            return clientSSL.end();
          })
          .then(() => {
            console.log('✅ Test connection complete - proceeding with migrations');
            runMigrations();
          });
      })
      .catch(err => {
        console.error('❌ Both connection attempts failed:', err);
        console.error('Full error:', JSON.stringify(err, null, 2));
        process.exit(1);
      });
  } catch (err) {
    console.error('❌ Error setting up test connection:', err);
    runMigrations(); // Try migrations anyway
  }
} else {
  runMigrations();
}

function runMigrations() {
  try {
    // Run Prisma migrations
    execSync('npx prisma migrate deploy', {
      stdio: 'inherit',
      env: process.env
    });

    console.log('✅ Migrations completed successfully');
    console.log('🚀 Starting Next.js application...');

    // Start the Next.js server using next start
    execSync('npm start', {
      stdio: 'inherit',
      env: process.env
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
