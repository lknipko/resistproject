'use client'

/**
 * DiffViewer Component
 *
 * Unified diff view with collapsed unchanged sections.
 * Mobile-friendly single-pane layout.
 */

import { SimpleDiffViewer } from './SimpleDiffViewer'

interface DiffViewerProps {
  originalContent: string
  proposedContent: string
  /** @deprecated No longer used - always renders unified view */
  splitView?: boolean
}

export function DiffViewer({
  originalContent,
  proposedContent,
}: DiffViewerProps) {
  return (
    <SimpleDiffViewer
      originalContent={originalContent}
      proposedContent={proposedContent}
    />
  )
}

/**
 * Unified (single column) diff viewer
 * @deprecated Use DiffViewer directly - it now always renders unified view
 */
export function UnifiedDiffViewer({
  originalContent,
  proposedContent
}: Omit<DiffViewerProps, 'splitView'>) {
  return (
    <DiffViewer
      originalContent={originalContent}
      proposedContent={proposedContent}
    />
  )
}
