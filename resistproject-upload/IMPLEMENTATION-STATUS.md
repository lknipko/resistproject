# Resist Project - Next.js Migration Implementation Status

**Date:** 2026-01-27
**Session Handoff Document**

## Project Overview

Migrating the Resist Project from Wiki.js to Next.js 15 custom application. Following the plan in `DEV-PLAN.md`.

## Current Status: Milestones 1-4 Complete ✅

### ✅ Milestone 1: Project Skeleton (COMPLETE)
- Next.js 15 with TypeScript, Tailwind CSS, App Router
- Project location: `C:\Users\lknip\Documents\civic-action-wiki\resist-project\`
- Tailwind configured with custom color tokens:
  - Teal: `#2d5a6b` (LEARN sections)
  - Orange: `#c65d24` (ACT sections)
- Layout components: Header, Footer, MobileNav
- Dev server running on: http://localhost:3000

### ✅ Milestone 2: Content Rendering Pipeline (COMPLETE)
- MDX compilation using `next-mdx-remote/rsc` (React Server Components)
- Content management system: `src/lib/content.ts` and `src/lib/mdx.ts`
- Gray-matter for frontmatter parsing
- Dynamic routes with `generateStaticParams`

### ✅ Milestone 3: Full Component Library (COMPLETE)
All 18 custom MDX components built and working:

**Core Components:**
- `PageHeader` - Teal/Orange header bars
- `TopSection` - Grid wrapper for summary + CTA
- `QuickSummary` - Gray box with optional highlight
- `ActNowBox` - Orange CTA box (top right)
- `ActNowBottom` - Full-width bottom CTA
- `FactsSection` - Teal-light background section
- `SourceLink` - Right-aligned source citations

**Content Components:**
- `CallScript` - Orange left border with "SCRIPT" label
- `DefinitionList` + `DefRow` - Term/description pairs
- `StatsGrid` + `StatBox` - Statistics display
- `CardGrid` + `Card` - Responsive card layouts
- `Badge` - Status badges (urgent, high, etc.)
- `Button` - Styled action buttons
- `Callout` - Warning/info callout boxes
- `PageMeta` - Tags and metadata footer
- `SectionIntro` - Italic intro paragraphs
- `RelatedActions` / `RelatedLinks` - Cross-linking sections

**Location:** `src/components/content/`

### ✅ Milestone 4: Content Migration (COMPLETE)
All 17 pages converted from HTML-in-markdown to clean MDX:

**Content Location:** `C:\Users\lknip\Documents\civic-action-wiki\resist-project\content\`

**LEARN Pages (8):**
- `learn/obbba-medicaid.mdx` ✅
- `learn/birthright-citizenship.mdx` ✅
- `learn/casa-decision.mdx` ✅
- `learn/digital-rights.mdx` ✅
- `learn/federal-law-enforcement.mdx` ✅
- `learn/schedule-f.mdx` ✅
- `learn/trump-accounts.mdx` ✅
- `learn/vaccine-schedule.mdx` ✅

**ACT Pages (8):**
- `act/dhs-funding.mdx` ✅
- `act/contact-congress.mdx` ✅
- `act/immigration.mdx` ✅
- `act/join-litigation.mdx` ✅
- `act/medicaid-enrollment.mdx` ✅
- `act/pharmacy-access.mdx` ✅
- `act/school-boards.mdx` ✅
- `act/whistleblower.mdx` ✅

**Home Page:**
- `home.mdx` ✅

**All pages verified loading at http://localhost:3000**

---

## 🚧 Remaining Work: Milestones 5-6

### Milestone 5: Database & Auth

**Goals:**
1. Create Prisma schema mapping 8 SQL migrations from `migrations/` folder
2. Set up fresh Railway PostgreSQL instance
3. Install and configure NextAuth.js v5 (Auth.js)
4. Build minimal sign-in page
5. Add middleware for future admin routes

**Database Schema Required (from DEV-PLAN.md):**

The Prisma schema must include all tables from these 8 migrations:

1. **001-page-metadata.sql** - PageMetadata table (scores, urgency, trending)
2. **002-user-extended.sql** - UserExtended table (reputation, tier, badges)
3. **003-edit-proposals.sql** - EditProposal table (collaborative editing)
4. **004-votes.sql** - Vote table (weighted voting on edits)
5. **005-audit-log.sql** - AuditLog table (action tracking)
6. **006-page-events.sql** - PageEvent table (analytics)
7. **007-pinned-pages.sql** - PinnedPage table (admin overrides)
8. **008-indexes.sql** - Database indexes for performance

**Key Files to Reference:**
- `migrations/` folder (source schemas)
- `DEV-PLAN.md` sections on database architecture

**Implementation Steps:**
1. Read all 8 SQL migration files
2. Create `prisma/schema.prisma` with equivalent Prisma models
3. Set up Railway PostgreSQL database
4. Run `npx prisma migrate deploy`
5. Install NextAuth dependencies: `npm install next-auth@5 @auth/prisma-adapter`
6. Create `src/lib/auth.ts` with NextAuth config
7. Create `src/app/api/auth/[...nextauth]/route.ts`
8. Build basic sign-in UI (optional for now - auth not blocking)

**Note:** Auth is NOT blocking for public content. All pages work without login. This sets foundation for future admin/contributor features.

### Milestone 6: Railway Cutover

**Goals:**
1. Final QA pass on all 17 pages
2. Update Railway service to build Next.js app
3. Verify DNS/SSL (no changes needed - same domain)
4. Add redirect: `/home` → `/` in `next.config.mjs`
5. Update `CLAUDE.md` with new workflow
6. Delete retired scripts

**Railway Configuration:**

Current Railway setup:
- Production URL: https://resistproject-production.up.railway.app
- Custom domain: resistproject.com
- PostgreSQL database already provisioned

**Dockerfile needed:**
```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

