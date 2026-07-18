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
│   │   ├── api/
│   │   │   └── search-index/   # Full-text search index endpoint
│   │   ├── learn/              # Learn pages
│   │   ├── act/                # Action pages
│   │   └── (environment)/      # Environment Hub (route group with isolated layout)
│   │       └── environment/    # /environment/* pages
│   ├── components/
│   │   ├── layout/             # Header, Footer, AuthButton, UserMenu, SearchBar, MainChrome
│   │   ├── environment/        # EnvironmentHeader, EnvironmentFooter
│   │   └── content/            # Content display components (TagFilterBar, RelatedContent, ...)
│   ├── lib/
│   │   ├── auth.ts             # NextAuth configuration
│   │   ├── db.ts               # Prisma client
│   │   ├── mdx.ts              # MDX processing
│   │   ├── tags.ts             # Canonical tag taxonomy (shared server+client)
│   │   ├── environment-tags.ts # Environment section tag taxonomy
│   │   └── remark-section-wrapper.ts  # MDX simple syntax plugin
│   └── types/
│       └── next-auth.d.ts      # NextAuth type extensions
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── content/                     # MDX content files
│   ├── home.mdx
│   ├── learn/                  # Educational content
│   ├── act/                    # Action opportunities
│   └── environment/            # Environment Hub content (unified facts+actions)
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

### 🔐 Auth Architecture Notes & Gotchas (updated 2026-07-18)

Sessions use the **database strategy** (Prisma adapter). Config: `src/lib/auth.ts`.

- **Google account linking is ON and must stay on.** `allowDangerousEmailAccountLinking: true` on the Google provider. The app was **email-first** — a Resend magic-link sign-in creates a `User` row with **no OAuth `Account` row**. Without linking, those users hit `OAuthAccountNotLinked` when they later click "Sign in with Google" and land **logged out after completing the Google flow**. Auto-linking by verified email is safe for Google specifically (Google verifies email ownership). Setting this back to `false` reintroduces the bug.

- **Never set cookies inside Auth.js callbacks/events.** Calling `next/headers` `cookies().set()` inside `signIn`/`createUser` runs during the OAuth callback response and can clobber the session cookie (this made brand-new Google signups land logged out). Instead:
  - Sign-in server actions (`src/app/auth/signin/actions.ts`) route post-auth through **`/auth/complete?returnTo=...`** via `redirectTo`.
  - **`src/app/auth/complete/route.ts`** (a normal Route Handler) reads onboarding status and sets the `onboarding-needed` cookie safely, then redirects to `/onboarding` or the original destination.

- **`onboarding-needed` cookie lifecycle:** set in `/auth/complete` → read in `src/middleware.ts` (redirects to `/onboarding`; excludes `/api/*` and `/auth/*` to avoid loops) → deleted in `src/app/onboarding/actions.ts` (dismiss) and `src/app/profile/actions.ts` (complete).

- **Host-mismatch failure mode:** if users reach the site on a different host than `NEXTAUTH_URL`/`AUTH_URL` (e.g. `www` vs apex), OAuth state/session cookies land on the wrong host and sign-in **silently fails** ("went through Google, came back logged out"). Google Console → Authorized redirect URI must be exactly `https://resistproject.com/api/auth/callback/google` and match the `NEXTAUTH_URL` host.

- **Required prod env:** `AUTH_TRUST_HOST=true`, `AUTH_SECRET` (+ `NEXTAUTH_SECRET`), `NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`. Historical fixes: `docs/archive/FIX-UNTRUSTED-HOST.md`, `docs/archive/FIX-CSRF-ERROR.md`.

---

## MDX Content Authoring

### ✅ Simple Syntax System (2026-02-08)

**Overview:**
All content is written in MDX using simple markdown syntax that automatically transforms into styled React components. This system reduces content verbosity by ~70% and makes it easier for contributors to write and edit pages.

**Core Implementation:**
- **Remark Plugin** (`src/lib/remark-section-wrapper.ts`) - Transforms markdown AST during MDX compilation
- Headings like `## Quick Summary`, `## Facts`, `## Analysis` automatically wrap content in styled components
- Special link syntax auto-converts to interactive components
- Auto-generates side-by-side layouts for Quick Summary + CTA boxes

**Writing Content - Simple Syntax:**

