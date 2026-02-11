'use client'

import { useState, useEffect } from 'react'
import { Representative } from '@/app/api/representatives/route'

interface UseRepresentativesResult {
  representatives: Representative[]
  loading: boolean
  error: string | null
}

/**
 * Hook to fetch representatives for a given zip code.
 *
 * Features:
 * - Caches results in sessionStorage to avoid repeated API calls
 * - Loading states for UI
 * - Error handling
 *
 * @param zipCode - Zip code to lookup (or null if not available)
 * @returns Representatives data, loading state, and error
 */
export function useRepresentatives(zipCode: string | null): UseRepresentativesResult {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Reset state if zip code is null
    if (!zipCode) {
      setRepresentatives([])
      setLoading(false)
      setError(null)
      return
    }

    // Check sessionStorage cache first
    const cacheKey = `reps_${zipCode}`
    const cached = sessionStorage.getItem(cacheKey)

    if (cached) {
      try {
        const data = JSON.parse(cached)
        setRepresentatives(data.representatives || [])
        setLoading(false)
        setError(null)
        return
      } catch (e) {
        // Invalid cache, continue to fetch
        sessionStorage.removeItem(cacheKey)
      }
    }

    // Fetch from API
    const fetchRepresentatives = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/representatives?zipCode=${encodeURIComponent(zipCode)}`)

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to fetch representatives')
        }

        const data = await response.json()
        setRepresentatives(data.representatives || [])

        // Cache in sessionStorage
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error occurred'
        setError(message)
        setRepresentatives([])
      } finally {
        setLoading(false)
      }
    }

    fetchRepresentatives()
  }, [zipCode])

  return { representatives, loading, error }
}
