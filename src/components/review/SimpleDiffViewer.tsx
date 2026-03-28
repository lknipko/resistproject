'use client'

/**
 * SimpleDiffViewer Component
 *
 * Unified diff viewer with collapsed unchanged sections.
 * Shows additions in green, deletions in red, and collapses
 * unchanged lines between changes for easy scanning.
 */

import { useState, useMemo } from 'react'
import { diffLines, Change } from 'diff'

const CONTEXT_LINES = 3

interface SimpleDiffViewerProps {
  originalContent: string
  proposedContent: string
}

type LineType = 'added' | 'removed' | 'context'

interface DiffLine {
  type: LineType
  content: string
}

interface DiffHunk {
  kind: 'lines'
  lines: DiffLine[]
}

interface CollapsedHunk {
  kind: 'collapsed'
  lines: string[]
}

type Hunk = DiffHunk | CollapsedHunk

export function SimpleDiffViewer({
  originalContent,
  proposedContent,
}: SimpleDiffViewerProps) {
  const hunks = useMemo(() => {
    const normalizeLineEndings = (text: string) =>
      text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

    const normalizedOriginal = normalizeLineEndings(originalContent)
    const normalizedProposed = normalizeLineEndings(proposedContent)

    const changes = diffLines(normalizedOriginal, normalizedProposed)

    return buildHunks(changes)
  }, [originalContent, proposedContent])

  if (hunks.length === 0) {
    return (
      <div className="border border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
        No changes detected
      </div>
    )
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-100 border-b border-gray-300 px-4 py-2 font-semibold text-sm text-gray-700">
        Changes
      </div>
      <div className="font-mono text-sm overflow-x-auto">
        {hunks.map((hunk, i) =>
          hunk.kind === 'collapsed' ? (
            <CollapsedSection key={i} lines={hunk.lines} />
          ) : (
            <div key={i}>
              {hunk.lines.map((line, j) => (
                <div key={j} className={lineClass(line.type)}>
                  <span className="select-none text-gray-400 w-6 inline-block text-right mr-2 shrink-0">
                    {line.type === 'removed' ? '-' : line.type === 'added' ? '+' : ' '}
                  </span>
                  <span className="whitespace-pre-wrap break-all">
                    {line.content || '\u00A0'}
                  </span>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  )
}

function CollapsedSection({ lines }: { lines: string[] }) {
  const [expanded, setExpanded] = useState(false)

  if (expanded) {
    return (
      <div>
        {lines.map((line, i) => (
          <div key={i} className="px-3 py-0.5 text-gray-600 bg-gray-50 flex">
            <span className="select-none text-gray-400 w-6 inline-block text-right mr-2 shrink-0">
              {' '}
            </span>
            <span className="whitespace-pre-wrap break-all">{line || '\u00A0'}</span>
          </div>
        ))}
        <button
          onClick={() => setExpanded(false)}
          className="w-full py-1 px-3 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs text-center border-y border-gray-200 transition-colors"
        >
          ··· collapse ···
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setExpanded(true)}
      className="w-full py-1.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-500 text-xs text-center border-y border-gray-200 transition-colors"
    >
      ··· {lines.length} unchanged line{lines.length !== 1 ? 's' : ''} ···
    </button>
  )
}

function lineClass(type: LineType): string {
  switch (type) {
    case 'added':
      return 'bg-green-50 text-green-800 px-3 py-0.5 flex'
    case 'removed':
      return 'bg-red-50 text-red-800 px-3 py-0.5 flex'
    case 'context':
      return 'px-3 py-0.5 text-gray-700 flex'
  }
}

/**
 * Converts raw diff Changes into hunks with collapsed unchanged sections.
 *
 * Each change from the diff library can be 'added', 'removed', or unchanged.
 * We split unchanged blocks into context lines (3 before/after each change)
 * and collapsed sections for the rest.
 */
function buildHunks(changes: Change[]): Hunk[] {
  // First, flatten all changes into individual lines with types
  const allLines: DiffLine[] = []

  for (const change of changes) {
    const lines = splitLines(change.value)
    const type: LineType = change.added ? 'added' : change.removed ? 'removed' : 'context'
    for (const line of lines) {
      allLines.push({ type, content: line })
    }
  }

  if (allLines.length === 0) return []

  // Find indices of all changed lines
  const changedIndices: number[] = []
  for (let i = 0; i < allLines.length; i++) {
    if (allLines[i].type !== 'context') {
      changedIndices.push(i)
    }
  }

  // If no changes, show a single collapsed section
  if (changedIndices.length === 0) {
    const contextLines = allLines.map((l) => l.content)
    return [{ kind: 'collapsed', lines: contextLines }]
  }

  // Determine which context lines to show (within CONTEXT_LINES of a change)
  const visibleSet = new Set<number>()
  for (const idx of changedIndices) {
    visibleSet.add(idx)
    for (let d = 1; d <= CONTEXT_LINES; d++) {
      if (idx - d >= 0) visibleSet.add(idx - d)
      if (idx + d < allLines.length) visibleSet.add(idx + d)
    }
  }

  // Build hunks by grouping consecutive visible lines and collapsing the rest
  const hunks: Hunk[] = []
  let i = 0

  while (i < allLines.length) {
    if (visibleSet.has(i)) {
      // Gather consecutive visible lines into a DiffHunk
      const lines: DiffLine[] = []
      while (i < allLines.length && visibleSet.has(i)) {
        lines.push(allLines[i])
        i++
      }
      hunks.push({ kind: 'lines', lines })
    } else {
      // Gather consecutive non-visible (unchanged) lines into a CollapsedHunk
      const lines: string[] = []
      while (i < allLines.length && !visibleSet.has(i)) {
        lines.push(allLines[i].content)
        i++
      }
      if (lines.length > 0) {
        hunks.push({ kind: 'collapsed', lines })
      }
    }
  }

  return hunks
}

/**
 * Split a change value into lines, removing the trailing empty string
 * that results from a final newline.
 */
function splitLines(value: string): string[] {
  const lines = value.split('\n')
  // Remove trailing empty string from final newline
  if (lines.length > 0 && lines[lines.length - 1] === '') {
    lines.pop()
  }
  return lines
}
