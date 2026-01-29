# Authentication & Collaborative Editing Setup

## Current Status
✅ Next.js app deployed to Railway
✅ Prisma schema with auth + collaborative editing models
✅ NextAuth configured with Resend email provider
✅ Auth UI pages created
⏳ Environment variables need updating
⏳ Database migrations need to run
⏳ Resend API key needed
⏳ Collaborative editing UI needs building

## Step 1: Get Railway Database URL

Since you rebuilt the Railway service, you need the new DATABASE_URL:

1. Go to Railway dashboard: https://railway.app/project/resistproject
2. Click on your **PostgreSQL** service
3. Go to **Variables** tab
4. Copy the `DATABASE_URL` value
5. Update your local `.env` file with this URL

## Step 2: Generate NextAuth Secret

Run this command to generate a secure random secret:

```bash
openssl rand -base64 32
```

Copy the output - you'll need it for both local and Railway.

## Step 3: Get Resend API Key

1. Go to https://resend.com (sign up if needed)
2. Create a new API key
3. Verify your domain `resistproject.com` in Resend (or use their test mode)
4. Copy the API key

## Step 4: Update Railway Environment Variables

In Railway dashboard, go to your **resistproject** service, then **Variables** tab, and add:

```
NEXTAUTH_URL=https://resistproject.com
NEXTAUTH_SECRET=<paste the secret from Step 2>
RESEND_API_KEY=<paste the key from Step 3>
EMAIL_FROM=noreply@resistproject.com
```

**Note:** DATABASE_URL should already be set automatically by Railway's PostgreSQL service.

## Step 5: Update Local .env

Update `resist-project/.env` with:

```env
DATABASE_URL=<paste from Railway PostgreSQL service>
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<same secret from Step 2>
RESEND_API_KEY=<same key from Step 3>
EMAIL_FROM=noreply@resistproject.com
```

## Step 6: Run Database Migrations

After setting environment variables in Railway, the migrations should run automatically on next deploy.

To trigger a redeploy:

```bash
git commit --allow-empty -m "Trigger Railway redeploy"
git push
```

Or use Railway CLI:
```bash
railway up
```

You can also run migrations manually via Railway's shell:
1. Go to your service in Railway dashboard
2. Click **Settings** → **Deploy Logs**
3. Once deployed, run: `npx prisma migrate deploy`

## Step 7: Test Authentication

1. Visit https://resistproject.com/auth/signin
2. Enter your email
3. Check your email for the magic link
4. Click the link to sign in
5. You should be redirected back to the site, authenticated

## Step 8: Verify Database Tables

Check that all tables were created:

```bash
npx prisma studio
```

This opens a GUI to browse your database. You should see:
- User, Account, Session, VerificationToken (NextAuth)
- UserExtended (user tiers, reputation)
- EditProposal, Vote (collaborative editing)
- PageMetadata, PageEvent, PinnedPage (content management)
- AuditLog (tracking)

## Next: Collaborative Editing

Once authentication is working, we'll build:

1. **Edit Proposal Form** - Let users suggest edits to content
2. **Review Queue** - Moderators see pending edits
3. **Voting Interface** - Community votes on proposed changes
4. **Diff Viewer** - Visual comparison of changes
5. **User Dashboard** - Show reputation, tier, edit history

## Architecture Overview

### User Tiers (schema: UserExtended.userTier)
1. **Tier 1** - New contributor (edits need 5 approvals)
2. **Tier 2** - Trusted contributor (edits need 3 approvals)
3. **Tier 3** - Moderator (can approve edits)
4. **Tier 4** - Senior moderator (can instantly approve)
5. **Tier 5** - Administrator (full access)

### Edit Workflow
1. User proposes edit → Creates `EditProposal` record
2. Validation runs (source checking, content policy)
3. Other users vote → Creates `Vote` records
4. When approval threshold met → Edit applied
5. All actions logged → `AuditLog` records

### Reputation System
Users gain reputation through:
- Approved edits (+10 points)
- Upvotes on their edits (+2 per vote)
- Reviewing other edits (+1 per review)
- Tier auto-promotes at reputation milestones

## Troubleshooting

### "Authentication failed against database server"
- Your DATABASE_URL is wrong or outdated
- Get the current URL from Railway PostgreSQL service Variables tab

### "Missing environment variable NEXTAUTH_SECRET"
- Add NEXTAUTH_SECRET to Railway environment variables
- Generate with: `openssl rand -base64 32`

### "Resend API error"
- Check your RESEND_API_KEY is correct
- Verify your domain in Resend dashboard
- Or use Resend test mode for development

### Migrations fail
- Check DATABASE_URL is correct
- Ensure PostgreSQL version is 12+ (Railway uses 15)
- Check Railway deploy logs for errors

## Database Schema Quick Reference

```
User (NextAuth)
  ├─→ UserExtended (reputation, tier, stats)
  ├─→ EditProposal[] (as author)
  ├─→ Vote[] (votes cast)
  └─→ AuditLog[] (actions taken)

EditProposal
  ├─→ User (proposer)
  ├─→ User (resolver)
  └─→ Vote[] (votes on this proposal)

PageMetadata (trending, scoring)
  └─→ PageEvent[] (analytics)
```

## Ready to Build?

Once authentication is working, run:

```bash
npm run dev
```

Then we'll start building the collaborative editing UI!
