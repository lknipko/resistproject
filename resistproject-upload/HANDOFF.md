# Development Handoff Document
**Date:** January 27, 2026
**Status:** Milestone 5 Complete, Ready for Styling Rollout & Deployment

---

## What's Been Completed

### ✅ Milestone 5: Database & Authentication

#### Database Setup
- **PostgreSQL on Railway**: Fresh database provisioned (separate from old Wiki.js DB)
- **Connection String**: Stored in `.env` (DATABASE_URL)
- **Prisma Schema**: Complete with 12 models
  - NextAuth models: User, Account, Session, VerificationToken
  - Custom models: UserExtended, PageMetadata, EditProposal, Vote, AuditLog, PageEvent, PageMetricsDaily, PinnedPage
- **Triggers & Functions**: All 20+ PostgreSQL triggers, functions, and views applied via `prisma/triggers-and-functions.sql`

#### Authentication Foundation
- **NextAuth v5 (beta)** installed and configured
- **Resend email provider** configured (API key in `.env`)
- **Auth routes**: `/api/auth/[...nextauth]`, `/auth/signin`, `/auth/verify`
- **Middleware**: Admin route protection placeholder
- **Status**: Auth is set up but providers array is currently empty (email auth temporarily disabled to avoid compilation issues)

#### Key Files Created
```
prisma/
├── schema.prisma              # Complete database schema
├── triggers-and-functions.sql # PostgreSQL advanced features
└── migrations/                # Generated migration history

src/
├── lib/
│   ├── db.ts                 # Prisma client singleton
│   └── auth.ts               # NextAuth configuration
├── middleware.ts             # Route protection
└── app/api/auth/[...nextauth]/route.ts
```

### ✅ Page Layout & Styling (Birthright Citizenship Example)

#### Component Architecture
Successfully implemented the mockup design (`Proposed Layout RP.pdf`) with proper:

**Page Structure:**
```
<PageHeader type="learn" />        // Teal banner, no gap with main header
<PageContent>                       // Max-width 1200px, pl-16 pr-8
  <h1>Title</h1>

  <TopSection>                      // 2:1 grid (QuickSummary:ActNowBox)
    <QuickSummary />
    <ActNowBox />
  </TopSection>

  <MainContentLayout sidebar={<ContentSidebar />}>
    <FactsSection>                  // Light teal background
      {content}
    </FactsSection>

    <AnalysisSection>               // Orange theme
      {content}
    </AnalysisSection>
  </MainContentLayout>

  <ActNowBottom />
</PageContent>
```

#### Styling Patterns Established

**Section Headers:**
- FACTS: `text-3xl font-bold text-teal-dark uppercase` (inside teal box)
- ANALYSIS: `text-3xl font-bold text-orange uppercase`
- Subtitles: `text-sm italic text-gray-600` aligned with section header

**Subheadings (h3):**
- FACTS section: `border-t-2 border-teal` (teal divider lines)
- ANALYSIS section: `border-t-2 border-orange` (orange divider lines)
- Both: `text-xl font-bold text-gray-900 mt-8 mb-4 pt-4`

**Outdenting/Indenting:**
- Page content has `pl-16` (left padding)
- h2 section headers: `-ml-16` (outdented to align with teal box edge)
- h3 subheadings: `-ml-16` (outdented)
- h3 in FactsSection: Additional `-ml-8` via component to align with parent padding

**Contents Sidebar:**
- Sticky: `top-24`
- Width: `250px`
- Border: `border-2 border-gray-300`
- Nested lists: Main items not indented, sub-items `ml-6`
- Color-coded links: Teal for FACTS, Orange for ANALYSIS

**Color Coding:**
- LEARN pages: Teal theme (`#2d5a6b`)
- ACT pages: Orange theme (`#c65d24`)
- FACTS section: Light teal background (`#e8f4f8`)
- Section dividers match their section color

#### Component Reference

