/**
 * Migration Script: Convert MDX files from verbose JSX to simple markdown syntax
 *
 * Usage: npx tsx scripts/migrate-mdx-to-simple.ts [--dry-run] [--file=path/to/file.mdx]
 *
 * Options:
 *   --dry-run: Show what would change without writing files
 *   --file: Only process a specific file (for testing)
 */

import fs from 'fs'
import path from 'path'

interface MigrationStats {
  filesProcessed: number
  filesChanged: number
  filesSkipped: number
  transformations: {
    topSectionRemoved: number
    quickSummaryConverted: number
    actNowBoxConverted: number
    learnMoreBoxConverted: number
    factsSectionConverted: number
    analysisSectionConverted: number
    sourceLinkConverted: number
    sectionIntroRemoved: number
    mainContentLayoutRemoved: number
  }
}

const stats: MigrationStats = {
  filesProcessed: 0,
  filesChanged: 0,
  filesSkipped: 0,
  transformations: {
    topSectionRemoved: 0,
    quickSummaryConverted: 0,
    actNowBoxConverted: 0,
    learnMoreBoxConverted: 0,
    factsSectionConverted: 0,
    analysisSectionConverted: 0,
    sourceLinkConverted: 0,
    sectionIntroRemoved: 0,
    mainContentLayoutRemoved: 0,
  }
}

const isDryRun = process.argv.includes('--dry-run')
const specificFile = process.argv.find(arg => arg.startsWith('--file='))?.split('=')[1]

/**
 * Transform MDX content from old JSX syntax to new simple syntax
 */
function transformMDX(content: string, filename: string): { content: string; changed: boolean } {
  let transformed = content
  let changed = false

  // Skip files that already use simple syntax (no component wrappers)
  if (!transformed.includes('<TopSection>') &&
      !transformed.includes('<FactsSection>') &&
      !transformed.includes('<AnalysisSection>') &&
      !transformed.includes('<QuickSummary>')) {
    console.log(`  ⏭️  Already using simple syntax, skipping`)
    return { content, changed: false }
  }

  // 1. Convert TopSection with QuickSummary and ActNowBox/LearnMoreBox
  const topSectionRegex = /<TopSection>\s*<QuickSummary[^>]*>([\s\S]*?)<\/QuickSummary>\s*<(ActNowBox|LearnMoreBox)\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/\2>\s*<\/TopSection>/g
  transformed = transformed.replace(topSectionRegex, (match, summaryContent, boxType, href, boxText) => {
    stats.transformations.topSectionRemoved++
    stats.transformations.quickSummaryConverted++
    if (boxType === 'ActNowBox') {
      stats.transformations.actNowBoxConverted++
    } else {
      stats.transformations.learnMoreBoxConverted++
    }
    changed = true

    const arrow = boxType === 'ActNowBox' ? '→' : '←'
    const prefix = boxType === 'ActNowBox' ? 'Take Action:' : 'Learn More:'
    const cleanSummary = summaryContent.trim()
    const cleanBoxText = boxText.trim()

    return `## Quick Summary\n\n${cleanSummary}\n\n[${arrow} ${prefix} ${cleanBoxText}](${href})`
  })

  // 2. Convert standalone QuickSummary (not in TopSection)
  const quickSummaryRegex = /<QuickSummary[^>]*>([\s\S]*?)<\/QuickSummary>/g
  transformed = transformed.replace(quickSummaryRegex, (match, content) => {
    stats.transformations.quickSummaryConverted++
    changed = true
    return `## Quick Summary\n\n${content.trim()}`
  })

  // 3. Convert standalone ActNowBox
  const actNowBoxRegex = /<ActNowBox\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/ActNowBox>/g
  transformed = transformed.replace(actNowBoxRegex, (match, href, text) => {
    stats.transformations.actNowBoxConverted++
    changed = true
    return `[→ Take Action: ${text.trim()}](${href})`
  })

  // 4. Convert standalone LearnMoreBox
  const learnMoreBoxRegex = /<LearnMoreBox\s+href="([^"]+)"[^>]*>([\s\S]*?)<\/LearnMoreBox>/g
  transformed = transformed.replace(learnMoreBoxRegex, (match, href, text) => {
    stats.transformations.learnMoreBoxConverted++
    changed = true
    return `[← Learn More: ${text.trim()}](${href})`
  })

  // 5. Convert FactsSection (and demote internal h2 to h3)
  const factsSectionRegex = /<FactsSection>([\s\S]*?)<\/FactsSection>/g
  transformed = transformed.replace(factsSectionRegex, (match, content) => {
    stats.transformations.factsSectionConverted++
    changed = true
    // Demote any h2 (##) headings inside Facts to h3 (###)
    const contentWithDemotedHeadings = content.replace(/^## /gm, '### ')
    return `## Facts\n\n${contentWithDemotedHeadings.trim()}`
  })

  // 6. Convert AnalysisSection (and demote internal h2 to h3)
  const analysisSectionRegex = /<AnalysisSection>([\s\S]*?)<\/AnalysisSection>/g
  transformed = transformed.replace(analysisSectionRegex, (match, content) => {
    stats.transformations.analysisSectionConverted++
    changed = true
    // Demote any h2 (##) headings inside Analysis to h3 (###)
    const contentWithDemotedHeadings = content.replace(/^## /gm, '### ')
    return `## Analysis\n\n${contentWithDemotedHeadings.trim()}`
  })

  // 7. Convert SourceLink
  const sourceLinkRegex = /<SourceLink\s+href="([^"]+)"\s+label="([^"]+)"\s*\/>/g
  transformed = transformed.replace(sourceLinkRegex, (match, href, label) => {
    stats.transformations.sourceLinkConverted++
    changed = true
    return `[source: ${label}](${href})`
  })

  // 8. Remove SectionIntro (will be auto-generated)
  const sectionIntroRegex = /<SectionIntro[^>]*>[\s\S]*?<\/SectionIntro>\s*/g
  if (sectionIntroRegex.test(transformed)) {
    stats.transformations.sectionIntroRemoved++
    changed = true
  }
  transformed = transformed.replace(sectionIntroRegex, '')

  // 9. Remove MainContentLayout wrapper (keep sidebar for now - manual step)
  // Note: We keep the MainContentLayout for now because removing it requires
  // either implementing AutoPageLayout or manually reconstructing sidebars
  // This is a manual migration step after AutoPageLayout is implemented

  return { content: transformed, changed }
}

/**
 * Process a single MDX file
 */
function processFile(filePath: string): void {
  console.log(`\n📄 Processing: ${filePath}`)
  stats.filesProcessed++

  const content = fs.readFileSync(filePath, 'utf-8')
  const { content: transformed, changed } = transformMDX(content, path.basename(filePath))

  if (!changed) {
    stats.filesSkipped++
    return
  }

  stats.filesChanged++

  if (isDryRun) {
    console.log(`  🔍 DRY RUN: Would update file`)
    console.log(`\n--- BEFORE (first 500 chars) ---`)
    console.log(content.substring(0, 500))
    console.log(`\n--- AFTER (first 500 chars) ---`)
    console.log(transformed.substring(0, 500))
  } else {
    fs.writeFileSync(filePath, transformed, 'utf-8')
    console.log(`  ✅ Updated successfully`)
  }
}

/**
 * Find all MDX files in a directory
 */
function findMDXFiles(dir: string): string[] {
  const files: string[] = []

  if (!fs.existsSync(dir)) {
    return files
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...findMDXFiles(fullPath))
    } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
      // Skip test files
      if (!entry.name.includes('test-simple')) {
        files.push(fullPath)
      }
    }
  }

  return files
}

