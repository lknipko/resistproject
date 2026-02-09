/**
 * Source Link Audit Script
 *
 * Scans all MDX content files for source links and identifies:
 * 1. Root-domain-only links (e.g., https://www.courtlistener.com/ with no specific path)
 * 2. Missing/broken link patterns
 * 3. Links that point to generic homepages instead of specific documents
 *
 * Usage: npx tsx scripts/audit-source-links.ts [--fix] [--file=path]
 */

import * as fs from 'fs'
import * as path from 'path'

const CONTENT_DIR = path.join(__dirname, '..', 'content')

interface LinkIssue {
  file: string
  line: number
  url: string
  label: string
  issue: 'root-domain' | 'missing-path' | 'generic-page' | 'placeholder'
  severity: 'high' | 'medium' | 'low'
  context: 'source-citation' | 'org-link' | 'unknown'
}

// Patterns that indicate a generic/root-domain link
const ROOT_DOMAIN_PATTERNS = [
  /^https?:\/\/[^/]+\/?$/,  // Just domain, no path
  /^https?:\/\/[^/]+\/?\s*$/,  // Domain with trailing whitespace
]

// Known generic pages that should have specific document links
const GENERIC_PAGE_PATTERNS = [
  /^https?:\/\/www\.courtlistener\.com\/?$/,
  /^https?:\/\/www\.whitehouse\.gov\/?$/,
  /^https?:\/\/www\.whitehouse\.gov\/presidential-actions\/?$/,
  /^https?:\/\/oversight\.house\.gov\/?$/,
  /^https?:\/\/www\.hsgac\.senate\.gov\/?$/,
  /^https?:\/\/www\.opm\.gov\/?$/,
  /^https?:\/\/www\.usaid\.gov\/?$/,
  /^https?:\/\/www\.consumerfinance\.gov\/?$/,
  /^https?:\/\/www\.gao\.gov\/?$/,
  /^https?:\/\/www\.heritage\.org\/?$/,
  /^https?:\/\/www\.doi\.gov\/?$/,
  /^https?:\/\/www\.treasury\.gov\/?$/,
  /^https?:\/\/www\.irs\.gov\/?$/,
  /^https?:\/\/www\.ssa\.gov\/?$/,
  /^https?:\/\/www\.faa\.gov\/?$/,
  /^https?:\/\/www\.epa\.gov\/?$/,
  /^https?:\/\/www\.noaa\.gov\/?$/,
  /^https?:\/\/www\.va\.gov\/oig\/?$/,
  /^https?:\/\/www\.intelligence\.senate\.gov\/?$/,
  /^https?:\/\/www\.judiciary\.senate\.gov\/?$/,
  /^https?:\/\/www\.congress\.gov\/?$/,
  /^https?:\/\/www\.whitehouse\.gov\/omb\/?$/,
  /^https?:\/\/www\.whitehouse\.gov\/administration\/?$/,
  /^https?:\/\/www\.afge\.org\/?$/,
  /^https?:\/\/www\.propublica\.org\/?$/,
  /^https?:\/\/www\.usaspending\.gov\/?$/,
  /^https?:\/\/www\.fpds\.gov\/?$/,
  /^https?:\/\/www\.oge\.gov\/?$/,
  /^https?:\/\/www\.ntsb\.gov\/?$/,
]

function classifyLink(url: string): LinkIssue['issue'] | null {
  const trimmedUrl = url.trim()

  // Check for placeholder URLs
  if (trimmedUrl === '#' || trimmedUrl.startsWith('#')) {
    return null // anchor links are fine
  }

  // Check for root domain
  for (const pattern of ROOT_DOMAIN_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return 'root-domain'
    }
  }

  // Check for known generic pages
  for (const pattern of GENERIC_PAGE_PATTERNS) {
    if (pattern.test(trimmedUrl)) {
      return 'generic-page'
    }
  }

  // Check if URL has a meaningful path (more than just /)
  try {
    const parsed = new URL(trimmedUrl)
    if (parsed.pathname === '/' || parsed.pathname === '') {
      return 'root-domain'
    }
    // Check for very short paths that are likely section pages, not documents
    if (parsed.pathname.split('/').filter(Boolean).length === 0) {
      return 'missing-path'
    }
  } catch {
    // Not a valid URL - skip
    return null
  }

  return null
}

