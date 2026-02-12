import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { canAdminister } from '@/lib/permissions'

export const metadata = {
  title: 'Analytics Dashboard',
}

async function getAnalytics() {
  const now = new Date()
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  // === External Link Clicks ===
  // Total clicks all time
  const totalClicks = await prisma.externalLinkClick.count()

  // Clicks last 7 days
  const clicksLast7Days = await prisma.externalLinkClick.count({
    where: {
      clickedAt: { gte: last7Days },
    },
  })

  // Clicks last 30 days
  const clicksLast30Days = await prisma.externalLinkClick.count({
    where: {
      clickedAt: { gte: last30Days },
    },
  })

  // === Civic Actions (Email/Call Clicks) ===
  // Total civic actions all time
  const totalCivicActions = await prisma.civicAction.count()

  // Civic actions last 7 days
  const civicActionsLast7Days = await prisma.civicAction.count({
    where: {
      actionDate: { gte: last7Days },
    },
  })

  // Civic actions last 30 days
  const civicActionsLast30Days = await prisma.civicAction.count({
    where: {
      actionDate: { gte: last30Days },
    },
  })

  // Email vs Call breakdown
  const emailClicks = await prisma.civicAction.count({
    where: { actionType: 'email_clicked' },
  })

  const callClicks = await prisma.civicAction.count({
    where: { actionType: 'call_clicked' },
  })

  // Most contacted representatives
  const topRepresentatives = await prisma.civicAction.groupBy({
    by: ['repName', 'repOffice'],
    _count: {
      id: true,
    },
    where: {
      repName: { not: null },
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 15,
  })

  // Top pages for civic actions
  const topCivicActionPages = await prisma.civicAction.groupBy({
    by: ['sourcePage'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  })

  // Daily civic actions for last 30 days
  const dailyCivicActions = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
    SELECT DATE(action_date) as date, COUNT(*)::int as count
    FROM civic_actions
    WHERE action_date >= ${last30Days}
    GROUP BY DATE(action_date)
    ORDER BY date ASC
  `

  // Top categories (all time)
  const topCategories = await prisma.externalLinkClick.groupBy({
    by: ['category'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  })

  // Top source pages (all time)
  const topSourcePages = await prisma.externalLinkClick.groupBy({
    by: ['sourcePage'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 10,
  })

  // Top URLs (all time)
  const topUrls = await prisma.externalLinkClick.groupBy({
    by: ['url', 'label'],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 15,
  })

  // Recent clicks (last 50)
  const recentClicks = await prisma.externalLinkClick.findMany({
    orderBy: {
      clickedAt: 'desc',
    },
    take: 50,
    select: {
      category: true,
      label: true,
      sourcePage: true,
      clickedAt: true,
    },
  })

  // Daily clicks for last 30 days
  const dailyClicks = await prisma.externalLinkClick.groupBy({
    by: ['clickDate'],
    _count: {
      id: true,
    },
    where: {
      clickDate: { gte: last30Days },
    },
    orderBy: {
      clickDate: 'asc',
    },
  })

  return {
    // External link tracking
    totalClicks,
    clicksLast7Days,
    clicksLast30Days,
    topCategories,
    topSourcePages,
    topUrls,
    recentClicks,
    dailyClicks,
    // Civic action tracking
    totalCivicActions,
    civicActionsLast7Days,
    civicActionsLast30Days,
    emailClicks,
    callClicks,
    topRepresentatives,
    topCivicActionPages,
    dailyCivicActions,
  }
}

// Helper to format category names
function formatCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    'contact-congress': '📞 Contact Congress',
    'abortion-fund-national': '💰 National Abortion Fund',
    'abortion-fund-regional': '💰 Regional Abortion Fund',
    'abortion-fund-naf': '💰 NAF Hotline',
    'abortion-fund-wrrap': '💰 WRRAP',
    'advocacy-aclu': '⚖️ ACLU',
    'advocacy-planned-parenthood': '🏥 Planned Parenthood',
    'advocacy-crr': '⚖️ Center for Reproductive Rights',
    'advocacy-reproductive-freedom': '✊ Reproductive Freedom for All',
    'donate': '💵 Donate',
    'petition': '✍️ Petition',
    'public-comment': '📝 Public Comment',
    'external-resource': '🔗 External Resource',
  }

  return categoryMap[category] || category
}

export default async function AnalyticsPage() {
  const session = await auth()
  if (!session) redirect('/auth/signin')

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
  })

  if (!userExtended) redirect('/auth/signin')

  const adminPerms = await canAdminister({
    userId: session.user.id,
    userExtended
  })
  if (!adminPerms.allowed) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="text-red-900">
            Access denied. Administrator permissions required.
          </p>
        </div>
      </div>
    )
  }

  const analytics = await getAnalytics()

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Privacy-friendly analytics - aggregate counts only, no personal data tracked
        </p>
      </div>

      {/* Summary Cards - External Links */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">External Link Clicks</h2>
        <p className="text-sm text-gray-600">Petition sites, donation pages, advocacy organizations</p>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Total Clicks</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {analytics.totalClicks.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">All time</div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Last 7 Days</div>
          <div className="mt-2 text-3xl font-bold text-teal-600">
            {analytics.clicksLast7Days.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {analytics.clicksLast7Days > 0
              ? `~${Math.round(analytics.clicksLast7Days / 7)} per day`
              : 'No activity'}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Last 30 Days</div>
          <div className="mt-2 text-3xl font-bold text-blue-600">
            {analytics.clicksLast30Days.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {analytics.clicksLast30Days > 0
              ? `~${Math.round(analytics.clicksLast30Days / 30)} per day`
              : 'No activity'}
          </div>
        </div>
      </div>

      {/* Summary Cards - Civic Actions (Email/Call) */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-800">📧 📞 Congressional Contact Actions</h2>
        <p className="text-sm text-gray-600">Emails and calls to representatives via personalized action cards</p>
      </div>
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <div className="rounded-lg border bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-sm">
          <div className="text-sm font-medium text-purple-800">Total Contacts</div>
          <div className="mt-2 text-3xl font-bold text-purple-700">
            {analytics.totalCivicActions.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-purple-600">All time</div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-sm">
          <div className="text-sm font-medium text-blue-800">📧 Emails</div>
          <div className="mt-2 text-3xl font-bold text-blue-700">
            {analytics.emailClicks.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-blue-600">
            {analytics.totalCivicActions > 0
              ? `${Math.round((analytics.emailClicks / analytics.totalCivicActions) * 100)}% of total`
              : 'No data'}
          </div>
        </div>

        <div className="rounded-lg border bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-sm">
          <div className="text-sm font-medium text-green-800">📞 Calls</div>
          <div className="mt-2 text-3xl font-bold text-green-700">
            {analytics.callClicks.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-green-600">
            {analytics.totalCivicActions > 0
              ? `${Math.round((analytics.callClicks / analytics.totalCivicActions) * 100)}% of total`
              : 'No data'}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Last 7 Days</div>
          <div className="mt-2 text-3xl font-bold text-teal-600">
            {analytics.civicActionsLast7Days.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {analytics.civicActionsLast7Days > 0
              ? `~${Math.round(analytics.civicActionsLast7Days / 7)} per day`
              : 'No activity'}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Last 30 Days</div>
          <div className="mt-2 text-3xl font-bold text-orange-600">
            {analytics.civicActionsLast30Days.toLocaleString()}
          </div>
          <div className="mt-1 text-xs text-gray-500">
            {analytics.civicActionsLast30Days > 0
              ? `~${Math.round(analytics.civicActionsLast30Days / 30)} per day`
              : 'No activity'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Most Contacted Representatives */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">🏛️ Most Contacted Representatives</h2>
          <div className="space-y-3">
            {analytics.topRepresentatives.map((rep) => (
              <div key={`${rep.repName}-${rep.repOffice}`} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{rep.repName || 'Unknown'}</div>
                  <div className="text-xs text-gray-500">{rep.repOffice || 'Unknown office'}</div>
                </div>
                <div className="text-lg font-bold text-purple-600">
                  {rep._count.id.toLocaleString()}
                </div>
              </div>
            ))}
            {analytics.topRepresentatives.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Civic Action Pages */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Most Effective Action Pages</h2>
          <div className="space-y-3">
            {analytics.topCivicActionPages.map((page) => (
              <div key={page.sourcePage} className="flex items-center justify-between">
                <div className="truncate font-medium text-sm">{page.sourcePage}</div>
                <div className="ml-4 text-lg font-bold text-purple-600">
                  {page._count.id.toLocaleString()}
                </div>
              </div>
            ))}
            {analytics.topCivicActionPages.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Action Categories */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Top External Link Categories</h2>
          <div className="space-y-3">
            {analytics.topCategories.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="font-medium">{formatCategory(cat.category)}</div>
                <div className="text-lg font-bold text-orange-600">
                  {cat._count.id.toLocaleString()}
                </div>
              </div>
            ))}
            {analytics.topCategories.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Top Source Pages */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Most Effective Pages</h2>
          <div className="space-y-3">
            {analytics.topSourcePages.map((page) => (
              <div key={page.sourcePage} className="flex items-center justify-between">
                <div className="truncate font-medium text-sm">{page.sourcePage}</div>
                <div className="ml-4 text-lg font-bold text-teal-600">
                  {page._count.id.toLocaleString()}
                </div>
              </div>
            ))}
            {analytics.topSourcePages.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Top External Links */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Most Clicked Links</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-2 text-left text-sm font-semibold">Link</th>
                  <th className="pb-2 text-left text-sm font-semibold">URL</th>
                  <th className="pb-2 text-right text-sm font-semibold">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topUrls.map((link, index) => (
                  <tr key={index} className="border-b last:border-b-0">
                    <td className="py-2 text-sm">{link.label || 'Untitled'}</td>
                    <td className="py-2 text-sm text-gray-600 truncate max-w-md">
                      {link.url}
                    </td>
                    <td className="py-2 text-right text-sm font-bold text-orange-600">
                      {link._count.id}
                    </td>
                  </tr>
                ))}
                {analytics.topUrls.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-4 text-center text-gray-500">
                      No data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Daily Civic Actions Chart */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Daily Congressional Contacts (Last 30 Days)</h2>
          <div className="space-y-2">
            {analytics.dailyCivicActions.map((day) => {
              const maxActions = Math.max(...analytics.dailyCivicActions.map((d) => Number(d.count)))
              const barWidth = maxActions > 0 ? (Number(day.count) / maxActions) * 100 : 0

              return (
                <div key={day.date.toString()} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded bg-gradient-to-r from-purple-500 to-purple-400 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-semibold">
                    {Number(day.count)}
                  </div>
                </div>
              )
            })}
            {analytics.dailyCivicActions.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Daily External Link Activity Chart */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Daily External Link Clicks (Last 30 Days)</h2>
          <div className="space-y-2">
            {analytics.dailyClicks.map((day) => {
              const maxClicks = Math.max(...analytics.dailyClicks.map((d) => d._count.id))
              const barWidth = maxClicks > 0 ? (day._count.id / maxClicks) * 100 : 0

              return (
                <div key={day.clickDate.toString()} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-600">
                    {new Date(day.clickDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div
                      className="h-6 rounded bg-gradient-to-r from-orange-500 to-orange-400 transition-all"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <div className="w-12 text-right text-sm font-semibold">
                    {day._count.id}
                  </div>
                </div>
              )
            })}
            {analytics.dailyClicks.length === 0 && (
              <p className="text-gray-500">No data yet</p>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
          <div className="space-y-2">
            {analytics.recentClicks.map((click, index) => (
              <div
                key={index}
                className="flex items-center justify-between border-b py-2 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {formatCategory(click.category)}
                  </div>
                  <div className="text-sm text-gray-600">{click.label}</div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(click.clickedAt).toLocaleString()}
                </div>
              </div>
            ))}
            {analytics.recentClicks.length === 0 && (
              <p className="text-gray-500">No activity yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 rounded-lg border border-green-200 bg-green-50 p-4">
        <h3 className="mb-2 font-semibold text-green-900">🔒 Privacy-Friendly Analytics</h3>
        <p className="text-sm text-green-800">
          This dashboard shows aggregate data only. No personal information is tracked:
          no user IDs, no IP addresses, no sessions, and no cookies. We only count:
        </p>
        <ul className="mt-2 text-sm text-green-800 list-disc list-inside space-y-1">
          <li>How many times external action links were clicked (petitions, donations, etc.)</li>
          <li>How many times users clicked email/call buttons for congressional contact</li>
          <li>Which representatives were contacted (names only, no user data)</li>
          <li>Which pages drove the most civic engagement</li>
        </ul>
        <p className="mt-2 text-sm text-green-800">
          This helps us measure the site's civic impact while respecting user privacy.
        </p>
      </div>
    </div>
  )
}
