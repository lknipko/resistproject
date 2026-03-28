import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db'
import { canAdminister } from '@/lib/permissions'
import { RallyStats } from './RallyStats'

export const metadata = {
  title: 'Rally Monitor - Resist Project',
  description: 'Real-time site activity monitoring during events',
}

export default async function RallyMonitorPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/admin/rally-monitor')
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h1 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h1>
            <p className="text-red-700">
              You must be an administrator (Tier 5) to access the rally monitor.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Rally Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time site activity during events</p>
          </div>
          <span className="text-sm text-gray-500">Auto-refreshes every 30s</span>
        </div>

        <RallyStats />
      </div>
    </div>
  )
}