```markdown
# Page Title

## Quick Summary

**Key Point:** Brief one-sentence summary.

Additional context about the issue.

[→ Take Action: Contact Congress](/act/contact-congress)

## Facts

### Timeline

| Date | Event | Source |
|------|-------|--------|
| 2025-01-20 | Event occurred | [source: Document Title](https://example.gov) |

### Key Documents

- Important fact [source: Executive Order](https://whitehouse.gov/eo)
- Another fact [source: Court Filing](https://supremecourt.gov)

## Analysis

### What This Means

Explanation and interpretation of the facts above.

### Who's Affected

- **Group 1**: Impact description
- **Group 2**: Impact description
```

**Heading Recognition:**
- `## Quick Summary` → QuickSummary component (grey box with left border)
- `## Facts` → FactsSection component (teal background, disclaimer)
- `## Analysis` → AnalysisSection component (orange heading, disclaimer)
- `## Quick Actions` → Section with auto-inserted intro text (Act pages)
- `## Sustained Actions` → Section with auto-inserted intro text (Act pages)
- `## Resources` → Resources section wrapper (Act pages)

**Special Link Syntax:**
- `[→ Take Action: Text](url)` → ActNowBox component (orange CTA)
- `[← Learn More: Text](url)` → LearnMoreBox component (teal CTA)
- `[source: Label](url)` → SourceLink component (right-aligned citation)
- `[source: A](url1) | [source: B](url2)` → SourceGroup component (comma-separated citations on one line, "Sources:" prefix)

**How It Works:**
1. Content is written in plain markdown with special headings
2. Remark plugin runs during MDX compilation
3. Plugin walks the markdown AST looking for recognized patterns
4. Transforms headings and links into MDX component nodes
5. Components render with full styling and interactivity

**Templates:**
- `templates/learn-page.md` - Template for Learn pages
- `templates/act-page.md` - Template for Act pages
- Templates built into "Propose New Page" button

**Migration:**
- All 16 production MDX files migrated on 2026-02-08
- Migration script: `scripts/migrate-mdx-to-simple.ts`
- Can be run on individual files with `--file=path/to/file.mdx`

**Benefits:**
- ~70% less code (e.g., 50 lines vs 170 lines)
- Contributors write plain markdown instead of JSX
- Consistent structure enforced automatically
- Easier to review edit proposals (cleaner diffs)
- Lower barrier to entry for community contributions

### ✅ Collapsible Sections (2026-02-08)

**Overview:**
For pages with extensive evidence and primary sources, collapsible sections allow comprehensive information to be presented without overwhelming readers. Sections are collapsed by default, keeping pages scannable while allowing users to drill down into details.

**Component:**
- `src/components/mdx/Collapsible.tsx` - Client-side interactive collapsible component
- Supports headings (h2, h3, h4) and list items
- Auto-detects section (learn/act) for accent colors
- Full keyboard accessibility (Tab, Enter, Space)
- Smooth animations and transitions

**Syntax:**

**Collapsible Headings:**
```markdown
## [+] Evidence Section

This content is collapsed by default.

### [+] Nested Timeline

This is nested and also collapsible.

### Regular Heading

This is NOT collapsible (no [+] marker).
```

**Collapsible List Items:**
```markdown
- [+] Primary Sources

  This content is hidden until expanded (note: blank line and 2-space indent).

  - Executive Order 12345
  - Court Filing ABC-2025

- Regular list item (not collapsible)

- [+] Another Collapsible Item

  More hidden content.
```

**Important Markdown Syntax:**
- List item content MUST have a blank line before it
- List item content MUST be indented with 2 spaces
- Without proper formatting, content won't be recognized as part of the list item

**Visual Design:**

**Collapsed State:**
- Looks like regular content with small chevron icon (▸)
- No background boxes or borders
- Blends naturally with page flow
- Hover: title underlines, color darkens

**Expanded State:**
- Chevron rotates down (▾)
- Content appears with subtle left border
- Indentation increases with nesting level:
  - h2: No extra indent
  - h3: Medium indent (pl-6 md:pl-8)
  - h4: Deep indent (pl-8 md:pl-10)
  - li: Medium indent (pl-6 md:pl-8)

**Section Colors:**
- Learn pages: Teal accent (`border-teal-500`)
- Act pages: Orange accent (`border-orange-500`)
- Auto-detected from frontmatter `type` field