**next.config.mjs updates needed:**
```javascript
export default {
  output: 'standalone',
  redirects: async () => [
    {
      source: '/home',
      destination: '/',
      permanent: true,
    },
  ],
}
```

**Scripts to delete after cutover:**
- `scripts/sync-to-production.js`
- `scripts/create-page.js`
- `scripts/update-page.js`
- `scripts/batch-publish.js`
- `scripts/push-to-production.js`

**CLAUDE.md updates:**
Remove Wiki.js deployment instructions, add:
```markdown
## Development Workflow

1. **Edit content:** Modify `.mdx` files in `content/` directory
2. **Test locally:** `npm run dev` - view at http://localhost:3000
3. **Deploy:** Push to GitHub - Railway auto-deploys from main branch
4. **Verify:** Check https://resistproject.com

No manual deployment scripts needed - content deploys via Git push.
```

---

## Critical Files & Directories

### Project Structure
```
resist-project/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Home page (renders home.mdx)
│   │   ├── globals.css             # Tailwind + custom CSS
│   │   ├── learn/[slug]/page.tsx   # Dynamic LEARN routes
│   │   ├── act/[slug]/page.tsx     # Dynamic ACT routes
│   │   └── api/auth/[...nextauth]/ # NextAuth routes (TO BUILD)
│   ├── components/
│   │   ├── layout/                 # Header, Footer, MobileNav
│   │   ├── content/                # 18 MDX components
│   │   └── mdx-components.tsx      # MDX component registry
│   ├── lib/
│   │   ├── content.ts              # Content file system loader
│   │   ├── mdx.ts                  # MDX compilation
│   │   ├── db.ts                   # Prisma client (TO BUILD)
│   │   └── auth.ts                 # NextAuth config (TO BUILD)
│   └── types/
│       └── content.ts              # TypeScript types
├── content/                        # All MDX content files
│   ├── home.mdx
│   ├── learn/*.mdx                 # 8 LEARN pages
│   └── act/*.mdx                   # 8 ACT pages
├── prisma/
│   └── schema.prisma               # TO CREATE
├── migrations/                     # 8 SQL files (source for Prisma)
├── Dockerfile                      # TO CREATE
├── docker-compose.yml              # Local PostgreSQL only
├── next.config.mjs                 # Needs redirect + output config
├── tailwind.config.ts              # Custom color tokens
└── package.json
```

### Key Configuration

**tailwind.config.ts - Custom Colors:**
```typescript
colors: {
  teal: {
    DEFAULT: '#2d5a6b',
    dark: '#1e3d4a',
    light: '#e8f4f8',
  },
  orange: {
    DEFAULT: '#c65d24',
    dark: '#a84d1d',
    light: '#fef3e7',
  },
}
```

**MDX Component Styling Conventions:**
- H2 sections: Teal for LEARN, Orange for ACT Analysis sections
- H2/H3 use negative margin outdent: `-ml-8 pl-8`
- Blockquotes: Teal background with white text + decorative quotes
- Tables: Clean borders, gray header row
- Links: Teal with hover underline

