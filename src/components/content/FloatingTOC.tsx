'use client'

import { useState, useEffect } from 'react'

interface TOCItem {
  id: string
  text: string
  level: number
}

export function FloatingTOC() {
  const [isOpen, setIsOpen] = useState(false)
  const [headings, setHeadings] = useState<TOCItem[]>([])
  const [isVisible, setIsVisible] = useState(false)

  // Collect headings from the page
  useEffect(() => {
    const elements = document.querySelectorAll('h2[id], h3[id]')
    const items: TOCItem[] = Array.from(elements).map(el => ({
      id: el.id,
      text: el.textContent || '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))
    setHeadings(items)
  }, [])

  // Show button after scrolling past the first screen
  useEffect(() => {
    function handleScroll() {
      setIsVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (headings.length === 0) return null

  return (
    <>
      {/* Floating button - only on mobile, only after scrolling */}
      <button
        onClick={() => setIsOpen(true)}
        className={`md:hidden fixed bottom-6 right-4 z-50 w-12 h-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center transition-all ${
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
        <div className="md:hidden fixed inset-0 z-50">
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
              {headings.map((heading) => (
                <a
                  key={heading.id}
                  href={`#${heading.id}`}
                  onClick={() => setIsOpen(false)}
                  className={`block py-2.5 text-sm border-b border-gray-100 last:border-0 ${
                    heading.level === 3 ? 'pl-4 text-gray-600' : 'font-medium text-gray-900'
                  }`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
