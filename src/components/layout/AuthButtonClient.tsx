'use client'

import Link from 'next/link'
import UserMenu from './UserMenu'

interface AuthButtonClientProps {
  session: {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  } | null
  userTier?: number
}

export default function AuthButtonClient({ session, userTier = 1 }: AuthButtonClientProps) {
  if (session?.user) {
    return <UserMenu user={session.user} userTier={userTier} />
  }

  return (
    <Link
      href="/auth/signin"
      className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-teal-dark"
    >
      Sign In
    </Link>
  )
}
