'use server'

/**
 * Review Queue Server Actions
 *
 * Handles voting on edit proposals and moderator actions.
 */

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canVote, getVoteWeight } from '@/lib/permissions'
import { checkAndResolveProposal } from '@/lib/proposal-resolution'
import { createAuditLog, logVoteCast } from '@/lib/audit'
import { revalidatePath } from 'next/cache'
import { awardVoteReputation } from '@/lib/reputation'
import { checkAndAwardBadges } from '@/lib/badges'

interface VoteResult {
  success?: boolean
  error?: string
  proposalResolved?: boolean
  newStatus?: 'approved' | 'rejected'
}

/**
 * Vote on an edit proposal
 */
export async function voteOnProposal(
  proposalId: number,
  voteType: 'approve' | 'reject',
  comment?: string
): Promise<VoteResult> {
  try {
    // 1. Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return { error: 'Not authenticated. Please sign in to vote.' }
    }

    // 2. Get user extended profile
    const userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id }
    })

    if (!userExtended) {
      return { error: 'User profile not found' }
    }

    // 3. Check voting permissions
    const permission = await canVote({
      userId: session.user.id,
      userExtended
    })

    if (!permission.allowed) {
      return { error: permission.reason }
    }

    // 4. Get proposal
    const proposal = await prisma.editProposal.findUnique({
      where: { id: proposalId }
    })

    if (!proposal) {
      return { error: 'Proposal not found' }
    }

    if (proposal.status !== 'pending') {
      return { error: `Cannot vote on ${proposal.status} proposal` }
    }

    // Prevent voting on own proposals
    if (proposal.proposerId === session.user.id) {
      return { error: 'You cannot vote on your own proposal' }
    }

    // 5. Check if already voted
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_voterId: {
          proposalId: proposalId,
          voterId: session.user.id
        }
      }
    })

    if (existingVote) {
      return { error: 'You have already voted on this proposal' }
    }

    // 6. Calculate vote weight
    const voteWeight = getVoteWeight(userExtended.userTier)

    // 7. Create vote record
    await prisma.vote.create({
      data: {
        proposalId,
        voterId: session.user.id,
        voterTier: userExtended.userTier,
        voteType,
        voteWeight,
        comment: comment || null,
      }
    })

    // 8. Update proposal scores
    const scoreChange = voteType === 'approve' ? voteWeight : -voteWeight

    await prisma.editProposal.update({
      where: { id: proposalId },
      data: {
        approvalScore: voteType === 'approve'
          ? { increment: voteWeight }
          : undefined,
        rejectionScore: voteType === 'reject'
          ? { decrement: voteWeight }
          : undefined,
      }
    })

    // 9. Update voter statistics
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        votesCast: { increment: 1 },
        dailyVoteCount: { increment: 1 },
      }
    })

    // Award reputation for voting
    await awardVoteReputation(session.user.id, proposalId)

    // Check and award badges (e.g., active voter)
    await checkAndAwardBadges(session.user.id)

    // 10. Create audit log
    await logVoteCast(
      session.user.id,
      proposalId,
      voteType,
      voteWeight
    )

    // 11. Check if proposal should be auto-resolved
    const resolutionResult = await checkAndResolveProposal(proposalId)

    // 12. Revalidate review page
    revalidatePath('/review')

    return {
      success: true,
      proposalResolved: resolutionResult.resolved,
      newStatus: resolutionResult.status
    }
  } catch (error) {
    console.error('Vote submission error:', error)
    return { error: 'Failed to submit vote. Please try again.' }
  }
}

/**
 * Get all pending proposals for review queue
 */
export async function getPendingProposals(options?: {
  limit?: number
  offset?: number
  status?: 'pending' | 'approved' | 'rejected'
}) {
  const { limit = 20, offset = 0, status = 'pending' } = options || {}

  const proposals = await prisma.editProposal.findMany({
    where: {
      status
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          extended: {
            select: {
              displayName: true,
            }
          }
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

  // Get total count for pagination
  const totalCount = await prisma.editProposal.count({
    where: { status }
  })

  return {
    proposals,
    totalCount,
    hasMore: offset + limit < totalCount
  }
}

/**
 * Get a single proposal with all details for viewing
 */
export async function getProposalDetails(proposalId: number) {
  const session = await auth()

  const proposal = await prisma.editProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      proposerExtended: {
        select: {
          userTier: true,
          reputationScore: true,
          editsApproved: true,
          editsRejected: true,
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
      }
    }
  })

  if (!proposal) {
    return null
  }

  // Check if current user has voted
  const userVote = session?.user?.id
    ? proposal.votes.find(v => v.voterId === session.user.id)
    : null

  return {
    proposal,
    userHasVoted: !!userVote,
    userVote
  }
}
