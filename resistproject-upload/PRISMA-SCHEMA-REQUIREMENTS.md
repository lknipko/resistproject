# Prisma Schema Requirements for Milestone 5

## Overview

The Prisma schema must replicate all 8 SQL migrations from the `migrations/` folder to support future collaborative editing features described in DEV-PLAN.md.

**Source:** `C:\Users\lknip\Documents\civic-action-wiki\migrations/`

---

## Required Tables (from SQL migrations)

### 1. PageMetadata (001-page-metadata.sql)
**Purpose:** Store scoring, trending, and urgency data for each page

**Fields:**
- `id` - Primary key
- `slug` - Page slug (unique)
- `type` - "learn" | "act"
- `score` - Calculated page score (float)
- `urgency_factor` - Admin-set urgency multiplier
- `view_count` - Total views
- `action_click_count` - Clicks on action links
- `last_action_date` - Last user action timestamp
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

**Indexes:** slug, type, score

---

### 2. UserExtended (002-user-extended.sql)
**Purpose:** User reputation and tier system (extends NextAuth User model)

**Fields:**
- `id` - Primary key
- `user_id` - Foreign key to NextAuth User (unique)
- `reputation_score` - Accumulated reputation points
- `tier` - User tier (1-5, default 1)
- `badges` - JSON array of earned badges
- `edit_count` - Total approved edits
- `vote_count` - Total votes cast
- `created_at` - Account creation
- `updated_at` - Last activity

**Indexes:** user_id, tier, reputation_score

**Relations:** Links to NextAuth User model

---

### 3. EditProposal (003-edit-proposals.sql)
**Purpose:** Collaborative editing proposals awaiting approval

**Fields:**
- `id` - Primary key (UUID)
- `page_slug` - Target page
- `author_id` - User who proposed (FK to User)
- `content_before` - Original MDX content
- `content_after` - Proposed MDX content
- `diff` - JSON diff object
- `rationale` - Text explanation of changes
- `status` - "pending" | "approved" | "rejected"
- `approval_threshold` - Required vote score
- `current_vote_score` - Weighted vote tally
- `created_at` - Proposal timestamp
- `updated_at` - Last vote timestamp
- `resolved_at` - Approval/rejection timestamp
- `resolved_by_id` - User who resolved (FK to User, nullable)

**Indexes:** page_slug, author_id, status, created_at

**Relations:**
- `author` - User
- `resolved_by` - User (nullable)
- `votes` - Vote[] (one-to-many)

---

### 4. Vote (004-votes.sql)
**Purpose:** Weighted voting on edit proposals

**Fields:**
- `id` - Primary key
- `edit_proposal_id` - FK to EditProposal
- `voter_id` - FK to User
- `vote_value` - -1 (reject), 0 (abstain), +1 (approve)
- `weight` - Vote weight based on voter tier/reputation
- `created_at` - Vote timestamp

**Indexes:** edit_proposal_id, voter_id
**Unique constraint:** (edit_proposal_id, voter_id) - one vote per user per proposal

**Relations:**
- `edit_proposal` - EditProposal
- `voter` - User

---

### 5. AuditLog (005-audit-log.sql)
**Purpose:** Track all moderation and admin actions

**Fields:**
- `id` - Primary key
- `user_id` - FK to User who performed action
- `action_type` - "approve_edit" | "reject_edit" | "ban_user" | "pin_page" | "override_score"
- `target_type` - "page" | "user" | "edit_proposal"
- `target_id` - ID of affected entity
- `metadata` - JSON object with action details
- `created_at` - Action timestamp

**Indexes:** user_id, action_type, target_type, created_at

**Relations:**
- `user` - User

---

### 6. PageEvent (006-page-events.sql)
**Purpose:** Analytics events (privacy-respecting, no PII)

**Fields:**
- `id` - Primary key
- `page_slug` - Page identifier
- `event_type` - "view" | "action_click" | "external_link_click"
- `event_metadata` - JSON object (e.g., which action clicked)
- `session_hash` - Hashed session ID (no user tracking)
- `created_at` - Event timestamp

**Indexes:** page_slug, event_type, created_at

**Notes:** No user_id - privacy-first analytics

---

### 7. PinnedPage (007-pinned-pages.sql)
**Purpose:** Admin overrides for homepage trending section

