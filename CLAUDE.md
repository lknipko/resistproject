# Resist Project - Developer Guide

## ⚠️ IMPORTANT: Working Directory

**Always work from:** `resistproject/` (this directory)

This is the git repository root. All git commands, npm commands, and Railway CLI commands should be run from here.

**Parent directory** (`civic-action-wiki/`) is just a container folder and is NOT a git repository.

---

## Project Overview

A Next.js-based civic engagement platform helping citizens understand government actions and take meaningful action. Provides verified facts from primary sources and actionable civic participation opportunities.

**Live Site:** https://resistproject.com
**GitHub Repo:** https://github.com/lknipko/resistproject

---

## Technology Stack

**Framework:**
- **Next.js 15** (App Router) - React framework with SSR
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

**Database & ORM:**
- **PostgreSQL** - Hosted on Railway
- **Prisma** - ORM and database toolkit

**Authentication:**
- **NextAuth.js v5** (Auth.js) - Passwordless email authentication
- **Resend** - Email delivery service for magic links

**Hosting:**
- **Railway.app** - Production hosting (web service + PostgreSQL)
- **Cloudflare DNS** - Domain management
- **Docker** - Containerized deployment

---

## Project Structure

```
resistproject/                    # ← Working directory (git repo root)
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── page.tsx            # Homepage
│   │   ├── layout.tsx          # Root layout
│   │   ├── auth/               # Authentication pages
│   │   │   ├── signin/         # Sign-in page
│   │   │   ├── verify-request/ # "Check email" page
│   │   │   └── error/          # Auth error page
│   │   ├── profile/            # User profile
│   │   │   ├── page.tsx        # Profile dashboard
│   │   │   └── settings/       # Account settings
│   │   ├── learn/              # Learn pages
│   │   └── act/                # Action pages
│   ├── components/
│   │   ├── layout/             # Header, Footer, AuthButton, UserMenu
│   │   └── content/            # Content display components
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── db.ts               # Prisma client
│   │   └── mdx.ts              # MDX processing
│   └── types/
│       └── next-auth.d.ts      # NextAuth type extensions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── content/                     # MDX content files
│   ├── home.mdx
│   ├── learn/                  # Educational content
│   └── act/                    # Action opportunities
├── public/                      # Static assets
├── Dockerfile                   # Production Docker image
├── railway.toml                 # Railway deployment config
├── migrate-and-start.js        # Startup script
├── package.json
├── tsconfig.json
└── CLAUDE.md                    # This file
```

---

## Authentication System Status

### ✅ Completed (2026-02-05)

**Core Authentication:**
- NextAuth.js v5 with Resend email provider
- Passwordless magic link authentication
- Session management (database-backed)
- Protected routes with redirects

**UI Components:**
- `AuthButton` - Shows Sign In button or UserMenu based on session
- `UserMenu` - Dropdown with user avatar, profile link, sign out
- Sign-in page with email form
- Verify-request page ("Check your email")
- Error handling page

**User Profile:**
- Profile page (`/profile`) - Shows tier, reputation, badges, stats
- Settings page (`/profile/settings`) - Account preferences
- Auto-creates `UserExtended` record on first sign-in
- Displays user tier (1-5) and reputation score
- Shows edit statistics and badges

**Database:**
- Full Prisma schema with NextAuth models
- `UserExtended` table with tier/reputation system
- Automatic tier promotion triggers
- Badge system (JSON field)

### 🔄 Next Steps

**User Experience:**
- [ ] Test end-to-end sign-in flow
- [ ] Verify email delivery works in production
- [ ] Test profile page with real user data
- [ ] Implement edit profile functionality (update display name, preferences)
- [ ] Add user avatar upload (optional)

**Mobile:**
- [ ] Implement mobile hamburger menu
- [ ] Add AuthButton to mobile navigation
- [ ] Test responsive auth UI

**Future Enhancements:**
- [ ] Email notification system (edit approvals, etc.)
- [ ] Badge awarding system
- [ ] Admin dashboard for user management
- [ ] Collaborative editing submission UI

---

## Railway Deployment

### Configuration Files

**railway.toml:**
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"
```

**CRITICAL:** `dockerfilePath` must point to `Dockerfile` at repository root, NOT a subdirectory.

### Environment Variables (Railway)

Required variables in Railway web service:

```bash
DATABASE_URL="postgresql://..."          # Auto-set by Railway Postgres
AUTH_SECRET="your-secret-here"          # Generate with: openssl rand -base64 32
RESEND_API_KEY="re_..."                 # From resend.com
EMAIL_FROM="noreply@resistproject.com"
NEXTAUTH_URL="https://resistproject.com"
```

### Deployment Process

1. **Push to GitHub:** `git push origin main`
2. **Railway auto-deploys** from GitHub (takes 2-3 minutes)
3. **Startup script** runs: `migrate-and-start.js`
   - Checks DATABASE_URL is set
   - Runs `prisma migrate deploy`
   - Starts Next.js with `npm start`

### Troubleshooting Deployments

**If changes don't appear after deployment:**

1. **Check `railway.toml`** - Ensure `dockerfilePath = "Dockerfile"` (no subdirectory)
2. **Check build logs** - Look for "cached" - Railway may be using old Docker layers
3. **Check commit** - Verify Railway deployed the latest commit
4. **Clear cache** - Add a cache-busting change to Dockerfile if needed:
   ```dockerfile
   ARG CACHEBUST=1
   RUN echo "Cache bust: $CACHEBUST"
   ```

**Common issues:**
- ❌ `railway.toml` pointing to wrong Dockerfile path
- ❌ Docker cache using old layers (everything shows "cached")
- ❌ Missing environment variables
- ❌ Database connection issues

---

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL and auth keys

# Run migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start dev server
npm run dev
```

