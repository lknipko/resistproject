/**
 * Tier Promotion System
 *
 * Automatically promotes users through tiers based on their contributions and reputation.
 */

import { prisma } from './db'
import { awardReputation } from './reputation'
import { awardBadge } from './badges'
import { createAuditLog } from './audit'

export interface TierRequirements {
  tier: number
  name: string
  editsApproved: number
  reputationScore: number
  description: string
}

/**
 * Tier promotion requirements
 */
export const TIER_REQUIREMENTS: TierRequirements[] = [
  {
    tier: 1,
    name: 'New Contributor',
    editsApproved: 0,
    reputationScore: 0,
    description: 'Starting tier for all new users'
  },
  {
    tier: 2,
    name: 'Contributor',
    editsApproved: 1,
    reputationScore: 0,
    description: 'Has at least 1 approved edit'
  },
  {
    tier: 3,
    name: 'Trusted Contributor',
    editsApproved: 5,
    reputationScore: 100,
    description: 'Proven track record with 5+ approved edits and 100+ reputation'
  },
  {
    tier: 4,
    name: 'Moderator',
    editsApproved: 0,
    reputationScore: 0,
    description: 'Manual promotion only - requires admin approval'
  },
  {
    tier: 5,
    name: 'Administrator',
    editsApproved: 0,
    reputationScore: 0,
    description: 'Manual promotion only - requires admin approval'
  },
]

/**
 * Check and promote user to higher tier if they meet requirements
 *
 * @param userId - User ID to check
 * @returns New tier if promoted, null if no promotion
 */
export async function checkAndPromoteUserTier(userId: string): Promise<number | null> {
  try {
    const userExtended = await prisma.userExtended.findUnique({
      where: { userId }
    })

    if (!userExtended) {
      console.error(`User ${userId} not found`)
      return null
    }

    const currentTier = userExtended.userTier

    // Can't auto-promote beyond tier 3
    if (currentTier >= 3) {
      return null
    }

    // Check if user meets requirements for next tier
    let newTier: number | null = null

    // Check tier 2 requirements
    if (currentTier === 1 && userExtended.editsApproved >= TIER_REQUIREMENTS[1].editsApproved) {
      newTier = 2
    }

    // Check tier 3 requirements
    if (currentTier === 2 &&
        userExtended.editsApproved >= TIER_REQUIREMENTS[2].editsApproved &&
        userExtended.reputationScore >= TIER_REQUIREMENTS[2].reputationScore) {
      newTier = 3
    }

    if (!newTier) {
      return null
    }

    // Promote user
    await prisma.userExtended.update({
      where: { userId },
      data: {
        userTier: newTier
      }
    })

    // Award tier-specific badge
    const badgeId = `tier-${newTier}`
    await awardBadge(userId, badgeId)

    // Award reputation bonus for tier promotion
    const bonusReputation = newTier * 25 // 50 for tier 2, 75 for tier 3
    await awardReputation({
      userId,
      points: bonusReputation,
      reason: `Promoted to Tier ${newTier}: ${TIER_REQUIREMENTS[newTier - 1].name}`,
      source: 'tier-promotion'
    })

    // Create audit log
    await createAuditLog({
      userId,
      action: 'tier_promotion',
      targetType: 'user',
      targetId: userId,
      details: {
        oldTier: currentTier,
        newTier,
        tierName: TIER_REQUIREMENTS[newTier - 1].name,
        bonusReputation
      }
    })

    console.log(`✨ User ${userId} promoted from Tier ${currentTier} to Tier ${newTier}`)

    return newTier
  } catch (error) {
    console.error('Error checking/promoting user tier:', error)
    return null
  }
}

/**
 * Get requirements for user's next tier
 */
export function getNextTierRequirements(currentTier: number): TierRequirements | null {
  if (currentTier >= 3) {
    return null // No auto-promotion beyond tier 3
  }

  return TIER_REQUIREMENTS[currentTier] || null
}

/**
 * Calculate progress towards next tier
 */
export function calculateTierProgress(userExtended: {
  userTier: number
  editsApproved: number
  reputationScore: number
}): {
  nextTier: number | null
  progress: number
  missing: {
    editsApproved: number
    reputationScore: number
  } | null
} {
  const currentTier = userExtended.userTier

  if (currentTier >= 3) {
    return {
      nextTier: null,
      progress: 100,
      missing: null
    }
  }

  const nextRequirements = TIER_REQUIREMENTS[currentTier]
  if (!nextRequirements) {
    return {
      nextTier: null,
      progress: 100,
      missing: null
    }
  }

  const editsProgress = nextRequirements.editsApproved > 0
    ? Math.min(userExtended.editsApproved / nextRequirements.editsApproved, 1) * 100
    : 100

  const repProgress = nextRequirements.reputationScore > 0
    ? Math.min(userExtended.reputationScore / nextRequirements.reputationScore, 1) * 100
    : 100

  const totalProgress = Math.min((editsProgress + repProgress) / 2, 100)

  return {
    nextTier: nextRequirements.tier,
    progress: totalProgress,
    missing: {
      editsApproved: Math.max(0, nextRequirements.editsApproved - userExtended.editsApproved),
      reputationScore: Math.max(0, nextRequirements.reputationScore - userExtended.reputationScore)
    }
  }
}

/**
 * Manually promote a user (admin only)
 */
export async function manuallyPromoteUser(
  userId: string,
  newTier: number,
  promotedBy: string,
  reason: string
): Promise<boolean> {
  try {
    if (newTier < 1 || newTier > 5) {
      throw new Error('Invalid tier')
    }

    const userExtended = await prisma.userExtended.findUnique({
      where: { userId }
    })

    if (!userExtended) {
      throw new Error('User not found')
    }

    const oldTier = userExtended.userTier

    // Update tier
    await prisma.userExtended.update({
      where: { userId },
      data: {
        userTier: newTier
      }
    })

    // Award badge
    const badgeId = `tier-${newTier}`
    await awardBadge(userId, badgeId)

    // Create audit log
    await createAuditLog({
      userId: promotedBy,
      action: 'manual_tier_promotion',
      targetType: 'user',
      targetId: userId,
      details: {
        oldTier,
        newTier,
        reason,
        promotedBy
      }
    })

    console.log(`Admin ${promotedBy} manually promoted user ${userId} to Tier ${newTier}: ${reason}`)

    return true
  } catch (error) {
    console.error('Error manually promoting user:', error)
    return false
  }
}
