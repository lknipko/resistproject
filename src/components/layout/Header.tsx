'use client'

import Link from 'next/link'
import { useState } from 'react'
import AuthButtonClient from './AuthButtonClient'

interface HeaderProps {
  session: {
    user?: {
      name?: string | null
      email?: string | null
      image?: string | null
    }
  } | null
  userTier?: number
}

export default function Header({ session, userTier = 1 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-teal-dark text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-teal-light transition-colors">
            Resist Project
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/learn" className="hover:text-teal-light transition-colors font-medium">
              LEARN
            </Link>
            <Link href="/act" className="hover:text-teal-light transition-colors font-medium">
              ACT
            </Link>
            <Link href="/about" className="hover:text-teal-light transition-colors">
              About
            </Link>
            <AuthButtonClient session={session} userTier={userTier} />
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
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

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 border-t border-teal-medium pt-4">
            <div className="flex flex-col gap-4">
              <Link
                href="/learn"
                className="hover:text-teal-light transition-colors font-medium text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                LEARN
              </Link>
              <Link
                href="/act"
                className="hover:text-teal-light transition-colors font-medium text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                ACT
              </Link>
              <Link
                href="/about"
                className="hover:text-teal-light transition-colors text-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <div className="pt-2 border-t border-teal-medium">
                <AuthButtonClient session={session} userTier={userTier} />
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
