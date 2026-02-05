# Civic Action Wiki - Project Context

## Project Overview

A civic engagement platform helping citizens understand government actions and take meaningful action. Uses a content-driven structure with verified facts from primary sources and actionable civic participation opportunities.

**Primary Goals:**
- Empower citizens with fact-based information about government actions
- Provide concrete, low-barrier action opportunities (not just symbolic demonstrations)
- Enable community contribution while maintaining high credibility standards
- Focus on material resistance and consequences, not just awareness

**Target Audience:**
- Citizens opposing government actions who want to act effectively
- People seeking verified, primary-source information
- Activists looking for coordinated, effective resistance strategies

---

## Technology Stack

**Framework:**
- **Next.js 15** (App Router) - React framework with SSR
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

**Database & ORM:**
- **PostgreSQL** - Production database (hosted on Railway)
- **Prisma** - ORM and database toolkit

**Authentication:**
- **NextAuth.js v5** (Auth.js) - Email-based passwordless authentication
- **Resend** - Email delivery service for magic links

**Content:**
- **MDX** - Markdown with React components for content pages
- **next-mdx-remote** - Server-side MDX rendering
- **gray-matter** - YAML frontmatter parsing

**Hosting & Deployment:**
- **Railway.app** - Production hosting (web service + PostgreSQL)
- **GitHub** - Source control (repository: lknipko/resistproject)
- **Custom domain:** resistproject.com (via Cloudflare DNS)

**Development:**
- **Node.js 20** - Runtime
- **Docker** - Containerized deployment
- **npm** - Package management

---

## Current Deployment Status

### Production Environment

**Live Site:** https://resistproject.com
**Railway Project:** resistproject-production
**GitHub Repo:** https://github.com/lknipko/resistproject

**Services:**
- **Web Service:** Next.js application (resistproject)
- **Database Service:** PostgreSQL (Postgres - newly provisioned Feb 2026)

