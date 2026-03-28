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
 * - Supports anonymous zip code lookup via public endpoint
 *
 * @param zipCode - Authenticated user's zip code (or null if not available)
 * @param anonymousZipCode - Anonymous zip code entered by unauthenticated user (optional)
 * @returns Representatives data, loading state, and error
 */
export function useRepresentatives(
  zipCode: string | null,
  anonymousZipCode?: string | null
): UseRepresentativesResult {
  const [representatives, setRepresentatives] = useState<Representative[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const effectiveZipCode = zipCode || anonymousZipCode || null
  const endpoint = zipCode ? '/api/representatives' : '/api/representatives/public'

  useEffect(() => {
    // Reset state if zip code is null
    if (!effectiveZipCode) {
      setRepresentatives([])
      setLoading(false)
      setError(null)
      return
    }

    // Check sessionStorage cache first
    const cacheKey = `reps_${effectiveZipCode}`
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
        const response = await fetch(`${endpoint}?zipCode=${encodeURIComponent(effectiveZipCode)}`)

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
  }, [effectiveZipCode, endpoint])

  return { representatives, loading, error }
}
