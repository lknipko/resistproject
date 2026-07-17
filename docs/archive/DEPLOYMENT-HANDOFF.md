# Deployment Handoff - Resist Project

**Date:** January 28, 2026
**Status:** ✅ DEPLOYED & LIVE
**Production URL:** https://resistproject.com
**Railway URL:** https://resistproject-production.up.railway.app

---

## 🎉 What We Accomplished

### Successfully Deployed Next.js App to Production

**Platform Stack:**
- **Framework:** Next.js 14 (App Router) with TypeScript
- **Styling:** Tailwind CSS with custom teal (LEARN) and orange (ACT) theming
- **Database:** PostgreSQL on Railway (configured but not yet used)
- **Hosting:** Railway.app with Cloudflare DNS
- **Repository:** https://github.com/lknipko/resistproject (private)

### Content Migration & Component Architecture

**Converted 16 pages to new component-based structure:**

**LEARN Pages (8):**
1. ✅ Birthright Citizenship (EO 14160)
2. ✅ OBBBA & Medicaid Changes
3. ✅ Vaccine Schedule Changes
4. ✅ Schedule F Civil Service
5. ✅ Digital Rights & Supreme Court
6. ✅ Trump v. CASA (Universal Injunctions)
7. ✅ Trump Foreign Accounts
8. ✅ Federal Law Enforcement (Minneapolis)

**ACT Pages (8):**
1. ✅ Immigration Defense
2. ✅ Contact Congress
3. ✅ DHS Funding Oversight
4. ✅ Join Litigation
5. ✅ Medicaid Enrollment
6. ✅ Pharmacy Access
7. ✅ School Boards
8. ✅ Whistleblower Resources

### Key Features Implemented

**Design System:**
- ✅ Indented body text in FACTS sections (h3 subheadings stay left-aligned)
- ✅ Cross-linking: LEARN pages have "ACT NOW" boxes → ACT pages
- ✅ Cross-linking: ACT pages have "LEARN MORE" boxes → LEARN pages
- ✅ Responsive sidebar navigation on all pages
- ✅ Mobile-first design with proper breakpoints
- ✅ SourceLink components for citations
- ✅ Card grids, callouts, badges, stat boxes

**Content Components Created:**
- `PageHeader` - Page headers with type-based styling
- `PageContent` - Main content wrapper
- `TopSection` - Hero section with QuickSummary and action boxes
- `QuickSummary` - Highlighted summary with key stat
- `ActNowBox` / `ActNowBottom` - Orange CTA boxes on LEARN pages
- `LearnMoreBox` / `LearnMoreBottom` - Teal CTA boxes on ACT pages
- `FactsSection` - Teal section with indented content
- `AnalysisSection` - Orange-accented analysis section
- `ContentSidebar` - Sticky sidebar navigation
- `MainContentLayout` - Layout with sidebar support
- `SourceLink` - Citation links with external icon
- `Card`, `CardGrid`, `Callout`, `Badge`, `Button`, `StatBox`, `StatsGrid`

---

## 📁 Project Structure

```
civic-action-wiki/
├── resist-project/                    # Next.js application (DEPLOY THIS)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx              # Home page
│   │   │   ├── learn/[slug]/page.tsx # LEARN page template
│   │   │   ├── act/[slug]/page.tsx   # ACT page template
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/
│   │   │   ├── content/              # Content components (see above)
│   │   │   ├── layout/               # Header, Footer
│   │   │   └── mdx-components.tsx    # MDX component registry
│   │   └── lib/
│   │       ├── content.ts            # Content loading utilities
│   │       ├── mdx.ts                # MDX parsing
│   │       ├── auth.ts               # NextAuth config (NOT YET ACTIVE)
│   │       └── db.ts                 # Prisma client (NOT YET ACTIVE)
│   ├── content/                      # MDX content files
│   │   ├── learn/*.mdx              # LEARN pages
│   │   ├── act/*.mdx                # ACT pages
│   │   └── home.mdx                 # Homepage content
│   ├── prisma/
│   │   └── schema.prisma            # Database schema (ready, not deployed)
│   ├── public/                      # Static assets (created for build)
│   ├── Dockerfile                   # Production Docker image
│   ├── next.config.mjs              # Next.js config (standalone output)
│   └── package.json                 # Dependencies
├── railway.toml                      # Railway build config
├── .env.example                      # Example environment variables
└── [old Wiki.js files]              # Legacy - ignore these
```

---

## 🚀 Deployment Configuration

### Railway Setup

**Project:** `grateful-alignment`
**Service:** `resistproject`
**Environment:** `production`