**Fields:**
- `id` - Primary key
- `page_slug` - Page to pin
- `position` - Display order (1-10)
- `pinned_by_id` - FK to User (admin)
- `reason` - Text explanation
- `created_at` - Pin timestamp
- `expires_at` - Optional expiration (nullable)

**Indexes:** page_slug, position, expires_at

**Relations:**
- `pinned_by` - User

---

### 8. Database Indexes (008-indexes.sql)
**Purpose:** Performance optimization

**Composite Indexes to Add:**
- PageMetadata: (type, score DESC) - for trending queries
- EditProposal: (status, created_at DESC) - for review queue
- Vote: (edit_proposal_id, created_at) - for vote tallying
- PageEvent: (page_slug, event_type, created_at) - for analytics

---

## NextAuth.js Integration

The schema must integrate with NextAuth.js v5 default tables:

**NextAuth Default Tables (don't modify):**
- `Account` - OAuth provider accounts
- `Session` - User sessions
- `User` - Core user data
- `VerificationToken` - Email verification

**Our Extension:**
- `UserExtended` links to `User` via `user_id` foreign key
- Provides reputation, tier, badges without modifying NextAuth schema

---

## Prisma Relations Map

```
User (NextAuth)
├── UserExtended (1:1)
├── EditProposal[] (1:many as author)
├── EditProposal[] (1:many as resolver)
├── Vote[] (1:many)
├── AuditLog[] (1:many)
└── PinnedPage[] (1:many)

EditProposal
├── author → User
├── resolved_by → User (nullable)
└── votes → Vote[] (1:many)

Vote
├── edit_proposal → EditProposal
└── voter → User

PageMetadata (standalone, indexed by slug)
PageEvent (standalone, privacy-focused)
AuditLog → User
PinnedPage → User
```

---

## Environment Variables Needed

Create `.env` file with:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email Provider (for passwordless auth)
EMAIL_SERVER="smtp://username:password@smtp.example.com:587"
EMAIL_FROM="noreply@resistproject.com"
```

---

## Prisma Schema Starter Template

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js v5 models (required)
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String?   @unique
  emailVerified DateTime?
  image         String?
  accounts      Account[]
  sessions      Session[]

  // Relations to our extended tables
  extended      UserExtended?
  editProposals EditProposal[] @relation("author")
  resolvedEdits EditProposal[] @relation("resolver")
  votes         Vote[]
  auditLogs     AuditLog[]
  pinnedPages   PinnedPage[]
}

model Account {
  id                 String  @id @default(cuid())
  userId             String
  type               String
  provider           String
  providerAccountId  String
  refresh_token      String?
  access_token       String?
  expires_at         Int?
  token_type         String?
  scope              String?
  id_token           String?
  session_state      String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// Custom models (implement based on SQL migrations)
model UserExtended {
  // TODO: Add fields from 002-user-extended.sql
}

model PageMetadata {
  // TODO: Add fields from 001-page-metadata.sql
}

model EditProposal {
  // TODO: Add fields from 003-edit-proposals.sql
}

model Vote {
  // TODO: Add fields from 004-votes.sql
}

model AuditLog {
  // TODO: Add fields from 005-audit-log.sql
}

model PageEvent {
  // TODO: Add fields from 006-page-events.sql
}

model PinnedPage {
  // TODO: Add fields from 007-pinned-pages.sql
}
```

---

## Implementation Steps for Milestone 5

1. **Read SQL migration files** from `migrations/001-008`
2. **Complete Prisma schema** based on SQL → Prisma mapping above
3. **Initialize Prisma:**
   ```bash
   npx prisma init
   # Edit schema.prisma
   npx prisma generate
   ```
4. **Create Railway PostgreSQL database** (if not exists)
5. **Set DATABASE_URL** in `.env`
6. **Push schema:**
   ```bash
   npx prisma migrate dev --name init
   # OR for production:
   npx prisma migrate deploy
   ```
7. **Create `src/lib/db.ts`:**
   ```typescript
   import { PrismaClient } from '@prisma/client'

   const globalForPrisma = globalThis as unknown as {
     prisma: PrismaClient | undefined
   }

   export const prisma = globalForPrisma.prisma ?? new PrismaClient()

   if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
   ```

---

**Ready for implementation.** All requirements documented. Refer to actual SQL files for exact column types and constraints.
