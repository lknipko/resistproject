'use server'

/**
 * Edit Proposal Server Actions
 *
 * Handles submission of edit proposals with:
 * - Authentication and permission checks
 * - Edit validation
 * - Diff generation
 * - Database storage
 * - Tier-based auto-approval for tier 3+ users
 * - Audit logging
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { ensurePageMetadata } from '@/lib/page-registry'
import { canSubmitEdit, getApprovalThreshold, incrementEditCount } from '@/lib/permissions'
import { validateEditProposal } from '@/lib/validation'
import { generateDiff } from '@/lib/diff'
import { logEditSubmission, createAuditLog } from '@/lib/audit'
import { revalidatePath } from 'next/cache'

interface SubmitEditProposalParams {
  section: 'learn' | 'act'
  slug: string
  originalContent: string
  proposedContent: string
  editSummary: string
  editType: 'content' | 'sources' | 'formatting' | 'metadata'
}

interface SubmitEditProposalResult {
  success?: boolean
  proposalId?: number
  instantApproval?: boolean
  error?: string
}

export async function submitEditProposal(
  params: SubmitEditProposalParams
): Promise<SubmitEditProposalResult> {
  const {
    section,
    slug,
    originalContent,
    proposedContent,
    editSummary,
    editType
  } = params

  // 1. Authentication check
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  // 2. Get user extended profile
  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id }
  })

  if (!userExtended) {
    return { error: 'User profile not found' }
  }

  // 3. Permission check (rate limits, tier, account status)
  const permission = await canSubmitEdit({
    userId: session.user.id,
    userExtended
  })

  if (!permission.allowed) {
    return { error: permission.reason }
  }

  // 4. Ensure PageMetadata exists
  const pageMetadata = await ensurePageMetadata(section, slug)

  // 5. Validate edit
  const validation = validateEditProposal({
    originalContent,
    proposedContent,
    editSummary,
    editType
  })

  if (!validation.passed) {
    return { error: validation.errors.join(', ') }
  }

  // 6. Generate diff
  const diffContent = generateDiff(originalContent, proposedContent)

  // 7. Calculate approval threshold based on proposer tier
  const { approvalThreshold, rejectionThreshold } = getApprovalThreshold(userExtended.userTier)

  // 8. Check for tier 3+ instant approval
  const instantApproval = userExtended.userTier >= 3

  try {
    // 9. Create edit proposal
    const proposal = await prisma.editProposal.create({
      data: {
        pageId: pageMetadata.pageId,
        pagePath: pageMetadata.pagePath,
        proposerId: session.user.id,
        proposerTier: userExtended.userTier,
        originalContent,
        proposedContent,
        diffContent,
        editSummary,
        editType,
        validationStatus: 'passed',
        validationResults: {
          warnings: validation.warnings,
          details: validation.details
        },
        approvalThreshold,
        rejectionThreshold,
        status: instantApproval ? 'approved' : 'pending',
        resolvedById: instantApproval ? session.user.id : null,
        resolvedAt: instantApproval ? new Date() : null,
        resolutionReason: instantApproval ? 'Auto-approved (Tier 3+ user)' : null
      }
    })

    // 10. Update user statistics
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        editsProposed: { increment: 1 },
        editsApproved: instantApproval ? { increment: 1 } : undefined
      }
    })

    // 11. Increment daily edit count
    await incrementEditCount(session.user.id)

    // 12. Create audit log
    await logEditSubmission(
      session.user.id,
      proposal.id,
      pageMetadata.pagePath,
      editSummary,
      editType,
      instantApproval
    )

    // 13. If instant approval, award reputation
    if (instantApproval) {
      await prisma.userExtended.update({
        where: { userId: session.user.id },
        data: { reputationScore: { increment: 10 } }
      })

      // Log reputation award
      await createAuditLog({
        actionType: 'reputation_awarded',
        actionCategory: 'gamification',
        actorId: 'system',
        actorType: 'system',
        targetType: 'user',
        targetId: session.user.id,
        description: 'Awarded 10 reputation for approved edit (instant approval)',
        metadata: { proposalId: proposal.id, points: 10 }
      })

      // Revalidate the page so approved edit appears immediately
      revalidatePath(`/${section}/${slug}`)
      revalidatePath('/profile')
    }

    return {
      success: true,
      proposalId: proposal.id,
      instantApproval
    }

  } catch (error) {
    console.error('Error creating edit proposal:', error)
    return { error: 'Failed to create edit proposal. Please try again.' }
  }
}
