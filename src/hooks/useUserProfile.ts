'use client'

import { useState, useEffect } from 'react'
import { UserCivicProfile } from '@/app/api/user/profile/route'

interface UseUserProfileResult {
  user: UserCivicProfile | null
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch the authenticated user's civic profile data.
 *
 * Features:
 * - Fetches profile data from API
 * - Loading states for UI
 * - Error handling
 * - Automatically refetches when session changes
 *
 * @returns User profile data, loading state, and error
 */
export function useUserProfile(): UseUserProfileResult {
  const [user, setUser] = useState<UserCivicProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/user/profile')

        if (response.status === 401) {
          // Not authenticated - this is expected
          setUser(null)
          setLoading(false)
          return
        }

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch profile')
        }

        const data = await response.json()
        setUser(data)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  return { user, loading, error }
}
