'use client'

import { useEffect, useState } from 'react'
import { ContentSidebar } from './ContentSidebar'

interface TOCItem {
  id: string
  text: string
  level: number
}

export function AutoSidebar() {
  const [headings, setHeadings] = useState<TOCItem[]>([])

  useEffect(() => {
    // Small delay to let MDX content render and rehype-slug assign IDs
    const timer = setTimeout(() => {
      const elements = document.querySelectorAll('h2[id], h3[id]')
      const items: TOCItem[] = Array.from(elements).map(el => ({
        id: el.id,
        text: el.textContent?.replace(/^[▸▾]\s*/, '') || '',
        level: el.tagName === 'H2' ? 2 : 3,
      }))
      setHeadings(items)
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  if (headings.length === 0) return null

  // Group h3s under their preceding h2
  const grouped: { h2: TOCItem; h3s: TOCItem[] }[] = []
  let currentGroup: { h2: TOCItem; h3s: TOCItem[] } | null = null

  for (const heading of headings) {
    if (heading.level === 2) {
      currentGroup = { h2: heading, h3s: [] }
      grouped.push(currentGroup)
    } else if (heading.level === 3 && currentGroup) {
      currentGroup.h3s.push(heading)
    }
  }

  // Determine page type from the URL or from the page header element
  const isActPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/act')

  return (
    <ContentSidebar>
      <ul className="space-y-3">
        {grouped.map((group) => {
          const text = group.h2.text
          const isFactsHeading = text.toLowerCase() === 'facts'
          const isAnalysisOrAction = text.toLowerCase().includes('analysis') ||
            text.toLowerCase().includes('action') ||
            text.toLowerCase().includes('sustained') ||
            text.toLowerCase().includes('resources')

          // Learn pages: facts=teal, analysis=orange
          // Act pages: everything orange
          let colorClass: string
          if (isActPage) {
            colorClass = 'text-orange hover:underline'
          } else if (isAnalysisOrAction) {
            colorClass = 'text-orange hover:underline'
          } else {
            colorClass = 'text-teal hover:underline'
          }

          return (
            <li key={group.h2.id} className="font-semibold">
              <a href={`#${group.h2.id}`} className={colorClass}>
                {isFactsHeading ? 'FACTS' : text.toLowerCase() === 'analysis' ? 'ANALYSIS' : text}
              </a>
              {group.h3s.length > 0 && (
                <ul className="ml-6 mt-2 space-y-1.5 font-normal">
                  {group.h3s.map((h3) => (
                    <li key={h3.id}>
                      <a href={`#${h3.id}`} className={colorClass}>
                        {h3.text}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </ContentSidebar>
  )
}