### Environment Variables (.env)

```bash
DATABASE_URL="postgresql://postgres:password@shuttle.proxy.rlwy.net:21700/railway"
AUTH_SECRET="your-secret-here"
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@resistproject.com"
NEXTAUTH_URL="http://localhost:3000"
```

**Note:** Use Railway's **external** DATABASE_URL (not `.railway.internal`) for local development.

### Common Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm start               # Start production server

# Database
npx prisma studio       # Open database GUI
npx prisma migrate dev  # Create and apply migration
npx prisma generate     # Regenerate Prisma Client

# Git
git add .
git commit -m "message"
git push origin main    # Triggers Railway deployment
```

---

## File Coordination (Multi-Claude Setup)

**Authentication Claude (YOU)** should focus on:
- ✅ `src/app/auth/**` - All auth pages
- ✅ `src/app/profile/**` - Profile pages
- ✅ `src/components/layout/AuthButton.tsx`
- ✅ `src/components/layout/UserMenu.tsx`
- ✅ `src/components/layout/Header.tsx` (auth-related changes only)
- ✅ `src/lib/auth.ts` - NextAuth config
- ✅ `prisma/schema.prisma` - Database schema
- ✅ Any authentication configuration files

**Styling Claude (OTHER)** is working on:
- `src/components/content/**` - Content display components
- `content/learn/*.mdx` - Learn page content
- `content/act/*.mdx` - Action page content
- Responsive design improvements

**Avoid conflicts:** Don't modify `src/components/content/` or content MDX files.

---

## Database Schema

### User Authentication (NextAuth)

- `User` - Core user accounts (email, name, emailVerified)
- `Account` - OAuth accounts (if adding providers later)
- `Session` - Active sessions
- `VerificationToken` - Magic link tokens

### Extended User Data

**UserExtended:**
- `userTier` - Contributor level (1-5)
  - 1: Reader
  - 2: Contributor (1+ approved edit)
  - 3: Trusted Contributor (5+ approved edits)
  - 4: Moderator (manual promotion)
  - 5: Administrator
- `reputationScore` - Points earned through contributions
- `badges` - JSON array of earned badges
- `editsProposed/Approved/Rejected` - Edit statistics
- `emailNotifications`, `weeklyDigest` - Preferences

**Auto-promotion triggers** in database promote users automatically when they reach edit thresholds.

---

## Testing Authentication

### Test Sign-In Flow

1. **Start development:**
   ```bash
   npm run dev
   ```

2. **Visit:** http://localhost:3000

3. **Click "Sign In"** in header

4. **Enter email** and submit

5. **Check email** for magic link
   - In development, Resend test mode may be enabled
   - Check Resend dashboard for sent emails

6. **Click magic link** → Should redirect to homepage, signed in

7. **Click avatar** in header → Dropdown appears

8. **Visit profile:** http://localhost:3000/profile
   - Should show tier, reputation, stats
   - If first sign-in, auto-creates UserExtended record

### Test Profile Pages

**Profile Dashboard:**
- Tier badge and progress bar
- Reputation score
- Badge collection (empty for new users)
- Edit statistics (all zeros for new users)

**Settings Page:**
- Email preferences (read-only for now)
- Account information
- Privacy info

---

## Security Notes

- **Never commit `.env`** - Contains secrets
- **AUTH_SECRET** must be strong (32+ bytes)
- **RESEND_API_KEY** - Keep private
- **DATABASE_URL** - Never expose in logs or client code
- **Session strategy:** Database-backed (more secure than JWT)
- **Email verification:** Required for authentication
- **Rate limiting:** Not yet implemented (future enhancement)

---

## Helpful Resources

**Documentation:**
- NextAuth.js: https://authjs.dev
- Prisma: https://www.prisma.io/docs
- Next.js: https://nextjs.org/docs
- Resend: https://resend.com/docs

**Project Files:**
- `AUTH-UI-IMPLEMENTATION.md` - Detailed auth implementation guide
- `GET-RAILWAY-DATABASE-URL.md` - How to get Railway database URL
- `PRISMA-SCHEMA-REQUIREMENTS.md` - Database schema documentation

---

## Quick Reference

### Sign In a User
1. User visits `/auth/signin`
2. Enters email
3. `signIn("resend", { email })` called
4. Resend sends magic link
5. User clicks link → `/api/auth/callback/resend?token=...`
6. Token verified, session created
7. User redirected to `callbackUrl` or homepage

### Check Authentication Status
```typescript
import { auth } from '@/lib/auth'

// In server component
const session = await auth()
if (!session) {
  redirect('/auth/signin')
}
```

### Sign Out
```typescript
import { signOut } from '@/lib/auth'

// In server action or API route
await signOut()
```

---

**Last Updated:** February 5, 2026
**Status:** Authentication system complete and deployed ✅
