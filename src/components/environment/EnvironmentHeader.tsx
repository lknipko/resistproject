'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import AuthButtonClient from '@/components/layout/AuthButtonClient'
import SearchBar from '@/components/layout/SearchBar'
import { useSession } from 'next-auth/react'

export default function EnvironmentHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const userTier = session?.user?.userTier ?? 1

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  return (
    <header className="sticky top-0 z-50 bg-forest-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/environment" className="flex items-center gap-2 group">
            <svg className="w-7 h-7 text-forest-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xl font-bold tracking-tight group-hover:text-forest-200 transition-colors">
              Environment Hub
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/environment" className="hover:text-forest-200 transition-colors font-medium">
              Topics
            </Link>
            <Link href="/" className="hover:text-forest-200 transition-colors text-sm text-forest-300">
              ← Main Site
            </Link>
            <SearchBar />
            <AuthButtonClient session={session} userTier={userTier} />
          </nav>

          <button
            className="md:hidden text-white"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-forest-700 pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/environment"
                className="hover:text-forest-200 transition-colors font-medium text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Topics
              </Link>
              <Link
                href="/"
                className="hover:text-forest-200 transition-colors text-forest-300"
                onClick={() => setMobileMenuOpen(false)}
              >
                ← Back to Main Site
              </Link>
              <div className="pt-2 border-t border-forest-700">
                <SearchBar fullWidth />
              </div>
              <div className="pt-2 border-t border-forest-700">
                <AuthButtonClient session={session} userTier={userTier} />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
