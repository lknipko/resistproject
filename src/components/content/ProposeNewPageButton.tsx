'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EditProposalModal } from './EditProposalModal'

interface ProposeNewPageButtonProps {
  section: 'learn' | 'act'
}

const NEW_PAGE_TEMPLATES = {
  learn: `# [Page Title]

## Quick Summary

**Key Point:** Brief one-sentence summary of this issue.

Additional context about why this matters and what happened.

[→ Take Action: Related Action Page Title](/act/action-slug)

## Facts

### Timeline

| Date | Event | Source |
|------|-------|--------|
| 2025-XX-XX | What happened | [source: Document Title](https://example.gov/document) |
| 2025-XX-XX | Additional event | [source: Document Title](https://example.gov/document) |

### Key Documents

- **Document Title** (Date)
  - [source: Full Document (PDF)](https://example.gov/document.pdf)
  - [source: Official Summary](https://example.gov/summary)

### Key Points

- Important fact with inline citation [source: Document Title](https://example.gov)
- Another important fact [source: Document Title](https://example.gov)

## Analysis

### What This Means

Explanation of the implications and context. This section provides interpretation
of the facts above.

### Who's Affected

- **Group 1**: How they're impacted
- **Group 2**: How they're impacted
- **Group 3**: How they're impacted

### Legal/Policy Context

Background on relevant laws, policies, or precedents that provide context.

---

## Related Actions

- [Action Title](/act/slug) - Brief description
- [Another Action](/act/slug) - Brief description
`,
  act: `# [Action Title]

## Quick Summary

**Goal:** One-sentence description of what this action accomplishes.

Brief explanation of why this action is important and what impact it will have.

[← Learn More: Related Learn Page Title](/learn/topic-slug)

## Quick Actions

### Call Your Representatives

**Script:**
"Hello, my name is [NAME] and I'm calling from [CITY, STATE]. I'm calling to urge [REPRESENTATIVE NAME] to [SPECIFIC ASK]."

**Find Your Representatives:**
- House: https://www.house.gov/representatives/find-your-representative
- Senate: https://www.senate.gov/senators/senators-contact.htm

### Send an Email

**Template:**
Dear [REPRESENTATIVE],

[Your message here - explain the issue and your specific ask]

Sincerely,
[Your name]
[Your city, state]

### Share on Social Media

**Sample Post:**
"[Your call to action with relevant hashtags]"

## Sustained Actions

### Join Organizations

- **Organization Name** ([Website](https://example.org))
  - What they do and how to get involved
  - Contact information or sign-up link

### Attend Events

Information about upcoming protests, town halls, community meetings, or other
relevant events.

### Submit Public Comments

Instructions for submitting formal comments to government agencies about
proposed regulations or policies.

## Resources

- Downloadable flyers and graphics (coming soon)
- Talking points document
- Additional reading: [source: Title](https://example.com)

---

## Related Topics

- [Learn Page Title](/learn/slug) - Context about this issue
- [Another Learn Page](/learn/slug) - Related background
`
}

export function ProposeNewPageButton({ section }: ProposeNewPageButtonProps) {
  const { data: session, status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (status === 'loading') {
    return null
  }

  if (!session) {
    return (
      <button
        onClick={() => window.location.href = '/auth/signin?callbackUrl=' + window.location.pathname}
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Sign In to Propose New Page
      </button>
    )
  }

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-md transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Propose New Page
      </button>

      {isModalOpen && (
        <EditProposalModal
          section={section}
          slug="new-page"
          currentContent={NEW_PAGE_TEMPLATES[section]}
          isNewPage={true}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
