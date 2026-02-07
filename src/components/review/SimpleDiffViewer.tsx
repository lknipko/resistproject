'use client'

/**
 * SimpleDiffViewer Component
 *
 * Custom diff viewer that works reliably with Next.js.
 * Displays side-by-side or unified diff view.
 */

import { useMemo } from 'react'
import { diffLines, Change } from 'diff'

interface SimpleDiffViewerProps {
  originalContent: string
  proposedContent: string
  splitView?: boolean
}

export function SimpleDiffViewer({
  originalContent,
  proposedContent,
  splitView = true
}: SimpleDiffViewerProps) {
  const changes = useMemo(() => {
    // Normalize line endings to fix Windows CRLF vs Unix LF issues
    const normalizeLineEndings = (text: string) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    const normalizedOriginal = normalizeLineEndings(originalContent)
    const normalizedProposed = normalizeLineEndings(proposedContent)

    return diffLines(normalizedOriginal, normalizedProposed)
  }, [originalContent, proposedContent])

  if (splitView) {
    return <SplitView changes={changes} />
  }

  return <UnifiedView changes={changes} />
}

function SplitView({ changes }: { changes: Change[] }) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="grid grid-cols-2 bg-gray-100 border-b border-gray-300">
        <div className="px-4 py-2 font-semibold text-sm text-gray-700 border-r border-gray-300">
          Original Content
        </div>
        <div className="px-4 py-2 font-semibold text-sm text-gray-700">
          Proposed Changes
        </div>
      </div>
      <div className="grid grid-cols-2 font-mono text-sm">
        <div className="border-r border-gray-300">
          {changes.map((change, index) => {
            if (change.added) return null // Skip added lines in left column

            const lines = change.value.split('\n').filter((line, i, arr) =>
              i < arr.length - 1 || line !== ''
            )

            return lines.map((line, lineIndex) => (
              <div
                key={`old-${index}-${lineIndex}`}
                className={`px-4 py-1 ${
                  change.removed
                    ? 'bg-red-50 text-red-900'
                    : 'bg-white text-gray-800'
                }`}
              >
                {change.removed && <span className="text-red-600 mr-2">-</span>}
                {line || '\u00A0'}
              </div>
            ))
          })}
        </div>
        <div>
          {changes.map((change, index) => {
            if (change.removed) return null // Skip removed lines in right column

            const lines = change.value.split('\n').filter((line, i, arr) =>
              i < arr.length - 1 || line !== ''
            )

            return lines.map((line, lineIndex) => (
              <div
                key={`new-${index}-${lineIndex}`}
                className={`px-4 py-1 ${
                  change.added
                    ? 'bg-green-50 text-green-900'
                    : 'bg-white text-gray-800'
                }`}
              >
                {change.added && <span className="text-green-600 mr-2">+</span>}
                {line || '\u00A0'}
              </div>
            ))
          })}
        </div>
      </div>
    </div>
  )
}

function UnifiedView({ changes }: { changes: Change[] }) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 font-semibold text-sm text-gray-700">
        Changes
      </div>
      <div className="font-mono text-sm">
        {changes.map((change, index) => {
          const lines = change.value.split('\n').filter((line, i, arr) =>
            i < arr.length - 1 || line !== ''
          )

          return lines.map((line, lineIndex) => (
            <div
              key={`${index}-${lineIndex}`}
              className={`px-4 py-1 ${
                change.added
                  ? 'bg-green-50 text-green-900'
                  : change.removed
                  ? 'bg-red-50 text-red-900'
                  : 'bg-white text-gray-800'
              }`}
            >
              {change.added && <span className="text-green-600 mr-2">+</span>}
              {change.removed && <span className="text-red-600 mr-2">-</span>}
              {!change.added && !change.removed && <span className="text-gray-400 mr-2">\u00A0</span>}
              {line || '\u00A0'}
            </div>
          ))
        })}
      </div>
    </div>
  )
}