| Component | File | Purpose |
|-----------|------|---------|
| PageHeader | `src/components/content/PageHeader.tsx` | LEARN/ACT banner |
| PageContent | `src/components/content/PageContent.tsx` | Main content wrapper with padding |
| TopSection | `src/components/content/TopSection.tsx` | Summary + Act Now grid (2:1) |
| QuickSummary | `src/components/content/QuickSummary.tsx` | Gray box with summary |
| ActNowBox | `src/components/content/ActNowBox.tsx` | Orange CTA box |
| MainContentLayout | `src/components/content/MainContentLayout.tsx` | Content + sidebar grid |
| ContentSidebar | `src/components/content/ContentSidebar.tsx` | Sticky table of contents |
| FactsSection | `src/components/content/FactsSection.tsx` | Teal background section |
| AnalysisSection | `src/components/content/AnalysisSection.tsx` | Orange-themed section |
| SourceLink | `src/components/content/SourceLink.tsx` | Auto-formats source citations |

---

## Next Steps

### 1. Apply Styling to Remaining LEARN Pages

**Files to update (in `content/learn/`):**
- `obbba-medicaid.mdx` ✅ (template page)
- `vaccine-schedule.mdx`
- `schedule-f.mdx`
- `digital-rights.mdx`
- `casa-decision.mdx`
- `trump-accounts.mdx`
- `federal-law-enforcement.mdx`

**Template Pattern:**
Use `birthright-citizenship.mdx` as the reference. Each page should have:

```mdx
---
title: "Page Title"
type: "learn"
tags: ["Tag1", "Tag2"]
description: "..."
---

<PageHeader type="learn" />

<PageContent>

# Page Title

<TopSection>
  <QuickSummary highlight="Key stat or finding">
    Brief overview paragraph 1.

    Brief overview paragraph 2.
  </QuickSummary>

  <ActNowBox href="/act/relevant-action">
    Call to action text
  </ActNowBox>
</TopSection>

<MainContentLayout
  sidebar={
    <ContentSidebar>
      <ul className="space-y-3">
        <li className="font-semibold"><a href="#facts" className="text-teal hover:underline">FACTS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#section-1" className="text-teal hover:underline">Section Name</a></li>
            ...
          </ul>
        </li>
        <li className="font-semibold"><a href="#analysis" className="text-orange hover:underline">ANALYSIS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#section-2" className="text-orange hover:underline">Section Name</a></li>
            ...
          </ul>
        </li>
      </ul>
    </ContentSidebar>
  }
>

<FactsSection>

### First Subsection

Content...

### Second Subsection

Content...

</FactsSection>

<AnalysisSection>

### What This Means

Content...

### Who Is Affected

Content...

</AnalysisSection>

## Related Actions

- [Action 1](/act/link)
- [Action 2](/act/link)

<ActNowBottom href="/act/relevant-action">
  Call to action
</ActNowBottom>

</MainContentLayout>

</PageContent>
```

**Notes:**
- Replace `QuickSummary` content with page-specific summary
- Update `ContentSidebar` links to match actual h3 IDs in the page
- Link to relevant ACT pages in both `ActNowBox` and `ActNowBottom`
- Use `<SourceLink>` for citations (auto-formats domain names)

### 2. Apply Styling to ACT Pages

**Files to update (in `content/act/`):**
- `contact-congress.mdx`
- `immigration.mdx`
- `join-litigation.mdx`
- `dhs-funding.mdx`
- `medicaid-enrollment.mdx`
- `pharmacy-access.mdx`
- `school-boards.mdx`
- `whistleblower.mdx`

**ACT Page Pattern:**
```mdx
---
title: "Action Title"
type: "act"
tags: ["Category"]
description: "..."
---

<PageHeader type="act" />

<PageContent>

# Action Title

<TopSection>
  <QuickSummary highlight="Impact statement">
    What this action does...
  </QuickSummary>

  <div className="bg-orange text-white p-6 text-center">
    <h3 className="text-lg font-bold mb-2 uppercase">Time Required</h3>
    <p className="text-3xl font-bold">5 minutes</p>
  </div>
</TopSection>

<MainContentLayout
  sidebar={
    <ContentSidebar>
      <ul className="space-y-3">
        <li className="font-semibold"><a href="#quick-actions" className="text-orange hover:underline">QUICK ACTIONS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#call" className="text-orange hover:underline">Call</a></li>
            <li><a href="#email" className="text-orange hover:underline">Email</a></li>
          </ul>
        </li>
        <li className="font-semibold"><a href="#resources" className="text-orange hover:underline">RESOURCES</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#organizations" className="text-orange hover:underline">Organizations</a></li>
          </ul>
        </li>
      </ul>
    </ContentSidebar>
  }
>

{/* Content sections with orange theme */}

</MainContentLayout>

</PageContent>
```

