'use server'

/**
 * Moderator Actions for Edit Proposals
 *
 * Enhanced tools for Tier 3+ moderators to manage proposals.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canModerate } from '@/lib/permissions'
import { resolveProposal } from '@/lib/proposal-resolution'
import { revalidatePath } from 'next/cache'
import { awardReviewReputation } from '@/lib/reputation'

interface ModeratorActionResult {
  success?: boolean
  error?: string
}

/**
 * Moderator instant approve - bypasses voting
 */
export async function moderatorApprove(
  proposalId: number,
  reason: string
): Promise<ModeratorActionResult> {
  try {
    // Check authentication and moderator status
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Not authenticated' }
    }

    const userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id }
    })

    if (!userExtended) {
      return { error: 'User profile not found' }
    }

    const permission = await canModerate({
      userId: session.user.id,
      userExtended
    })

    if (!permission.allowed) {
      return { error: permission.reason || 'Not authorized for moderator actions' }
    }

    // Get proposal
    const proposal = await prisma.editProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return { error: 'Proposal not found' }
    }

    if (proposal.status !== 'pending') {
      return { error: `Proposal is already ${proposal.status}` }
    }

    // Resolve proposal with moderator as resolver
    await resolveProposal(
      proposalId,
      'approved',
      `Moderator approval: ${reason}`,
      session.user.id
    )

    // Increment moderator's review count
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        reviewsCompleted: { increment: 1 }
      }
    })

    // Award reputation for moderation
    await awardReviewReputation(session.user.id, proposalId)

    revalidatePath('/admin/review-edits')
    revalidatePath('/review')

    return { success: true }
  } catch (error) {
    console.error('Moderator approve error:', error)
    return { error: 'Failed to approve proposal' }
  }
}

/**
 * Moderator instant reject - bypasses voting
 */
export async function moderatorReject(
  proposalId: number,
  reason: string
): Promise<ModeratorActionResult> {
  try {
    // Check authentication and moderator status
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Not authenticated' }
    }

    const userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id }
    })

    if (!userExtended) {
      return { error: 'User profile not found' }
    }

    const permission = await canModerate({
      userId: session.user.id,
      userExtended
    })

    if (!permission.allowed) {
      return { error: permission.reason || 'Not authorized for moderator actions' }
    }

    // Get proposal
    const proposal = await prisma.editProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return { error: 'Proposal not found' }
    }

    if (proposal.status !== 'pending') {
      return { error: `Proposal is already ${proposal.status}` }
    }

    // Resolve proposal with moderator as resolver
    await resolveProposal(
      proposalId,
      'rejected',
      `Moderator rejection: ${reason}`,
      session.user.id
    )

    // Increment moderator's review count
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        reviewsCompleted: { increment: 1 }
      }
    })

    // Award reputation for moderation
    await awardReviewReputation(session.user.id, proposalId)

    revalidatePath('/admin/review-edits')
    revalidatePath('/review')

    return { success: true }
  } catch (error) {
    console.error('Moderator reject error:', error)
    return { error: 'Failed to reject proposal' }
  }
}

/**
 * Get all proposals with enhanced moderator view
 */
export async function getProposalsForModerator(options?: {
  limit?: number
  offset?: number
  status?: 'pending' | 'approved' | 'rejected' | 'all'
  searchTerm?: string
}) {
  const { limit = 50, offset = 0, status = 'all', searchTerm } = options || {}

  const whereClause: any = {}

  if (status !== 'all') {
    whereClause.status = status
  }

  if (searchTerm) {
    whereClause.OR = [
      { pagePath: { contains: searchTerm, mode: 'insensitive' } },
      { editSummary: { contains: searchTerm, mode: 'insensitive' } },
      { proposer: { email: { contains: searchTerm, mode: 'insensitive' } } }
    ]
  }

  const proposals = await prisma.editProposal.findMany({
    where: whereClause,
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      resolvedBy: {
        select: {
          id: true,
          name: true,
          email: true,
        }
      },
      votes: {
        include: {
          voter: {
            select: {
              id: true,
              name: true,
              image: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      },
      _count: {
        select: {
          votes: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    skip: offset
  })

  const totalCount = await prisma.editProposal.count({
    where: whereClause
  })

  return {
    proposals,
    totalCount,
    hasMore: offset + limit < totalCount
  }
}
