/**
 * Seed Content Updates
 *
 * Creates approved EditProposal records documenting the Feb 26, 2026 content updates.
 * Run this AFTER updating the MDX files (the updated content is read from disk as proposedContent).
 *
 * Usage: npx tsx scripts/seed-content-updates.ts
 *
 * What it does:
 * 1. Finds the admin user (Tier 5) to use as proposer/resolver
 * 2. For each updated page, reads the current MDX file as proposedContent
 * 3. Creates an approved EditProposal record with admin as resolver
 * 4. After running, content-resolver will serve the approved proposal's content
 */

import fs from 'fs'
import path from 'path'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Pages that were updated in this batch (Feb 26, 2026)
const CONTENT_UPDATES: Array<{
  section: 'learn' | 'act'
  slug: string
  editSummary: string
}> = [
  {
    section: 'learn',
    slug: 'tariffs',
    editSummary: 'Add Supreme Court IEEPA ruling (6-3, Feb 21), Section 122 pivot, updated household cost figures, Harvard/IMF research',
  },
  {
    section: 'learn',
    slug: 'epstein-files',
    editSummary: 'Add Epstein Files Transparency Act, 3.5M DOJ document release, Europe accountability actions, Congressional inquiry into missing Trump-related files',
  },
  {
    section: 'learn',
    slug: 'ice-detention-deportation',
    editSummary: 'Add Operation Metro Surge ended (Feb 12), ACLU lawsuit, 14% violent offender arrest rate, 475K+ removal totals, public opinion shift',
  },
  {
    section: 'learn',
    slug: 'federal-law-enforcement',
    editSummary: 'Add Metro Surge end, ACLU First Amendment lawsuit, Don Lemon arrest, college funding threats, House Judiciary hearing',
  },
  {
    section: 'learn',
    slug: 'voting-rights',
    editSummary: 'Add SAVE Act legislative update, EI-ISAC defunding, FBI FITF disbanding, CISA 130 workers eliminated, state official communication breakdown',
  },
  {
    section: 'learn',
    slug: 'doge',
    editSummary: 'Add court injunction wave (20+ agencies), Treasury payment system blocked, CFPB ruling, Department of Education $900M cuts, Brookings government crash analysis',
  },
  {
    section: 'learn',
    slug: 'public-health',
    editSummary: 'Add WHO withdrawal in effect, RFK Jr. 5-month actions summary, measles outbreak case counts, ACA subsidy expiration impacts',
  },
  {
    section: 'act',
    slug: 'tariff-impact',
    editSummary: 'Add Section 122 action section, 150-day deadline alert, updated email template, updated talking points',
  },
  {
    section: 'act',
    slug: 'epstein-accountability',
    editSummary: 'Add DOJ Epstein Library actions, demand full accountability email template, European accountability amplification',
  },
  {
    section: 'act',
    slug: 'ice-detention-defense',
    editSummary: 'Add Metro Surge ended note, ACLU lawsuit support actions, 14% statistic email template',
  },
  {
    section: 'act',
    slug: 'protect-your-vote',
    editSummary: 'Add election security section, CISA/EI-ISAC contact Congress action, state election official outreach, volunteer observer resources',
  },
  {
    section: 'act',
    slug: 'foreign-policy',
    editSummary: 'Add Greenland "no force" pledge update with caveats, Panama false "reclaimed" claim correction',
  },
]

// New pages created in this batch — these just need founding proposals
const NEW_PAGES: Array<{
  section: 'learn' | 'act'
  slug: string
  editSummary: string
}> = [
  {
    section: 'learn',
    slug: 'affordability-crisis',
    editSummary: 'New page: Affordability Crisis — tariffs, ACA subsidy expiration, housing, food costs (Feb 26, 2026)',
  },
  {
    section: 'act',
    slug: 'economic-relief',
    editSummary: 'New page: Economic Relief actions — ACA subsidies, tariff opposition, housing reform, personal relief resources (Feb 26, 2026)',
  },
  {
    section: 'learn',
    slug: 'election-security',
    editSummary: 'New page: Election Security — EI-ISAC defunding, CISA elimination, FBI FITF disbanding, 2026 midterm risk (Feb 26, 2026)',
  },
]

