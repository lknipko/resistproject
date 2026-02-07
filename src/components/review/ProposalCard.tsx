'use client'

/**
 * ProposalCard Component
 *
 * Displays a single edit proposal with voting interface.
 * Features:
 * - Collapsible details view
 * - Vote buttons (approve/reject)
 * - Progress bars for approval/rejection
 * - Diff viewer when expanded
 * - Voter list
 */

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { DiffViewer } from './DiffViewer'
import { voteOnProposal } from '@/app/review/actions'
import type { EditProposal, Vote, User } from '@prisma/client'

interface ProposalCardProps {
  proposal: EditProposal & {
    proposer: Pick<User, 'id' | 'name' | 'email' | 'image'> & {
      extended: {
        displayName: string | null
      } | null
    }
    votes: (Vote & {
      voter: Pick<User, 'id' | 'name' | 'image'>
    })[]
    _count: {
      votes: number
    }
  }
  userHasVoted?: boolean
  currentUserId?: string
}

export function ProposalCard({ proposal, userHasVoted, currentUserId }: ProposalCardProps) {
  const router = useRouter()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const approvalProgress = proposal.approvalThreshold > 0
    ? Math.min((proposal.approvalScore / proposal.approvalThreshold) * 100, 100)
    : 0

  const rejectionProgress = proposal.rejectionThreshold < 0
    ? Math.min(Math.abs((proposal.rejectionScore / proposal.rejectionThreshold) * 100), 100)
    : 0

  const votesFor = proposal.votes.filter(v => v.voteType === 'approve').length
  const votesAgainst = proposal.votes.filter(v => v.voteType === 'reject').length

  const isOwnProposal = currentUserId === proposal.proposerId

  const handleVote = async (voteType: 'approve' | 'reject') => {
    setError(null)
    setSuccessMessage(null)

    startTransition(async () => {
      const result = await voteOnProposal(proposal.id, voteType)

      if (result.error) {
        setError(result.error)
      } else {
        setSuccessMessage(
          result.proposalResolved
            ? `Vote submitted! Proposal ${result.newStatus}.`
            : 'Vote submitted successfully!'
        )
        // Refresh to show updated vote counts
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

  return (
    <div className="bg-white border border-gray-300 rounded-lg shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
              <span className="font-medium text-gray-900">
                {proposal.proposer.extended?.displayName || proposal.proposer.name || proposal.proposer.email || 'User'}
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
        <div className="mt-4 space-y-2">
          {/* Approval Progress */}
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

          {/* Rejection Progress */}
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

          {/* Voter List */}
          {proposal.votes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Votes ({proposal.votes.length}):</h4>
              <div className="space-y-2">
                {proposal.votes.map((vote) => (
                  <div key={vote.id} className="flex items-center gap-2 text-sm">
                    {vote.voter.image && (
                      <img src={vote.voter.image} alt="" className="w-6 h-6 rounded-full" />
                    )}
                    <span className="font-medium">{vote.voter.name || 'User'}</span>
                    <span className={vote.voteType === 'approve' ? 'text-green-600' : 'text-red-600'}>
                      {vote.voteType === 'approve' ? '✓' : '✗'}
                    </span>
                    <span className="text-gray-500">
                      (weight: {vote.voteWeight})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Vote Buttons */}
          {!userHasVoted && !isOwnProposal && (
            <div className="flex gap-3">
              <button
                onClick={() => handleVote('approve')}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Submitting...' : 'Approve'}
              </button>
              <button
                onClick={() => handleVote('reject')}
                disabled={isPending}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isPending ? 'Submitting...' : 'Reject'}
              </button>
            </div>
          )}

          {userHasVoted && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm text-center font-medium">
              ✓ You have already voted on this proposal
            </div>
          )}

          {isOwnProposal && (
            <div className="p-3 bg-gray-100 border border-gray-300 rounded text-gray-700 text-sm text-center font-medium">
              This is your proposal - you cannot vote on it
            </div>
          )}
        </div>
      )}
    </div>
  )
}