**Key Differences from LEARN:**
- Use `type="act"` (orange theme)
- Focus on actionable steps, not just information
- Include call scripts, email templates, organization links
- Time estimates for actions

### 3. Create Landing Pages

**Create: `content/learn.mdx`**
```mdx
---
title: "LEARN: Understand What's Happening"
type: "learn"
---

<PageHeader type="learn" />

<PageContent>

# LEARN: Understand What's Happening

Browse fact-based information about government actions, verified with primary sources.

<CardGrid>
  <Card href="/learn/birthright-citizenship" title="Birthright Citizenship" tags={["Immigration", "14th Amendment"]}>
    Executive Order 14160 restricts citizenship recognition...
  </Card>
  <Card href="/learn/obbba-medicaid" title="OBBBA: Medicaid Changes" tags={["Healthcare", "Medicaid"]}>
    How the One Big Beautiful Bill Act affects healthcare...
  </Card>
  {/* Add all 8 LEARN pages */}
</CardGrid>

</PageContent>
```

**Create: `content/act.mdx`**
```mdx
---
title: "ACT: Take Action Now"
type: "act"
---

<PageHeader type="act" />

<PageContent>

# ACT: Take Action Now

Every issue needs a response. Here are concrete, effective actions you can take.

<CardGrid>
  <Card href="/act/contact-congress" title="Contact Congress" tags={["Quick", "5 min"]}>
    Call scripts and email templates for your representatives
  </Card>
  <Card href="/act/immigration" title="Defend Immigrant Rights" tags={["Know Your Rights"]}>
    Resources and legal defense organizations
  </Card>
  {/* Add all 8 ACT pages */}
</CardGrid>

</PageContent>
```

**Note:** `Card` and `CardGrid` components already exist in `src/components/content/`

### 4. Deploy to Railway

#### Pre-Deployment Checklist

1. **Environment Variables in Railway:**
   ```env
   DATABASE_URL=<from Railway PostgreSQL service - internal URL>
   NEXTAUTH_URL=https://resistproject.com
   NEXTAUTH_SECRET=<generate new for production: openssl rand -base64 32>
   RESEND_API_KEY=re_MBtATmSk_FHzVGbUUthPr79ANbmf9Z3cc
   EMAIL_FROM=noreply@resistproject.com
   ```

2. **Verify `.env` is in `.gitignore`** ✅

3. **Test local production build:**
   ```bash
   npm run build
   npm start
   ```
   Should see: `✓ Compiled successfully` with 17+ static pages

4. **Update `.dockerignore`** ✅ (already created)

#### Deployment Steps

**Option A: GitHub Auto-Deploy (Recommended)**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Complete Milestone 5: Database, auth, and styling foundation"
   git push origin main
   ```

2. **Connect Railway to GitHub:**
   - Railway dashboard → resistproject → Settings
   - Connect to GitHub repository
   - Select branch: `main`
   - Auto-deploy on push: ✅ Enabled

3. **First Deploy:**
   - Railway detects Dockerfile (if exists) or uses Next.js buildpack
   - Build takes ~3-5 minutes
   - Monitor logs in Railway dashboard

4. **Apply Database Triggers (One-Time):**
   - After first successful deploy
   - Railway → PostgreSQL → Data → Query
   - Copy/paste `prisma/triggers-and-functions.sql`
   - Execute

5. **Verify Domain:**
   - Railway URL: `https://resistproject-production.up.railway.app`
   - Custom domain: `https://resistproject.com`
   - Check Cloudflare DNS settings pointing to Railway

**Option B: Railway CLI Deploy**

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link to project
railway link

# Deploy
railway up

