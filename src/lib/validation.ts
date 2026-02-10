/**
 * Edit Validation Utility
 *
 * Validates edit proposals before submission.
 * Checks: edit size, profanity, links, source quality, markdown validity.
 */

import { diffWords } from 'diff'
import Filter from 'bad-words'

// Initialize profanity filter
const profanityFilter = new Filter()

export interface ValidationParams {
  originalContent: string
  proposedContent: string
  editSummary: string
  editType: 'content' | 'sources' | 'formatting' | 'metadata'
}

export interface ValidationResult {
  passed: boolean
  errors: string[]
  warnings: string[]
  details: {
    changedWords?: number
    linkCount?: number
    govLinkCount?: number
    editType?: string
  }
}

/**
 * Custom words to add to profanity filter.
 * The bad-words library handles most profanity, but we add spam-related terms.
 */
const CUSTOM_BAD_WORDS = [
  'spam',
  'scam',
  'viagra',
  'casino',
  'porn',
]

// Add custom words to filter
profanityFilter.addWords(...CUSTOM_BAD_WORDS)

/**
 * Suspicious URL patterns that might indicate spam or phishing.
 */
const SUSPICIOUS_URL_PATTERNS = [
  /bit\.ly/i,
  /tinyurl/i,
  /goo\.gl/i,
  /t\.co/i,
  /rebrand\.ly/i,
  /ow\.ly/i
]

/**
 * Validate an edit proposal before submission.
 *
 * @param params - Validation parameters
 * @returns ValidationResult with passed status, errors, and warnings
 */
export function validateEditProposal(params: ValidationParams): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const details: ValidationResult['details'] = {}

  const { originalContent, proposedContent, editSummary, editType } = params

  // 1. Edit summary validation
  if (!editSummary || editSummary.trim().length < 10) {
    errors.push('Edit summary must be at least 10 characters')
  }

  if (editSummary && editSummary.length > 500) {
    errors.push('Edit summary must be less than 500 characters')
  }

  // 2. Minimum change size
  const changes = diffWords(originalContent, proposedContent)
  const changedWords = changes.filter(c => c.added || c.removed).length
  details.changedWords = changedWords

  // Removed minimum word requirement to allow single-word corrections
  // if (changedWords < 3) {
  //   errors.push('Edit too small - must change at least 3 words')
  // }

  // 3. Maximum change size (prevent vandalism)
  const originalLength = originalContent.length
  const proposedLength = proposedContent.length

  if (proposedLength > originalLength * 3) {
    warnings.push('Edit more than triples the page length - may need review')
  }

  if (proposedLength < originalLength * 0.3 && originalLength > 100) {
    warnings.push('Edit removes more than 70% of content - may need review')
  }

  // 4. Profanity filter (using bad-words library)
  if (profanityFilter.isProfane(proposedContent)) {
    errors.push('Edit contains inappropriate language')
  }

  // Also check edit summary for profanity
  if (profanityFilter.isProfane(editSummary)) {
    errors.push('Edit summary contains inappropriate language')
  }

  // 5. Link validation
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  const links = [...proposedContent.matchAll(linkPattern)]
  details.linkCount = links.length

  for (const [fullMatch, text, url] of links) {
    // Check for valid URL format
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      warnings.push(`Suspicious link format: ${url}`)
    }

    // Check for URL shorteners (potential spam)
    for (const pattern of SUSPICIOUS_URL_PATTERNS) {
      if (pattern.test(url)) {
        warnings.push(`URL shortener detected: ${url} - prefer direct links`)
        break
      }
    }

    // Check for empty link text
    if (!text || text.trim().length === 0) {
      warnings.push('Link has empty text - provide descriptive text')
    }
  }

  // 6. Source quality check (for "sources" edit type)
  if (editType === 'sources') {
    const govLinks = (proposedContent.match(/\.gov/g) || []).length
    const eduLinks = (proposedContent.match(/\.edu/g) || []).length
    const orgLinks = (proposedContent.match(/\.org/g) || []).length

    details.govLinkCount = govLinks

    if (links.length > 0 && govLinks === 0 && eduLinks === 0) {
      warnings.push('No .gov or .edu sources found - consider adding primary sources')
    }

    if (govLinks > 0) {
      // Award points for using government sources (could be used for reputation later)
      details.govLinkCount = govLinks
    }
  }

  // 7. Markdown validity
  try {
    // Check balanced brackets
    const openBrackets = (proposedContent.match(/\[/g) || []).length
    const closeBrackets = (proposedContent.match(/\]/g) || []).length

    if (openBrackets !== closeBrackets) {
      warnings.push('Unbalanced markdown brackets - check formatting')
    }

    // Check balanced parentheses in links
    const openParens = (proposedContent.match(/\(/g) || []).length
    const closeParens = (proposedContent.match(/\)/g) || []).length

    if (openParens !== closeParens) {
      warnings.push('Unbalanced parentheses - check link formatting')
    }
  } catch (e) {
    warnings.push('Could not validate markdown formatting')
  }

  // 8. Check for HTML tags (not allowed in markdown)
  const htmlTagPattern = /<(?!\/?(PageHeader|PageContent|TopSection|QuickSummary|ActNowBox|LearnMoreBox|FactsSection|AnalysisSection|MainContentLayout|ContentSidebar|SourceLink|RelatedActions|CallScript|ContactInfo))[a-z][\s\S]*?>/gi
  const htmlTags = proposedContent.match(htmlTagPattern)

  if (htmlTags && htmlTags.length > 0) {
    warnings.push('HTML tags detected - use markdown formatting instead (unless using custom MDX components)')
  }

  // 9. Check for very long lines (could indicate pasted content without formatting)
  const lines = proposedContent.split('\n')
  const longLines = lines.filter(line => line.length > 500)

  if (longLines.length > 3) {
    warnings.push('Multiple very long lines detected - consider breaking into paragraphs')
  }

  // 10. Check for duplicate content (simple check)
  const words = proposedContent.toLowerCase().split(/\s+/)
  const uniqueWords = new Set(words)

  if (words.length > 50 && uniqueWords.size < words.length * 0.3) {
    warnings.push('High repetition detected - review for duplicate content')
  }

  details.editType = editType

  return {
    passed: errors.length === 0,
    errors,
    warnings,
    details
  }
}