function getSeverity(issue: LinkIssue['issue'], url: string): LinkIssue['severity'] {
  if (issue === 'root-domain') return 'high'
  if (issue === 'generic-page') return 'high'
  if (issue === 'missing-path') return 'medium'
  return 'low'
}

// Detect whether a link is a source citation or an intentional org link
function classifyContext(label: string, line: string, currentSection: string): LinkIssue['context'] {
  // Source citation syntax: [source: Label](url)
  if (label.startsWith('source:') || label.startsWith('Source:')) return 'source-citation'

  // Links inside Facts or Analysis sections with evidence-like labels
  if (currentSection === 'facts' || currentSection === 'analysis') return 'source-citation'

  // Links in Resources, Organizations, or Tools sections are intentional org links
  if (currentSection === 'resources' || currentSection === 'organizations' || currentSection === 'tools') return 'org-link'

  // Labels that look like org names (no specific document indicators)
  const orgNamePatterns = [
    /^[A-Z][a-z]+ (Center|Institute|Foundation|Project|Association|Coalition|Union|Society|Committee|Council|Network|Alliance|Trust|Fund)$/i,
    /\((?:ACLU|NAACP|SPLC|CREW|EFF|CPJ|SPJ|POGO|INN|NRA|AFL-CIO|AFGE)\)/,
  ]
  for (const p of orgNamePatterns) {
    if (p.test(label)) return 'org-link'
  }

  return 'unknown'
}

