#!/usr/bin/env node

/**
 * Setup Environment Variables Helper
 * Generates required secrets and shows Railway setup instructions
 */

const { randomBytes } = require('crypto');
const { readFileSync, writeFileSync, existsSync } = require('fs');
const { join } = require('path');

const projectRoot = join(__dirname, '..');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function generateSecret() {
  return randomBytes(32).toString('base64');
}

function checkEnvFile() {
  const envPath = join(projectRoot, '.env');
  const envExamplePath = join(projectRoot, '.env.example');

  if (!existsSync(envPath)) {
    log('⚠️  No .env file found!', colors.yellow);
    if (existsSync(envExamplePath)) {
      log('Creating .env from .env.example...', colors.blue);
      const example = readFileSync(envExamplePath, 'utf-8');
      writeFileSync(envPath, example);
      log('✓ Created .env file', colors.green);
    }
    return false;
  }
  return true;
}

function parseEnvFile() {
  const envPath = join(projectRoot, '.env');
  const content = readFileSync(envPath, 'utf-8');
  const vars = {};

  content.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      vars[key] = value;
    }
  });

  return vars;
}

function checkEnvironment() {
  log('\n🔍 Checking environment setup...\n', colors.bright);

  const hasEnv = checkEnvFile();
  if (!hasEnv) {
    log('Please create a .env file first.\n', colors.red);
    return;
  }

  const env = parseEnvFile();
  const required = [
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET',
    'RESEND_API_KEY',
    'EMAIL_FROM'
  ];

  const missing = [];
  const placeholder = [];

  log('Environment Variables Status:', colors.bright);
  log('─'.repeat(50));

  required.forEach(key => {
    const value = env[key];
    const hasValue = value && value.length > 0;
    const isPlaceholder = value?.includes('your_') || value?.includes('re_your_');

    if (!hasValue) {
      log(`❌ ${key}: MISSING`, colors.red);
      missing.push(key);
    } else if (isPlaceholder) {
      log(`⚠️  ${key}: PLACEHOLDER (needs real value)`, colors.yellow);
      placeholder.push(key);
    } else {
      const preview = value.substring(0, 20) + (value.length > 20 ? '...' : '');
      log(`✓ ${key}: ${preview}`, colors.green);
    }
  });

  log('─'.repeat(50));

  return { env, missing, placeholder };
}

function showNextSteps(status) {
  const { missing, placeholder } = status;

  if (missing.length === 0 && placeholder.length === 0) {
    log('\n✓ All environment variables are set!', colors.green);
    log('\nYou can now run:', colors.bright);
    log('  npm run dev', colors.blue);
    return;
  }

  log('\n📋 Next Steps:\n', colors.bright);

  if (missing.includes('NEXTAUTH_SECRET') || placeholder.includes('NEXTAUTH_SECRET')) {
    const secret = generateSecret();
    log('1. Generate NEXTAUTH_SECRET:', colors.yellow);
    log(`   ${secret}`, colors.green);
    log('   Add this to both .env and Railway variables\n');
  }

  if (missing.includes('DATABASE_URL') || placeholder.includes('DATABASE_URL')) {
    log('2. Get DATABASE_URL from Railway:', colors.yellow);
    log('   a. Go to https://railway.app', colors.blue);
    log('   b. Select your project → PostgreSQL service', colors.blue);
    log('   c. Click Variables tab', colors.blue);
    log('   d. Copy DATABASE_URL value', colors.blue);
    log('   e. Paste into .env file\n');
  }

  if (missing.includes('RESEND_API_KEY') || placeholder.includes('RESEND_API_KEY')) {
    log('3. Get RESEND_API_KEY:', colors.yellow);
    log('   a. Go to https://resend.com', colors.blue);
    log('   b. Sign up or log in', colors.blue);
    log('   c. Create new API key', colors.blue);
    log('   d. Copy and paste into .env\n');
  }

  log('4. Update Railway Environment Variables:', colors.yellow);
  log('   After setting local .env, add these to Railway:', colors.blue);
  log('   - NEXTAUTH_URL=https://resistproject.com', colors.blue);
  log('   - NEXTAUTH_SECRET=<same as local>', colors.blue);
  log('   - RESEND_API_KEY=<same as local>', colors.blue);
  log('   - EMAIL_FROM=noreply@resistproject.com', colors.blue);
  log('');
}

function testDatabaseConnection() {
  log('\n🔌 Testing database connection...\n', colors.bright);

  try {
    const { execSync } = require('child_process');
    execSync('npx prisma db pull --schema=./prisma/schema.prisma', {
      cwd: projectRoot,
      stdio: 'pipe',
      timeout: 10000
    });
    log('✓ Database connection successful!', colors.green);
    return true;
  } catch (error) {
    log('❌ Database connection failed', colors.red);
    log('Error: ' + error.message, colors.red);
    log('\nCheck that:', colors.yellow);
    log('  - DATABASE_URL is correct in .env', colors.blue);
    log('  - Railway PostgreSQL service is running', colors.blue);
    log('  - Your IP is allowed (Railway should allow all by default)', colors.blue);
    return false;
  }
}

// Main execution
console.clear();
log('══════════════════════════════════════════════════', colors.bright);
log('   Resist Project - Environment Setup Helper', colors.bright);
log('══════════════════════════════════════════════════', colors.bright);

const status = checkEnvironment();

if (status) {
  showNextSteps(status);

  const hasRequired = status.missing.length === 0 &&
                     !status.placeholder.includes('DATABASE_URL');

  if (hasRequired) {
    const dbOk = testDatabaseConnection();

    if (dbOk) {
      log('\n✓ Setup complete! Ready to start development.', colors.green);
      log('\nRun: npm run dev', colors.bright);
    }
  }
}

log('\n💡 See AUTH-SETUP.md for detailed instructions', colors.blue);
log('══════════════════════════════════════════════════\n', colors.bright);
