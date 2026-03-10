'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
  const pathname = usePathname()
  const callbackUrl = pathname.startsWith('/auth/') ? '/' : pathname

  if (session?.user) {
    return <UserMenu user={session.user} userTier={userTier} />
  }

  return (
    <Link
      href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      className="px-4 py-2 rounded-md bg-steel-600 hover:bg-steel-700 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-steel-400 focus:ring-offset-2 focus:ring-offset-teal-dark"
    >
      Sign In
    </Link>
  )
}