/**
 * Main migration function
 */
function migrate(): void {
  console.log('🚀 MDX Migration Script')
  console.log('========================\n')

  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n')
  }

  const contentDir = path.join(process.cwd(), 'content')

  let filesToProcess: string[]

  if (specificFile) {
    const fullPath = path.join(process.cwd(), specificFile)
    if (!fs.existsSync(fullPath)) {
      console.error(`❌ File not found: ${specificFile}`)
      process.exit(1)
    }
    filesToProcess = [fullPath]
    console.log(`Processing single file: ${specificFile}\n`)
  } else {
    filesToProcess = findMDXFiles(contentDir)
    console.log(`Found ${filesToProcess.length} MDX files\n`)
  }

  // Process each file
  for (const file of filesToProcess) {
    try {
      processFile(file)
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error)
    }
  }

  // Print summary
  console.log('\n\n📊 Migration Summary')
  console.log('===================')
  console.log(`Files processed: ${stats.filesProcessed}`)
  console.log(`Files changed: ${stats.filesChanged}`)
  console.log(`Files skipped: ${stats.filesSkipped}`)
  console.log('\nTransformations:')
  console.log(`  TopSections removed: ${stats.transformations.topSectionRemoved}`)
  console.log(`  QuickSummary converted: ${stats.transformations.quickSummaryConverted}`)
  console.log(`  ActNowBox converted: ${stats.transformations.actNowBoxConverted}`)
  console.log(`  LearnMoreBox converted: ${stats.transformations.learnMoreBoxConverted}`)
  console.log(`  FactsSection converted: ${stats.transformations.factsSectionConverted}`)
  console.log(`  AnalysisSection converted: ${stats.transformations.analysisSectionConverted}`)
  console.log(`  SourceLink converted: ${stats.transformations.sourceLinkConverted}`)
  console.log(`  SectionIntro removed: ${stats.transformations.sectionIntroRemoved}`)

  if (isDryRun) {
    console.log('\n💡 Run without --dry-run to apply changes')
  } else {
    console.log('\n✅ Migration complete!')
  }
}

// Run migration
migrate()
