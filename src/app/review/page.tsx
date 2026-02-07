/**
 * Review Queue Page
 *
 * Displays all pending edit proposals for community voting.
 * Requires authentication.
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getPendingProposals } from './actions'
import { ProposalCard } from '@/components/review/ProposalCard'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Review Proposals - Resist Project',
  description: 'Review and vote on community edit proposals'
}

interface ReviewPageProps {
  searchParams: Promise<{
    status?: 'pending' | 'approved' | 'rejected'
    page?: string
  }>
}

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/review')
  }

  const params = await searchParams
  const status = params.status || 'pending'
  const page = parseInt(params.page || '1', 10)
  const limit = 20
  const offset = (page - 1) * limit

  // Fetch proposals
  const { proposals, totalCount, hasMore } = await getPendingProposals({
    status,
    limit,
    offset
  })

  // Get user's votes to check which proposals they've voted on
  const userVotes = await prisma.vote.findMany({
    where: {
      voterId: session.user.id,
      proposalId: {
        in: proposals.map(p => p.id)
      }
    },
    select: {
      proposalId: true
    }
  })

  const votedProposalIds = new Set(userVotes.map(v => v.proposalId))

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Review Edit Proposals</h1>
          <p className="text-gray-600">
            Help improve the content by reviewing and voting on community edit proposals.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-300">
          <a
            href="/review?status=pending"
            className={`px-4 py-2 font-semibold transition-colors ${
              status === 'pending'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
            {status === 'pending' && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-teal-100 text-teal-700 rounded-full">
                {totalCount}
              </span>
            )}
          </a>
          <a
            href="/review?status=approved"
            className={`px-4 py-2 font-semibold transition-colors ${
              status === 'approved'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved
          </a>
          <a
            href="/review?status=rejected"
            className={`px-4 py-2 font-semibold transition-colors ${
              status === 'rejected'
                ? 'text-teal-600 border-b-2 border-teal-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected
          </a>
        </div>

        {/* Info Box */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How Voting Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Your vote weight depends on your tier: Tier 1 = 1 point, Tier 2 = 2 points, Tier 3+ = 3 points</li>
            <li>• Tier 1 proposals need 10 approval points, Tier 2 need 5 points, Tier 3+ are auto-approved</li>
            <li>• Proposals auto-approve or auto-reject when thresholds are reached</li>
            <li>• You earn +1 reputation for voting, +2 bonus if you vote with the majority</li>
          </ul>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No {status} proposals found</p>
            <p className="text-gray-500 text-sm">
              {status === 'pending'
                ? 'Check back later or start contributing by suggesting edits!'
                : `Switch to the "Pending" tab to see proposals awaiting review.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                userHasVoted={votedProposalIds.has(proposal.id)}
                currentUserId={session.user.id}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <a
                href={`/review?status=${status}&page=${page - 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                ← Previous
              </a>
            )}

            <span className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium text-gray-900">
              Page {page} of {totalPages}
            </span>

            {hasMore && (
              <a
                href={`/review?status=${status}&page=${page + 1}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next →
              </a>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {proposals.length} of {totalCount} {status} proposals
        </div>
      </div>
    </div>
  )
}
