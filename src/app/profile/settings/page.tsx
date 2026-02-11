import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import DisplayNameForm from './DisplayNameForm'
import EmailPreferencesForm from './EmailPreferencesForm'
import CivicProfileForm from './CivicProfileForm'

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
          <EmailPreferencesForm
            initialEmailNotifications={userExtended?.emailNotifications ?? true}
            initialWeeklyDigest={userExtended?.weeklyDigest ?? true}
          />
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
              <DisplayNameForm initialDisplayName={userExtended?.displayName || session.user.name || ''} />
            </div>
          </div>
        </div>

        {/* Civic Engagement Profile */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Civic Engagement Profile
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Complete your profile to get personalized action templates for contacting your representatives.
            Your information is used only to identify your federal representatives and customize templates.
          </p>
          <CivicProfileForm
            initialFirstName={userExtended?.firstName || ''}
            initialLastName={userExtended?.lastName || ''}
            initialZipCode={userExtended?.zipCode || ''}
            initialPhoneNumber={userExtended?.phoneNumber || ''}
          />
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
