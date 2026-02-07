/**
 * Permissions System
 *
 * Handles all tier-based permission checks, vote weighting, approval thresholds,
 * and rate limiting for the collaborative editing system.
 */

import { prisma } from './db'
import type { UserExtended } from '@prisma/client'

export interface PermissionContext {
  userId: string
  userExtended?: UserExtended | null
}

export interface PermissionResult {
  allowed: boolean
  reason?: string
}

/**
 * Daily edit limits by user tier
 */
const DAILY_EDIT_LIMITS = {
  1: 3,    // Tier 1: 3 edits per day
  2: 10,   // Tier 2: 10 edits per day
  3: 50,   // Tier 3: 50 edits per day
  4: 100,  // Tier 4: 100 edits per day
  5: 999   // Tier 5: Unlimited (effectively)
} as const

/**
 * Daily vote limits by user tier
 */
const DAILY_VOTE_LIMITS = {
  1: 20,   // Tier 1: 20 votes per day
  2: 50,   // Tier 2: 50 votes per day
  3: 100,  // Tier 3: 100 votes per day
  4: 200,  // Tier 4: 200 votes per day
  5: 999   // Tier 5: Unlimited (effectively)
} as const

/**
 * Check if a user can submit an edit proposal.
 * Checks: account status, daily rate limits, tier permissions.
 *
 * @param context - User context with userExtended
 * @returns Permission result with allowed status and optional reason
 */
