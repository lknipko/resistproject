# Milestones 5 & 6 - Implementation Checklist

## Pre-flight Check ✈️

- [ ] Dev server starts: `npm run dev`
- [ ] All 17 pages load at http://localhost:3000
- [ ] Review `IMPLEMENTATION-STATUS.md` for context
- [ ] Review `PRISMA-SCHEMA-REQUIREMENTS.md` for database details

---

## Milestone 5: Database & Auth

### Step 1: Read Migration Files
- [ ] Read `migrations/001-page-metadata.sql`
- [ ] Read `migrations/002-user-extended.sql`
- [ ] Read `migrations/003-edit-proposals.sql`
- [ ] Read `migrations/004-votes.sql`
- [ ] Read `migrations/005-audit-log.sql`
- [ ] Read `migrations/006-page-events.sql`
- [ ] Read `migrations/007-pinned-pages.sql`
- [ ] Read `migrations/008-indexes.sql`

### Step 2: Install Dependencies
```bash
cd "C:\Users\lknip\Documents\civic-action-wiki\resist-project"
npm install prisma @prisma/client --save-dev
npm install @auth/prisma-adapter next-auth@5
```

- [ ] Dependencies installed

### Step 3: Create Prisma Schema
- [ ] Run: `npx prisma init`
- [ ] Edit `prisma/schema.prisma`:
  - [ ] Add NextAuth.js models (User, Account, Session, VerificationToken)
  - [ ] Add UserExtended model (links to User)
  - [ ] Add PageMetadata model
  - [ ] Add EditProposal model (with author/resolver relations)
  - [ ] Add Vote model (with unique constraint)
  - [ ] Add AuditLog model
  - [ ] Add PageEvent model
  - [ ] Add PinnedPage model
  - [ ] Add all indexes from 008-indexes.sql

**Reference:** `PRISMA-SCHEMA-REQUIREMENTS.md` has full details

### Step 4: Database Connection
- [ ] Get Railway PostgreSQL connection string
- [ ] Add to `.env`:
  ```
  DATABASE_URL="postgresql://..."
  NEXTAUTH_URL="http://localhost:3000"
  NEXTAUTH_SECRET="<generate-random-32-char-string>"
  EMAIL_SERVER="smtp://..."
  EMAIL_FROM="noreply@resistproject.com"
  ```

### Step 5: Run Migrations
```bash
npx prisma generate
npx prisma migrate dev --name init
```

- [ ] Prisma client generated
- [ ] Migrations applied to Railway database
- [ ] Verify tables in Railway dashboard

### Step 6: Create Database Client
- [ ] Create `src/lib/db.ts`:
  ```typescript
  import { PrismaClient } from '@prisma/client'

  const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
  }

  export const prisma = globalForPrisma.prisma ?? new PrismaClient()

  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
  ```

### Step 7: Configure NextAuth
- [ ] Create `src/lib/auth.ts`:
  ```typescript
  import NextAuth from "next-auth"
  import EmailProvider from "next-auth/providers/email"
  import { PrismaAdapter } from "@auth/prisma-adapter"
  import { prisma } from "./db"

  export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(prisma),
    providers: [
      EmailProvider({
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM,
      }),
    ],
    pages: {
      signIn: '/auth/signin',
    },
  })
  ```

- [ ] Create `src/app/api/auth/[...nextauth]/route.ts`:
  ```typescript
  import { handlers } from "@/lib/auth"
  export const { GET, POST } = handlers
  ```

### Step 8: Optional Sign-in UI
- [ ] Create `src/app/auth/signin/page.tsx` (basic email form)
- [ ] Test sign-in flow (not blocking for public content)

### Step 9: Add Middleware (Future Admin Protection)
- [ ] Create `src/middleware.ts`:
  ```typescript
  import { auth } from "@/lib/auth"

  export default auth((req) => {
    if (req.nextUrl.pathname.startsWith('/admin')) {
      if (!req.auth) {
        return Response.redirect(new URL('/auth/signin', req.url))
      }
    }
  })

  export const config = {
    matcher: ['/admin/:path*']
  }
  ```

### Milestone 5 Complete ✅
- [ ] Database schema deployed
- [ ] NextAuth configured
- [ ] All tables created in Railway PostgreSQL
- [ ] Dev server still works with database connection

---

## Milestone 6: Railway Cutover

### Step 1: Configure Next.js for Production

- [ ] Update `next.config.mjs`:
  ```javascript
  /** @type {import('next').NextConfig} */
  const nextConfig = {
    output: 'standalone',
    async redirects() {
      return [
        {
          source: '/home',
          destination: '/',
          permanent: true,
        },
      ]
    },
  }

  export default nextConfig
  ```

### Step 2: Create Dockerfile

