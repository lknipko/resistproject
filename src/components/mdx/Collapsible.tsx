'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CollapsibleProps {
  title: string
  level: 'h2' | 'h3' | 'h4' | 'li'
  section?: 'learn' | 'act'
  children: React.ReactNode
  defaultOpen?: boolean
}

export function Collapsible({
  title,
  level,
  section = 'learn',
  children,
  defaultOpen = false
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const contentId = `collapsible-${title.replace(/\s+/g, '-').toLowerCase()}`

  // Section-based accent colors
  const accentColor = section === 'learn' ? 'text-teal-600' : 'text-orange-600'
  const borderColor = section === 'learn' ? 'border-teal-500' : 'border-orange-500'
  const hoverColor = section === 'learn' ? 'hover:text-teal-700' : 'hover:text-orange-700'

  // Font sizes and styling based on level (matches regular headings/list items)
  const headingStyles = {
    h2: 'text-2xl md:text-3xl font-bold text-gray-900 mt-12 mb-6',
    h3: 'text-xl font-bold text-gray-900 mt-8 mb-4',
    h4: 'text-base font-semibold text-gray-800 mt-6 mb-2',
    li: 'text-base text-gray-800 mb-2'
  }

  // Indentation for expanded content
  const contentIndent = {
    h2: 'ml-4 md:ml-6',
    h3: 'ml-6 md:ml-8',
    h4: 'ml-8 md:ml-10',
    li: 'ml-6 md:ml-8'
  }

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    }
  }

  // Use li tag for list items, div for headings
  const WrapperTag = level === 'li' ? 'li' : 'div'
  const wrapperClass = level === 'li' ? 'list-none' : 'my-4'

  return (
    <WrapperTag className={wrapperClass}>
      {/* Header - looks like a regular heading/list item with chevron */}
      <button
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={contentId}
        className={cn(
          'w-full flex items-center gap-2 text-left cursor-pointer transition-colors group',
          headingStyles[level],
          hoverColor
        )}
        tabIndex={0}
      >
        {/* Chevron icon */}
        <svg
          className={cn(
            'w-4 h-4 transition-transform duration-200 flex-shrink-0',
            accentColor,
            isOpen && 'rotate-90'
          )}
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
        {/* Title with hover underline */}
        <span className="group-hover:underline">{title}</span>
      </button>

      {/* Expanded content with subtle left border and indent */}
      <div
        id={contentId}
        className={cn(
          'overflow-hidden transition-all duration-300',
          isOpen ? 'max-h-[10000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={cn(
          'pt-2 pb-4 pl-6 border-l-2',
          borderColor,
          contentIndent[level],
          '[&_.outdent]:ml-0 [&_h2.outdent]:ml-0 [&_h3.outdent]:ml-0'
        )}>
          {children}
        </div>
      </div>
    </WrapperTag>
  )
}
