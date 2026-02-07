/**
 * Diff Generation Utility
 *
 * Generates and parses diffs for edit proposals.
 * Uses the 'diff' library to create line-by-line diffs.
 */

import { diffLines, Change } from 'diff'

/**
 * Generate a diff between original and proposed content.
 * Returns a JSON string that can be stored in the database.
 *
 * @param original - Original content
 * @param proposed - Proposed content
 * @returns JSON string representation of diff
 */
export function generateDiff(original: string, proposed: string): string {
  const diff = diffLines(original, proposed)
  return JSON.stringify(diff)
}

/**
 * Parse a diff JSON string back into Change objects.
 *
 * @param diffContent - JSON string from database
 * @returns Array of Change objects
 */
export function parseDiff(diffContent: string): Change[] {
  try {
    return JSON.parse(diffContent) as Change[]
  } catch (error) {
    console.error('Error parsing diff content:', error)
    return []
  }
}

/**
 * Get a summary of changes from a diff.
 * Useful for displaying stats like "5 lines added, 3 lines removed".
 *
 * @param diffContent - JSON string from database
 * @returns Summary object with added/removed/unchanged counts
 */
export function getDiffSummary(diffContent: string): {
  linesAdded: number
  linesRemoved: number
  linesUnchanged: number
  totalChanges: number
} {
  const changes = parseDiff(diffContent)

  let linesAdded = 0
  let linesRemoved = 0
  let linesUnchanged = 0

  changes.forEach(change => {
    const lineCount = change.value.split('\n').length - 1

    if (change.added) {
      linesAdded += lineCount
    } else if (change.removed) {
      linesRemoved += lineCount
    } else {
      linesUnchanged += lineCount
    }
  })

  return {
    linesAdded,
    linesRemoved,
    linesUnchanged,
    totalChanges: linesAdded + linesRemoved
  }
}

/**
 * Check if a diff represents a significant change.
 * Helps filter out trivial edits.
 *
 * @param diffContent - JSON string from database
 * @param minChanges - Minimum number of changed lines (default: 1)
 * @returns True if change is significant
 */
export function isSignificantChange(diffContent: string, minChanges: number = 1): boolean {
  const summary = getDiffSummary(diffContent)
  return summary.totalChanges >= minChanges
}