**Use Cases:**
- Evidence sections with 10+ primary sources
- Detailed timelines with many events
- Technical documentation or legal details
- Any content that's comprehensive but not immediately essential

**Testing:**
- Test pages: `/test/collapsibles` and `/test/mdx-collapsibles`
- Works inside Facts/Analysis sections
- Supports nested collapsibles (multiple levels)
- Mobile responsive with appropriate indentation

### ✅ Email Broadcast System (2026-03-26)

**Overview:**
Admin-triggered email broadcasts to all opted-in users about new/urgent content. Uses the existing Resend integration.

**How to use:**
1. Navigate to `/admin/broadcasts` (Tier 5 admin only)
2. Write subject line and message body (supports `**bold**` markdown)
3. Select and reorder featured pages (urgent pages shown first)
4. Preview the email, then "Send Test" to your own email, then "Send Broadcast" to all users

**Key files:**
- `src/lib/email.ts` — Resend client singleton, batch send (chunks of 100), HMAC-signed unsubscribe token utils
- `src/lib/email-templates.ts` — HTML email template renderer (inline CSS, logo via hosted URL, teal/orange page cards)
- `src/app/api/unsubscribe/route.ts` — One-click unsubscribe (no login required, CAN-SPAM compliant)
- `src/app/admin/broadcasts/page.tsx` — Admin page with composer + broadcast history
- `src/app/admin/broadcasts/actions.ts` — Server actions: `sendBroadcast()`, `sendTestEmail()`, `previewBroadcast()`, `getRecipientCount()`
- `src/components/admin/BroadcastComposer.tsx` — Client form with subject, message, page selector, reorder, preview, test send, broadcast send

**Database:**
- `EmailBroadcast` model tracks subject, intro text, featured pages, delivery stats (recipient/success/failure counts), status, sender
- Migration: `20260326164620_add_email_broadcasts`

**Email details:**
- Sender: `noreply@resistproject.com` (via `EMAIL_FROM` env var)
- Recipients: all `UserExtended` records with `emailNotifications = true`
- Logo: hosted at `https://resistproject.com/logo-icon-white.svg` (must be remote URL — Gmail strips inline SVGs and base64 data URIs)
- Unsubscribe: HMAC-signed token using `AUTH_SECRET`, no expiration
- Rate limits: Resend free tier = 100 emails/day; UI warns if recipients exceed limit
- Batch sending: 100 per Resend batch API call, 1s delay between batches
- Test emails: prefixed with `[TEST]` in subject, sent only to admin's email, no DB record created
- Audit log entry created for each broadcast send

---

### ✅ Search & Tag System (2026-02-26)

**Overview:**
Full-text Fuse.js search in the header, interactive tag filtering on index pages, and automatic related content on detail pages.

**Canonical Tag Taxonomy (`src/lib/tags.ts`):**
- **Topic tags (14):** Healthcare, Immigration, Civil Rights, LGBTQ+ Rights, Education, Environment, Press Freedom, Voting Rights, Economy, Foreign Policy, Public Health, Judiciary, Corruption, Government Reform
- **Status tags (3):** Ongoing, Under Litigation, Urgent
- Shared module importable by both server and client components — do NOT export tag constants from `'use client'` files (causes runtime errors on the server)

**Search (`src/components/layout/SearchBar.tsx` + `src/app/api/search-index/route.ts`):**
- Fuse.js fuzzy search, loaded once per session with module-level cache
- `/api/search-index` returns all pages with title, description, tags, excerpt (full body text stripped of JSX/markdown)
- Key config: `ignoreLocation: true` (required for body text matches in long pages), `threshold: 0.35`
- Weights: title ×3, description ×2, tags ×2, excerpt ×1
- Use `type="text"` not `type="search"` — the latter adds a duplicate browser clear button
- Renders in desktop nav and in mobile hamburger menu (`fullWidth` prop)
- JSX tag stripping: use `<[^>]+>/g → ' '` (keep content inside tags), NOT `<[A-Z]...>[\s\S]*?</[A-Z]...>` (that erases all body text)

**Tag Filtering (`src/components/content/TagFilterBar.tsx`):**
- `'use client'` pill bar on `/learn` and `/act` index pages
- URL-based filtering: `?tag=X` query param, read via `searchParams` in server page components
- Clicking a tag on any `PageMeta` card also navigates to `/{section}?tag={tag}`

