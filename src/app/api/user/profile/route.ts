import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'

/**
 * User civic profile data
 */
export interface UserCivicProfile {
  firstName: string | null
  lastName: string | null
  zipCode: string | null
  phoneNumber: string | null
  civicProfileCompleted: boolean
}

/**
 * GET /api/user/profile
 *
 * Returns the authenticated user's civic engagement profile data.
 * Used by client components to check profile completion and fetch data for templates.
 *
 * Authentication required.
 */
export async function GET() {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Fetch user extended data
    const userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        zipCode: true,
        phoneNumber: true,
        civicProfileCompleted: true,
      },
    })

    if (!userExtended) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const profile: UserCivicProfile = {
      firstName: userExtended.firstName,
      lastName: userExtended.lastName,
      zipCode: userExtended.zipCode,
      phoneNumber: userExtended.phoneNumber,
      civicProfileCompleted: userExtended.civicProfileCompleted,
    }

    return NextResponse.json(profile, {
      status: 200,
      headers: {
        // Short cache since profile can be edited
        'Cache-Control': 'private, max-age=60',
      },
    })
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
