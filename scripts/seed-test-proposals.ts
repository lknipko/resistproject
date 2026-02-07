/**
 * Seed Test Edit Proposals
 *
 * Creates sample edit proposals for testing the review and moderation system
 */

import { PrismaClient } from '@prisma/client'
import { generateDiff } from '../src/lib/diff'

const prisma = new PrismaClient()

const sampleEdits = [
  {
    pagePath: '/learn/digital-rights',
    section: 'learn',
    editSummary: 'Fix typo in privacy section',
    editType: 'content',
    originalSnippet: 'Your digital privcy is at risk',
    proposedSnippet: 'Your digital privacy is at risk',
  },
  {
    pagePath: '/learn/obbba-medicaid',
    section: 'learn',
    editSummary: 'Add citation for enrollment numbers',
    editType: 'sources',
    originalSnippet: 'millions of people lost coverage',
    proposedSnippet: 'millions of people lost coverage [Source: CMS.gov report, Jan 2025]',
  },
  {
    pagePath: '/act/contact-congress',
    section: 'act',
    editSummary: 'Update phone script for clarity',
    editType: 'content',
    originalSnippet: 'tell them you oppose',
    proposedSnippet: 'clearly state your opposition to',
  },
  {
    pagePath: '/learn/trump-accounts',
    section: 'learn',
    editSummary: 'Correct date in timeline',
    editType: 'content',
    originalSnippet: 'January 15, 2025',
    proposedSnippet: 'January 16, 2025',
  },
  {
    pagePath: '/act/immigration',
    section: 'act',
    editSummary: 'Add local organization contact info',
    editType: 'content',
    originalSnippet: 'Contact local organizations',
    proposedSnippet: 'Contact local organizations:\n- ACLU: 1-800-XXX-XXXX\n- Immigration Advocates: contact@example.org',
  },
]

async function seedTestProposals() {
  try {
    console.log('\n🌱 Seeding test edit proposals...\n')

    // Get all users to distribute proposals among them
    const users = await prisma.userExtended.findMany({
      include: {
        user: true
      }
    })

    if (users.length === 0) {
      console.error('❌ No users found. Please create at least one user first.')
      return
    }

    console.log(`Found ${users.length} user(s) to create proposals from\n`)

    // Get page metadata
    const pages = await prisma.pageMetadata.findMany()
    const pageMap = new Map(pages.map(p => [p.pagePath, p]))

    let createdCount = 0

    for (let i = 0; i < sampleEdits.length; i++) {
      const edit = sampleEdits[i]
      const userIndex = i % users.length
      const userExtended = users[userIndex]
      const page = pageMap.get(edit.pagePath)

      if (!page) {
        console.log(`⚠️  Skipping ${edit.pagePath} - page not found`)
        continue
      }

      // Create simple original/proposed content
      const originalContent = `# Example Content\n\n${edit.originalSnippet}\n\nMore content here.`
      const proposedContent = `# Example Content\n\n${edit.proposedSnippet}\n\nMore content here.`
      const diffContent = generateDiff(originalContent, proposedContent)

      // Determine status based on user tier
      const instantApproval = userExtended.userTier >= 3
      const status = instantApproval ? 'approved' : 'pending'

      const proposal = await prisma.editProposal.create({
        data: {
          pageId: page.pageId,
          pagePath: edit.pagePath,
          proposerId: userExtended.userId,
          proposerTier: userExtended.userTier,
          originalContent,
          proposedContent,
          diffContent,
          editSummary: edit.editSummary,
          editType: edit.editType,
          validationStatus: 'passed',
          validationResults: JSON.stringify({
            passed: true,
            errors: [],
            warnings: [],
          }),
          status,
          approvalThreshold: userExtended.userTier >= 3 ? 0 : (userExtended.userTier === 2 ? 5 : 10),
          rejectionThreshold: userExtended.userTier >= 3 ? 0 : (userExtended.userTier === 2 ? -3 : -5),
          approvalScore: 0,
          rejectionScore: 0,
          resolvedById: instantApproval ? userExtended.userId : null,
          resolvedAt: instantApproval ? new Date() : null,
          resolutionReason: instantApproval ? 'Auto-approved (Tier 3+ user)' : null,
        }
      })

      const displayName = userExtended.displayName || userExtended.user.email
      const statusEmoji = status === 'approved' ? '✅' : '⏳'
      console.log(`${statusEmoji} Created proposal #${proposal.id}: "${edit.editSummary}" by ${displayName} (Tier ${userExtended.userTier})`)
      createdCount++
    }

    console.log(`\n✅ Successfully created ${createdCount} test proposals!\n`)

  } catch (error) {
    console.error('❌ Error seeding proposals:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedTestProposals()