**Related Content (`src/components/content/RelatedContent.tsx`):**
- Server component — shows up to 3 related pages below each article
- Cross-section pages (learn↔act) preferred over same-section
- Same slug in the other section gets +100 score bonus (guarantees mirror page always appears)
- Requires `max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16` on its outer div (rendered outside MDX `<PageContent>` wrapper)
- Returns `null` if current page has no topic tags

**Content updates:**
- All 51 MDX frontmatter `tags:` fields migrated to canonical tags
- Hardcoded `## Related Actions` / `## Related Learn Pages` sections removed from MDX files (replaced by RelatedContent component)

---

### ✅ "Our Home" Environment Section (launched 2026-04-02, massively expanded 2026-04-04)

**Overview:**
A dedicated environment sub-section at `/environment/*` branded "Our Home", with its own green visual identity, header, and footer. Shares the same Next.js app, database, auth, and deployment as the main site. NOT a main nav item — linked from the homepage and learn/act landing pages. Old URLs (`/learn/climate-environment`, `/act/environment`) permanently redirect here.

**Key Design Decisions:**
- **Unified pages:** Environment pages combine facts AND actions on a single page (unlike learn/act split on the main site)
- **Own layout:** Route group `(environment)` with `EnvironmentHeader` and `EnvironmentFooter`, isolated from main site chrome via `MainChrome` conditional wrapper
- **Color scheme:** Facts = blue/steel, Analysis = orange, Actions = forest green. `forest` Tailwind palette (50-900)
- **Own tag taxonomy:** Finer-grained than the main site's single "Environment" tag
- **Collapsible sections:** All dense evidence uses `### [+] Section` syntax to keep pages scannable

**Route Structure:**
```
src/app/(environment)/
  layout.tsx              # Nested layout (EnvironmentHeader + EnvironmentFooter)
  environment/
    page.tsx              # Landing page with hero, tag filter, topic grid
    [slug]/
      page.tsx            # Individual topic pages (MDX)
```

**Layout Isolation:**
- `src/components/layout/MainChrome.tsx` — Client component wrapping root layout. Checks `usePathname()`: on `/environment/*` renders just `{children}` (no main header/footer), otherwise renders `HeaderWrapper` + `Footer`.
- `src/app/(environment)/layout.tsx` — Nested layout (no `<html>`/`<body>`) that renders `EnvironmentHeader` + `EnvironmentFooter`.

**Environment-Specific Components:**
- `src/components/environment/EnvironmentHeader.tsx` — Dark green (`forest-800`) header. Dimmed Resist Project logo (opacity-50) + "RESIST PROJECT" in muted text + "/" divider + "Our Home" in bold white. On mobile, only "Our Home" shows.
- `src/components/environment/EnvironmentFooter.tsx` — Green-themed footer
- `src/components/content/ActionsSection.tsx` — Wrapper for Quick Actions / Sustained Actions headings. Green on environment pages, orange on act pages. Renders its own intro subtitle text.

**Environment Tag Taxonomy (`src/lib/environment-tags.ts`):**
- **Topic tags (16):** Air Quality, Water, Public Lands, Wildlife, Climate, Energy, Environmental Justice, Toxics & Chemicals, Oceans & Coasts, Agriculture, Health, Forests, Utah & Local, Corporate Accountability, Policy & Regulation, Science & Monitoring
- **Status tags (5):** Urgent, Ongoing, Under Litigation, Comment Period Open, New

**Section Color Scheme (environment pages):**
- `QuickSummary` — Gray (same as learn/act)
- `FactsSection` — Blue/steel (`bg-steel-50`, `text-steel-700`, `border-steel-600`)
- `AnalysisSection` — Orange (same as learn/act)
- `ActionsSection` — Forest green (`text-forest-800`, `border-forest-600`)
- `Collapsible` — Green accents (`border-forest-500`)
- TOC sidebar and floating TOC — Green links for action sections

**Section Type (`SiteSection`):**
- Defined in `src/types/content.ts` as `'learn' | 'act' | 'environment'`
- Used across ~20 files. The remark plugin detects section from frontmatter and passes it as a `section` prop to `FactsSection`, `AnalysisSection`, `ActionsSection`, `QuickSummary`, and `Collapsible`.
- `TagFilterBar`, `PageHeader`, `RelatedContent`, `PageMeta` all handle all three sections with appropriate color schemes.