# Apply migrations
railway run npx prisma migrate deploy
```

#### Post-Deployment

1. **Test all pages:**
   - Home: https://resistproject.com
   - LEARN pages: https://resistproject.com/learn/birthright-citizenship
   - ACT pages: https://resistproject.com/act/immigration
   - Landing pages: /learn, /act

2. **Verify database connection:**
   - Check Railway logs for Prisma client errors
   - Test that pages load (means DB connection works)

3. **SSL Certificate:**
   - Railway auto-provisions for custom domains
   - Verify HTTPS works

4. **Update Documentation:**
   - Mark Milestones 5 & 6 complete in `MILESTONE-5-6-CHECKLIST.md`

---

## Known Issues & Notes

### Temporary: Email Auth Disabled
- NextAuth providers array is currently empty to avoid build issues
- To re-enable Resend email auth, update `src/lib/auth.ts`:
  ```typescript
  import Resend from "next-auth/providers/resend"

  providers: [
    Resend({
      from: process.env.EMAIL_FROM || "noreply@resistproject.com",
    }),
  ],
  ```

### Styling Not Yet Applied
- Only `birthright-citizenship.mdx` has the full mockup styling
- Other 15 pages still have old/minimal formatting
- Use template pattern above to update them

### Missing Features (Future)
- LEARN and ACT landing pages don't exist yet (create per instructions above)
- Search functionality
- Tag filtering
- User authentication (sign-in works but not required for content)
- Admin dashboard

---

## File Structure Reference

```
resist-project/
├── content/                    # MDX content files
│   ├── home.mdx               # Homepage
│   ├── learn/                 # LEARN section (8 pages)
│   │   └── birthright-citizenship.mdx  ✅ Fully styled
│   └── act/                   # ACT section (8 pages)
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── layout.tsx        # Root layout with Header/Footer
│   │   ├── page.tsx          # Homepage (renders home.mdx)
│   │   ├── learn/[slug]/page.tsx
│   │   ├── act/[slug]/page.tsx
│   │   └── api/auth/[...nextauth]/
│   │
│   ├── components/
│   │   ├── layout/           # Header, Footer
│   │   ├── content/          # Page components (see table above)
│   │   └── mdx-components.tsx # MDX component mapping
│   │
│   └── lib/
│       ├── auth.ts           # NextAuth config
│       ├── db.ts             # Prisma client
│       ├── content.ts        # MDX file reading
│       └── mdx.ts            # MDX compilation
│
├── prisma/
│   ├── schema.prisma         # Database schema
│   ├── triggers-and-functions.sql
│   └── migrations/
│
├── .env                      # Local environment (NOT in git)
├── next.config.mjs           # Next.js config (standalone output)
├── tailwind.config.ts        # Tailwind theme (teal/orange colors)
└── package.json
```

---

## Quick Commands

```bash
# Development
npm run dev                    # Start dev server (http://localhost:3000)

# Build
npm run build                  # Production build
npm start                      # Run production build locally

# Database
npx prisma studio              # View database in browser
npx prisma generate            # Regenerate Prisma client
npx prisma migrate dev         # Create new migration (local)
npx prisma migrate deploy      # Apply migrations (production)

# Deployment
git push origin main           # Auto-deploy to Railway (if connected)
railway up                     # Manual deploy via CLI
railway logs                   # View production logs
```

---

## Contact & Resources

**Project Documentation:**
- Main docs: `CLAUDE.md`
- This handoff: `HANDOFF.md`
- Setup guide: `SETUP-GUIDE.md`
- Deployment: `DEPLOYMENT.md`
- Database schema: `PRISMA-SCHEMA-REQUIREMENTS.md`

**Database:**
- Railway PostgreSQL (new instance, separate from Wiki.js)
- Connection string in `.env`

**Domain:**
- Production: https://resistproject.com
- Railway URL: https://resistproject-production.up.railway.app
- DNS: Cloudflare

**References:**
- Design mockup: `Proposed Layout RP.pdf`
- Example styled page: `content/learn/birthright-citizenship.mdx`

---

## Success Criteria

Before marking complete:

- [ ] All 8 LEARN pages styled with mockup design
- [ ] All 8 ACT pages styled with mockup design
- [ ] LEARN landing page created (`/learn`)
- [ ] ACT landing page created (`/act`)
- [ ] Home page updated with proper styling
- [ ] Local build succeeds: `npm run build` (no errors)
- [ ] All 17+ pages generated statically
- [ ] Deployed to Railway successfully
- [ ] Custom domain (resistproject.com) working with HTTPS
- [ ] Database triggers applied in production
- [ ] All pages load without errors

**Estimated Time:**
- Styling remaining pages: 3-4 hours
- Creating landing pages: 1 hour
- Deployment & verification: 1 hour
- **Total: 5-6 hours**

---

**Ready to proceed!** Start with applying the template to 2-3 LEARN pages to verify the pattern, then batch the rest.
