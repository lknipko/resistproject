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

### ✅ Completed (2026-02-06)

**Core Authentication:**
- NextAuth.js v5 with dual providers:
  - **Resend** - Passwordless magic link authentication
  - **Google OAuth** - Social sign-in
- Session management (database-backed, 30-day duration)
- Protected routes with redirects
- Auto-creation of `UserExtended` records on first sign-in
- Display name auto-generation with uniqueness checking

**UI Components:**
- `AuthButton` - Shows Sign In button or UserMenu based on session
- `UserMenu` - Dropdown with tier-based links (profile, dashboard)
- Sign-in page with Google and email options
- Verify-request page with auto-redirect when signed in
- Error handling page

**User Profile:**
- Profile page (`/profile`) - Shows tier, reputation, badges, stats
- Settings page (`/profile/settings`) - Account preferences
- **Profile Editing:**
  - Display name editing with Edit/Save/Cancel workflow
  - Email preferences (notifications, weekly digest)
  - Server actions with validation and error handling
  - Real-time feedback with success/error messages
  - Automatic page revalidation after updates

**Database:**
- Full Prisma schema with NextAuth models
- `UserExtended` table with tier/reputation/badge system
- Edit proposal, voting, and moderation tables
- Audit logging system

---

## Collaborative Editing System

### ✅ Phase 1-4 Complete (2026-02-06)

**Phase 1: Foundation**
- ✅ Page ID mapping (`PageMetadata` table)
- ✅ Permission system (`src/lib/permissions.ts`)
- ✅ Edit validation (`src/lib/validation.ts`)
- ✅ Diff generation (`src/lib/diff.ts`)
- ✅ Edit submission UI (`EditPageButton`, `EditProposalModal`)
- ✅ Edit submission server action (`src/app/edit-proposals/actions.ts`)

**Phase 2: Voting & Auto-Resolution**
- ✅ Review queue page (`/review`)
- ✅ Proposal cards with diff viewer
- ✅ Voting server actions
- ✅ Weighted voting system (Tier 1=1pt, Tier 2=2pt, Tier 3+=3pt)
- ✅ Auto-approval/rejection at vote thresholds
- ✅ Content resolution system (approved edits apply to pages)

**Phase 3: Moderation Dashboard**
- ✅ Moderator dashboard (`/admin/review-edits`) - Tier 3+ only
- ✅ Enhanced proposal cards with moderator actions
- ✅ Instant approve/reject functionality
- ✅ User proposal tracking on profile page
- ✅ Tier-based navigation links

**Phase 4: Reputation & Gamification**
- ✅ Reputation system (`src/lib/reputation.ts`)
  - Edit approved: +10
  - Edit rejected: -5
  - Vote cast: +1
  - Vote with majority: +2 bonus
  - Review completed: +2
- ✅ Tier auto-promotion (`src/lib/tier-promotion.ts`)
  - Tier 1→2: 1 approved edit
  - Tier 2→3: 5 approved edits + 100 reputation
  - Tier 3+: Manual promotion only
- ✅ Badge system (`src/lib/badges.ts`)
  - Tier badges
  - Contribution badges
  - Engagement badges
  - Quality badges

**Key Features:**
- Edit proposals with MDX editing and preview
- Community voting with weighted scores
- Automatic resolution at approval/rejection thresholds
- Reputation awards for quality contributions
- Tier progression based on approved edits
- Badge achievements for milestones
- Audit logging for all actions
- Tier-based dashboard access
- "Propose New Page" button on learn/act landing pages

