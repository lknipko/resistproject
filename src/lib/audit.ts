/**
 * Audit Logging Utility
 *
 * Tracks all user actions for security, transparency, and moderation.
 * Creates AuditLog records for every significant action in the system.
 */

import { prisma } from './db'
import type { AuditLog } from '@prisma/client'

export interface CreateAuditLogParams {
  // Action identification
  actionType: string
  actionCategory: 'content' | 'voting' | 'moderation' | 'gamification' | 'system' | 'user'

  // Actor information
  actorId: string | 'system'
  actorType?: 'user' | 'system' | 'admin'
  actorIpHash?: string

  // Target information
  targetType?: 'page' | 'proposal' | 'user' | 'vote'
  targetId?: number | string
  targetPath?: string

  // Action details
  description: string
  oldValue?: any
  newValue?: any
  metadata?: any

  // Security flags
  isSuspicious?: boolean
}

export interface QueryAuditTrailParams {
  // Filters
  targetPath?: string
  actorId?: string
  actionType?: string
  actionCategory?: string
  startDate?: Date
  endDate?: Date

  // Pagination
  limit?: number
  offset?: number
}

/**
 * Create an audit log entry.
 * Call this after any significant action (edit submission, vote, approval, etc.)
 *
 * @param params - Audit log parameters
 * @returns Created AuditLog record
 */
export async function createAuditLog(params: CreateAuditLogParams): Promise<AuditLog> {
  const {
    actionType,
    actionCategory,
    actorId,
    actorType = 'user',
    actorIpHash,
    targetType,
    targetId,
    targetPath,
    description,
    oldValue,
    newValue,
    metadata,
    isSuspicious = false
  } = params

  // Convert targetId to number if it's a string number
  const targetIdNumber = targetId !== undefined
    ? typeof targetId === 'string'
      ? parseInt(targetId, 10)
      : targetId
    : undefined

  return await prisma.auditLog.create({
    data: {
      actionType,
      actionCategory,
      actorId: actorId === 'system' ? null : actorId,
      actorType,
      actorIpHash,
      targetType,
      targetId: targetIdNumber,
      targetPath,
      description,
      oldValue: oldValue !== undefined ? oldValue : undefined,
      newValue: newValue !== undefined ? newValue : undefined,
      metadata: metadata !== undefined ? metadata : undefined,
      isSuspicious
    }
  })
}

/**
 * Query audit trail with filters.
 * Useful for viewing history of a page, user, or action type.
 *
 * @param params - Query parameters with filters
 * @returns Array of AuditLog records
 */
