'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  userTier?: number
}

export default function UserMenu({ user, userTier = 1 }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Get user initials for avatar
  const getInitials = () => {
    if (user.name) {
      return user.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    }
    if (user.email) {
      return user.email[0].toUpperCase()
    }
    return 'U'
  }

  const pathname = usePathname()

  const handleSignOut = async () => {
    await signOut({ callbackUrl: pathname })
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* User avatar button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-teal-600 hover:bg-teal-500 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-teal-dark"
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <div className="w-9 h-9 rounded-full bg-teal-500 flex items-center justify-center text-white font-semibold text-sm">
          {getInitials()}
        </div>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-200">
          {/* User info section */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Your Profile
            </Link>
            <Link
              href="/review"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Review Proposals
            </Link>

            {/* Moderator Dashboard - Tier 3+ */}
            {userTier >= 3 && (
              <Link
                href="/admin/review-edits"
                className="block px-4 py-2 text-sm text-teal-700 font-medium hover:bg-teal-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                🛡️ Moderator Dashboard
              </Link>
            )}

            <Link
              href="/profile/settings"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Settings
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 py-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
