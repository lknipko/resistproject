/**
 * Reputation System
 *
 * Awards reputation points for various contributions and tracks user standing.
 */

import { prisma } from './db'
import { createAuditLog } from './audit'

export interface ReputationChange {
  userId: string
  points: number
  reason: string
  source?: string
}

/**
 * Reputation point values for different actions
 */
export const REPUTATION_VALUES = {
  // Edit actions
  EDIT_APPROVED: 10,
  EDIT_REJECTED: -5,
  EDIT_REVERTED: -10,

  // Voting actions
  VOTE_CAST: 1,
  VOTE_WITH_MAJORITY: 2, // Bonus for voting with the eventual outcome

  // Quality bonuses
  FIRST_EDIT: 5,
  QUALITY_EDIT: 5, // Edits with .gov sources
  HELPFUL_EDIT: 3, // Edits that receive positive votes

  // Moderation
  REVIEW_COMPLETED: 2,

  // Penalties
  SPAM_PENALTY: -50,
  ABUSE_PENALTY: -100,
} as const

/**
 * Award reputation points to a user
 *
 * @param change - Reputation change details
 * @returns Updated user extended record
 */
export async function awardReputation(change: ReputationChange) {
  const { userId, points, reason, source } = change

  try {
    // Update user reputation
    const userExtended = await prisma.userExtended.update({
      where: { userId },
      data: {
        reputationScore: {
          increment: points
        }
      }
    })

    // Create audit log
    await createAuditLog({
      userId,
      action: 'reputation_awarded',
      targetType: 'user',
      targetId: userId,
      details: {
        points,
        reason,
        source,
        newScore: userExtended.reputationScore
      }
    })

    return userExtended
  } catch (error) {
    console.error('Error awarding reputation:', error)
    throw error
  }
}

/**
 * Award reputation for an approved edit
 */
export async function awardEditApprovalReputation(userId: string, proposalId: number) {
  // Check if this is the user's first approved edit
  const userExtended = await prisma.userExtended.findUnique({
    where: { userId }
  })

  if (!userExtended) return

  const isFirstEdit = userExtended.editsApproved === 0

  // Award base points for approval
  await awardReputation({
    userId,
    points: REPUTATION_VALUES.EDIT_APPROVED,
    reason: 'Edit proposal approved',
    source: `proposal:${proposalId}`
  })

  // Bonus for first edit
  if (isFirstEdit) {
    await awardReputation({
      userId,
      points: REPUTATION_VALUES.FIRST_EDIT,
      reason: 'First edit approved',
      source: `proposal:${proposalId}`
    })
  }
}

/**
 * Penalize reputation for a rejected edit
 */
export async function penalizeEditRejection(userId: string, proposalId: number) {
  await awardReputation({
    userId,
    points: REPUTATION_VALUES.EDIT_REJECTED,
    reason: 'Edit proposal rejected',
    source: `proposal:${proposalId}`
  })
}

/**
 * Award reputation for casting a vote
 */
export async function awardVoteReputation(userId: string, proposalId: number) {
  await awardReputation({
    userId,
    points: REPUTATION_VALUES.VOTE_CAST,
    reason: 'Vote cast on proposal',
    source: `proposal:${proposalId}`
  })
}

/**
 * Award bonus reputation to voters who voted with the majority
 * Called when a proposal is resolved
 */
export async function awardMajorityVoteBonus(
  proposalId: number,
  winningVoteType: 'approve' | 'reject'
) {
  try {
    // Get all votes for this proposal with the winning vote type
    const majorityVotes = await prisma.vote.findMany({
      where: {
        proposalId,
        voteType: winningVoteType
      }
    })

    // Award bonus to each voter
    for (const vote of majorityVotes) {
      await awardReputation({
        userId: vote.voterId,
        points: REPUTATION_VALUES.VOTE_WITH_MAJORITY,
        reason: `Voted with majority (${winningVoteType})`,
        source: `proposal:${proposalId}`
      })
    }

    console.log(`Awarded majority bonus to ${majorityVotes.length} voters on proposal ${proposalId}`)
  } catch (error) {
    console.error('Error awarding majority vote bonus:', error)
  }
}

/**
 * Award reputation for completing a moderation review
 */
export async function awardReviewReputation(userId: string, proposalId: number) {
  await awardReputation({
    userId,
    points: REPUTATION_VALUES.REVIEW_COMPLETED,
    reason: 'Moderation review completed',
    source: `proposal:${proposalId}`
  })
}

/**
 * Get reputation rank/level based on score
 */
export function getReputationRank(reputationScore: number): {
  rank: string
  minScore: number
  nextRank: string | null
  nextRankScore: number | null
} {
  const ranks = [
    { rank: 'Newcomer', minScore: 0, next: 'Contributor' },
    { rank: 'Contributor', minScore: 50, next: 'Active Member' },
    { rank: 'Active Member', minScore: 150, next: 'Established' },
    { rank: 'Established', minScore: 500, next: 'Respected' },
    { rank: 'Respected', minScore: 1000, next: 'Distinguished' },
    { rank: 'Distinguished', minScore: 2500, next: 'Legendary' },
    { rank: 'Legendary', minScore: 5000, next: null },
  ]

  for (let i = ranks.length - 1; i >= 0; i--) {
    if (reputationScore >= ranks[i].minScore) {
      return {
        rank: ranks[i].rank,
        minScore: ranks[i].minScore,
        nextRank: ranks[i].next,
        nextRankScore: ranks[i].next && i < ranks.length - 1 ? ranks[i + 1].minScore : null
      }
    }
  }

  return {
    rank: 'Newcomer',
    minScore: 0,
    nextRank: 'Contributor',
    nextRankScore: 50
  }
}
