#!/usr/bin/env node

/**
 * Railway Deployment Readiness Checker
 * Verifies all environment variables are set correctly before deploying
 */

const { readFileSync, existsSync } = require('fs');
const { join } = require('path');
const https = require('https');

const projectRoot = join(__dirname, '..');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

function parseEnvFile() {
  const envPath = join(projectRoot, '.env');
  if (!existsSync(envPath)) {
    return null;
  }

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

function checkDatabaseURL(url) {
  const issues = [];

  if (!url || url.length === 0) {
    issues.push('DATABASE_URL is missing');
    return issues;
  }

  if (url.includes('gondola.proxy.rlwy.net')) {
    issues.push('DATABASE_URL uses old Railway proxy format - needs updating');
  }

  if (url.includes('your_') || url.includes('password@host')) {
    issues.push('DATABASE_URL is a placeholder - needs real value from Railway');
  }

  if (!url.startsWith('postgresql://')) {
    issues.push('DATABASE_URL should start with postgresql://');
  }

  return issues;
}

function checkNextAuthSecret(secret) {
  const issues = [];

  if (!secret || secret.length === 0) {
    issues.push('NEXTAUTH_SECRET is missing');
    return issues;
  }

  if (secret.includes('your_') || secret === 'your_32_character_random_secret_here') {
    issues.push('NEXTAUTH_SECRET is a placeholder - generate with: openssl rand -base64 32');
  }

  if (secret.length < 32) {
    issues.push('NEXTAUTH_SECRET is too short (should be 32+ chars)');
  }

  return issues;
}

function checkResendKey(key) {
  const issues = [];

  if (!key || key.length === 0) {
    issues.push('RESEND_API_KEY is missing');
    return issues;
  }

  if (key.includes('your_') || !key.startsWith('re_')) {
    issues.push('RESEND_API_KEY should start with re_');
  }

  return issues;
}

async function checkWebsite(url) {
  return new Promise((resolve) => {
    https.get(url, { timeout: 5000 }, (res) => {
      resolve({
        status: res.statusCode,
        ok: res.statusCode === 200 || res.statusCode === 404 // 404 is fine, means site is up
      });
    }).on('error', (err) => {
      resolve({ ok: false, error: err.message });
    });
  });
}

async function main() {
  console.clear();
  log('══════════════════════════════════════════════════', colors.bright);
  log('   Railway Deployment Readiness Check', colors.bright);
  log('══════════════════════════════════════════════════', colors.bright);

  const env = parseEnvFile();

  if (!env) {
    log('\n❌ No .env file found!', colors.red);
    log('Create one from .env.example first.', colors.yellow);
    return;
  }

  log('\n📋 Checking Local Environment...\n', colors.bright);

  const checks = [
    {
      name: 'DATABASE_URL',
      value: env.DATABASE_URL,
      checker: checkDatabaseURL
    },
    {
      name: 'NEXTAUTH_SECRET',
      value: env.NEXTAUTH_SECRET,
      checker: checkNextAuthSecret
    },
    {
      name: 'RESEND_API_KEY',
      value: env.RESEND_API_KEY,
      checker: checkResendKey
    },
    {
      name: 'NEXTAUTH_URL',
      value: env.NEXTAUTH_URL,
      checker: (val) => {
        if (!val) return ['NEXTAUTH_URL is missing'];
        if (val.includes('localhost')) return ['⚠️  Using localhost (ok for local dev)'];
        return [];
      }
    },
    {
      name: 'EMAIL_FROM',
      value: env.EMAIL_FROM,
      checker: (val) => {
        if (!val) return ['EMAIL_FROM is missing'];
        if (!val.includes('@')) return ['EMAIL_FROM should be a valid email'];
        return [];
      }
    }
  ];

  let hasErrors = false;
  let hasWarnings = false;

  checks.forEach(({ name, value, checker }) => {
    const issues = checker(value);

    if (issues.length === 0) {
      const preview = value ? value.substring(0, 30) + (value.length > 30 ? '...' : '') : '';
      log(`✓ ${name}: ${preview}`, colors.green);
    } else {
      issues.forEach(issue => {
        if (issue.startsWith('⚠️')) {
          log(`${issue}`, colors.yellow);
          hasWarnings = true;
        } else {
          log(`❌ ${name}: ${issue}`, colors.red);
          hasErrors = true;
        }
      });
    }
  });

  log('\n─────────────────────────────────────────────────');

  if (hasErrors) {
    log('\n❌ Issues found! Fix the errors above before deploying.', colors.red);
    log('\nSee NEXT-STEPS.md for detailed instructions.', colors.cyan);
    return;
  }

  log('\n✓ Local environment looks good!', colors.green);

  // Check if website is accessible
  log('\n🌐 Checking Production Website...\n', colors.bright);

  const siteCheck = await checkWebsite('https://resistproject.com');

  if (siteCheck.ok) {
    log('✓ https://resistproject.com is accessible', colors.green);
  } else {
    log('⚠️  Could not reach https://resistproject.com', colors.yellow);
    if (siteCheck.error) {
      log(`   Error: ${siteCheck.error}`, colors.yellow);
    }
    log('   This is normal if the site is not deployed yet.', colors.yellow);
  }

  // Railway checklist
  log('\n📦 Railway Deployment Checklist:\n', colors.bright);

  log('Before deploying, ensure in Railway dashboard:', colors.cyan);
  log('  1. PostgreSQL service is running', colors.blue);
  log('  2. Next.js service variables are set:', colors.blue);
  log('     - DATABASE_URL (reference to PostgreSQL)', colors.blue);
  log('     - NEXTAUTH_URL=https://resistproject.com', colors.blue);
  log('     - NEXTAUTH_SECRET=<same as local .env>', colors.blue);
  log('     - RESEND_API_KEY=<same as local .env>', colors.blue);
  log('     - EMAIL_FROM=noreply@resistproject.com', colors.blue);
  log('  3. Latest code is pushed to GitHub', colors.blue);
  log('  4. Railway is connected to GitHub repo', colors.blue);

  log('\n🚀 Ready to Deploy?\n', colors.bright);

  log('Option 1: Push to GitHub (auto-deploys)', colors.cyan);
  log('  git add -A', colors.blue);
  log('  git commit -m "Configure production environment"', colors.blue);
  log('  git push', colors.blue);

  log('\nOption 2: Manual redeploy in Railway', colors.cyan);
  log('  Dashboard → Deployments → Redeploy', colors.blue);

  log('\n🔍 After Deploy:\n', colors.bright);
  log('  1. Check deploy logs for "✅ Migrations completed"', colors.blue);
  log('  2. Verify "✓ Ready in XXms" appears', colors.blue);
  log('  3. Visit /auth/signin and test authentication', colors.blue);
  log('  4. Check Prisma Studio for user record', colors.blue);

  log('\n══════════════════════════════════════════════════', colors.bright);
  log('💡 See NEXT-STEPS.md for complete guide', colors.cyan);
  log('══════════════════════════════════════════════════\n', colors.bright);
}

main().catch(err => {
  log(`\n❌ Error: ${err.message}`, colors.red);
  process.exit(1);
});