**Build Settings:**
- **Builder:** Dockerfile
- **Dockerfile Path:** `resist-project/Dockerfile`
- **Root Directory:** (empty - builds from repo root)
- **Auto-deploy:** ✅ Enabled on push to `main` branch

**Environment Variables (Required):**
```bash
# Set in Railway dashboard
PORT=3000                              # CRITICAL: Must match domain port
DATABASE_URL=postgresql://...          # Auto-provided by Railway
NEXTAUTH_URL=https://resistproject.com # For future auth
NEXTAUTH_SECRET=cU5xKj8pN9qR2tV...     # Generated secret
EMAIL_FROM=noreply@resistproject.com   # For future emails
```

**Domain Configuration:**
- **Public:** `resistproject.com` (Port 3000) ✅
- **Public:** `resistproject-production.up.railway.app` (Port 3000) ✅
- **Private:** `resistproject.railway.internal`

**Database:**
- PostgreSQL 15 automatically provisioned
- Connection string in `DATABASE_URL`
- Schema defined in `prisma/schema.prisma`
- **NOT YET USED** (future: auth, comments, analytics)

---

## 🔧 Local Development

### Setup

```bash
cd resist-project
npm install
npm run dev
```

Access at: http://localhost:3000

### Environment Variables

Create `.env.local`:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/resistproject"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"
```

### Database (when needed)

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Open Prisma Studio
npx prisma studio
```

---

## 📝 Git Workflow

### Repository

- **GitHub:** https://github.com/lknipko/resistproject (private)
- **Main Branch:** `main` (auto-deploys to Railway)

### Making Changes

```bash
# 1. Make changes to files in resist-project/

# 2. Commit (Railway auto-deploys on push to main)
git add resist-project/
git commit -m "Description of changes

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# 3. Push to GitHub
git push origin main

# 4. Railway automatically detects and deploys
# Check status at: https://railway.app/project/109f1e03-273e-424d-a84f-b7217532a47f
```

### Authentication Issues (Git Push)

If push fails:
1. Ensure GitHub token has `repo` scope
2. Token: `github_pat_11BFBVEAI0...` (in your GitHub settings)
3. Remove cached credentials: `git credential-manager erase https://github.com`
4. Push again

---

## 🐛 Known Issues & Quirks

### Deployment

1. **Port Configuration Critical**
   - Railway domains MUST be set to Port 3000
   - Railway environment variable `PORT=3000` must be set
   - Mismatch causes 502 Bad Gateway errors

2. **Dockerfile Context**
   - Dockerfile is in `resist-project/Dockerfile`
   - But builds from repository root (due to railway.toml)
   - COPY commands use `resist-project/` prefix to handle this

3. **Public Directory**
   - Created with `.gitkeep` to prevent build failures
   - Dockerfile ensures it exists before build

4. **Railway Auto-Deploy**
   - Sometimes takes 1-2 minutes to detect GitHub pushes
   - Can manually trigger in Dashboard → Deployments → Redeploy

5. **Cloudflare Caching**
   - May cache 502 errors if deployment fails
   - Solution: Cloudflare Dashboard → Caching → Purge Everything

### Content

1. **Heading Styling in Cards**
   - Don't use `###` headings inside `<Card>` components
   - Use `**Bold text**` instead
   - Reason: Global h3 styles have `-ml-16` which breaks card layout

2. **FactsSection Indentation**
   - Achieved via `pl-8` on content wrapper + `-ml-8` on h3 elements
   - Don't add manual spaces in markdown - they get stripped

3. **MDX Component Registration**
   - New components must be added to `src/components/mdx-components.tsx`
   - Import the component AND add to `mdxComponents` export

---

## 🔐 Authentication Setup (NEXT STEPS)

### Current State

**NextAuth v5 is configured but DISABLED:**
- Auth routes exist in `src/app/api/auth/[...nextauth]/route.ts`
- Middleware is configured but not active
- Database schema includes User, Account, Session tables
- Email provider (Resend) configured

### To Enable Authentication

1. **Set up Resend for email authentication:**
   ```bash
   # Get API key from https://resend.com
   railway variables set RESEND_API_KEY="re_..."
   ```

2. **Run database migrations:**
   ```bash
   cd resist-project
   npx prisma migrate deploy
   ```

3. **Enable auth middleware:**
   - Edit `src/middleware.ts`
   - Uncomment authentication logic
   - Configure protected routes

4. **Test auth flow:**
   - Visit `/auth/signin`
   - Enter email
   - Check for magic link email
   - Click link → should create session

