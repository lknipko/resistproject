'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EditProposalModal } from './EditProposalModal'

interface ProposeNewPageButtonProps {
  section: 'learn' | 'act'
}

const NEW_PAGE_TEMPLATES = {
  learn: `# [Page Title]

## Overview
Brief introduction to the topic and why it matters.

## FACTS

### Timeline
- **Date:** What happened
- **Date:** Additional events

### Primary Sources
- [Source Title](URL) - Official government document
- [Source Title](URL) - Court filing or decision

### Key Points
- Important fact with source citation
- Another important fact

## ANALYSIS

### What This Means
Explanation of the implications and context.

### Who's Affected
Description of communities or groups impacted.

### Legal/Policy Context
Background on relevant laws, policies, or precedents.

## Related Resources
- Additional information links
- Expert analysis (attributed)

## Related Actions
Links to ACT pages will be added after approval.
`,
  act: `# [Action Title]

## Overview
What this action is about and why it's important.

## QUICK ACTIONS (< 5 minutes)

### Call Your Representatives
**Script:**
"Hello, my name is [NAME] and I'm calling from [CITY, STATE]. I'm calling to urge [REPRESENTATIVE NAME] to [SPECIFIC ASK]."

**Phone Numbers:**
- Find your representative: https://www.house.gov/representatives/find-your-representative

### Send an Email
**Template:**
Dear [REPRESENTATIVE],

[Your message here]

Sincerely,
[Your name]
[Your city, state]

### Share on Social Media
Sample post: "[Your call to action]"

## SUSTAINED ACTIONS (ongoing, >5 minutes)

### Join Organizations
- **Organization Name** - [Website](URL)
  - What they do and how to get involved

### Attend Events
Information about protests, town halls, or other events.

### Submit Public Comments
How to submit formal comments to government agencies.

## RESOURCES

### Downloadable Materials
- Flyers (PDF)
- Social media graphics
- Talking points

## IMPACT
How this action helps and what success looks like.

## Related Topics
Links to LEARN pages will be added after approval.
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