**File Structure:**
```
src/
├── app/
│   ├── review/                     # Review queue for voting
│   │   ├── page.tsx
│   │   └── actions.ts
│   ├── admin/
│   │   └── review-edits/          # Moderator dashboard (Tier 3+)
│   │       ├── page.tsx
│   │       └── actions.ts
│   └── edit-proposals/
│       └── actions.ts              # Edit submission
├── components/
│   ├── content/
│   │   ├── EditPageButton.tsx     # Appears on all learn/act pages
│   │   ├── EditProposalModal.tsx  # Full-screen edit interface
│   │   └── ProposeNewPageButton.tsx # New page proposals
│   └── review/
│       ├── ProposalCard.tsx       # Proposal display
│       └── DiffViewer.tsx         # Side-by-side diff
└── lib/
    ├── permissions.ts              # Tier-based access control
    ├── validation.ts               # Edit validation rules
    ├── diff.ts                     # Diff generation
    ├── proposal-resolution.ts      # Auto-approval logic
    ├── content-resolver.ts         # Apply approved edits
    ├── reputation.ts               # Reputation system
    ├── tier-promotion.ts           # Tier progression
    ├── badges.ts                   # Badge awards
    └── audit.ts                    # Audit logging
```

### Collaborative Editing Workflow

**1. User Submits Edit Proposal**
```
User clicks "Suggest Edit" → EditProposalModal opens
↓
User edits MDX content, writes summary
↓
submitEditProposal() server action:
  - Validates session and permissions
  - Validates edit (min 3 words changed, profanity check)
  - Generates diff
  - Determines approval threshold based on tier
  - Tier 3+: Instant approval → skip to step 3
  - Tier 1-2: Creates pending proposal
  - Awards reputation (+1 for proposal submission)
  - Logs audit trail
```

**2. Community Votes (Tier 1-2 proposals only)**
```
Users visit /review page → See pending proposals
↓
User clicks approve/reject → voteOnProposal() server action:
  - Validates session and permissions
  - Checks if already voted (unique constraint)
  - Calculates vote weight (tier 1=1pt, 2=2pt, 3+=3pt)
  - Creates Vote record
  - Updates proposal scores
  - Awards reputation (+1 for voting)
  - Calls checkAndResolveProposal()
```

**3. Auto-Resolution**
```
checkAndResolveProposal() checks thresholds:
  - Tier 1 proposer: needs 10 approval points (or -10 rejection)
  - Tier 2 proposer: needs 5 approval points (or -5 rejection)
↓
If threshold reached → resolveProposal():
  - Updates proposal status to approved/rejected
  - Awards/penalizes proposer reputation (+10/-5)
  - Awards majority vote bonus to voters (+2)
  - Checks and promotes user tier if qualified
  - Awards badges for milestones
  - Logs audit trail
```

**4. Content Display**
```
User visits /learn/some-page
↓
getResolvedContent() called:
  - Loads base MDX file
  - Fetches all approved edits for this page
  - Applies edits sequentially
  - Returns resolved content + version number
↓
Page renders with "X community edits" indicator
```

**Tier Progression Example:**
```
New user (Tier 1) → Proposes edit → Needs 10 vote points
Community votes → Reaches 10 points → Auto-approves
Reputation: +10 for approval → User promoted to Tier 2
↓
User (Tier 2) → Proposes 4 more edits → All approved
After 5 total approved edits + 100+ reputation → Tier 3
↓
User (Tier 3) → All future edits instantly approved
Can access moderator dashboard at /admin/review-edits
```

**Rate Limits:**
- Tier 1: 3 edits/day, 10 votes/day
- Tier 2: 10 edits/day, 30 votes/day
- Tier 3+: 50 edits/day, 100 votes/day
- Resets daily based on `lastActivityReset` field

### 🔄 Next Steps

**Testing & Polish:**
- [ ] Test end-to-end edit submission and voting flow
- [ ] Test tier progression (1→2→3)
- [ ] Test badge awarding
- [ ] Verify reputation calculations
- [ ] Test moderation dashboard features
- [ ] Test "propose new page" functionality

**Production Deployment:**
- [ ] Deploy collaborative editing system to production
- [ ] Test end-to-end flow in production
- [ ] Monitor audit logs

**Mobile:**
- [ ] Implement mobile hamburger menu
- [ ] Test responsive edit/review UI

