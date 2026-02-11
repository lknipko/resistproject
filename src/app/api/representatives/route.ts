import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { validateZipCode } from '@/lib/validation'

export const runtime = 'nodejs'

/**
 * Representative information
 */
export interface Representative {
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

/**
 * API Response structure
 */
interface RepresentativesResponse {
  representatives: Representative[]
  zipCode: string
  timestamp: string
}

/**
 * Geocodio API response structure
 */
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
 * GET /api/representatives?zipCode=12345
 *
 * Fetches federal representatives (2 Senators + 1 House Rep) for a given zip code
 * using the Geocodio API.
 *
 * Authentication required.
 * Cached for 24 hours.
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Get and validate zip code parameter
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
      next: { revalidate: 86400 }, // Cache for 24 hours
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

    // Parse response and extract representatives
    const representatives = parseRepresentatives(data)

    if (representatives.length === 0) {
      return NextResponse.json(
        { error: 'No representatives found for this zip code. Please verify your zip code.' },
        { status: 404 }
      )
    }

    const result: RepresentativesResponse = {
      representatives,
      zipCode: zipCode.trim(),
      timestamp: new Date().toISOString(),
    }

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

/**
 * Parse Geocodio API response to extract federal representatives
 *
 * Expected structure:
 * - 2 US Senators (type: 'senator')
 * - 1 US Representative (type: 'representative')
 */
function parseRepresentatives(data: GeocodioResponse): Representative[] {
  const representatives: Representative[] = []

  if (!data.results || data.results.length === 0) {
    return representatives
  }

  // Get first result (most accurate for the zip code)
  const result = data.results[0]
  if (!result.fields?.congressional_districts || result.fields.congressional_districts.length === 0) {
    return representatives
  }

  // Get legislators from first congressional district
  const district = result.fields.congressional_districts[0]
  const legislators = district.current_legislators || []

  for (const legislator of legislators) {
    const { type, seniority, bio, contact, social } = legislator

    // Determine office name
    let office = ''
    if (type === 'senator') {
      office = 'United States Senate'
    } else if (type === 'representative') {
      office = 'United States House of Representatives'
    } else {
      continue // Skip unknown types
    }

    // Build name
    const name = `${bio.first_name} ${bio.last_name}`

    // Build channels array from social media
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
      emails: [], // Geocodio doesn't provide email addresses
      urls: [contact.url, contact.contact_form].filter((url): url is string => !!url),
      photoUrl: bio.photo_url,
      channels,
    })
  }

  // Sort: Senators first (senior, then junior), then Representative
  representatives.sort((a, b) => {
    const aIsSenator = a.office.includes('Senate')
    const bIsSenator = b.office.includes('Senate')

    if (aIsSenator && !bIsSenator) return -1
    if (!aIsSenator && bIsSenator) return 1

    // Both same type, maintain order (senators are already senior/junior ordered)
    return 0
  })

  return representatives
}
