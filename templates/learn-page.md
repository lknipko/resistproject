# Learn Page Template

Use this template when creating new educational content pages.

## Filename Convention

`content/learn/kebab-case-title.mdx`

Example: `content/learn/federal-law-enforcement.mdx`

---

## Template

```mdx
---
title: "Page Title"
subtitle: "Brief description (can be empty)"
type: "learn"
tags: ["Tag1", "Tag2", "Tag3"]
lastUpdated: "2026-02-07"
description: "One-sentence description for SEO and previews"
---

<PageHeader type="learn" />

<PageContent>

# Page Title

## Quick Summary

**Key Point:** Brief summary of this issue in one sentence.

[→ Take Action: Relevant Action Page](/act/action-slug)

<MainContentLayout
  sidebar={
    <ContentSidebar>
      <ul className="space-y-3">
        <li className="font-semibold"><a href="#facts" className="text-teal hover:underline">FACTS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#timeline" className="text-teal hover:underline">Timeline</a></li>
            <li><a href="#key-documents" className="text-teal hover:underline">Key Documents</a></li>
          </ul>
        </li>
        <li className="font-semibold"><a href="#analysis" className="text-orange hover:underline">ANALYSIS</a>
          <ul className="ml-6 mt-2 space-y-1.5 font-normal">
            <li><a href="#what-this-means" className="text-orange hover:underline">What This Means</a></li>
            <li><a href="#who-is-affected" className="text-orange hover:underline">Who's Affected</a></li>
          </ul>
        </li>
      </ul>
    </ContentSidebar>
  }
>

## Facts

This section contains only verifiable, primary-sourced information.

### Timeline

| Date | Event | Source |
|------|-------|--------|
| 2026-01-01 | Event description | [Source Name](url) |
| 2026-01-15 | Another event | [Source Name](url) |

### Key Documents

- **Document Title** (Date)
  - [Full Text (PDF)](url)
  - [Analysis by Organization](url)
  - [News Coverage](url)

[source: Primary Source Document Title](https://example.gov/document)

### Additional Subsections

Add more h3 headings as needed. Common subsections:
- What Happened
- The Legal Framework
- Key Players
- Affected Programs

## Analysis

This section provides context and interpretation of the facts above.

### What This Means

Explain the implications and significance:
- Why this matters
- What changed from before
- What the practical effects are

### Who's Affected

- **Group 1**: How they're impacted
- **Group 2**: How they're impacted
- **Everyone**: Broader societal impacts

### Long-term Implications

Discuss potential future consequences and patterns.

---

## Related Actions

- [Action Title](/act/action-slug) - Brief description
- [Another Action](/act/another-slug) - Brief description

---

**Tags:** `Tag1` `Tag2` `Tag3`

**Last Updated:** Month DD, YYYY

**Sources Verified:** Month DD, YYYY

</MainContentLayout>

</PageContent>
```

---

## Guidelines

### Facts Section

**Include:**
- Dates and timelines
- Direct quotes from official documents
- Links to primary sources (.gov domains, court filings, official statements)
- Verifiable data and statistics

**Avoid:**
- News media as primary sources (use for additional context only)
- Opinion or interpretation (save for Analysis section)
- Unverified claims
- Editorial language

### Analysis Section

**Include:**
- Context and background
- Interpretation of significance
- Expert perspectives (attributed)
- Implications and consequences
- Historical context

**Maintain:**
- Clear distinction from facts
- Balanced perspective
- Accessible language
- Connection to broader themes

### Source Quality

**Priority order:**
1. Federal Register notices
2. Executive orders (WhiteHouse.gov)
3. Court filings and decisions
4. Congressional bills (Congress.gov)
5. Official agency statements (.gov domains)
6. Inspector General reports
7. Academic research
8. Reputable news (for context, not primary sourcing)

### Using the New Simple Syntax

The following markdown headings will be automatically styled:

- `## Quick Summary` → Grey box with "QUICK SUMMARY" heading
- `## Facts` → Teal background section with disclaimer
- `## Analysis` → Orange heading with disclaimer
- `[→ Take Action: Text](/url)` → Orange "ACT NOW" CTA box
- `[← Learn More: Text](/url)` → Teal "LEARN MORE" CTA box
- `[source: Label](url)` → Right-aligned source link

### Tags

Choose tags from established categories:
- **Issue Areas**: Immigration, Healthcare, Press Freedom, Environment, etc.
- **Rights**: First Amendment, Due Process, Equal Protection, Privacy, etc.
- **Agencies**: DOJ, EPA, DHS, HHS, etc.
- **Status**: Ongoing, Resolved, Under Litigation, Historical
- **Scope**: Federal, State, Local

---

## Checklist Before Publishing

- [ ] All factual claims have primary source citations
- [ ] Dates are accurate and properly formatted
- [ ] Links to sources are working
- [ ] Facts and Analysis sections are clearly separated
- [ ] Related action pages are linked
- [ ] Tags are appropriate and consistent with other pages
- [ ] lastUpdated date is current
- [ ] Page has been tested in local development
- [ ] Sidebar navigation matches actual h2/h3 structure
