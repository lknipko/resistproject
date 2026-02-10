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
    totalClicks,
    clicksLast7Days,
    clicksLast30Days,
    topCategories,
    topSourcePages,
    topUrls,
    recentClicks,
    dailyClicks,
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

  const adminPerms = await canAdminister({ userExtended })
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

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="text-sm font-medium text-gray-600">Total Actions</div>
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Top Action Categories */}
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Top Action Categories</h2>
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

        {/* Daily Activity Chart (simple text version) */}
        <div className="lg:col-span-2 rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Daily Activity (Last 30 Days)</h2>
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
          no user IDs, no IP addresses, no sessions, and no cookies. We only count how
          many times each action link was clicked to measure the site's civic impact.
        </p>
      </div>
    </div>
  )
}