export async function getAuditTrail(params: QueryAuditTrailParams = {}): Promise<AuditLog[]> {
  const {
    targetPath,
    actorId,
    actionType,
    actionCategory,
    startDate,
    endDate,
    limit = 50,
    offset = 0
  } = params

  return await prisma.auditLog.findMany({
    where: {
      targetPath: targetPath ? targetPath : undefined,
      actorId: actorId ? actorId : undefined,
      actionType: actionType ? actionType : undefined,
      actionCategory: actionCategory ? actionCategory : undefined,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          extended: {
            select: {
              displayName: true,
              userTier: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset
  })
}

/**
 * Get audit trail for a specific page.
 * Shows all edits, approvals, and other actions on a page.
 *
 * @param pagePath - Page path (e.g., '/learn/digital-rights')
 * @param limit - Maximum number of records to return
 * @returns Array of AuditLog records
 */
export async function getPageAuditTrail(pagePath: string, limit: number = 50): Promise<AuditLog[]> {
  return await getAuditTrail({ targetPath: pagePath, limit })
}

/**
 * Get audit trail for a specific user.
 * Shows all actions performed by a user.
 *
 * @param userId - User ID
 * @param limit - Maximum number of records to return
 * @returns Array of AuditLog records
 */
export async function getUserAuditTrail(userId: string, limit: number = 50): Promise<AuditLog[]> {
  return await getAuditTrail({ actorId: userId, limit })
}

/**
 * Get recent suspicious activity.
 * Useful for moderation dashboard.
 *
 * @param limit - Maximum number of records to return
 * @returns Array of suspicious AuditLog records
 */
export async function getSuspiciousActivity(limit: number = 20): Promise<AuditLog[]> {
  return await prisma.auditLog.findMany({
    where: {
      isSuspicious: true
    },
    include: {
      actor: {
        select: {
          name: true,
          email: true,
          extended: {
            select: {
              displayName: true,
              userTier: true,
              accountStatus: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  })
}

/**
 * Count actions by a user in a time period.
 * Useful for rate limiting and abuse detection.
 *
 * @param userId - User ID
 * @param actionType - Type of action to count
 * @param since - Start date (default: 24 hours ago)
 * @returns Count of actions
 */
export async function countUserActions(
  userId: string,
  actionType: string,
  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000)
): Promise<number> {
  return await prisma.auditLog.count({
    where: {
      actorId: userId,
      actionType,
      createdAt: {
        gte: since
      }
    }
  })
}

/**
 * Helper: Create audit log for edit proposal submission.
 */
export async function logEditSubmission(
  userId: string,
  proposalId: number,
  pagePath: string,
  editSummary: string,
  editType: string,
  instantApproval: boolean
): Promise<void> {
  await createAuditLog({
    actionType: instantApproval ? 'edit_proposal_instant_approved' : 'edit_proposal_submitted',
    actionCategory: 'content',
    actorId: userId,
    targetType: 'proposal',
    targetId: proposalId,
    targetPath: pagePath,
    description: `Submitted edit proposal: ${editSummary}`,
    metadata: { editType, instantApproval }
  })
}

/**
 * Helper: Create audit log for vote cast.
 */
export async function logVoteCast(
  userId: string,
  proposalId: number,
  voteType: string,
  voteWeight: number
): Promise<void> {
  await createAuditLog({
    actionType: 'vote_cast',
    actionCategory: 'voting',
    actorId: userId,
    targetType: 'proposal',
    targetId: proposalId,
    description: `Cast ${voteType} vote (weight: ${voteWeight})`,
    metadata: { voteType, voteWeight }
  })
}

/**
 * Helper: Create audit log for proposal resolution.
 */
export async function logProposalResolution(
  proposalId: number,
  status: 'approved' | 'rejected',
  resolverIdOrSystem: string | 'system',
  reason: string,
  pagePath: string
): Promise<void> {
  await createAuditLog({
    actionType: 'edit_proposal_resolved',
    actionCategory: 'content',
    actorId: resolverIdOrSystem,
    actorType: resolverIdOrSystem === 'system' ? 'system' : 'user',
    targetType: 'proposal',
    targetId: proposalId,
    targetPath: pagePath,
    description: `Edit proposal ${status}: ${reason}`,
    metadata: { status, reason }
  })
}

/**
 * Helper: Create audit log for tier promotion.
 */
export async function logTierPromotion(
  userId: string,
  oldTier: number,
  newTier: number
): Promise<void> {
  await createAuditLog({
    actionType: 'tier_promotion',
    actionCategory: 'gamification',
    actorId: 'system',
    actorType: 'system',
    targetType: 'user',
    targetId: userId,
    description: `User promoted from Tier ${oldTier} to Tier ${newTier}`,
    oldValue: { tier: oldTier },
    newValue: { tier: newTier }
  })
}

/**
 * Helper: Create audit log for reputation award.
 */
export async function logReputationAward(
  userId: string,
  points: number,
  reason: string
): Promise<void> {
  await createAuditLog({
    actionType: 'reputation_awarded',
    actionCategory: 'gamification',
    actorId: 'system',
    actorType: 'system',
    targetType: 'user',
    targetId: userId,
    description: `Awarded ${points} reputation: ${reason}`,
    metadata: { points, reason }
  })
}

/**
 * Helper: Create audit log for badge award.
 */
export async function logBadgeAward(
  userId: string,
  badgeId: string,
  badgeName: string
): Promise<void> {
  await createAuditLog({
    actionType: 'badge_awarded',
    actionCategory: 'gamification',
    actorId: 'system',
    actorType: 'system',
    targetType: 'user',
    targetId: userId,
    description: `Awarded badge: ${badgeName}`,
    metadata: { badgeId, badgeName }
  })
}
