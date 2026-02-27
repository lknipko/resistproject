'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function SignInLink() {
  const pathname = usePathname()
  const callbackUrl = pathname.startsWith('/auth/') ? '/' : pathname

  return (
    <Link
      href={`/auth/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`}
      className="px-4 py-2 rounded-md bg-teal-600 hover:bg-teal-500 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-teal-dark"
    >
      Sign In
    </Link>
  )
}
