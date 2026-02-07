'use client'

/**
 * DiffViewer Component
 *
 * Displays side-by-side diff comparison of original vs proposed content.
 * Uses custom implementation to avoid Next.js Web Worker issues.
 */

import { SimpleDiffViewer } from './SimpleDiffViewer'

interface DiffViewerProps {
  originalContent: string
  proposedContent: string
  splitView?: boolean
}

export function DiffViewer({
  originalContent,
  proposedContent,
  splitView = true
}: DiffViewerProps) {
  return (
    <SimpleDiffViewer
      originalContent={originalContent}
      proposedContent={proposedContent}
      splitView={splitView}
    />
  )
}

/**
 * Unified (single column) diff viewer for mobile
 */
export function UnifiedDiffViewer({
  originalContent,
  proposedContent
}: Omit<DiffViewerProps, 'splitView'>) {
  return (
    <DiffViewer
      originalContent={originalContent}
      proposedContent={proposedContent}
      splitView={false}
    />
  )
}
