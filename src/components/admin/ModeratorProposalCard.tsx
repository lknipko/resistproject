'use client'

/**
 * ModeratorProposalCard Component
 *
 * Enhanced proposal card for moderators with instant approve/reject actions.
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DiffViewer } from '../review/DiffViewer'
import { moderatorApprove, moderatorReject } from '@/app/admin/review-edits/actions'
import type { EditProposal, Vote, User } from '@prisma/client'

interface ModeratorProposalCardProps {
  proposal: EditProposal & {
    proposer: Pick<User, 'id' | 'name' | 'email' | 'image'>
    resolvedBy?: Pick<User, 'id' | 'name' | 'email'> | null
    votes: (Vote & {
      voter: Pick<User, 'id' | 'name' | 'image'>
    })[]
    _count: {
      votes: number
    }
  }
}

export function ModeratorProposalCard({ proposal }: ModeratorProposalCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showRejectReason, setShowRejectReason] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const approvalProgress = proposal.approvalThreshold > 0
    ? Math.min((proposal.approvalScore / proposal.approvalThreshold) * 100, 100)
    : 0

  const rejectionProgress = proposal.rejectionThreshold < 0
    ? Math.min(Math.abs((proposal.rejectionScore / proposal.rejectionThreshold) * 100), 100)
    : 0

  const votesFor = proposal.votes.filter(v => v.voteType === 'approve').length
  const votesAgainst = proposal.votes.filter(v => v.voteType === 'reject').length

  const handleInstantApprove = async () => {
    if (!confirm('Are you sure you want to instantly approve this proposal? This will bypass community voting.')) {
      return
    }

    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = await moderatorApprove(proposal.id, 'Moderator instant approval')

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage('Proposal approved successfully!')
        router.refresh()
      }
    })
  }

  const handleInstantReject = async () => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection')
      return
    }

    if (!confirm('Are you sure you want to instantly reject this proposal?')) {
      return
    }

    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = await moderatorReject(proposal.id, rejectReason)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage('Proposal rejected successfully!')
        setShowRejectReason(false)
        setRejectReason('')
        router.refresh()
      }
    })
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getStatusBadge = () => {
    switch (proposal.status) {
      case 'pending':
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">Pending</span>
      case 'approved':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Approved</span>
      case 'rejected':
        return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Rejected</span>
      default:
        return null
    }
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge()}
              <span className="text-sm text-gray-600">
                #{proposal.id}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">
                {proposal.proposer.name || proposal.proposer.email || 'User'}
              </span>
              <span>•</span>
              <span>{formatDate(proposal.createdAt)}</span>
              <span>•</span>
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                Tier {proposal.proposerTier}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {proposal.pagePath}
            </h3>
            <p className="text-gray-700">{proposal.editSummary}</p>

            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
              <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded font-medium">
                {proposal.editType.replace('-', ' ')}
              </span>
              <span>{votesFor} approve</span>
              <span>{votesAgainst} reject</span>
            </div>
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-teal-600 hover:text-teal-700 font-medium text-sm flex items-center gap-1"
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
            <svg
              className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Progress Bars */}
        {proposal.status === 'pending' && (
          <div className="mt-4 space-y-2">
            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Approval: {proposal.approvalScore} / {proposal.approvalThreshold}</span>
                <span>{Math.round(approvalProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${approvalProgress}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs text-gray-600 mb-1">
                <span>Rejection: {Math.abs(proposal.rejectionScore)} / {Math.abs(proposal.rejectionThreshold)}</span>
                <span>{Math.round(rejectionProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-red-600 h-2 rounded-full transition-all"
                  style={{ width: `${rejectionProgress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Resolved Info */}
        {proposal.status !== 'pending' && proposal.resolvedBy && (
          <div className="mt-3 text-sm text-gray-600">
            Resolved by: {proposal.resolvedBy.name || proposal.resolvedBy.email} on {formatDate(proposal.resolvedAt!)}
            {proposal.resolutionReason && (
              <div className="text-xs text-gray-500 mt-1">Reason: {proposal.resolutionReason}</div>
            )}
          </div>
        )}
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="p-4 bg-gray-50">
          {/* Diff Viewer */}
          <div className="mb-4">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Changes:</h4>
            <DiffViewer
              originalContent={proposal.originalContent}
              proposedContent={proposal.proposedContent}
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-800 text-sm">
              {successMessage}
            </div>
          )}

          {/* Moderator Actions */}
          {proposal.status === 'pending' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">Moderator Actions:</h4>

              <div className="flex gap-3">
                <button
                  onClick={handleInstantApprove}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isPending ? 'Processing...' : '✓ Instant Approve'}
                </button>
                <button
                  onClick={() => setShowRejectReason(!showRejectReason)}
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ✗ Instant Reject
                </button>
              </div>

              {/* Reject Reason Input */}
              {showRejectReason && (
                <div className="p-3 bg-white border border-red-200 rounded-lg">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rejection Reason (required):
                  </label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Explain why this edit is being rejected..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    disabled={isPending}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={handleInstantReject}
                      disabled={isPending || !rejectReason.trim()}
                      className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Confirm Reject
                    </button>
                    <button
                      onClick={() => {
                        setShowRejectReason(false)
                        setRejectReason('')
                      }}
                      disabled={isPending}
                      className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
