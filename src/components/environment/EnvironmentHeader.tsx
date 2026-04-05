'use client'

import Link from 'next/link'
import Image from 'next/image'
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
          {/* Logo: dimmed Resist Project branding + "Our Home" */}
          <Link href="/ourhome" className="flex items-center gap-3 group">
            <Image
              src="/logo-icon-white.svg"
              alt="Resist Project Logo"
              width={36}
              height={36}
              className="flex-shrink-0 opacity-50 group-hover:opacity-70 transition-opacity"
              priority
            />
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white/40 hidden sm:inline">
                RESIST PROJECT
              </span>
              <span className="text-white/25 hidden sm:inline">/</span>
              <span className="text-xl font-black tracking-tight text-white group-hover:text-forest-200 transition-colors">
                Our Home
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/ourhome/topics" className="hover:text-forest-200 transition-colors font-medium">
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
                href="/ourhome/topics"
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