---

## Design Reference

**PDF mockup location:** `C:\Users\lknip\Documents\civic-action-wiki\Proposed Layout RP.pdf`

**Key visual elements from PDF:**
- Teal header bar spanning full width (LEARN label)
- Centered title + subtitle below header
- Two-column top: Quick Summary (gray, ~65%) + ACT NOW box (orange, ~35%)
- Sticky Contents sidebar (right side, hierarchical)
- FACTS section: teal "FACTS" h2, italic intro, horizontal rule
- Blockquotes: teal bg, white italic text, quote marks
- Timeline tables: clean borders
- Analysis: orange "Analysis" h2
- Who Is Affected: definition list with teal right-aligned terms
- ACT NOW bottom: centered orange box, clickable

---

## Dependencies Already Installed

```json
{
  "dependencies": {
    "next": "15.5.10",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "next-mdx-remote": "^5.0.0",
    "gray-matter": "^4.0.3",
    "remark-gfm": "^4.0.0",
    "rehype-slug": "^6.0.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.5"
  },
  "devDependencies": {
    "@types/node": "^22",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.17",
    "typescript": "^5"
  }
}
```

**Still need to install for Milestone 5:**
- `next-auth@5`
- `@auth/prisma-adapter`
- `@prisma/client`
- `prisma` (dev dependency)

---

## Testing & Verification

**Dev server:** Running at http://localhost:3000

**All pages confirmed loading:**
- Home: ✅
- 8 LEARN pages: ✅
- 8 ACT pages: ✅

**Build command:** `npm run build` - last build successful with 17 static pages

**Common issues encountered:**
- Node.js zombie processes locking `.next/` - fixed by killing all node processes
- MDX frontmatter access - don't use `{frontmatter.x}` directly in MDX, pass as props
- Port conflicts - multiple dev servers running on 3000-3007

---

## Railway Deployment Context

**Current production (Wiki.js):**
- Running on Railway
- Connected to PostgreSQL
- Domain: resistproject.com via Cloudflare DNS
- Auto-deploys from GitHub

**After cutover:**
- Same Railway project
- Same PostgreSQL (new schema via Prisma migrations)
- Same domain (no DNS changes)
- Next.js replaces Wiki.js Docker image
- Standalone Next.js build for Docker

---

## Important Notes

1. **All component files exist and work** - no need to rebuild them
2. **All content is converted** - 17 MDX files ready to deploy
3. **Design matches PDF mockup** - verified visually
4. **Auth is optional** - public content works without login
5. **Database schema must match DEV-PLAN.md** - includes all 8 migrations for future features
6. **Content deploys via Git** - no manual scripts after cutover

---

## Next Session Goals

**Milestone 5 (Database & Auth):**
1. Read 8 SQL migration files from `migrations/`
2. Create equivalent `prisma/schema.prisma`
3. Set up Railway PostgreSQL connection
4. Run migrations
5. Install + configure NextAuth.js v5
6. Optional: Build basic sign-in UI

**Milestone 6 (Cutover):**
1. Add Dockerfile for standalone Next.js
2. Update `next.config.mjs` with output + redirects
3. Configure Railway to build from Next.js
4. Deploy and verify at resistproject.com
5. Update CLAUDE.md documentation
6. Clean up retired scripts

**Estimated time:** Milestone 5 = 2-3 hours, Milestone 6 = 1-2 hours

---

## Quick Start Commands for Next Session

```bash
# Navigate to project
cd "C:\Users\lknip\Documents\civic-action-wiki\resist-project"

# Start dev server (verify everything still works)
npm run dev

# Install Prisma dependencies (Milestone 5)
npm install prisma @prisma/client --save-dev
npm install @auth/prisma-adapter next-auth@5

# Initialize Prisma
npx prisma init

# After creating schema.prisma, generate client
npx prisma generate

# Push to Railway database
npx prisma migrate deploy
```

---

## Reference Documents

- **Migration Plan:** `C:\Users\lknip\Documents\civic-action-wiki\DEV-PLAN.md`
- **Project Instructions:** `C:\Users\lknip\Documents\civic-action-wiki\CLAUDE.md`
- **Design Mockup:** `C:\Users\lknip\Documents\civic-action-wiki\Proposed Layout RP.pdf`
- **SQL Migrations:** `C:\Users\lknip\Documents\civic-action-wiki\migrations/001-008`

---

**Status:** Ready for Milestone 5 implementation. All prerequisites complete. ✅
