'use client'

import { useState, Children, isValidElement, ReactNode } from 'react'

interface CallScriptGroupProps {
  /** JSON-encoded array of labels for each call script */
  labels?: string
  children?: ReactNode
}

/**
 * CallScriptGroup Component
 *
 * Wraps multiple CallRepButton components in an accordion-style picker.
 * Only one call script is visible at a time, reducing scroll on mobile.
 * First script is expanded by default.
 *
 * The remark plugin automatically wraps consecutive h3 + CallRepButton
 * pairs in this component, passing the h3 text as labels.
 */
export function CallScriptGroup({ labels, children }: CallScriptGroupProps) {
  const [openIndex, setOpenIndex] = useState(0)

  const parsedLabels: string[] = labels ? JSON.parse(labels) : []
  const templates = Children.toArray(children).filter(isValidElement)

  if (templates.length <= 1) {
    // Single script, no need for accordion
    return <>{children}</>
  }

  return (
    <div className="my-6 space-y-2">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
          {templates.length} call scripts
        </span>
        <span className="text-xs text-gray-400">— select a topic below</span>
      </div>
      {templates.map((child, index) => {
        const label = parsedLabels[index] || `Call Script ${index + 1}`
        const isOpen = index === openIndex

        return (
          <div key={index}>
            {/* Accordion header */}
            <button
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              className={`w-full flex items-center justify-between p-3 md:p-4 text-left transition-colors rounded-lg ${
                isOpen
                  ? 'bg-orange-50'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium ${isOpen ? 'text-orange-900' : 'text-gray-700'}`}>
                {label}
              </span>
              <svg
                className={`w-5 h-5 flex-shrink-0 ml-2 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-orange-600' : 'text-gray-400'
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Accordion content - renders at full width */}
            {isOpen && child}
          </div>
        )
      })}
    </div>
  )
}