**Cross-Linking Architecture:**
- Homepage: Green banner section between "Browse by Category" and "How It Works"
- `/learn` landing: Green card at bottom — "Looking for environment content?"
- `/act` landing: Green card at bottom — "Looking for environmental actions?"
- Search index (`/api/search-index`) includes environment pages
- Sitemap includes environment pages
- `RelatedContent` cross-links across all three sections
- **Hub pages** (climate-science, epa-rollbacks, fossil-fuel-industry) each have a "Related Issues" section linking to 6-7 spoke pages
- **Utah cluster** (great-salt-lake, utah-air-quality, utah-water-rights, utah-mining, wasatch-development, utah-wildfire-smoke, bears-ears-grand-staircase, colorado-river, geothermal-energy) each have a "Related Utah Environmental Issues" section cross-linking to the most relevant siblings

**Charts (`public/environment/charts/`):**
19 matplotlib PNG charts at 150 DPI. Generation scripts in `scripts/gen_chart_*.py` and `scripts/chart_*.py`.

**Photos (`public/environment/photos/`):**
12 public-domain JPG photos sourced from .gov agencies (NASA, NOAA, USFWS, DOE, NPS, USCG, NIFC). All resized to max 1600px wide.

**Content (`content/environment/*.mdx`) — 62 pages total:**

*Original 5:* air-quality, clean-water, public-lands, endangerment-finding, citizen-science

*Tier 1 (15 pages):* climate-science, epa-rollbacks, fossil-fuel-industry, fossil-fuel-subsidies, great-salt-lake, utah-air-quality, extreme-weather, endangered-species, environmental-racism, pfas-forever-chemicals, microplastics, bears-ears-grand-staircase, solar-wind-energy, climate-impacts, indigenous-environmental-rights

*Tier 2 (24 pages):* coral-reefs, dams-rivers, deforestation, groundwater-depletion, coal-ash, fracking, pollinator-decline, wildfire-crisis, ocean-plastic, carcinogens, pesticides-herbicides, nuclear-energy, sea-level-rise, geothermal-energy, colorado-river, wetlands-protection, superfund-sites, methane-emissions, bird-decline, oil-spills, utah-mining, utah-water-rights, wasatch-development, utah-wildfire-smoke

*Tier 3 (18 pages):* light-pollution, invasive-species, soil-health, deep-sea-mining, overfishing, energy-storage-grid, offshore-drilling, climate-migration, green-infrastructure, arctic-ice-loss, marine-mammals, predator-management, waste-recycling, food-agriculture-environment, climate-tipping-points, state-environmental-policy, environmental-litigation, greenwashing

**Action Diversity Standard (all pages):**
Every page must include at minimum: EmailTemplate + CallRepButton + 5 additional action types from: citizen science apps, regulations.gov public comments (with docket numbers where possible), consumer choices, local government engagement, volunteering, FOIA requests, community organizing.

**Adding New Environment Pages:**
1. Create `content/environment/new-topic.mdx` with frontmatter `type: "environment"`
2. Use tags from `src/lib/environment-tags.ts` (exact strings only)
3. Follow unified format: Quick Summary, Facts (with `### [+]` collapsibles for dense evidence), Analysis, Quick Actions (EmailTemplate + CallRepButton + 5+ diverse actions), Sustained Actions (5+ orgs), Resources
4. Page auto-appears on `/environment` landing and in search/sitemap
5. Add cross-links from relevant hub pages or Utah cluster pages as appropriate

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

### Running locally without Railway (sandbox / no hosted DB)

If Node and/or a hosted Postgres aren't available (fresh machine or sandbox), this recipe was verified to work end-to-end:

```bash
# Node 20 via nvm (no sudo needed)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
. "$HOME/.nvm/nvm.sh" && nvm install 20

# Disposable Postgres via rootless podman (fully-qualified image name is required)
podman run -d --name resist-pg -e POSTGRES_USER=resist -e POSTGRES_PASSWORD=resist \
  -e POSTGRES_DB=resist -p 5432:5432 docker.io/library/postgres:15-alpine

# .env DATABASE_URL for that container:
#   DATABASE_URL="postgresql://resist:resist@localhost:5432/resist?schema=public"
# Generate AUTH_SECRET/NEXTAUTH_SECRET with: openssl rand -base64 32

npm install
npx prisma migrate deploy   # apply existing migrations (use `migrate dev` only to CREATE new ones)
npx prisma generate
npm run dev
```