**Future Enhancements:**
- [ ] Email notification system (edit approvals, vote results)
- [ ] Real-time vote count updates (polling or WebSockets)
- [ ] Conflict detection (multiple edits to same page)
- [ ] Edit history viewer
- [ ] User reputation leaderboard

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
# Database
DATABASE_URL="postgresql://postgres:password@shuttle.proxy.rlwy.net:21700/railway"

# NextAuth
AUTH_SECRET="your-secret-here"           # Generate: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# Email Provider (Resend)
RESEND_API_KEY="re_..."                  # From resend.com
EMAIL_FROM="noreply@resistproject.com"

# Google OAuth
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

**Note:** Use Railway's **external** DATABASE_URL (not `.railway.internal`) for local development.

**Required for production:**
- All variables above must be set in Railway environment variables
- `NEXTAUTH_URL` should be `https://resistproject.com` in production
- `AUTH_SECRET` must be 32+ byte random string

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

## Key System Components

**Authentication & Authorization:**
- `src/lib/auth.ts` - NextAuth v5 configuration (Google + Resend)
- `src/lib/permissions.ts` - Tier-based permission checks
- `src/app/auth/` - Sign-in, verify-request, error pages
- `src/components/layout/` - AuthButton, UserMenu, HeaderWrapper

**Collaborative Editing:**
- `src/app/review/` - Review queue for voting
- `src/app/admin/review-edits/` - Moderator dashboard
- `src/app/edit-proposals/` - Edit submission
- `src/components/content/EditPageButton.tsx` - Edit entry point
- `src/components/content/EditProposalModal.tsx` - Edit interface
- `src/components/review/` - ProposalCard, DiffViewer

**Core Libraries:**
- `src/lib/validation.ts` - Edit validation rules
- `src/lib/diff.ts` - Diff generation utilities
- `src/lib/proposal-resolution.ts` - Auto-approval logic
- `src/lib/content-resolver.ts` - Apply approved edits
- `src/lib/reputation.ts` - Reputation system
- `src/lib/tier-promotion.ts` - Auto-tier progression
- `src/lib/badges.ts` - Badge awarding
- `src/lib/audit.ts` - Audit logging

**Database:**
- `prisma/schema.prisma` - Full database schema
- Models: User, UserExtended, EditProposal, Vote, AuditLog, PageMetadata

**Scripts:**
- `scripts/seed-page-metadata.ts` - Initialize page database
- `scripts/grant-admin.ts` - Manually grant admin rights
- `scripts/backfill-display-names.ts` - Backfill display names
- `scripts/seed-test-proposals.ts` - Create test proposals

---

## Database Schema

### User Authentication (NextAuth)

- `User` - Core user accounts (email, name, emailVerified)
- `Account` - OAuth accounts (if adding providers later)
- `Session` - Active sessions
- `VerificationToken` - Magic link tokens

### Extended User Data & Permissions

**UserExtended:**
- `userTier` - Contributor level (1-5)
  - **Tier 1 (New Contributor):** Can propose edits (need 10 vote points for approval)
  - **Tier 2 (Contributor):** Auto-promoted at 1 approved edit (need 5 vote points)
  - **Tier 3 (Trusted Contributor):** Auto-promoted at 5 approved edits + 100 rep (instant approval)
  - **Tier 4 (Moderator):** Manual promotion (can moderate edits)
  - **Tier 5 (Administrator):** Manual promotion (full system access)
- `displayName` - Auto-generated from email, user can edit in profile
- `reputationScore` - Points earned through contributions
- `badges` - JSON array of earned badges (tier badges, contribution badges, etc.)
- `editsProposed/Approved/Rejected` - Edit statistics
- `votesCast`, `reviewsCompleted` - Engagement statistics
- `dailyEditCount`, `dailyVoteCount` - Rate limiting counters
- `lastActivityReset` - Tracks daily reset for rate limits
- `emailNotifications`, `weeklyDigest` - Preferences

**Auto-promotion logic:**
- Runs after each edit approval
- Checks tier requirements
- Awards tier badges
- Logs promotion in audit trail