function scanFile(filePath: string): LinkIssue[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')
  const issues: LinkIssue[] = []
  const relativePath = path.relative(CONTENT_DIR, filePath)

  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g

  // Track current section for context
  let currentSection = ''
  const sectionPatterns: [RegExp, string][] = [
    [/^##\s+(Quick\s+)?Summary/i, 'summary'],
    [/^##\s+Facts/i, 'facts'],
    [/^##\s+Analysis/i, 'analysis'],
    [/^##\s+Quick\s+Actions/i, 'actions'],
    [/^##\s+Sustained\s+Actions/i, 'actions'],
    [/^##\s+Resources/i, 'resources'],
    [/^###.*(?:Organizations|Groups|Coalitions)/i, 'organizations'],
    [/^###.*(?:Tools|Websites|Platforms)/i, 'tools'],
    [/^###.*(?:Primary\s+Sources|Sources|Key\s+Documents)/i, 'facts'],
  ]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Update current section based on headings
    for (const [pattern, section] of sectionPatterns) {
      if (pattern.test(line)) {
        currentSection = section
        break
      }
    }

    let match: RegExpExecArray | null

    // Reset regex
    linkRegex.lastIndex = 0

    while ((match = linkRegex.exec(line)) !== null) {
      const label = match[1]
      const url = match[2]

      // Skip internal links
      if (url.startsWith('/') || url.startsWith('#')) continue

      // Skip mailto links
      if (url.startsWith('mailto:')) continue

      const issue = classifyLink(url)
      if (issue) {
        const context = classifyContext(label, line, currentSection)
        // Downgrade severity for intentional org links
        let severity = getSeverity(issue, url)
        if (context === 'org-link') severity = 'low'

        issues.push({
          file: relativePath,
          line: i + 1,
          url,
          label,
          issue,
          severity,
          context,
        })
      }
    }
  }

  return issues
}

function getAllMdxFiles(dir: string): string[] {
  const files: string[] = []

  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllMdxFiles(fullPath))
    } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

function main() {
  const args = process.argv.slice(2)
  const specificFile = args.find(a => a.startsWith('--file='))?.replace('--file=', '')

  let files: string[]
  if (specificFile) {
    const fullPath = path.resolve(specificFile)
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${specificFile}`)
      process.exit(1)
    }
    files = [fullPath]
  } else {
    files = getAllMdxFiles(CONTENT_DIR)
  }

  console.log(`\n📋 Source Link Audit Report`)
  console.log(`${'='.repeat(60)}`)
  console.log(`Scanning ${files.length} files...\n`)

  const allIssues: LinkIssue[] = []

  for (const file of files) {
    const issues = scanFile(file)
    allIssues.push(...issues)
  }

  // Sort by severity, then file
  allIssues.sort((a, b) => {
    const severityOrder = { high: 0, medium: 1, low: 2 }
    if (severityOrder[a.severity] !== severityOrder[b.severity]) {
      return severityOrder[a.severity] - severityOrder[b.severity]
    }
    return a.file.localeCompare(b.file)
  })

  // Group by severity
  const high = allIssues.filter(i => i.severity === 'high')
  const medium = allIssues.filter(i => i.severity === 'medium')
  const low = allIssues.filter(i => i.severity === 'low')

  if (high.length > 0) {
    console.log(`🔴 HIGH SEVERITY (${high.length} issues) - Root domain / generic homepage links`)
    console.log(`${'-'.repeat(60)}`)
    for (const issue of high) {
      console.log(`  ${issue.file}:${issue.line}`)
      console.log(`    Label: ${issue.label}`)
      console.log(`    URL: ${issue.url}`)
      console.log(`    Issue: ${issue.issue} | Context: ${issue.context}`)
      console.log()
    }
  }

  if (medium.length > 0) {
    console.log(`🟡 MEDIUM SEVERITY (${medium.length} issues) - Missing specific paths`)
    console.log(`${'-'.repeat(60)}`)
    for (const issue of medium) {
      console.log(`  ${issue.file}:${issue.line}`)
      console.log(`    Label: ${issue.label}`)
      console.log(`    URL: ${issue.url}`)
      console.log(`    Issue: ${issue.issue}`)
      console.log()
    }
  }

  if (low.length > 0) {
    console.log(`🟢 LOW SEVERITY (${low.length} issues)`)
    console.log(`${'-'.repeat(60)}`)
    for (const issue of low) {
      console.log(`  ${issue.file}:${issue.line}`)
      console.log(`    Label: ${issue.label}`)
      console.log(`    URL: ${issue.url}`)
      console.log()
    }
  }

  // Summary
  const sourceCitations = allIssues.filter(i => i.context === 'source-citation')
  const orgLinks = allIssues.filter(i => i.context === 'org-link')
  const unknownCtx = allIssues.filter(i => i.context === 'unknown')

  console.log(`\n${'='.repeat(60)}`)
  console.log(`📊 Summary`)
  console.log(`  Total issues: ${allIssues.length}`)
  console.log(`  High severity: ${high.length}`)
  console.log(`  Medium severity: ${medium.length}`)
  console.log(`  Low severity: ${low.length}`)
  console.log(`  Files scanned: ${files.length}`)
  console.log(`\n  By context:`)
  console.log(`    Source citations (need fixing): ${sourceCitations.length}`)
  console.log(`    Org/resource links (intentional): ${orgLinks.length}`)
  console.log(`    Unknown context: ${unknownCtx.length}`)

  // Group by file for per-file summary
  const byFile = new Map<string, LinkIssue[]>()
  for (const issue of allIssues) {
    const existing = byFile.get(issue.file) || []
    existing.push(issue)
    byFile.set(issue.file, existing)
  }

  console.log(`\n  Issues per file:`)
  for (const [file, issues] of Array.from(byFile.entries()).sort((a, b) => b[1].length - a[1].length)) {
    const highCount = issues.filter(i => i.severity === 'high').length
    console.log(`    ${file}: ${issues.length} total (${highCount} high)`)
  }

  console.log()
}

main()