Public pages and all MDX content render fine with placeholder external keys. **Google OAuth** needs real `GOOGLE_CLIENT_ID`/`SECRET` (can't be tested locally without them); **email magic links** need a real `RESEND_API_KEY`.

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

## Weekly Content Update Workflow

Content lives in `content/{learn,act,environment}/*.mdx`. The loader (`src/lib/content.ts`) reads **`.mdx` only** — any `.md` twins are dead legacy. New pages **auto-appear** in listings (filesystem-based) and self-register metadata lazily (`src/lib/page-registry.ts`); to add one, just create the `.mdx` with correct `type` frontmatter (`learn`/`act`/`environment`).

Every page carries `lastUpdated: "YYYY-MM-DD"` — the staleness signal (pages cluster around shared dates per update). A "weekly update" (see git history for examples) means:

1. **Research the window** since the last update. For events after the model's knowledge cutoff, use **live web research** — a good approach is to fan out topic-cluster research agents (courts, immigration, foreign policy/Iran, economy/tariffs, health, democracy/exec power, civil rights/education, national environment, Western/Utah environment), each returning dated + sourced developments mapped to page slugs, then synthesize a per-page digest.
2. **Rewrite each affected page's lead** — the `## Quick Summary` paragraph (learn/act) or the `**Key Point:**` paragraph (environment) — to lead with the freshest developments, and **bump `lastUpdated`**.
3. **Refresh `content/home.mdx`** — the homepage is a curated "Critical Issues" digest of dated headline paragraphs + LEARN/ACT links, with a "Last updated" footer.
4. **Do NOT falsely bump `lastUpdated`** on pages with no real change — it misrepresents freshness. Leave evergreen tool pages (contact-congress, share, etc.) alone unless their content changed.
5. Verify pages render (`curl localhost:3000/...`) and commit in logical batches with a detailed digest commit message.

Authoring conventions: simple-syntax headings auto-wrap into components; special links `[→ Take Action: …](/act/…)`, `[← Learn More: …](/learn/…)`, `[source: …](url)`; `### [+]` for collapsibles. Templates in `templates/`.

## Push / Deploy Notes

- Push to `main` → **Railway auto-deploys** (~2-3 min). This is a **solo project; commits go directly to `main`.**
- This dev environment has **no `gh` CLI** and no stored git credentials. Pushing needs a **fine-grained PAT with `Contents: Read and write`** on `lknipko/resistproject` (a token lacking that scope returns **403**, not 401). Pass it via an ephemeral credential helper and never persist it to git config:
  ```bash
  GIT_PAT='<token>' git -c credential.helper='!f() { echo username=lknipko; echo "password=${GIT_PAT}"; }; f' push origin main
  ```
- Repo-local git identity used: `lknipko` / `lknipko@gmail.com`.

## Recent Session Log

- **2026-07-18 — Auth fixes** ("went through Google, came back logged out"): enabled Google account linking + moved onboarding cookie into `/auth/complete`. See **Auth Architecture Notes** above.
- **2026-07-17 — Full content refresh** to the June 6 → July 17 window: ~90 pages updated + 5 new (`temporary-protected-status`, `ice-agent-shootings`, `independent-agencies`, `aca-marketplace`, `pepfar-hiv-funding`).
- **2026-07-17 — Header cross-branding:** main header shows a greyed "Our Home" link beside the logo; Our Home header (`EnvironmentHeader.tsx`) shows "Our Home" primary + greyed Resist Project logo linking back to `/`.
- **2026-07-17 — Our Home hero fix** (`HeroSlideshow.tsx`): real crossfade + eager-loaded images + inline blur (LQIP) placeholders + `forest-900` bg; AVIF enabled in `next.config.mjs`.
- **2026-07-17 — Repo cleanup:** removed duplicate nested app copies (`resist-project/`, `resistproject-upload/`), committed logs, `force.txt`; archived transient fix/handoff docs to `docs/archive/`.

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