**Environment Variables (Railway - Web Service):**
- `DATABASE_URL` - PostgreSQL connection string (points to new database)
- `AUTH_SECRET` - NextAuth.js secret key
- `AUTH_RESEND_KEY` - Resend API key for email delivery
- `NEXTAUTH_URL` - Full URL of the site (https://resistproject.com)
- `EMAIL_FROM` - From address for magic link emails

**Deployment Method:**
- Dockerfile-based deployment
- Automatic builds on git push to main branch
- Build context: repository root
- Dockerfile path: `resist-project/Dockerfile`

### Startup Process

The application uses a custom startup script (`migrate-and-start.js`) that:
1. Checks DATABASE_URL is set
2. Runs Prisma migrations (`prisma migrate deploy`)
3. Starts the Next.js server (`npm start`)

This ensures database schema is up-to-date before the app starts.

---

## Project Structure

```
resist-project/
├── prisma/
│   ├── schema.prisma              # Database schema (NextAuth + custom models)
│   ├── migrations/                # Database migration files
│   └── (SQL scripts for triggers/functions)
├── src/
│   ├── app/                       # Next.js App Router pages
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── globals.css           # Global styles
│   │   ├── learn/                # Learn section pages
│   │   │   ├── page.tsx          # Learn index
│   │   │   └── [slug]/page.tsx   # Dynamic learn pages
│   │   ├── act/                  # Act section pages
│   │   │   ├── page.tsx          # Act index
│   │   │   └── [slug]/page.tsx   # Dynamic act pages
│   │   ├── auth/                 # Authentication pages
│   │   │   ├── signin/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── SignInForm.tsx
│   │   │   │   └── actions.ts
│   │   │   ├── verify-request/page.tsx  # "Check your email" page
│   │   │   ├── verify/page.tsx          # Token verification
│   │   │   └── error/page.tsx           # Auth error page
│   │   ├── about/page.tsx        # About page
│   │   ├── test/page.tsx         # Test/development page
│   │   └── api/
│   │       └── auth/[...nextauth]/route.ts  # NextAuth API routes
│   ├── components/
│   │   ├── layout/               # Header, Footer, etc.
│   │   ├── content/              # Content display components
│   │   └── mdx-components.tsx    # MDX component mappings
│   ├── lib/
│   │   ├── auth.ts              # NextAuth configuration
│   │   ├── db.ts                # Prisma client instance
│   │   ├── content.ts           # Content loading utilities
│   │   ├── mdx.ts               # MDX processing
│   │   └── utils.ts             # General utilities
│   ├── types/
│   │   └── content.ts           # TypeScript type definitions
│   └── middleware.ts            # Next.js middleware (auth, redirects)
├── content/
│   ├── home.mdx                 # Homepage content
│   ├── learn/                   # Learn section MDX files
│   │   ├── birthright-citizenship.mdx
│   │   ├── casa-decision.mdx
│   │   ├── digital-rights.mdx
│   │   ├── federal-law-enforcement.mdx
│   │   ├── obbba-medicaid.mdx
│   │   ├── schedule-f.mdx
│   │   ├── trump-accounts.mdx
│   │   └── vaccine-schedule.mdx
│   └── act/                     # Act section MDX files
│       ├── contact-congress.mdx
│       ├── dhs-funding.mdx
│       ├── immigration.mdx
│       ├── join-litigation.mdx
│       ├── medicaid-enrollment.mdx
│       ├── pharmacy-access.mdx
│       ├── school-boards.mdx
│       └── whistleblower.mdx
├── public/                      # Static assets
├── Dockerfile                   # Production Docker image
├── migrate-and-start.js        # Startup script (migrations + server)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.mjs
└── railway.toml                # Railway deployment config
```

---

## Content Structure

### Learn Pages (Information)
Located in `content/learn/` - informational content about government actions and policies.

**Standard structure:**
- **Quick Summary:** TL;DR of the issue
- **Facts Section:** Timeline, primary sources, direct quotes
- **Analysis Section:** Context, interpretation, who's affected
- **Related Actions:** Links to relevant Act pages

**Frontmatter (YAML):**
```yaml
---
title: "Page Title"
description: "Brief description for SEO"
category: "learn"
tags: ["tag1", "tag2"]
---
```

### Act Pages (Action Opportunities)
Located in `content/act/` - concrete actions citizens can take.

**Standard structure:**
- **Quick Actions:** <5 minutes, one-click when possible
- **Sustained Actions:** Ongoing, >5 minutes
- **Resources:** Downloadable materials
- **Related Learning:** Links to relevant Learn pages

---

## Database Schema

### NextAuth Models (Required)
- `User` - User accounts
- `Account` - OAuth accounts (if using providers)
- `Session` - User sessions
- `VerificationToken` - Email verification tokens

### Custom Models (Planned/Partial)
- `UserExtended` - Additional user data (reputation, stats)
- `PageMetadata` - Content scoring and trending
- `EditProposal` - Collaborative editing proposals
- `Vote` - Voting on edit proposals
- `AuditLog` - Action tracking
- `PageEvent` - Analytics events
- `PageMetricsDaily` - Aggregated metrics
- `PinnedPage` - Featured/pinned content

**Note:** Full collaborative editing not yet implemented. Basic auth and content display are working.

---

## Authentication Flow

**Email-based (Passwordless):**
1. User enters email on `/auth/signin`
2. Magic link sent via Resend
3. User clicks link → redirected to `/auth/verify?token=...`
4. Token validated → session created → redirected to homepage
5. User is now signed in

**Protected Routes:**
- Currently: Most routes are public
- Planned: Editing, voting, and admin features require authentication

**Session Management:**
- Sessions stored in PostgreSQL
- Cookie-based session tokens
- Auto-expires after period of inactivity

---

## Development Workflow

### Local Development

**Prerequisites:**
- Node.js 20+
- PostgreSQL database (local or cloud)
- `.env` file with DATABASE_URL and auth keys

**Commands:**
```bash
# Install dependencies
npm install

# Run Prisma migrations
npx prisma migrate dev

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Environment Variables (.env):**
```
DATABASE_URL="postgresql://user:pass@localhost:5432/dbname"
AUTH_SECRET="generate-with-openssl-rand-base64-32"
AUTH_RESEND_KEY="re_..."
NEXTAUTH_URL="http://localhost:3000"
EMAIL_FROM="noreply@resistproject.com"
```

### Git Workflow

**Important:** Always ensure source files are tracked before pushing:
```bash
# Check for untracked files
git status

# Add necessary files
git add resist-project/src/

# Commit and push
git commit -m "Description"
git push origin main
```

**Common Issue:** Untracked files in `resist-project/src/` won't be included in Railway builds. Always verify files are committed before expecting them in deployment.

---

## Known Issues & Next Steps

### ✅ Completed (2026-02-04)

1. **Authentication UI** - COMPLETE
   - [x] Add user profile/account page
   - [x] Add sign-out button in header
   - [x] Show user email when signed in
   - [x] User menu dropdown with avatar
   - [x] Protected route redirects
   - [x] Settings page
   - [x] Tier and reputation display

   See `AUTH-UI-IMPLEMENTATION.md` for full documentation.

### Immediate Priorities (Next Session)

1. **Mobile Navigation**
   - [ ] Implement hamburger menu functionality
   - [ ] Add auth button to mobile menu
   - [ ] Test responsive design on mobile devices

2. **Edit Profile Functionality**
   - [ ] Server action to update display name
   - [ ] Server action to update email preferences
   - [ ] Form validation and error handling

3. **Frontend Padding/Layout Issues**
   - [ ] Add consistent left/right padding to all pages
   - [ ] Ensure mobile responsiveness (especially padding on small screens)
   - [ ] Test on actual mobile devices
   - [ ] Fix any layout issues on Learn/Act pages

4. **Content Pages Styling**
   - [ ] Improve typography and readability
   - [ ] Add proper spacing between sections
   - [ ] Style MDX components (callouts, cards, etc.)

### Future Enhancements

- **Collaborative Editing:**
  - Edit proposal submission UI
  - Review/voting interface
  - Diff visualization

- **Analytics:**
  - Page view tracking
  - Engagement metrics
  - Trending algorithm

- **Content Management:**
  - Admin dashboard for content
  - Batch content operations
  - Content preview

---

## Important Notes

### Database Credentials
- **2026-02-05:** Recreated PostgreSQL database due to credential corruption
- Always use the DATABASE_URL directly from the Postgres service Variables tab
- If authentication fails, check that DATABASE_URL matches actual Postgres credentials

### Deployment Process
- Railway automatically builds on push to main
- Build takes ~2-3 minutes
- Migrations run automatically on startup via `migrate-and-start.js`
- Check Railway logs if deployment fails

### Content Updates
- MDX files in `content/` directory are read at build time
- To update content: edit MDX files, commit, push → Railway rebuilds
- For dynamic content updates, need to implement database-backed content

### Security
- Never commit `.env` files
- Keep AUTH_SECRET and AUTH_RESEND_KEY secure
- Database credentials are in Railway environment only

---

## Helpful Commands

**Prisma:**
```bash
# Create new migration
npx prisma migrate dev --name description

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio

# Reset database (DESTRUCTIVE)
npx prisma migrate reset
```

**Git:**
```bash
# Check what files need to be committed
git status --short | grep "^??" | grep "resist-project/src/"

# Add all source files
git add resist-project/src/

# Check recent commits
git log --oneline -10
```

**Railway:**
```bash
# View recent logs (if Railway CLI installed)
railway logs

# Open Railway dashboard
# Go to: https://railway.app
```

---

## Contact & Resources

**GitHub Repository:** https://github.com/lknipko/resistproject
**Live Site:** https://resistproject.com
**Framework Docs:** https://nextjs.org/docs
**NextAuth Docs:** https://authjs.dev
**Prisma Docs:** https://www.prisma.io/docs
