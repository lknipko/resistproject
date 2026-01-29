# Milestone 5 Setup Guide

## Step 1: Get Railway PostgreSQL Connection String

1. Go to https://railway.app and log in
2. Open your **resistproject** project
3. Click on your **PostgreSQL** service
4. Go to the **Variables** tab
5. Find **`DATABASE_URL`** and copy the entire value
   - It should look like: `postgresql://postgres:password@host.railway.app:5432/railway`

6. Open `.env` file in the resist-project folder
7. Replace the placeholder DATABASE_URL with your actual value:
   ```
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_CONNECTION_STRING"
   ```

## Step 2: Generate NEXTAUTH_SECRET

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output and paste it into `.env` file:
```
NEXTAUTH_SECRET="paste_the_generated_secret_here"
```

## Step 3: Set up Resend (Email Provider)

1. Go to https://resend.com and sign up (free tier is generous)
2. Verify your email
3. Go to **API Keys** section
4. Click **Create API Key**
5. Copy the API key (starts with `re_`)
6. Add to `.env` file:
   ```
   RESEND_API_KEY="re_your_actual_api_key"
   ```

7. Verify your domain (resistproject.com) in Resend dashboard to send from noreply@resistproject.com
   - Or use Resend's default domain for testing: `onboarding@resend.dev`

## Step 4: Run Database Migrations

Once `.env` is configured with real values:

```bash
cd "C:\Users\lknip\Documents\civic-action-wiki\resist-project"

# Create migration
npx prisma migrate dev --name init

# This will:
# - Push all tables to Railway PostgreSQL
# - Generate Prisma Client
# - Create migration history
```

## Step 5: Apply Triggers and Functions

After Prisma migrations succeed, we need to manually run the PostgreSQL triggers/functions.

**Option A: Via Railway Dashboard**
1. Open Railway project
2. Click PostgreSQL service
3. Go to **Data** tab
4. Click **Query** button
5. Copy contents of `prisma/triggers-and-functions.sql`
6. Paste and execute

**Option B: Via Command Line (if you have psql)**
```bash
psql $DATABASE_URL -f prisma/triggers-and-functions.sql
```

## Step 6: Verify

Check that all tables were created:
```bash
npx prisma studio
```

This opens a browser interface showing all database tables.

---

## Quick Reference: .env Template

```env
DATABASE_URL="postgresql://postgres:PASSWORD@HOST.railway.app:PORT/railway"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="32_character_random_string"
RESEND_API_KEY="re_your_api_key_here"
EMAIL_FROM="noreply@resistproject.com"
```

---

## Next Steps After Database Setup

Once database is ready, we'll move to **Milestone 6: Railway Deployment**:
- Update next.config.mjs
- Create Dockerfile
- Deploy to Railway
- Test production site
