import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export default async function DebugSessionPage() {
  const session = await auth()

  let userExtended = null
  if (session?.user?.id) {
    userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Session Debug Info</h1>

        <div className="space-y-6">
          {/* Session Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Session</h2>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(session, null, 2)}
            </pre>
          </div>

          {/* UserExtended Data */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">UserExtended</h2>
            {userExtended ? (
              <pre className="bg-gray-100 p-4 rounded overflow-auto">
                {JSON.stringify(userExtended, null, 2)}
              </pre>
            ) : (
              <p className="text-red-600">No UserExtended record found</p>
            )}
          </div>

          {/* Status Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <ul className="space-y-2">
              <li>✓ Authenticated: {session ? 'Yes' : 'No'}</li>
              <li>✓ User ID: {session?.user?.id || 'None'}</li>
              <li>✓ Email: {session?.user?.email || 'None'}</li>
              <li>✓ UserExtended exists: {userExtended ? 'Yes' : 'No'}</li>
              <li>✓ User Tier: {userExtended?.userTier || 'N/A'}</li>
              <li>✓ Display Name: {userExtended?.displayName || 'Not set'}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