- [ ] Create `Dockerfile` in project root (see IMPLEMENTATION-STATUS.md for full content)
- [ ] Key sections:
  - Multi-stage build (deps, builder, runner)
  - Prisma generate in builder stage
  - Standalone output copying
  - Node 20 Alpine base

### Step 3: Create .dockerignore

- [ ] Create `.dockerignore`:
  ```
  node_modules
  .next
  .git
  *.md
  .env.local
  ```

### Step 4: Test Production Build Locally

```bash
npm run build
npm start
```

- [ ] Build succeeds
- [ ] All 17 pages generate statically
- [ ] Test at http://localhost:3000

### Step 5: Configure Railway

- [ ] Push to GitHub (main branch)
- [ ] In Railway dashboard:
  - [ ] Select "Deploy from GitHub repo"
  - [ ] Connect `resistproject` repo
  - [ ] Set environment variables:
    - `DATABASE_URL` (from Railway PostgreSQL)
    - `NEXTAUTH_URL=https://resistproject.com`
    - `NEXTAUTH_SECRET=<production-secret>`
    - `EMAIL_SERVER`
    - `EMAIL_FROM`
  - [ ] Build command: `npm run build`
  - [ ] Start command: `node server.js`

### Step 6: Deploy & Verify

- [ ] Trigger Railway deployment
- [ ] Wait for build to complete
- [ ] Check deployment logs for errors
- [ ] Visit https://resistproject-production.up.railway.app
- [ ] Visit https://resistproject.com (custom domain)
- [ ] Test all pages:
  - [ ] Home page loads
  - [ ] 8 LEARN pages load
  - [ ] 8 ACT pages load
  - [ ] Navigation works
  - [ ] Styling correct (teal/orange colors)

### Step 7: DNS/SSL Verification

- [ ] Verify SSL certificate auto-renewed
- [ ] Check Cloudflare DNS still pointing to Railway
- [ ] Test HTTP → HTTPS redirect
- [ ] Test `/home` → `/` redirect

### Step 8: Update Documentation

- [ ] Update `CLAUDE.md`:
  - Remove Wiki.js deployment instructions
  - Add new Git-based workflow
  - Update development commands
  - Document content editing process

- [ ] Content should include:
  ```markdown
  ## Development Workflow

  1. Edit content: Modify `.mdx` files in `content/` directory
  2. Test locally: `npm run dev` at http://localhost:3000
  3. Deploy: Push to GitHub main branch
  4. Verify: Check https://resistproject.com

  No manual deployment scripts needed.
  ```

### Step 9: Clean Up Old Files

- [ ] Delete `scripts/sync-to-production.js`
- [ ] Delete `scripts/create-page.js`
- [ ] Delete `scripts/update-page.js`
- [ ] Delete `scripts/batch-publish.js`
- [ ] Delete `scripts/push-to-production.js`
- [ ] Keep `scripts/` folder if other scripts exist
- [ ] Commit cleanup: `git commit -m "Remove retired Wiki.js deployment scripts"`

### Step 10: Final Verification

- [ ] All 17 pages accessible on resistproject.com
- [ ] Titles and headers display correctly
- [ ] Images load (if any)
- [ ] Links work (internal and external)
- [ ] Mobile responsive design works
- [ ] Colors match design (teal/orange)
- [ ] Typography consistent (sans-serif)
- [ ] Page load speed acceptable

### Milestone 6 Complete ✅
- [ ] Production deployment live
- [ ] Old Wiki.js decommissioned
- [ ] Documentation updated
- [ ] Scripts cleaned up
- [ ] Site fully operational at resistproject.com

---

## Post-Deployment Tasks (Optional/Future)

- [ ] Set up GitHub Actions for automated testing
- [ ] Configure Railway environment for staging
- [ ] Add sitemap.xml generation
- [ ] Add robots.txt
- [ ] Set up error monitoring (Sentry)
- [ ] Add analytics (privacy-respecting)
- [ ] Create backup automation for content files
- [ ] Document content contributor workflow

---

## Rollback Plan (If Issues Arise)

**If production deployment fails:**

1. Railway keeps old deployment running
2. In Railway dashboard: "Rollback to Previous Deployment"
3. Fix issues locally
4. Redeploy when ready

**Database rollback:**
- Railway PostgreSQL keeps automatic backups (7 days)
- Can restore via Railway dashboard if needed

---

## Success Criteria

✅ All 17 pages live on resistproject.com
✅ Database schema deployed with all 8 tables
✅ NextAuth.js configured for future admin features
✅ Git-based deployment workflow functional
✅ Old Wiki.js scripts removed
✅ Documentation updated
✅ Zero downtime during cutover

---

**Total Estimated Time:** 3-5 hours for both milestones

**Priority:** Milestone 5 first (can be tested locally), then Milestone 6 (production cutover)
