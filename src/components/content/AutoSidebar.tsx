'use client'

import { useEffect, useState, useMemo } from 'react'
import { ContentSidebar } from './ContentSidebar'

interface TOCItem {
  id: string
  text: string
  level: number
}

type Group = { h2: TOCItem; h3s: TOCItem[] }

export function AutoSidebar() {
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Scan headings from DOM
  useEffect(() => {
    function scanHeadings() {
      const elements = document.querySelectorAll('h2[id], h3[id], [data-toc-level][id]')
      const seen = new Set<string>()
      const items: TOCItem[] = []

      for (const el of elements) {
        if (!el.id || seen.has(el.id)) continue
        seen.add(el.id)

        let level: number
        const tocLevel = el.getAttribute('data-toc-level')
        if (tocLevel) {
          level = tocLevel === 'h2' ? 2 : 3
        } else {
          level = el.tagName === 'H2' ? 2 : 3
        }

        let text = ''
        const button = el.querySelector('button')
        if (button) {
          const span = button.querySelector('span')
          text = span?.textContent || button.textContent?.replace(/^[▸▾]\s*/, '') || ''
        } else {
          text = el.textContent?.replace(/^[▸▾]\s*/, '') || ''
        }

        if (text) items.push({ id: el.id, text, level })
      }
      return items
    }

    const items = scanHeadings()
    if (items.length > 0) {
      setHeadings(items)
      return
    }

    const delays = [100, 300, 800, 1500]
    const timers = delays.map(delay =>
      setTimeout(() => {
        const found = scanHeadings()
        if (found.length > 0) setHeadings(found)
      }, delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [])

  // Group h3s under their preceding h2
  const grouped = useMemo<Group[]>(() => {
    const result: Group[] = []
    let current: Group | null = null
    for (const heading of headings) {
      if (heading.level === 2) {
        current = { h2: heading, h3s: [] }
        result.push(current)
      } else if (heading.level === 3 && current) {
        current.h3s.push(heading)
      }
    }
    return result
  }, [headings])

  // Track active h2 section via scroll position
  useEffect(() => {
    if (grouped.length === 0) return

    function updateActive() {
      const OFFSET = 130 // px from top — accounts for sticky header
      let active = grouped[0].h2.id
      for (const group of grouped) {
        const el = document.getElementById(group.h2.id)
        if (el && el.getBoundingClientRect().top <= OFFSET) {
          active = group.h2.id
        }
      }
      setActiveId(active)
    }

    window.addEventListener('scroll', updateActive, { passive: true })
    updateActive()
    return () => window.removeEventListener('scroll', updateActive)
  }, [grouped])

  if (headings.length === 0) return null

  const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isActPage = pathname.startsWith('/act')
  const isEnvironmentPage = pathname.startsWith('/ourhome')

  return (
    <ContentSidebar>
      <ul className="space-y-0.5">
        {grouped.map((group) => {
          const text = group.h2.text
          const isFactsHeading = text.toLowerCase() === 'facts'
          const isAnalysisHeading = text.toLowerCase().includes('analysis')
          const isActionHeading =
            text.toLowerCase().includes('action') ||
            text.toLowerCase().includes('sustained') ||
            text.toLowerCase().includes('resources')

          // Text color classes for h2 link
          let h2Color: string
          let dotBg: string
          if (isEnvironmentPage) {
            if (isFactsHeading) {
              h2Color = 'text-steel-600 hover:text-steel-700'
              dotBg = 'bg-steel-600'
            } else if (isAnalysisHeading) {
              h2Color = 'text-orange hover:text-orange-dark'
              dotBg = 'bg-orange'
            } else if (isActionHeading) {
              h2Color = 'text-forest-700 hover:text-forest-800'
              dotBg = 'bg-forest-700'
            } else {
              h2Color = 'text-teal hover:text-teal-dark'
              dotBg = 'bg-teal'
            }
          } else if (isActPage) {
            h2Color = 'text-orange hover:text-orange-dark'
            dotBg = 'bg-orange'
          } else if (isAnalysisHeading || isActionHeading) {
            h2Color = 'text-orange hover:text-orange-dark'
            dotBg = 'bg-orange'
          } else {
            h2Color = 'text-teal hover:text-teal-dark'
            dotBg = 'bg-teal'
          }

          const isActive = activeId === group.h2.id
          const isExpanded = isActive || hoveredId === group.h2.id
          const displayText = isFactsHeading
            ? 'FACTS'
            : text.toLowerCase() === 'analysis'
            ? 'ANALYSIS'
            : text

          return (
            <li
              key={group.h2.id}
              onMouseEnter={() => setHoveredId(group.h2.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="py-1"
            >
              {/* h2 row: dot + label */}
              <div className="flex items-center gap-1.5">
                {/* Active indicator dot — always occupies space to prevent layout shift */}
                <span
                  aria-hidden="true"
                  className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200 ${dotBg} ${
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75'
                  }`}
                />
                <a
                  href={`#${group.h2.id}`}
                  className={`font-semibold text-sm leading-snug transition-colors ${h2Color} ${
                    isActive ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {displayText}
                </a>
              </div>

              {/* h3 subheadings — slide in/out */}
              {group.h3s.length > 0 && (
                <ul
                  className={`overflow-hidden transition-all duration-200 ease-in-out ${
                    isExpanded ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0 mt-0'
                  }`}
                >
                  {group.h3s.map((h3) => (
                    <li key={h3.id}>
                      <a
                        href={`#${h3.id}`}
                        className={`block py-0.5 pl-4 text-xs leading-snug transition-colors ${h2Color} opacity-80 hover:opacity-100`}
                      >
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