**EditProposal:**
- Stores proposed edits with diff content
- Tracks approval/rejection scores
- Links to proposer and page
- Status: pending, approved, rejected
- `approvalThreshold`, `rejectionThreshold` based on proposer tier

**Vote:**
- One vote per user per proposal (compound unique constraint)
- Vote type: approve or reject
- Vote weight based on voter tier (1, 2, or 3 points)
- Optional comment

**PageMetadata:**
- Maps MDX files to database IDs
- Tracks page section (learn/act) and slug
- Future: Could track edit counts, view counts, etc.

**AuditLog:**
- Records all system actions
- userId, action, entityType, entityId, metadata, ipAddress
- Useful for security monitoring and dispute resolution

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

## Troubleshooting

### Windows Dev Server Issues

**EPERM: operation not permitted on .next/trace**
- **Cause:** Windows file lock on .next folder
- **Solution:**
  ```bash
  taskkill /F /IM node.exe
  rm -rf .next
  npm run dev
  ```

**Port already in use**
- Dev server will auto-select available port (3001, 3002, etc.)
- Check terminal output for actual port

### Database Issues

**Prisma Client not recognizing new fields**
- **Cause:** Prisma client in memory not regenerated
- **Solution:**
  ```bash
  npx prisma generate
  # Restart dev server
  ```

**Migration conflicts**
- **Solution:**
  ```bash
  npx prisma migrate reset  # WARNING: Deletes all data
  npx prisma migrate dev
  ```

### Authentication Issues

**"User profile not found" errors**
- **Cause:** UserExtended record not created
- **Solution:** Check `src/lib/auth.ts` signIn callback
- **Fallback:** Run `scripts/backfill-display-names.ts`

**Google OAuth not working**
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
- Verify authorized redirect URIs in Google Cloud Console:
  - `http://localhost:3000/api/auth/callback/google` (dev)
  - `https://resistproject.com/api/auth/callback/google` (prod)

### Voting/Editing Issues

**"Unknown argument voterId_proposalId"**
- **Cause:** Unique constraint field order wrong
- **Solution:** Use `proposalId_voterId` (matches schema)

**Edit proposals failing to save**
- Check Prisma client is up to date
- Restart dev server

---

## Quick Reference

### Sign In a User
1. User visits `/auth/signin`
2. Can sign in with Google or email
3. **Google:** `signIn("google")` → OAuth flow
4. **Email:** `signIn("resend", { email })` → Magic link sent
5. User clicks link → Session created
6. Auto-creates `UserExtended` record with tier 1
7. Display name auto-generated from email

### Check Authentication & Permissions
```typescript
import { auth } from '@/lib/auth'
import { canModerate, canAdminister } from '@/lib/permissions'

// Get session
const session = await auth()
if (!session) redirect('/auth/signin')

// Get user extended data
const userExtended = await prisma.userExtended.findUnique({
  where: { userId: session.user.id }
})

// Check permissions
const modPerms = await canModerate({ userExtended })
if (!modPerms.allowed) {
  return { error: modPerms.reason }
}
```

### Submit Edit Proposal
```typescript
// From EditProposalModal → calls server action
import { submitEditProposal } from '@/app/edit-proposals/actions'

const result = await submitEditProposal({
  section: 'learn',
  slug: 'digital-rights',
  proposedContent: '...',
  editSummary: 'Updated facts section',
  editType: 'content',
  isNewPage: false
})
```

### Vote on Proposal
```typescript
// From review page → calls server action
import { voteOnProposal } from '@/app/review/actions'

await voteOnProposal(proposalId, 'approve', 'Good fact-checking')
```

### Grant Admin Rights
```bash
# Run script
npx tsx scripts/grant-admin.ts lknipko@gmail.com nipko

# Or manually in Prisma Studio
# Set userTier=5, reputationScore=1000
```

---

**Last Updated:** February 6, 2026
**Status:**
- ✅ Authentication system (Google + Email)
- ✅ Collaborative editing (Phases 1-4)
- ✅ Reputation & gamification
- ✅ Tier-based permissions
- 🔄 Production deployment pending