### Auth Implementation Notes

**Current Strategy:**
- Email-only authentication (passwordless)
- Magic links sent via Resend
- Sessions stored in PostgreSQL
- No OAuth providers yet (can add later)

**Protected Routes (when enabled):**
- `/admin/*` - Admin dashboard
- API routes for content management

**Public Routes (always):**
- `/` - Homepage
- `/learn/*` - All LEARN pages
- `/act/*` - All ACT pages

---

## 📊 Collaborative Editing Setup (FUTURE)

### Database Schema Ready

The Prisma schema includes tables for:
- `Page` - Content pages with versioning
- `PageRevision` - Full revision history
- `Comment` - Page comments/discussions
- `Vote` - Voting on comments
- `Tag` - Tagging system
- `PageView` - Analytics

### Implementation Approach

**Phase 1: Read-Only with Analytics**
1. Migrate existing MDX content to database
2. Track page views, trending content
3. Keep edit workflow via GitHub for now

**Phase 2: Authenticated Contributions**
1. Enable user authentication (NextAuth)
2. Add comment system on pages
3. Allow flagging/reporting content

**Phase 3: Collaborative Editing**
1. Build content editor (MDX WYSIWYG or Monaco)
2. Implement draft/review workflow
3. Version control with approval system
4. Moderator dashboard

### Suggested Tech Stack

