import Link from 'next/link'
import { auth } from '@/lib/auth'
import UserMenu from './UserMenu'

export default async function AuthButton() {
  let session = null

  try {
    session = await auth()
  } catch (error) {
    console.error('Auth error:', error)
    // If auth fails, show sign in button
  }

  if (session?.user) {
    return <UserMenu user={session.user} />
  }

  return (
    <Link
      href="/auth/signin"
      className="px-4 py-2 rounded-md bg-steel-600 hover:bg-steel-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-steel-400 focus:ring-offset-2 focus:ring-offset-teal-dark"
    >
      Sign In
    </Link>
  )
}