/**
 * Validate edit summary only (quick check).
 *
 * @param editSummary - The edit summary text
 * @returns ValidationResult (simplified)
 */
export function validateEditSummary(editSummary: string): {
  valid: boolean
  error?: string
} {
  if (!editSummary || editSummary.trim().length < 10) {
    return { valid: false, error: 'Edit summary must be at least 10 characters' }
  }

  if (editSummary.length > 500) {
    return { valid: false, error: 'Edit summary must be less than 500 characters' }
  }

  return { valid: true }
}

/**
 * Check if content contains potential spam indicators.
 *
 * @param content - Content to check
 * @returns True if spam indicators detected
 */
export function hasSpamIndicators(content: string): boolean {
  const spamPatterns = [
    /click here/gi,
    /buy now/gi,
    /limited offer/gi,
    /act fast/gi,
    /free money/gi,
    /guaranteed/gi,
    /\$\$\$/g,
    /!!!{3,}/g // Multiple exclamation marks
  ]

  return spamPatterns.some(pattern => pattern.test(content))
}

/**
 * Extract all URLs from content.
 *
 * @param content - Content to extract URLs from
 * @returns Array of URLs
 */
export function extractUrls(content: string): string[] {
  const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g
  const matches = [...content.matchAll(linkPattern)]
  return matches.map(match => match[2])
}

/**
 * Count government (.gov) sources in content.
 *
 * @param content - Content to analyze
 * @returns Number of .gov links
 */
export function countGovSources(content: string): number {
  return (content.match(/\.gov/g) || []).length
}