**Editor:**
- [Tiptap](https://tiptap.dev/) for rich text editing
- Or [Monaco Editor](https://microsoft.github.io/monaco-editor/) for MDX

**Real-time (optional):**
- [Pusher](https://pusher.com/) for live updates
- Or [Ably](https://ably.com/) for collaborative editing

**Version Control:**
- Store full content in `PageRevision` table
- Track diffs using `diff-match-patch`
- Show revision history like Wikipedia

---

## 📋 Content Management

### Adding New Pages

**LEARN Page:**
1. Create `resist-project/content/learn/new-topic.mdx`
2. Use template from `templates/learn-page.md` or copy existing page
3. Follow component structure:
   - PageHeader, PageContent, TopSection
   - FactsSection with indented content
   - AnalysisSection
   - ActNowBottom linking to relevant ACT page
4. Commit and push - auto-deploys

**ACT Page:**
1. Create `resist-project/content/act/new-action.mdx`
2. Use template from `templates/act-page.md` or copy existing page
3. Include:
   - LearnMoreBox linking to relevant LEARN page
   - Quick Actions section
   - Sustained Actions section
4. Commit and push

### Content Guidelines

**FACTS Section:**
- Only verifiable, primary-sourced information
- Every claim needs a link via `<SourceLink>`
- Dates, quotes, and attributions required
- Keep objective - interpretation goes in ANALYSIS

**ANALYSIS Section:**
- Explain what facts mean
- Who's affected, why it matters
- Legal/policy context
- Can include expert opinions (attributed)

**Cross-Linking:**
- Every LEARN page should link to 1-3 related ACT pages
- Every ACT page should link to 1-2 related LEARN pages
- Use descriptive link text, not "click here"

---

## 🎨 Styling Guidelines

### Color System

```css
/* LEARN pages - Teal */
--teal: #0d9488
--teal-dark: #115e59
--teal-light: #f0fdfa

/* ACT pages - Orange */
--orange: #ea580c
--orange-dark: #c2410c

/* Neutral */
--gray-50 to --gray-900
```

### Component Variants

**Cards:**
- `variant="orange"` - Orange border/accent for ACT content
- `variant="teal"` - Teal border/accent for LEARN content
- No variant - Neutral gray border

**Badges:**
- `variant="high"` - Red background (ACT, urgent)
- `variant="urgent"` - Orange background
- No variant - Gray background

**Buttons:**
- `variant="primary"` - Orange background
- `variant="secondary"` - Gray outline
- `href` prop makes it a link

### Responsive Design

- Mobile-first approach (min-width breakpoints)
- Sidebar collapses on mobile
- Card grids stack on small screens
- Large text reduces size on mobile

---

## 🔍 Debugging

### Common Issues

**502 Bad Gateway:**
1. Check Railway logs: `railway logs`
2. Verify `PORT=3000` environment variable
3. Check domain is configured for Port 3000
4. Purge Cloudflare cache if needed

**Build Failures:**
1. Check GitHub Actions or Railway build logs
2. Common: Missing Prisma schema → Run `npx prisma generate`
3. Common: Missing public directory → Dockerfile now creates it

**Styles Not Applying:**
1. Check Tailwind class names are valid
2. Verify component is registered in `mdx-components.tsx`
3. Check for CSS conflicts (custom classes vs Tailwind)

**Content Not Showing:**
1. Verify MDX frontmatter is valid YAML
2. Check file is in correct directory (`content/learn/` or `content/act/`)
3. Ensure filename matches slug in URL
4. Check for MDX syntax errors

### Useful Commands

```bash
# Check Railway status
railway status

# View logs
railway logs

# Redeploy
railway redeploy

# Check environment variables
railway variables

# Local dev with debugging
npm run dev -- --turbo

# Build locally to test
npm run build
npm run start
```

---

## 📚 Important Files Reference

**Configuration:**
- `resist-project/next.config.mjs` - Next.js settings
- `resist-project/tailwind.config.ts` - Tailwind theme
- `resist-project/tsconfig.json` - TypeScript config
- `railway.toml` - Railway build settings
- `resist-project/prisma/schema.prisma` - Database schema

**Core Components:**
- `src/components/mdx-components.tsx` - MDX component registry
- `src/app/layout.tsx` - Root layout with Header/Footer
- `src/lib/content.ts` - Content loading logic
- `src/lib/mdx.ts` - MDX parsing with components

**Styling:**
- `src/app/globals.css` - Global styles, Tailwind imports
- `src/components/content/*.tsx` - All content components

**Content:**
- `content/learn/*.mdx` - LEARN pages
- `content/act/*.mdx` - ACT pages
- `content/home.mdx` - Homepage

---

## 🚦 Next Session Priorities

### 1. Authentication (Estimated: 2-4 hours)

**Tasks:**
- [ ] Activate Resend email service
- [ ] Run Prisma migrations to create auth tables
- [ ] Enable NextAuth middleware
- [ ] Test sign-in flow end-to-end
- [ ] Add user profile page
- [ ] Protect admin routes

**Files to Modify:**
- `src/middleware.ts` - Enable auth
- `src/app/admin/*` - Create admin pages
- `src/lib/auth.ts` - Verify configuration

### 2. Collaborative Editing Foundation (Estimated: 4-6 hours)

**Phase 1: Database Migration**
- [ ] Script to import all MDX files to database
- [ ] Keep MDX as source of truth initially
- [ ] Set up sync: MDX → Database on deploy

**Phase 2: Version Control**
- [ ] Create revision on every save
- [ ] Show revision history UI
- [ ] Implement diff view

**Phase 3: Comment System**
- [ ] Add comment UI to pages
- [ ] Implement threading
- [ ] Add moderation tools

---

## 📞 Helpful Resources

**Documentation:**
- Next.js: https://nextjs.org/docs
- Tailwind CSS: https://tailwindcss.com/docs
- Prisma: https://www.prisma.io/docs
- NextAuth: https://authjs.dev/
- Railway: https://docs.railway.app/

**Railway Project:**
- Dashboard: https://railway.app/project/109f1e03-273e-424d-a84f-b7217532a47f
- Deployments: Click project → resistproject service → Deployments tab

**GitHub:**
- Repository: https://github.com/lknipko/resistproject
- Settings: https://github.com/lknipko/resistproject/settings

---

## ✅ Success Criteria

**Current Status: PRODUCTION-READY** ✅

- [x] All 16 pages deployed and accessible
- [x] Cross-linking between LEARN and ACT pages
- [x] Responsive design works on mobile
- [x] Custom domain (resistproject.com) working
- [x] Auto-deploy from GitHub working
- [x] Component architecture in place
- [x] Styling system consistent

**Next Milestones:**

- [ ] User authentication live
- [ ] Database-backed content with versioning
- [ ] Comment system active
- [ ] Admin dashboard functional
- [ ] Collaborative editing workflow

---

## 🎯 Final Notes

**What Went Well:**
- Component-based architecture makes pages easy to maintain
- Railway deployment is straightforward once configured
- Tailwind + custom components give consistent design
- MDX provides flexibility for complex layouts

**Lessons Learned:**
- Docker build context matters - Dockerfile paths need to account for repository structure
- Railway port configuration must match app's listening port
- Git authentication on Windows can be tricky - use tokens in URL
- Cloudflare can cache errors - purge when troubleshooting

**For Next Developer:**
- The codebase is well-structured and documented
- All components are in `src/components/content/`
- Content is in `content/` directory
- Railway auto-deploys on push to main
- Database schema is ready but not active yet

**Good luck with authentication and collaborative editing!** 🚀

---

**Document Version:** 1.0
**Last Updated:** January 28, 2026
**Next Review:** After auth implementation
