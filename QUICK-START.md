# Quick Start - Get Authentication Working

## Current Status

✅ Next.js app code is complete
✅ Prisma schema defined
✅ Environment variables set locally
✅ Resend API key configured
❌ Railway DATABASE_URL needs updating
❌ Railway environment variables need setting
❌ Database migrations need to run

## Immediate Next Steps (15 minutes)

### Step 1: Get Railway PostgreSQL URL (5 min)

1. Open https://railway.app
2. Go to your resistproject
3. Click on **PostgreSQL** service
4. Click **Variables** tab
5. Copy the `DATABASE_URL` value

### Step 2: Update Local .env (1 min)

Edit `resist-project/.env`:

```bash
# Replace this line:
DATABASE_URL="postgresql://postgres:OLD_PASSWORD@gondola.proxy.rlwy.net:56943/railway"

# With the new URL you copied:
DATABASE_URL="postgresql://postgres:NEW_PASSWORD@NEW_HOST.railway.app:5432/railway"
```

Save the file.

### Step 3: Update Railway Environment (5 min)

In Railway dashboard, go to your **Next.js app** service (not PostgreSQL):

1. Click **Variables** tab
2. Add these variables (click + New Variable for each):

```
NEXTAUTH_URL=https://resistproject.com
NEXTAUTH_SECRET=+Ly4VBN4mcr6u5JYxktL3MJSJz2NuLONKLTYd7WXqI4=
RESEND_API_KEY=re_MBtATmSk_FHzVGbUUWQaWUGCZQz7jqKWu
EMAIL_FROM=noreply@resistproject.com
```

(Use the NEXTAUTH_SECRET and RESEND_API_KEY from your local .env)

**IMPORTANT:** Make sure DATABASE_URL is also there. If not, add it:
- Click **+ New Variable**
- Click **Add Reference**
- Select **PostgreSQL** → **DATABASE_URL**

3. Click **Deploy** to restart with new variables

### Step 4: Run Migrations Locally (2 min)

```bash
cd resist-project

# Test connection
npx prisma db pull

# Deploy migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

All three should succeed.

### Step 5: Deploy to Railway (2 min)

Trigger a new deployment:

```bash
git commit --allow-empty -m "Trigger redeploy with updated env vars"
git push
```

Or in Railway dashboard, click **Deployments** → **Redeploy**.

### Step 6: Test Authentication (5 min)

1. Go to https://resistproject.com/auth/signin
2. Enter your email
3. Check your email for the magic link
4. Click the link
5. You should be signed in!

Verify by going to https://resistproject.com/admin (should redirect to sign-in if not logged in)

## Verification Commands

### Check local environment is ready:
```bash
cd resist-project
node scripts/setup-env.js
```

Should show all green checkmarks.

### Check database connection:
```bash
npx prisma studio
```

Should open a GUI showing all your database tables.

### Check Railway deployment:
1. Go to Railway dashboard
2. Click your Next.js service
3. Click **Deployments**
4. Click latest deployment
5. Check logs - should see "Ready in XXms"

## Troubleshooting

### "Authentication failed against database server"
→ DATABASE_URL is wrong. Get the current one from Railway PostgreSQL service.

### "Missing environment variable NEXTAUTH_SECRET"
→ Add NEXTAUTH_SECRET to Railway environment variables (in Next.js service, not PostgreSQL).

### "Resend API error"
→ Check RESEND_API_KEY is correct. Try sending a test email from Resend dashboard.

### "Migration failed: relation already exists"
→ Database already has tables. Run `npx prisma migrate resolve --applied 20260127184234_init` then try again.

### Railway deploy fails
→ Check deploy logs in Railway dashboard. Common issues:
- Missing environment variables
- Database connection timeout (wait a moment and try again)
- Build cache issues (try **Settings** → **Clear Build Cache**)

## After Authentication Works

Once you can successfully sign in:

1. Create your admin account:
   - Sign in with your email
   - Manually set your tier to 5 in the database:
   ```sql
   UPDATE users_extended SET user_tier = 5 WHERE email = 'your@email.com';
   ```

2. Start building collaborative editing:
   - See COLLAB-EDITING-PLAN.md
   - We'll begin with the "Edit" button on content pages

3. Next features:
   - Edit proposal form
   - Review queue for moderators
   - Voting interface
   - User dashboard

## Files Created for You

- `AUTH-SETUP.md` - Detailed authentication setup guide
- `GET-RAILWAY-URL.md` - How to get your Railway database URL
- `COLLAB-EDITING-PLAN.md` - Complete plan for collaborative editing features
- `QUICK-START.md` - This file (fastest path to working auth)
- `scripts/setup-env.js` - Environment variable checker

## Need Help?

If you get stuck, check:
1. Railway deployment logs (most issues show here)
2. Browser console (for client-side errors)
3. Local terminal output (for Prisma errors)

Common error patterns:
- "DATABASE_URL" → Get new URL from Railway
- "NEXTAUTH_SECRET" → Add to Railway variables
- "RESEND_API" → Check Resend dashboard for correct key
- "Migration failed" → Database might need reset (see AUTH-SETUP.md)

## Success Checklist

- [ ] Railway PostgreSQL service is running
- [ ] New DATABASE_URL copied from Railway
- [ ] Local .env updated with new DATABASE_URL
- [ ] Railway variables set (NEXTAUTH_URL, NEXTAUTH_SECRET, RESEND_API_KEY, EMAIL_FROM)
- [ ] `npx prisma migrate deploy` succeeded
- [ ] Railway deployment succeeded
- [ ] Can visit https://resistproject.com (loads without error)
- [ ] Can visit https://resistproject.com/auth/signin (shows sign-in form)
- [ ] Can receive email from Resend
- [ ] Can click magic link and sign in
- [ ] Session persists (refresh page, still signed in)

Once all checked, you're ready to build collaborative editing! 🎉