async function readMdxFile(section: string, slug: string): Promise<string | null> {
  const filePath = path.join(process.cwd(), 'content', section, `${slug}.mdx`)
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`)
    return null
  }
  return fs.readFileSync(filePath, 'utf8')
}

async function getOrCreatePageMetadata(
  section: string,
  slug: string,
  content: string
): Promise<{ pageId: number; pagePath: string } | null> {
  const pagePath = `/${section}/${slug}`

  const existing = await prisma.pageMetadata.findFirst({ where: { pagePath } })
  if (existing) {
    return { pageId: existing.pageId, pagePath }
  }

  // Create new PageMetadata for new pages
  const maxPage = await prisma.pageMetadata.findFirst({
    orderBy: { pageId: 'desc' },
    select: { pageId: true },
  })
  const nextPageId = (maxPage?.pageId || 0) + 1

  // Extract tags from frontmatter (simple regex)
  const tagsMatch = content.match(/^tags:\s*\[([^\]]+)\]/m)
  const tags: string[] = tagsMatch
    ? tagsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''))
    : []

  await prisma.pageMetadata.create({
    data: {
      pageId: nextPageId,
      pagePath,
      contentType: section,
      issueTags: tags as any[],
      tier: 3,
      status: 'active',
      baseScore: 100,
      currentScore: 100,
      urgencyFactor: 1.0,
      freshnessFactor: 1.0,
    },
  })

  console.log(`  📄 Created PageMetadata: ${pagePath} (ID: ${nextPageId})`)
  return { pageId: nextPageId, pagePath }
}

async function seedContentUpdates() {
  console.log('\n🌱 Seeding content update proposals (Feb 26, 2026)...\n')

  // Find admin user (Tier 5)
  const adminUser = await prisma.userExtended.findFirst({
    where: { userTier: 5 },
    include: { user: true },
  })

  if (!adminUser) {
    console.error('❌ No Tier 5 admin user found. Run scripts/grant-admin.ts first.')
    console.error('   Usage: npx tsx scripts/grant-admin.ts your@email.com yourDisplayName')
    process.exit(1)
  }

  console.log(`✅ Found admin: ${adminUser.displayName || adminUser.user.email} (Tier ${adminUser.userTier})\n`)

  let successCount = 0
  let errorCount = 0
  const resolvedAt = new Date('2026-02-26T12:00:00Z')

  // Process updates to existing pages
  console.log('📝 Processing updates to existing pages...\n')

  for (const update of CONTENT_UPDATES) {
    try {
      const content = await readMdxFile(update.section, update.slug)
      if (!content) {
        errorCount++
        continue
      }

      const pagePath = `/${update.section}/${update.slug}`
      const pageMetadata = await prisma.pageMetadata.findFirst({ where: { pagePath } })

      if (!pageMetadata) {
        console.log(`⚠️  No PageMetadata for ${pagePath} — run seed-page-metadata.ts first`)
        errorCount++
        continue
      }

      // Create approved proposal (original = placeholder indicating pre-update state)
      const originalContent = `[Pre-Feb-26-2026 version — see git history for original content]\n\n` +
        content.split('\n').slice(0, 20).join('\n') + '\n...'

      await prisma.editProposal.create({
        data: {
          pageId: pageMetadata.pageId,
          pagePath,
          proposerId: adminUser.userId,
          proposerTier: adminUser.userTier,
          originalContent,
          proposedContent: content,
          diffContent: `Admin update: ${update.editSummary}`,
          editSummary: update.editSummary,
          editType: 'content',
          validationStatus: 'passed',
          validationResults: JSON.stringify({ passed: true, errors: [], warnings: [] }),
          status: 'approved',
          approvalThreshold: 0,
          rejectionThreshold: 0,
          approvalScore: 5,
          rejectionScore: 0,
          resolvedById: adminUser.userId,
          resolvedAt,
          resolutionReason: 'Admin content update — Feb 26, 2026',
        },
      })

      console.log(`✅ Created approved proposal: /${update.section}/${update.slug}`)
      console.log(`   "${update.editSummary.substring(0, 80)}..."`)
      successCount++
    } catch (error) {
      console.error(`❌ Error processing ${update.section}/${update.slug}:`, error)
      errorCount++
    }
  }

  // Process new pages
  console.log('\n📄 Processing new pages...\n')

  for (const newPage of NEW_PAGES) {
    try {
      const content = await readMdxFile(newPage.section, newPage.slug)
      if (!content) {
        errorCount++
        continue
      }

      const pageInfo = await getOrCreatePageMetadata(newPage.section, newPage.slug, content)
      if (!pageInfo) {
        errorCount++
        continue
      }

      // Create founding approved proposal
      await prisma.editProposal.create({
        data: {
          pageId: pageInfo.pageId,
          pagePath: pageInfo.pagePath,
          proposerId: adminUser.userId,
          proposerTier: adminUser.userTier,
          originalContent: '[New page — no prior version]',
          proposedContent: content,
          diffContent: `New page created: ${newPage.editSummary}`,
          editSummary: newPage.editSummary,
          editType: 'content',
          validationStatus: 'passed',
          validationResults: JSON.stringify({ passed: true, errors: [], warnings: [] }),
          status: 'approved',
          approvalThreshold: 0,
          rejectionThreshold: 0,
          approvalScore: 5,
          rejectionScore: 0,
          resolvedById: adminUser.userId,
          resolvedAt,
          resolutionReason: 'Admin — new page created Feb 26, 2026',
        },
      })

      console.log(`✅ Created founding proposal: ${pageInfo.pagePath}`)
      console.log(`   "${newPage.editSummary.substring(0, 80)}..."`)
      successCount++
    } catch (error) {
      console.error(`❌ Error processing new page ${newPage.section}/${newPage.slug}:`, error)
      errorCount++
    }
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✨ Seeding Complete!')
  console.log(`   Successful: ${successCount}`)
  console.log(`   Errors:     ${errorCount}`)
  console.log(`   Total:      ${successCount + errorCount}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n📋 Next steps:')
  console.log('   1. Run: npx tsx scripts/seed-page-metadata.ts  (to register new pages in DB)')
  console.log('   2. Restart dev server: npm run dev')
  console.log('   3. Visit updated pages to verify content-resolver serves new content')
  console.log('   4. Check /admin/review-edits to see edit history')
  console.log('')
}

async function main() {
  try {
    await seedContentUpdates()
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
