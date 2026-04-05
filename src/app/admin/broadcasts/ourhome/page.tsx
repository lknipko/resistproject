import Link from 'next/link'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { canAdminister } from '@/lib/permissions'
import { getAllPages } from '@/lib/content'
import { getRecipientCount } from '../actions'
import { BroadcastComposer } from '@/components/admin/BroadcastComposer'

export const metadata = {
  title: 'Our Home Email Broadcasts - Resist Project',
  description: 'Send Our Home email updates to subscribers',
}

export default async function OurHomeBroadcastsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin/broadcasts/ourhome')
  }

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
  })

  if (!userExtended) {
    redirect('/auth/signin')
  }

  const permission = await canAdminister({ userId: session.user.id, userExtended })

  if (!permission.allowed) {
    return (
      <div className="min-h-screen bg-forest-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
            <p className="text-red-700">
              You must be an administrator (Tier 5) to send broadcasts.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const envPages = getAllPages('environment').map((p) => ({
    ...p,
    description: p.description || '',
    type: 'environment' as const,
    tags: p.tags || [],
    slug: p.slug,
  }))

  const recipientCount = await getRecipientCount()

  const recentBroadcasts = await prisma.emailBroadcast.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: {
      sentBy: { select: { name: true, email: true } },
    },
  })

  // Filter to only broadcasts that featured environment pages
  const ourHomeBroadcasts = recentBroadcasts.filter((b) => {
    const pages = b.featuredPages as Array<{ type?: string }>
    return Array.isArray(pages) && pages.some((p) => p.type === 'environment')
  })

  return (
    <div className="min-h-screen bg-forest-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">🌿</span>
            <h1 className="text-3xl font-bold text-forest-900">Our Home Broadcasts</h1>
          </div>
          <p className="text-forest-700 mb-3">
            Send email updates to subscribers about new and urgent Our Home content.
          </p>
          <Link
            href="/admin/broadcasts"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            ← Switch to Main Site Broadcasts
          </Link>
        </div>

        {/* Compose Section */}
        <div className="bg-white border border-forest-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-forest-900 mb-4">Compose Broadcast</h2>
          <BroadcastComposer
            pages={envPages}
            recipientCount={recipientCount}
            adminEmail={session.user.email || ''}
            filterTabs={['urgent', 'all', 'environment']}
            accentColor="forest"
          />
        </div>

        {/* Broadcast History */}
        {ourHomeBroadcasts.length > 0 && (
          <div className="bg-white border border-forest-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-forest-900 mb-4">Recent Our Home Broadcasts</h2>
            <div className="divide-y divide-gray-100">
              {ourHomeBroadcasts.map((b) => (
                <div key={b.id} className="py-3 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{b.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {b.sentAt
                        ? new Date(b.sentAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                          })
                        : 'Not sent'}
                      {' · '}
                      {b.sentBy?.name || b.sentBy?.email || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded ${
                        b.status === 'sent'
                          ? 'bg-green-100 text-green-700'
                          : b.status === 'sending'
                          ? 'bg-yellow-100 text-yellow-700'
                          : b.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {b.status}
                    </span>
                    <span className="text-xs text-gray-500">
                      {b.successCount}/{b.recipientCount}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {ourHomeBroadcasts.length === 0 && (
          <div className="bg-white border border-forest-200 rounded-lg p-6 text-center text-forest-600 text-sm">
            No Our Home broadcasts sent yet.
          </div>
        )}
      </div>
    </div>
  )
}
