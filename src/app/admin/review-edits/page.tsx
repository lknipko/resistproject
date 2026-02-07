/**
 * Moderator Review Dashboard
 *
 * Enhanced edit review interface for Tier 3+ moderators.
 * Features:
 * - Instant approve/reject
 * - Enhanced filters
 * - Bulk operations
 * - Proposer history
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { canModerate } from '@/lib/permissions'
import { getProposalsForModerator } from './actions'
import { ModeratorProposalCard } from '@/components/admin/ModeratorProposalCard'

export const metadata = {
  title: 'Moderator Dashboard - Resist Project',
  description: 'Review and moderate community edit proposals'
}

interface ModeratorDashboardProps {
  searchParams: Promise<{
    status?: 'pending' | 'approved' | 'rejected' | 'all'
    page?: string
    search?: string
  }>
}

export default async function ModeratorDashboard({ searchParams }: ModeratorDashboardProps) {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin/review-edits')
  }

  // Check moderator permissions
  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id }
  })

  if (!userExtended) {
    redirect('/auth/signin')
  }

  const permission = await canModerate({
    userId: session.user.id,
    userExtended
  })

  if (!permission.allowed) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
            <p className="text-red-700">
              You must be Tier 3 or higher to access the moderator dashboard.
            </p>
            <p className="text-sm text-red-600 mt-2">
              Current tier: {userExtended.userTier}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const params = await searchParams
  const status = params.status || 'all'
  const page = parseInt(params.page || '1', 10)
  const searchTerm = params.search || ''
  const limit = 50
  const offset = (page - 1) * limit

  // Fetch proposals
  const { proposals, totalCount, hasMore } = await getProposalsForModerator({
    status: status as any,
    limit,
    offset,
    searchTerm
  })

  const totalPages = Math.ceil(totalCount / limit)

  // Get statistics
  const stats = {
    pending: await prisma.editProposal.count({ where: { status: 'pending' } }),
    approved: await prisma.editProposal.count({ where: { status: 'approved' } }),
    rejected: await prisma.editProposal.count({ where: { status: 'rejected' } }),
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Moderator Dashboard</h1>
          <p className="text-gray-600">
            Enhanced review tools for managing community edit proposals.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="text-sm text-yellow-600 font-semibold">Pending Review</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.pending}</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="text-sm text-green-600 font-semibold">Approved</div>
            <div className="text-3xl font-bold text-green-900">{stats.approved}</div>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="text-sm text-red-600 font-semibold">Rejected</div>
            <div className="text-3xl font-bold text-red-900">{stats.rejected}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <div className="flex gap-2">
              <a
                href="/admin/review-edits?status=all"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  status === 'all'
                    ? 'bg-teal-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({stats.pending + stats.approved + stats.rejected})
              </a>
              <a
                href="/admin/review-edits?status=pending"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  status === 'pending'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Pending ({stats.pending})
              </a>
              <a
                href="/admin/review-edits?status=approved"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  status === 'approved'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Approved ({stats.approved})
              </a>
              <a
                href="/admin/review-edits?status=rejected"
                className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                  status === 'rejected'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejected ({stats.rejected})
              </a>
            </div>

            {/* Search */}
            <form className="flex-1" method="get">
              <input type="hidden" name="status" value={status} />
              <input
                type="search"
                name="search"
                defaultValue={searchTerm}
                placeholder="Search by page path, summary, or proposer..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </form>
          </div>
        </div>

        {/* Moderator Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Moderator Tools</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use "Instant Approve" or "Instant Reject" to bypass community voting</li>
            <li>• Your actions are logged in the audit trail</li>
            <li>• Proposers will receive reputation changes based on your decision</li>
            <li>• Reviews completed: {userExtended.reviewsCompleted}</li>
          </ul>
        </div>

        {/* Proposals List */}
        {proposals.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-300 rounded-lg">
            <p className="text-gray-600 text-lg mb-2">No proposals found</p>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? 'Try a different search term'
                : 'All proposals have been reviewed!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {proposals.map((proposal) => (
              <ModeratorProposalCard
                key={proposal.id}
                proposal={proposal}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {page > 1 && (
              <a
                href={`/admin/review-edits?status=${status}&page=${page - 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
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
                href={`/admin/review-edits?status=${status}&page=${page + 1}${searchTerm ? `&search=${searchTerm}` : ''}`}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Next →
              </a>
            )}
          </div>
        )}

        {/* Stats Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          Showing {proposals.length} of {totalCount} proposals
        </div>
      </div>
    </div>
  )
}
