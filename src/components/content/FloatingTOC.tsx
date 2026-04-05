'use client'

import { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'

interface TOCItem {
  id: string
  text: string
  level: number
  isAction?: boolean
}

type Group = { h2: TOCItem; h3s: TOCItem[] }

export function FloatingTOC() {
  const [isOpen, setIsOpen] = useState(false)
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [isVisible, setIsVisible] = useState(false)
  const [activeId, setActiveId] = useState<string>('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const pathname = usePathname()
  const isEnvironment = pathname.startsWith('/ourhome')

  // Collect headings from the page
  useEffect(() => {
    const elements = document.querySelectorAll('h2[id], h3[id]')
    const ACTION_IDS = ['quick-actions', 'sustained-actions', 'resources']
    let inActionSection = false
    const items: TOCItem[] = Array.from(elements).map(el => {
      const id = el.id
      const level = el.tagName === 'H2' ? 2 : 3
      if (level === 2) {
        inActionSection = ACTION_IDS.includes(id)
      }
      return {
        id,
        text: el.textContent || '',
        level,
        isAction: inActionSection,
      }
    })
    setHeadings(items)
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
        current.h3s.push(heading as TOCItem)
      }
    }
    return result
  }, [headings])

  // Track active section via scroll
  useEffect(() => {
    if (grouped.length === 0) return
    function updateActive() {
      const OFFSET = 130
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

  // Show button after scrolling past the first screen
  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Sync expandedId with activeId when panel opens
  useEffect(() => {
    if (isOpen) setExpandedId(activeId || null)
  }, [isOpen, activeId])

  if (headings.length === 0) return null

  return (
    <>
      {/* Floating button - only on mobile, only after scrolling */}
      <button
        onClick={() => setIsOpen(true)}
        className={`lg:hidden fixed bottom-6 right-4 z-50 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all ${
          isVisible ? 'opacity-90 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Table of contents"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
        </svg>
      </button>

      {/* Slide-up panel */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          {/* Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl max-h-[70vh] overflow-y-auto animate-slide-up">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-bold text-gray-900">Contents</h3>
              <button onClick={() => setIsOpen(false)} className="p-1 text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="px-4 py-3">
              {grouped.map((group) => {
                const isActive = activeId === group.h2.id
                const isExpanded = expandedId === group.h2.id
                const actionColor = isEnvironment && group.h2.isAction
                const h2Class = actionColor ? 'font-semibold text-forest-700' : 'font-semibold text-gray-900'
                const h3Class = actionColor ? 'text-forest-600' : 'text-gray-600'

                return (
                  <div key={group.h2.id} className="border-b border-gray-100 last:border-0">
                    {/* h2 row */}
                    <button
                      className={`w-full text-left py-2.5 flex items-center gap-2 ${h2Class}`}
                      onClick={() => setExpandedId(isExpanded ? null : group.h2.id)}
                    >
                      {/* Active dot */}
                      <span
                        className={`shrink-0 w-1.5 h-1.5 rounded-full transition-all ${
                          isActive
                            ? actionColor ? 'bg-forest-600' : 'bg-gray-700'
                            : 'opacity-0 bg-gray-400'
                        }`}
                        aria-hidden="true"
                      />
                      <a
                        href={`#${group.h2.id}`}
                        onClick={() => setIsOpen(false)}
                        className="flex-1 text-sm"
                      >
                        {group.h2.text}
                      </a>
                      {group.h3s.length > 0 && (
                        <svg
                          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>

                    {/* h3 subheadings */}
                    {group.h3s.length > 0 && (
                      <ul
                        className={`overflow-hidden transition-all duration-200 ease-in-out ${
                          isExpanded ? 'max-h-96 opacity-100 pb-2' : 'max-h-0 opacity-0'
                        }`}
                      >
                        {group.h3s.map((h3) => (
                          <li key={h3.id}>
                            <a
                              href={`#${h3.id}`}
                              onClick={() => setIsOpen(false)}
                              className={`block py-1.5 pl-6 text-sm ${h3Class}`}
                            >
                              {h3.text}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
