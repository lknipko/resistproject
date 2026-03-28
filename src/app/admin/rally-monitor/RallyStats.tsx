'use client'

import { useState, useEffect, useCallback } from 'react'

interface Stats {
  newUsersToday: number
  totalUsers: number
  proposalsToday: number
  votesToday: number
  civicActionsToday: number
  civicActionsByType: Record<string, number>
  linkClicksToday: number
  linkClicksByCategory: Record<string, number>
  topPages: Array<{ page: string; count: number }>
  recentSignups: Array<{ displayName: string; createdAt: string }>
  auditActionsToday: number
  auditByCategory: Record<string, number>
}

export function RallyStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/rally-stats')
      if (res.ok) {
        setStats(await res.json())
        setLastUpdated(new Date())
        setError(null)
      } else {
        setError('Failed to fetch stats')
      }
    } catch {
      setError('Network error')
    }
  }, [])

  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (error && !stats) {
    return (
      <div className="text-center py-12 text-red-600">
        {error}
      </div>
    )
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8">
      {/* Primary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="New Users Today" value={stats.newUsersToday} color="green" />
        <StatCard label="Total Users" value={stats.totalUsers} color="blue" />
        <StatCard label="Edit Proposals Today" value={stats.proposalsToday} color="orange" />
        <StatCard label="Votes Today" value={stats.votesToday} color="purple" />
      </div>

      {/* Civic action and link click cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Civic Actions Today" value={stats.civicActionsToday} color="orange" />
        <StatCard label="External Link Clicks" value={stats.linkClicksToday} color="blue" />
        <StatCard label="Audit Events Today" value={stats.auditActionsToday} color="purple" />
      </div>

      {/* Breakdown panels */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Civic actions by type */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-900">Civic Actions by Type</h2>
          {Object.keys(stats.civicActionsByType).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.civicActionsByType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600">{type}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No civic actions yet today</p>
          )}
        </div>

        {/* Link clicks by category */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-900">Link Clicks by Category</h2>
          {Object.keys(stats.linkClicksByCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.linkClicksByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No link clicks yet today</p>
          )}
        </div>
      </div>

      {/* Top pages and audit breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Top pages by civic actions */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-900">Top Pages (Civic Actions)</h2>
          {stats.topPages.length > 0 ? (
            <div className="space-y-2">
              {stats.topPages.map(({ page, count }) => (
                <div key={page} className="flex justify-between text-sm">
                  <span className="text-gray-600 truncate mr-4">{page}</span>
                  <span className="font-semibold text-gray-900 shrink-0">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No page activity yet today</p>
          )}
        </div>

        {/* Audit log breakdown */}
        <div className="bg-white border border-gray-300 rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4 text-gray-900">Audit Log by Category</h2>
          {Object.keys(stats.auditByCategory).length > 0 ? (
            <div className="space-y-2">
              {Object.entries(stats.auditByCategory)
                .sort((a, b) => b[1] - a[1])
                .map(([category, count]) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-600">{category}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No audit events yet today</p>
          )}
        </div>
      </div>

      {/* Recent signups */}
      <div className="bg-white border border-gray-300 rounded-lg p-6">
        <h2 className="font-bold text-lg mb-4 text-gray-900">Recent Signups (Today)</h2>
        {stats.recentSignups.length > 0 ? (
          <div className="space-y-2">
            {stats.recentSignups.map((user, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-900">{user.displayName}</span>
                <span className="text-gray-500">
                  {new Date(user.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No signups yet today</p>
        )}
      </div>

      {/* External dashboards */}
      <div className="grid md:grid-cols-2 gap-4">
        <a
          href="https://dash.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl font-bold text-gray-400">CF</span>
          <div>
            <div className="font-semibold text-gray-900">Cloudflare Analytics</div>
            <div className="text-sm text-gray-500">Traffic, cache, security</div>
          </div>
        </a>
        <a
          href="https://railway.app"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 p-4 bg-gray-50 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <span className="text-xl font-bold text-gray-400">RW</span>
          <div>
            <div className="font-semibold text-gray-900">Railway Dashboard</div>
            <div className="text-sm text-gray-500">CPU, memory, logs</div>
          </div>
        </a>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-center text-xs text-gray-400">
          Last updated: {lastUpdated.toLocaleTimeString()}
          {error && <span className="text-red-400 ml-2">(refresh failed)</span>}
        </p>
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color: string
}) {
  const colorClasses: Record<string, string> = {
    green: 'bg-green-50 border-green-200 text-green-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    orange: 'bg-orange-50 border-orange-200 text-orange-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`rounded-lg border-2 p-4 ${colorClasses[color]}`}>
      <div className="text-3xl font-bold">{value.toLocaleString()}</div>
      <div className="text-sm mt-1 opacity-75">{label}</div>
    </div>
  )
}
