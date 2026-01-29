# Deployment Guide - Resist Project

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - From Railway PostgreSQL service
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `RESEND_API_KEY` - From https://resend.com (optional for now)

### 3. Run Database Migrations
```bash
# Push Prisma schema to database
npx prisma migrate dev --name init

# Apply PostgreSQL triggers and functions
# Via Railway dashboard: PostgreSQL → Data → Query
# Copy/paste contents of: prisma/triggers-and-functions.sql
```

### 4. Start Development Server
```bash
npm run dev
```

Open http://localhost:3000

---

## Production Deployment (Railway)

### Prerequisites
- GitHub repository with resist-project code
- Railway account with PostgreSQL service
- Resend account (for email auth)

### Step 1: Configure Railway Environment Variables

In Railway dashboard → resistproject → Variables tab, add:

```env
DATABASE_URL=<from Railway PostgreSQL service>
NEXTAUTH_URL=https://resistproject.com
NEXTAUTH_SECRET=<generate new secret for production>
RESEND_API_KEY=<from resend.com>
EMAIL_FROM=noreply@resistproject.com
```

### Step 2: Connect GitHub Repository

1. In Railway dashboard → resistproject
2. Click **New** → **GitHub Repo**
3. Select your resist-project repository
4. Railway will auto-detect the Dockerfile

### Step 3: Configure Build Settings

Railway should auto-detect:
- **Build Command**: (uses Dockerfile)
- **Start Command**: `node server.js`
- **Port**: 3000

### Step 4: Deploy

1. Push code to GitHub main branch
2. Railway automatically triggers deployment
3. Monitor build logs in Railway dashboard
4. Wait for deployment to complete (~3-5 minutes)

### Step 5: Run Database Migrations (One-Time)

After first deployment:

1. Go to Railway → PostgreSQL service → Data tab
2. Click **Query** button
3. Copy contents of `prisma/triggers-and-functions.sql`
4. Paste and execute

Or use Railway CLI:
```bash
railway run npx prisma migrate deploy
```

### Step 6: Verify Deployment

Visit:
- https://resistproject-production.up.railway.app
- https://resistproject.com (custom domain)

Check:
- [ ] Home page loads
- [ ] All 17 pages accessible
- [ ] Navigation works
- [ ] SSL certificate active
- [ ] `/home` redirects to `/`

---

## Database Management

### View Database
```bash
npx prisma studio
```

### Create New Migration
```bash
npx prisma migrate dev --name description_of_changes
```

### Reset Database (DANGER - deletes all data)
```bash
npx prisma migrate reset
```

### Seed Database (Future)
```bash
npm run seed
```

---

## Rollback Plan

If deployment fails:

1. Railway keeps previous deployment running
2. In Railway dashboard: Click **Rollback** button
3. Fix issues locally
4. Redeploy when ready

Database rollback:
- Railway PostgreSQL has automatic backups (7 days retention)
- Restore via Railway dashboard → PostgreSQL → Backups

---

## Monitoring

### Check Build Logs
Railway dashboard → Deployments → Click deployment → View Logs

### Check Runtime Logs
Railway dashboard → resistproject service → Logs tab

### Common Issues

**Build fails with Prisma error:**
- Ensure DATABASE_URL is set in Railway variables
- Check Prisma schema syntax

**Pages don't load:**
- Check Next.js build logs for errors
- Verify all MDX files compiled correctly

**Database connection error:**
- Verify DATABASE_URL is correct
- Check PostgreSQL service is running

**Email auth not working:**
- Verify RESEND_API_KEY is correct
- Check Resend dashboard for delivery logs
- Verify domain is verified in Resend

---

## Content Updates

### Edit Existing Page
1. Edit `.mdx` file in `content/` directory
2. Test locally: `npm run dev`
3. Commit and push to GitHub
4. Railway auto-deploys changes

### Add New Page
1. Create new `.mdx` file in `content/learn/` or `content/act/`
2. Follow template structure
3. Test locally
4. Commit and push

No manual deployment scripts needed - Git push triggers deployment.

---

## Security Notes

- Never commit `.env` file (already in `.gitignore`)
- Use different `NEXTAUTH_SECRET` for production
- Rotate API keys regularly
- Monitor Railway logs for suspicious activity
- Keep dependencies updated: `npm audit`

---

## Cost Monitoring

Railway free tier limits:
- 500 hours/month runtime
- $5 credit/month
- PostgreSQL included

Monitor usage: Railway dashboard → Usage tab

Upgrade to Pro if exceeding limits.