export async function canSubmitEdit(context: PermissionContext): Promise<PermissionResult> {
  if (!context.userExtended) {
    return { allowed: false, reason: 'User profile not found' }
  }

  // Check account status
  if (context.userExtended.accountStatus !== 'active') {
    const reason = context.userExtended.suspensionReason
      ? `Account suspended: ${context.userExtended.suspensionReason}`
      : 'Account is not active'
    return { allowed: false, reason }
  }

  // Check if account suspension has expired
  if (context.userExtended.suspensionExpires) {
    const now = new Date()
    if (context.userExtended.suspensionExpires > now) {
      const daysLeft = Math.ceil(
        (context.userExtended.suspensionExpires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )
      return {
        allowed: false,
        reason: `Account suspended for ${daysLeft} more day${daysLeft > 1 ? 's' : ''}`
      }
    }
  }

  // Check daily rate limit
  const today = new Date().toISOString().split('T')[0]
  const lastReset = context.userExtended.lastActivityReset
    ? context.userExtended.lastActivityReset.toISOString().split('T')[0]
    : null

  // If it's a new day, reset counters
  if (today !== lastReset) {
    await prisma.userExtended.update({
      where: { userId: context.userId },
      data: {
        dailyEditCount: 0,
        dailyVoteCount: 0,
        lastActivityReset: new Date()
      }
    })
    return { allowed: true }
  }

  // Check daily edit limit for user's tier
  const userTier = context.userExtended.userTier as 1 | 2 | 3 | 4 | 5
  const limit = DAILY_EDIT_LIMITS[userTier]

  if (context.userExtended.dailyEditCount >= limit) {
    return {
      allowed: false,
      reason: `Daily edit limit reached (${limit} edits per day for your tier)`
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can vote on an edit proposal.
 * Checks: account status, daily rate limits.
 *
 * @param context - User context with userExtended
 * @returns Permission result with allowed status and optional reason
 */
export async function canVote(context: PermissionContext): Promise<PermissionResult> {
  if (!context.userExtended) {
    return { allowed: false, reason: 'User profile not found' }
  }

  // Check account status
  if (context.userExtended.accountStatus !== 'active') {
    return { allowed: false, reason: 'Account is not active' }
  }

  // Check daily rate limit
  const today = new Date().toISOString().split('T')[0]
  const lastReset = context.userExtended.lastActivityReset
    ? context.userExtended.lastActivityReset.toISOString().split('T')[0]
    : null

  // If it's a new day, counters were already reset (or will be on first action)
  if (today !== lastReset) {
    return { allowed: true }
  }

  // Check daily vote limit for user's tier
  const userTier = context.userExtended.userTier as 1 | 2 | 3 | 4 | 5
  const limit = DAILY_VOTE_LIMITS[userTier]

  if (context.userExtended.dailyVoteCount >= limit) {
    return {
      allowed: false,
      reason: `Daily vote limit reached (${limit} votes per day for your tier)`
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can moderate (instant approve/reject edits).
 * Requires tier 3 or higher.
 *
 * @param context - User context with userExtended
 * @returns Permission result with allowed status and optional reason
 */
export async function canModerate(context: PermissionContext): Promise<PermissionResult> {
  if (!context.userExtended) {
    return { allowed: false, reason: 'User profile not found' }
  }

  if (context.userExtended.userTier < 3) {
    return {
      allowed: false,
      reason: `Moderator access requires Tier 3 or higher (you are Tier ${context.userExtended.userTier})`
    }
  }

  return { allowed: true }
}

/**
 * Check if a user can administer (site-wide settings, user management).
 * Requires tier 5 (Administrator).
 *
 * @param context - User context with userExtended
 * @returns Permission result with allowed status and optional reason
 */
export async function canAdminister(context: PermissionContext): Promise<PermissionResult> {
  if (!context.userExtended) {
    return { allowed: false, reason: 'User profile not found' }
  }

  if (context.userExtended.userTier < 5) {
    return {
      allowed: false,
      reason: `Administrator access requires Tier 5 (you are Tier ${context.userExtended.userTier})`
    }
  }

  return { allowed: true }
}

/**
 * Get the vote weight for a user based on their tier.
 *
 * - Tier 1: 1 point per vote
 * - Tier 2: 2 points per vote
 * - Tier 3+: 3 points per vote
 *
 * @param userTier - User's tier (1-5)
 * @returns Vote weight (1, 2, or 3)
 */
export function getVoteWeight(userTier: number): number {
  if (userTier >= 3) return 3
  if (userTier === 2) return 2
  return 1
}

/**
 * Get the approval and rejection thresholds for an edit proposal
 * based on the proposer's tier.
 *
 * - Tier 1 proposer: 10 points to approve, -5 to reject
 * - Tier 2 proposer: 5 points to approve, -3 to reject
 * - Tier 3+ proposer: Instant approval (thresholds not used)
 *
 * @param proposerTier - Proposer's tier (1-5)
 * @returns Object with approvalThreshold and rejectionThreshold
 */
export function getApprovalThreshold(proposerTier: number): {
  approvalThreshold: number
  rejectionThreshold: number
} {
  // Tier 3+ = instant approval (thresholds not used)
  if (proposerTier >= 3) {
    return { approvalThreshold: 0, rejectionThreshold: 0 }
  }

  if (proposerTier === 2) {
    return { approvalThreshold: 5, rejectionThreshold: -3 }
  }

  // Tier 1
  return { approvalThreshold: 10, rejectionThreshold: -5 }
}

/**
 * Increment the daily edit count for a user.
 * Call this after successfully submitting an edit proposal.
 *
 * @param userId - User ID
 */
export async function incrementEditCount(userId: string): Promise<void> {
  await prisma.userExtended.update({
    where: { userId },
    data: { dailyEditCount: { increment: 1 } }
  })
}

/**
 * Increment the daily vote count for a user.
 * Call this after successfully casting a vote.
 *
 * @param userId - User ID
 */
export async function incrementVoteCount(userId: string): Promise<void> {
  await prisma.userExtended.update({
    where: { userId },
    data: { dailyVoteCount: { increment: 1 } }
  })
}

/**
 * Check if a user is allowed to perform a specific action based on their tier.
 * General-purpose permission check.
 *
 * @param userTier - User's tier (1-5)
 * @param requiredTier - Minimum tier required for the action
 * @returns True if user has required tier or higher
 */
export function hasMinimumTier(userTier: number, requiredTier: number): boolean {
  return userTier >= requiredTier
}

/**
 * Get user's tier name as a human-readable string.
 *
 * @param userTier - User's tier (1-5)
 * @returns Tier name
 */
export function getTierName(userTier: number): string {
  const tierNames = {
    1: 'New Contributor',
    2: 'Contributor',
    3: 'Trusted Contributor',
    4: 'Moderator',
    5: 'Administrator'
  }
  return tierNames[userTier as keyof typeof tierNames] || 'User'
}
