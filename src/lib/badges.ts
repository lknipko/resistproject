/**
 * Badge System
 *
 * Awards badges for achievements and milestones.
 */

import { prisma } from './db'
import { createAuditLog } from './audit'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category: 'contribution' | 'quality' | 'engagement' | 'tier' | 'special'
}

/**
 * Available badges
 */
export const BADGES: Record<string, Badge> = {
  // Tier badges
  'tier-2': {
    id: 'tier-2',
    name: 'Contributor',
    description: 'Reached Tier 2',
    icon: '📝',
    rarity: 'common',
    category: 'tier'
  },
  'tier-3': {
    id: 'tier-3',
    name: 'Trusted Contributor',
    description: 'Reached Tier 3',
    icon: '✅',
    rarity: 'rare',
    category: 'tier'
  },
  'tier-4': {
    id: 'tier-4',
    name: 'Community Moderator',
    description: 'Promoted to Moderator',
    icon: '🛡️',
    rarity: 'epic',
    category: 'tier'
  },
  'tier-5': {
    id: 'tier-5',
    name: 'Administrator',
    description: 'Site Administrator',
    icon: '👑',
    rarity: 'legendary',
    category: 'tier'
  },

  // Contribution badges
  'first-edit': {
    id: 'first-edit',
    name: 'First Edit',
    description: 'First edit approved',
    icon: '🌟',
    rarity: 'common',
    category: 'contribution'
  },
  'prolific-editor': {
    id: 'prolific-editor',
    name: 'Prolific Editor',
    description: '10+ edits approved',
    icon: '📚',
    rarity: 'rare',
    category: 'contribution'
  },
  'wiki-guardian': {
    id: 'wiki-guardian',
    name: 'Wiki Guardian',
    description: '50+ edits approved',
    icon: '🏆',
    rarity: 'epic',
    category: 'contribution'
  },
  'wiki-legend': {
    id: 'wiki-legend',
    name: 'Wiki Legend',
    description: '100+ edits approved',
    icon: '💎',
    rarity: 'legendary',
    category: 'contribution'
  },

  // Quality badges
  'source-champion': {
    id: 'source-champion',
    name: 'Source Champion',
    description: '20+ edits with .gov sources',
    icon: '🔍',
    rarity: 'rare',
    category: 'quality'
  },
  'fact-checker': {
    id: 'fact-checker',
    name: 'Fact Checker',
    description: '10+ source citations added',
    icon: '✓',
    rarity: 'rare',
    category: 'quality'
  },

  // Engagement badges
  'active-voter': {
    id: 'active-voter',
    name: 'Active Voter',
    description: '50+ votes cast',
    icon: '🗳️',
    rarity: 'common',
    category: 'engagement'
  },
  'quality-reviewer': {
    id: 'quality-reviewer',
    name: 'Quality Reviewer',
    description: '100+ votes cast',
    icon: '👁️',
    rarity: 'rare',
    category: 'engagement'
  },
  'community-voice': {
    id: 'community-voice',
    name: 'Community Voice',
    description: '500+ votes cast',
    icon: '📢',
    rarity: 'epic',
    category: 'engagement'
  },

  // Special badges
  'early-adopter': {
    id: 'early-adopter',
    name: 'Early Adopter',
    description: 'Joined in the first month',
    icon: '🚀',
    rarity: 'legendary',
    category: 'special'
  },
  'helpful-feedback': {
    id: 'helpful-feedback',
    name: 'Helpful Feedback',
    description: '10+ comments on proposals',
    icon: '💬',
    rarity: 'common',
    category: 'engagement'
  },
}

/**
 * Award a badge to a user
 *
 * @param userId - User ID
 * @param badgeId - Badge ID from BADGES
 * @returns True if badge awarded, false if already had it
 */
export async function awardBadge(userId: string, badgeId: string): Promise<boolean> {
  try {
    const badge = BADGES[badgeId]
    if (!badge) {
      console.error(`Badge ${badgeId} not found`)
      return false
    }

    const userExtended = await prisma.userExtended.findUnique({
      where: { userId }
    })

    if (!userExtended) {
      console.error(`User ${userId} not found`)
      return false
    }

    // Check if user already has this badge
    const currentBadges = userExtended.badges as string[]
    if (currentBadges.includes(badgeId)) {
      return false // Already has badge
    }

    // Add badge
    await prisma.userExtended.update({
      where: { userId },
      data: {
        badges: {
          push: badgeId
        }
      }
    })

    // Create audit log
    await createAuditLog({
      userId,
      action: 'badge_awarded',
      targetType: 'user',
      targetId: userId,
      details: {
        badgeId,
        badgeName: badge.name,
        rarity: badge.rarity
      }
    })

    console.log(`🏅 Badge "${badge.name}" awarded to user ${userId}`)

    return true
  } catch (error) {
    console.error('Error awarding badge:', error)
    return false
  }
}

/**
 * Check and award badges based on user's achievements
 *
 * @param userId - User ID to check
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  try {
    const userExtended = await prisma.userExtended.findUnique({
      where: { userId }
    })

    if (!userExtended) {
      return []
    }

    const awardedBadges: string[] = []

    // Check contribution badges
    if (userExtended.editsApproved >= 1) {
      if (await awardBadge(userId, 'first-edit')) {
        awardedBadges.push('first-edit')
      }
    }

    if (userExtended.editsApproved >= 10) {
      if (await awardBadge(userId, 'prolific-editor')) {
        awardedBadges.push('prolific-editor')
      }
    }

    if (userExtended.editsApproved >= 50) {
      if (await awardBadge(userId, 'wiki-guardian')) {
        awardedBadges.push('wiki-guardian')
      }
    }

    if (userExtended.editsApproved >= 100) {
      if (await awardBadge(userId, 'wiki-legend')) {
        awardedBadges.push('wiki-legend')
      }
    }

    // Check engagement badges
    if (userExtended.votesCast >= 50) {
      if (await awardBadge(userId, 'active-voter')) {
        awardedBadges.push('active-voter')
      }
    }

    if (userExtended.votesCast >= 100) {
      if (await awardBadge(userId, 'quality-reviewer')) {
        awardedBadges.push('quality-reviewer')
      }
    }

    if (userExtended.votesCast >= 500) {
      if (await awardBadge(userId, 'community-voice')) {
        awardedBadges.push('community-voice')
      }
    }

    return awardedBadges
  } catch (error) {
    console.error('Error checking/awarding badges:', error)
    return []
  }
}

/**
 * Get badge display info
 */
export function getBadgeInfo(badgeId: string): Badge | null {
  return BADGES[badgeId] || null
}

/**
 * Get all badges for a user with display info
 */
export function getUserBadgesWithInfo(badgeIds: string[]): Badge[] {
  return badgeIds
    .map(id => BADGES[id])
    .filter((badge): badge is Badge => badge !== undefined)
}
