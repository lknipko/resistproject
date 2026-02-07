/**
 * Proposal Resolution System
 *
 * Handles auto-approval/rejection when vote thresholds are reached
 * and tier promotion based on edit history.
 */

import { prisma } from '@/lib/db'
import { EditProposal, UserExtended } from '@prisma/client'
import { createAuditLog, logProposalResolution } from './audit'
import { revalidatePath } from 'next/cache'
import { awardEditApprovalReputation, penalizeEditRejection, awardMajorityVoteBonus } from './reputation'
import { checkAndPromoteUserTier as tierPromote } from './tier-promotion'
import { checkAndAwardBadges } from './badges'

/**
 * Check if a proposal has reached approval or rejection threshold
 * and auto-resolve it if so.
 */
export async function checkAndResolveProposal(
  proposalId: number
): Promise<{ resolved: boolean; status?: 'approved' | 'rejected' }> {
  const proposal = await prisma.editProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: true,
    }
  })

  if (!proposal) {
    throw new Error('Proposal not found')
  }

  if (proposal.status !== 'pending') {
    return { resolved: false }
  }

  // Check approval threshold
  if (proposal.approvalScore >= proposal.approvalThreshold) {
    await resolveProposal(proposalId, 'approved', 'Automatic approval: threshold reached', 'system')
    return { resolved: true, status: 'approved' }
  }

  // Check rejection threshold (note: rejection threshold is negative)
  if (proposal.rejectionScore <= proposal.rejectionThreshold) {
    await resolveProposal(proposalId, 'rejected', 'Automatic rejection: threshold reached', 'system')
    return { resolved: true, status: 'rejected' }
  }

  return { resolved: false }
}

/**
 * Resolve a proposal (approve or reject).
 * Updates proposal status, proposer stats, awards reputation,
 * and checks for tier promotion.
 */
export async function resolveProposal(
  proposalId: number,
  status: 'approved' | 'rejected',
  reason: string,
  resolverId: string | 'system'
): Promise<void> {
  const proposal = await prisma.editProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: true,
      votes: {
        include: {
          voter: true
        }
      }
    }
  })

  if (!proposal) {
    throw new Error('Proposal not found')
  }

  if (proposal.status !== 'pending') {
    throw new Error('Proposal is not pending')
  }

  // Update proposal status
  await prisma.editProposal.update({
    where: { id: proposalId },
    data: {
      status,
      resolvedById: resolverId === 'system' ? null : resolverId,
      resolvedAt: new Date(),
      resolutionReason: reason,
    }
  })

  // Update proposer statistics
  if (status === 'approved') {
    await prisma.userExtended.update({
      where: { userId: proposal.proposerId },
      data: {
        editsApproved: { increment: 1 },
      }
    })

    // Award reputation using the reputation system
    await awardEditApprovalReputation(proposal.proposerId, proposalId)
  } else {
    await prisma.userExtended.update({
      where: { userId: proposal.proposerId },
      data: {
        editsRejected: { increment: 1 },
      }
    })

    // Penalize reputation using the reputation system
    await penalizeEditRejection(proposal.proposerId, proposalId)
  }

  // Award bonus reputation to voters who voted with majority
  if (proposal.votes.length > 0) {
    const majorityVoteType = status === 'approved' ? 'approve' : 'reject'
    await awardMajorityVoteBonus(proposalId, majorityVoteType)

    // Track vote statistics
    for (const vote of proposal.votes) {
      if (vote.voteType === majorityVoteType) {
        await prisma.userExtended.update({
          where: { userId: vote.voterId },
          data: {
            votesReceivedPositive: { increment: 1 },
          }
        })
      } else {
        await prisma.userExtended.update({
          where: { userId: vote.voterId },
          data: {
            votesReceivedNegative: { increment: 1 },
          }
        })
      }
    }
  }

  // Create audit log
  await logProposalResolution(
    proposalId,
    status,
    resolverId,
    reason,
    proposal.pagePath
  )

  // Check if proposer should be promoted and award badges
  const newTier = await tierPromote(proposal.proposerId)
  if (newTier) {
    console.log(`🎉 User promoted to Tier ${newTier}`)
  }

  // Check and award any eligible badges
  await checkAndAwardBadges(proposal.proposerId)

  // Revalidate the review page and the affected content page
  revalidatePath('/review')
  const [section, slug] = proposal.pagePath.split('/').filter(Boolean)
  if (section && slug) {
    revalidatePath(`/${section}/${slug}`)
  }
}

// Tier promotion moved to src/lib/tier-promotion.ts

/**
 * Get proposal resolution status and vote breakdown.
 */
export async function getProposalResolutionStatus(proposalId: number): Promise<{
  proposal: EditProposal
  votesFor: number
  votesAgainst: number
  approvalProgress: number
  rejectionProgress: number
  canResolve: boolean
  willApprove: boolean
  willReject: boolean
}> {
  const proposal = await prisma.editProposal.findUnique({
    where: { id: proposalId },
    include: {
      votes: true
    }
  })

  if (!proposal) {
    throw new Error('Proposal not found')
  }

  const votesFor = proposal.votes.filter(v => v.voteType === 'approve').length
  const votesAgainst = proposal.votes.filter(v => v.voteType === 'reject').length

  const approvalProgress = proposal.approvalThreshold > 0
    ? (proposal.approvalScore / proposal.approvalThreshold) * 100
    : 0

  const rejectionProgress = proposal.rejectionThreshold < 0
    ? Math.abs((proposal.rejectionScore / proposal.rejectionThreshold) * 100)
    : 0

  const willApprove = proposal.approvalScore >= proposal.approvalThreshold
  const willReject = proposal.rejectionScore <= proposal.rejectionThreshold
  const canResolve = willApprove || willReject

  return {
    proposal,
    votesFor,
    votesAgainst,
    approvalProgress,
    rejectionProgress,
    canResolve,
    willApprove,
    willReject
  }
}
