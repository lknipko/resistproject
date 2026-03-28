import { NextRequest, NextResponse } from 'next/server'
import { validateZipCode } from '@/lib/validation'

export const runtime = 'nodejs'

// In-memory cache for representative lookups (shared across requests in this route)
const repCache = new Map<string, { data: RepresentativesResponse; timestamp: number }>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 hours

function getCachedReps(zipCode: string): RepresentativesResponse | null {
  const cached = repCache.get(zipCode)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

function setCachedReps(zipCode: string, data: RepresentativesResponse) {
  repCache.set(zipCode, { data, timestamp: Date.now() })
  // Prevent unbounded growth — cap at 1000 entries
  if (repCache.size > 1000) {
    const oldest = [...repCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0]
    if (oldest) repCache.delete(oldest[0])
  }
}

interface Representative {
  name: string
  office: string
  party: string
  phones: string[]
  emails: string[]
  urls: string[]
  photoUrl?: string
  channels?: Array<{
    type: string
    id: string
  }>
}

interface RepresentativesResponse {
  representatives: Representative[]
  zipCode: string
  timestamp: string
}

interface GeocodioResponse {
  results: Array<{
    fields?: {
      congressional_districts?: Array<{
        current_legislators?: Array<{
          type: 'representative' | 'senator'
          seniority?: string | null
          bio: {
            first_name: string
            last_name: string
            party: string
            photo_url?: string
          }
          contact: {
            phone?: string
            url?: string
            contact_form?: string | null
          }
          social?: {
            twitter?: string | null
            facebook?: string | null
            youtube?: string | null
          }
        }>
      }>
    }
  }>
}

/**
 * GET /api/representatives/public?zipCode=12345
 *
 * Public (unauthenticated) endpoint for fetching federal representatives.
 * Same logic as the authenticated endpoint but without auth check.
 * Rate limiting handled by middleware (30 req/min for /api/).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const zipCode = searchParams.get('zipCode')

    if (!zipCode) {
      return NextResponse.json(
        { error: 'Zip code parameter is required' },
        { status: 400 }
      )
    }

    const zipValidation = validateZipCode(zipCode)
    if (!zipValidation.valid) {
      return NextResponse.json(
        { error: zipValidation.error || 'Invalid zip code' },
        { status: 400 }
      )
    }

    // Check in-memory cache first
    const trimmedZip = zipCode.trim()
    const cached = getCachedReps(trimmedZip)
    if (cached) {
      return NextResponse.json(cached, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
          'X-Cache': 'HIT',
        },
      })
    }

    // Check for API key
    const apiKey = process.env.GEOCODIO_API_KEY
    if (!apiKey) {
      console.error('GEOCODIO_API_KEY not configured')
      return NextResponse.json(
        { error: 'Representative lookup service not configured' },
        { status: 500 }
      )
    }

    // Call Geocodio API with congressional district data
    const apiUrl = `https://api.geocod.io/v1.7/geocode?q=${encodeURIComponent(zipCode.trim())}&fields=cd&api_key=${apiKey}`

    const response = await fetch(apiUrl, {
      next: { revalidate: 86400 },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Geocodio API error:', response.status, errorText)

      if (response.status === 404) {
        return NextResponse.json(
          { error: 'No representatives found for this zip code. Please verify your zip code.' },
          { status: 404 }
        )
      }

      return NextResponse.json(
        { error: 'Failed to fetch representatives. Please try again later.' },
        { status: response.status }
      )
    }

    const data: GeocodioResponse = await response.json()

    const representatives = parseRepresentatives(data)

    if (representatives.length === 0) {
      return NextResponse.json(
        { error: 'No representatives found for this zip code. Please verify your zip code.' },
        { status: 404 }
      )
    }

    const result: RepresentativesResponse = {
      representatives,
      zipCode: trimmedZip,
      timestamp: new Date().toISOString(),
    }

    setCachedReps(trimmedZip, result)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    })
  } catch (error) {
    console.error('Error fetching representatives:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseRepresentatives(data: GeocodioResponse): Representative[] {
  const representatives: Representative[] = []

  if (!data.results || data.results.length === 0) {
    return representatives
  }

  const result = data.results[0]
  if (!result.fields?.congressional_districts || result.fields.congressional_districts.length === 0) {
    return representatives
  }

  const district = result.fields.congressional_districts[0]
  const legislators = district.current_legislators || []

  for (const legislator of legislators) {
    const { type, bio, contact, social } = legislator

    let office = ''
    if (type === 'senator') {
      office = 'United States Senate'
    } else if (type === 'representative') {
      office = 'United States House of Representatives'
    } else {
      continue
    }

    const name = `${bio.first_name} ${bio.last_name}`

    const channels: Array<{ type: string; id: string }> = []
    if (social?.twitter) {
      channels.push({ type: 'Twitter', id: social.twitter })
    }
    if (social?.facebook) {
      channels.push({ type: 'Facebook', id: social.facebook })
    }
    if (social?.youtube) {
      channels.push({ type: 'YouTube', id: social.youtube })
    }

    representatives.push({
      name,
      office,
      party: bio.party || 'Unknown',
      phones: contact.phone ? [contact.phone] : [],
      emails: [],
      urls: [contact.url, contact.contact_form].filter((url): url is string => !!url),
      photoUrl: bio.photo_url,
      channels,
    })
  }

  representatives.sort((a, b) => {
    const aIsSenator = a.office.includes('Senate')
    const bIsSenator = b.office.includes('Senate')

    if (aIsSenator && !bIsSenator) return -1
    if (!aIsSenator && bIsSenator) return 1

    return 0
  })

  return representatives
}
