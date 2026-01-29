# Collaborative Editing System - Implementation Plan

## Overview

We're building a Wikipedia-style collaborative editing system where:
- Anyone can propose edits to content pages
- Community votes on proposed changes
- Moderators review and approve based on vote threshold
- Users gain reputation and tier progression
- All actions are audited

## Architecture

### Database Schema (Already Complete ✓)

```
User (NextAuth base)
  └─→ UserExtended
       ├─ userTier (1-5): access level
       ├─ reputationScore: earned through good edits
       ├─ editsProposed/Approved/Rejected: stats
       └─ badges: achievements

EditProposal
  ├─ pageId, pagePath: what's being edited
  ├─ originalContent, proposedContent: the change
  ├─ diffContent: computed diff for display
  ├─ editSummary: why the change
  ├─ status: pending/approved/rejected
  ├─ approvalScore, rejectionScore: vote counts
  └─ validationStatus: auto-checks passed?

Vote
  ├─ proposalId: which edit
  ├─ voterId: who voted
  ├─ voteType: approve/reject/flag
  └─ voteWeight: tier-based (tier 1 = 1 point, tier 3 = 3 points)
```

## User Interface Components to Build

### 1. Edit Button on Content Pages

**Location:** Bottom of every /learn/* and /act/* page
**Component:** `<EditPageButton>`

```tsx
// Shows for authenticated users
<button>Suggest Edit</button>
// Opens EditProposalForm modal
```

### 2. Edit Proposal Form

**Component:** `<EditProposalForm>`

Fields:
- Content editor (markdown with preview)
- Edit summary (required, max 500 chars)
- Edit type dropdown: content, sources, formatting, metadata
- Sections affected (auto-detect or manual select)

Validation:
- Check for primary sources (if adding links)
- Profanity/spam filter
- Minimum edit size (prevent trivial changes)
- Check for edit conflicts (page changed since loaded)

### 3. Pending Edits Queue

**Route:** `/admin/review-edits`
**Component:** `<EditReviewQueue>`

Shows for moderators (tier 3+):
- List of pending EditProposals
- Sort by: newest, most votes, oldest
- Filter by: page, status, validation status
- Click to expand and review

### 4. Edit Proposal Detail View

**Component:** `<EditProposalDetail>`

Displays:
- Diff viewer (side-by-side or unified)
- Proposer info (name, tier, reputation)
- Edit summary
- Validation results
- Vote counts (approve/reject/flag)
- Comments thread

Actions:
- Vote buttons (approve/reject/flag)
- Comment form
- Moderator actions (instant approve/reject)

### 5. Diff Viewer

**Component:** `<DiffViewer>`

Show changes with:
- Line-by-line comparison
- Color coding (green = addition, red = deletion, yellow = modification)
- Collapsible unchanged sections
- Markdown rendering of both versions

Library options:
- `react-diff-viewer-continued` (most popular)
- `diff` package + custom UI
- `unified` + `remark` for markdown-aware diffs

### 6. Vote Interface

**Component:** `<VoteButtons>`

For tier 1-2 (regular users):
```tsx
<ApproveButton weight={userTier} />
<RejectButton weight={userTier} />
<FlagButton reason={...} />
```

For tier 3+ (moderators):
```tsx
<InstantApproveButton />
<InstantRejectButton reason={...} />
```

### 7. User Profile/Dashboard

**Route:** `/profile` or `/dashboard`
**Component:** `<UserDashboard>`

Shows:
- Current tier and next tier requirements
- Reputation score and history
- Edit statistics (proposed/approved/rejected)
- Badges earned
- Recent activity
- Pending proposals (yours)

### 8. Reputation Badge

**Component:** `<UserBadge>`

Display tier and reputation in:
- Comment author lines
- Edit proposal headers
- User dropdown menu

Visual:
```
[⭐⭐⭐ Moderator | 1,234 rep]
[⭐ New Contributor | 12 rep]
```

### 9. Activity Feed

**Route:** `/activity` or `/recent-changes`
**Component:** `<ActivityFeed>`

Public feed showing:
- Recent edit proposals (approved/rejected)
- New users
- Reputation milestones
- Badges earned

Like Wikipedia's "Recent Changes" page.

## API Routes to Build

### POST `/api/edit-proposals/create`
Create new edit proposal

Request:
```json
{
  "pageId": 123,
  "pagePath": "/learn/obbba-medicaid",
  "proposedContent": "...",
  "editSummary": "...",
  "editType": "content",
  "sectionsAffected": ["analysis"]
}
```

Response:
```json
{
  "id": 456,
  "status": "pending",
  "validationResults": {...}
}
```

### POST `/api/edit-proposals/:id/vote`
Vote on a proposal

Request:
```json
{
  "voteType": "approve",
  "comment": "Good sources added"
}
```

Response:
```json
{
  "approvalScore": 8,
  "rejectionScore": 1,
  "threshold": 10,
  "percentComplete": 80
}
```

### POST `/api/edit-proposals/:id/resolve`
Moderator instant approve/reject

Request:
```json
{
  "action": "approve",
  "reason": "Well-sourced and accurate"
}
```

### GET `/api/edit-proposals/queue`
Get pending proposals (paginated)

Query params:
- `status`: pending/all
- `page`: page number
- `limit`: items per page
- `sortBy`: created/votes/oldest

### GET `/api/users/:id/reputation`
Get user's reputation and stats

Response:
```json
{
  "tier": 2,
  "reputation": 234,
  "nextTierAt": 500,
  "stats": {
    "editsProposed": 45,
    "editsApproved": 38,
    "editsRejected": 7,
    "approvalRate": 84
  },
  "badges": ["first-edit", "good-sources", "trusted-contributor"]
}
```

## Server Actions (Next.js App Router)

Since we're using Next.js 15, prefer Server Actions over API routes:

### `submitEditProposal(formData)`
### `voteOnProposal(proposalId, voteType)`
### `resolveProposal(proposalId, action, reason)`
### `getUserReputation(userId)`

## Validation Rules

### Auto-validation checks:
1. **Source quality check**
   - Count .gov links (good)
   - Flag social media/opinion links (bad)
   - Require sources for factual claims

2. **Content policy**
   - No profanity
   - No all-caps (except acronyms)
   - Minimum 50 chars changed
   - Maximum 10,000 chars changed (prevent vandalism)

3. **Format consistency**
   - Valid markdown
   - No broken links
   - Proper heading hierarchy

4. **Conflict detection**
   - Check if page changed since edit started
   - Flag if another edit overlaps same section

### Vote thresholds by tier:

| Proposer Tier | Approval Threshold | Auto-Reject at |
|---------------|-------------------|----------------|
| 1 (New)       | 10 points         | -5 points      |
| 2 (Trusted)   | 5 points          | -3 points      |
| 3 (Moderator) | Instant approve   | N/A            |
| 4+ (Admin)    | Instant approve   | N/A            |

Vote weights:
- Tier 1: 1 point
- Tier 2: 2 points
- Tier 3+: 3 points

## Reputation System

### Earn reputation:
- Edit approved: +10 points
- Edit receives upvote: +2 points
- Vote on edit (helps moderate): +1 point
- Edit rejected: -5 points (prevent spam)

### Tier progression:
- Tier 1 → 2: 100 reputation + 10 approved edits
- Tier 2 → 3: 500 reputation + 50 approved edits (manual review)
- Tier 3 → 4: Manual promotion by admins
- Tier 4 → 5: Manual (site owner only)

### Badges (gamification):
- "First Edit" - 1 approved edit
- "Trusted Contributor" - 10 approved edits
- "Source Champion" - 20 edits with primary sources
- "Rapid Responder" - 5 edits within 24h of page creation
- "Quality Reviewer" - 50 helpful votes
- "Community Moderator" - Reached tier 3

## Implementation Order

### Phase 1: Basic Edit Proposals (Week 1)
1. ✓ Database schema (done)
2. Create `<EditPageButton>` on content pages
3. Build `<EditProposalForm>` modal
4. Server action: `submitEditProposal()`
5. Basic validation (length, markdown)
6. Show "Edit submitted!" success message

### Phase 2: Review & Voting (Week 1-2)
1. Build `/admin/review-edits` page
2. `<EditReviewQueue>` component
3. `<EditProposalDetail>` with diff viewer
4. `<VoteButtons>` component
5. Server actions: `voteOnProposal()`, `resolveProposal()`
6. Auto-approve when threshold reached

### Phase 3: User Dashboard (Week 2)
1. Build `/profile` or `/dashboard` page
2. `<UserDashboard>` component
3. Display reputation, tier, stats
4. Show user's pending proposals
5. Edit history timeline

### Phase 4: Reputation System (Week 2-3)
1. Reputation calculation logic
2. Auto tier-up at thresholds
3. Badge system
4. `<UserBadge>` component
5. Activity feed

### Phase 5: Advanced Features (Week 3-4)
1. Email notifications (new votes, edit approved/rejected)
2. Conflict detection
3. Advanced validation (source quality checks)
4. Edit templates for common changes
5. Batch operations for moderators
6. Analytics dashboard

## Technical Notes

### Diff Generation
Use `diff` library to create diffs on submit:

```typescript
import { diffLines } from 'diff';

const diff = diffLines(originalContent, proposedContent);
const diffContent = JSON.stringify(diff);
// Store in EditProposal.diffContent
```

### Optimistic UI Updates
Use Next.js optimistic updates for instant feedback:

```typescript
const [optimisticScore, setOptimisticScore] = useOptimistic(approvalScore);

async function handleVote() {
  setOptimisticScore(prev => prev + voteWeight);
  await voteOnProposal(proposalId, 'approve');
}
```

### Real-time Updates (Optional)
Use Pusher or Railway's Redis for real-time vote count updates:

```typescript
// When someone votes, push event to channel
pusher.trigger('edit-proposals', 'vote-cast', {
  proposalId,
  newApprovalScore
});
```

### Content Security
- Sanitize markdown to prevent XSS
- Use `remark` plugins to strip dangerous HTML
- Validate all links before approving edits

## Testing Plan

### Unit Tests
- Vote weight calculation
- Reputation gain/loss
- Tier progression logic
- Validation rules

### Integration Tests
- Submit → Vote → Approve flow
- Conflict detection
- Email notifications
- Permission checks (tier-based)

### E2E Tests (Playwright)
1. User submits edit proposal
2. Moderator reviews and approves
3. Edit appears on page
4. User gains reputation
5. User tiers up

## Success Metrics

After launch, track:
- Edit proposals per day
- Approval rate by tier
- Average time to approval
- Active moderators
- User tier distribution
- Most edited pages

Target: 80%+ approval rate for tier 2+ users

## Ready to Start?

Once authentication is working, we'll begin with **Phase 1: Basic Edit Proposals**.

First component: `<EditPageButton>` on content pages.
