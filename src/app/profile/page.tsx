import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Your Profile',
}

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile')
  }

  // Fetch extended user data
  let userExtended = null
  try {
    userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id },
    })
  } catch (error) {
    console.error('Database connection error:', error)
    // Database not accessible - show message
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-yellow-900 mb-2">Database Not Connected</h2>
            <p className="text-yellow-800 mb-4">
              Cannot connect to the database. Please configure DATABASE_URL in your .env file.
            </p>
            <p className="text-sm text-yellow-700">
              See GET-RAILWAY-DATABASE-URL.md for instructions.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If user doesn't have extended profile yet, create one
  if (!userExtended && session.user.email) {
    try {
      await prisma.userExtended.create({
        data: {
          userId: session.user.id,
          email: session.user.email,
          displayName: session.user.name || session.user.email.split('@')[0],
        },
      })
    } catch (error) {
      console.error('Could not create user extended profile:', error)
    }
  }

  const extended = userExtended || {
    displayName: session.user.name || session.user.email?.split('@')[0],
    userTier: 1,
    reputationScore: 0,
    editsProposed: 0,
    editsApproved: 0,
    editsRejected: 0,
    votesCast: 0,
    reviewsCompleted: 0,
    badges: [],
  }

  // Tier names
  const tierNames = {
    1: 'New Contributor',
    2: 'Contributor',
    3: 'Trusted Contributor',
    4: 'Moderator',
    5: 'Administrator',
  }

  const tierName = tierNames[extended.userTier as keyof typeof tierNames] || 'User'

  // Calculate progress to next tier
  const getNextTierProgress = () => {
    if (extended.userTier === 5) return null
    if (extended.userTier === 1 && extended.editsApproved >= 1) return { next: 2, current: 1, max: 1 }
    if (extended.userTier === 2) return { next: 3, current: extended.editsApproved, max: 5 }
    return null
  }

  const tierProgress = getNextTierProgress()

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {extended.displayName}
              </h1>
              <p className="text-gray-600 mt-1">{session.user.email}</p>
            </div>
            <div className="text-right">
              <div className="inline-block bg-teal-100 text-teal-800 px-4 py-2 rounded-full font-semibold">
                {tierName}
              </div>
              <p className="text-sm text-gray-500 mt-2">Tier {extended.userTier}</p>
            </div>
          </div>
        </div>

        {/* Tier Progress */}
        {tierProgress && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Progress to Tier {tierProgress.next}
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Approved edits: {tierProgress.current} / {tierProgress.max}</span>
                <span>{Math.round((tierProgress.current / tierProgress.max) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-teal-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((tierProgress.current / tierProgress.max) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Reputation & Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Reputation */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Reputation</h2>
            <div className="text-4xl font-bold text-teal-600">
              {extended.reputationScore}
            </div>
            <p className="text-sm text-gray-600 mt-2">
              Reputation points earned through contributions
            </p>
          </div>

          {/* Badges */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Badges</h2>
            {Array.isArray(extended.badges) && extended.badges.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {(extended.badges as string[]).map((badge, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No badges earned yet</p>
            )}
          </div>
        </div>

        {/* Edit Statistics */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Edit Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-2xl font-bold text-gray-900">{extended.editsProposed}</div>
              <div className="text-sm text-gray-600">Proposed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{extended.editsApproved}</div>
              <div className="text-sm text-gray-600">Approved</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{extended.editsRejected}</div>
              <div className="text-sm text-gray-600">Rejected</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{extended.votesCast}</div>
              <div className="text-sm text-gray-600">Votes Cast</div>
            </div>
          </div>
        </div>

        {/* Activity Statistics */}
        {extended.userTier >= 3 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Moderation Activity</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <div className="text-2xl font-bold text-teal-600">{extended.reviewsCompleted}</div>
                <div className="text-sm text-gray-600">Reviews Completed</div>
              </div>
            </div>
          </div>
        )}

        {/* Account Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Email</span>
              <span className="font-medium">{session.user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Display Name</span>
              <span className="font-medium">{extended.displayName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Status</span>
              <span className="font-medium text-green-600">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
