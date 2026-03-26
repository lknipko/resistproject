# Weekly Content Update

Perform a comprehensive weekly content update for the Resist Project civic engagement platform. This involves researching current events, updating existing pages, and preparing an email broadcast for subscribers.

## Context

- Working directory: `resistproject/`
- Content files: `content/learn/*.mdx` (educational) and `content/act/*.mdx` (action)
- Homepage: `content/home.mdx` + `src/app/page.tsx` (6 hardcoded FeaturedIssue cards)
- Photos: `public/photos/` using `[photo: Caption | Credit](/photos/filename.jpg)` syntax
- Email broadcast: composed at `/admin/broadcasts` with subject, intro text (supports `**bold**`), and selected featured pages
- Source links use `[source: Label](url)` syntax; multi-source uses `[source: A](url1) | [source: B](url2)`
- All frontmatter has `lastUpdated` field — update it on every page you touch

## Steps

### 1. Audit Current Content

Read the frontmatter of every `.mdx` file in `content/learn/` and `content/act/` to catalog:
- Each page's title, tags, and `lastUpdated` date
- Which pages are tagged `Urgent`
- Which pages have the oldest `lastUpdated` dates

Also read `content/home.mdx` and the `FeaturedIssue` section of `src/app/page.tsx` (~lines 110-180) to see what's currently featured.

### 2. Research Current Events

Use web search to find major US government/policy developments from the past week. Search for:
- "US government news this week [current date]"
- "Trump administration [current date]"
- "Congress [current date]"
- "Supreme Court [current date]"
- Issue-specific searches for each existing page topic (immigration, DOGE, tariffs, healthcare, Iran, climate, LGBTQ+, voting rights, press freedom, etc.)

For each development found, note: what happened, when, which agencies/officials, primary source URLs, and what citizens can do.

### 3. Update Learn Pages

For each learn page where new developments exist:
- Update the `lastUpdated` frontmatter field to today's date
- Add new facts to the Key Points section or relevant subsection
- Add new entries to the Timeline table
- Update the Quick Summary if the situation has materially changed
- Include `[source: Label](url)` citations for every new fact
- Update casualty figures, vote counts, or other running statistics

Prioritize pages tagged `Urgent` and pages with the most significant new developments.

### 4. Update Act Pages

For act pages related to updated learn pages:
- Update `lastUpdated` to today
- Update call scripts and email templates with current context (vote counts, dates, latest developments)
- Add new call scripts or email templates if a new action opportunity has emerged
- Call scripts use `<CallRepButton>` component; email templates use `<EmailTemplate>` component
- Update talking points in sustained actions sections

### 5. Update Homepage

- Update `content/home.mdx`: revise issue descriptions with latest numbers and developments; update the `Last updated` date at the bottom
- Update `src/app/page.tsx` FeaturedIssue cards: revise descriptions; consider whether any of the 6 featured issues should be swapped based on changing urgency
- The 6 featured issues should represent the most urgent, actionable, and impactful current issues

### 6. Add Photos (if needed)

Check which learn pages are missing a `[photo:` tag. For pages without photos that have significant updates:
- Download from Unsplash using `curl -sL -H "User-Agent: Mozilla/5.0" -o public/photos/FILENAME.jpg "https://images.unsplash.com/photo-UNSPLASH_ID?w=1280&q=80"`
- Add `[photo: Caption text | Credit](/photos/filename.jpg)` after the Key Points section
- Verify the download is a valid JPEG with `file public/photos/FILENAME.jpg`

### 7. Build Verification

Run `npm run build` (may need `rm -rf .next/cache` first on Windows) to verify all MDX compiles. All pages should generate without errors. The Windows `.next/trace` file lock issue is a known non-content problem — if all pages compile and the error is only about file renaming, the content is fine.

### 8. Prepare Email Broadcast

Draft the email content for the admin to paste into `/admin/broadcasts`:

**Subject line format:** "Resist Project Update: [Top 2-3 developments in ~80 chars]"

**Intro text format:** 2-4 short paragraphs highlighting the most important developments this week. Use `**bold**` for emphasis. End with "**Read the latest and take action below.**"

**Featured pages:** Select 5-6 pages ordered by urgency — mix of learn pages (for awareness) and act pages (for action). Provide the full paths like `/learn/iran-war`.

Present the broadcast draft clearly so the admin can copy it into the broadcast composer.

### 9. Commit and Push

After confirming all updates, stage the changed files and commit with a descriptive message following this format:

```
[Date] weekly update: [top 2-3 changes summarized]

[Bulleted list of all pages updated and what changed]

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
```

Then push to `origin main` to trigger Railway deployment.

## Important Rules

- Every factual claim must have a `[source: Label](url)` citation to a primary source (.gov, court filings, official reports) or credible news outlet
- Never fabricate sources or statistics — if you can't find a reliable source, note it and move on
- Keep the FACTS/ANALYSIS separation in learn pages — new facts go in Facts sections, interpretation goes in Analysis
- Use the existing MDX syntax patterns (collapsible `[+]` headings, source links, photo tags) — don't introduce new component patterns
- Don't remove existing content unless it's been superseded by newer information
- Update `lastUpdated` on every page you modify
- Ask the user before swapping featured homepage issues — present your recommendation and let them decide
