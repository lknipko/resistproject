import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const metadata = {
  title: 'Account Settings',
}

export default async function SettingsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/auth/signin?callbackUrl=/profile/settings')
  }

  // Fetch extended user data
  let userExtended = null
  try {
    userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id },
    })
  } catch (error) {
    console.error('Database connection error:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account preferences and notifications</p>
        </div>

        {/* Email Preferences */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Email Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="email-notifications"
                  type="checkbox"
                  defaultChecked={userExtended?.emailNotifications ?? true}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  disabled
                />
              </div>
              <div className="ml-3">
                <label htmlFor="email-notifications" className="font-medium text-gray-900">
                  Email Notifications
                </label>
                <p className="text-sm text-gray-600">
                  Receive notifications when your edits are reviewed or approved
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="weekly-digest"
                  type="checkbox"
                  defaultChecked={userExtended?.weeklyDigest ?? true}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  disabled
                />
              </div>
              <div className="ml-3">
                <label htmlFor="weekly-digest" className="font-medium text-gray-900">
                  Weekly Digest
                </label>
                <p className="text-sm text-gray-600">
                  Get a weekly summary of platform activity and trending content
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Note:</strong> Email preference updates are coming soon. These settings are currently read-only.
            </p>
          </div>
        </div>

        {/* Account Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Information</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <input
                type="email"
                value={session.user.email || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Email address cannot be changed. Contact support if needed.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                value={userExtended?.displayName || session.user.name || ''}
                disabled
                className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900"
              />
              <p className="mt-1 text-xs text-gray-500">
                Display name updates coming soon
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Privacy & Security</h2>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <h3 className="font-medium text-green-900 mb-2">Secure Authentication</h3>
              <p className="text-sm text-green-800">
                Your account uses passwordless email authentication. Sign-in links are sent to your verified email address.
              </p>
            </div>

            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Data we collect:</strong></p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li>Email address (for authentication)</li>
                <li>Edit history and contributions</li>
                <li>Voting activity (to prevent abuse)</li>
                <li>Anonymized analytics data</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-md p-6 border-2 border-red-200">
          <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                disabled
                className="px-4 py-2 bg-red-600 text-white rounded-md opacity-50 cursor-not-allowed"
              >
                Delete Account (Coming Soon)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
