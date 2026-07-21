import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { publicBaseUrl } from '@/lib/request-url'

/**
 * Post-sign-in landing route.
 *
 * Sign-in flows (Google and the email magic link) redirect here after
 * authentication. This runs as a normal Route Handler request — a safe place to
 * read the database and set cookies — so we keep that work OUT of the Auth.js
 * sign-in callbacks, where mutating cookies during the OAuth callback response
 * can interfere with the session cookie.
 *
 * If the user still needs onboarding, we set the `onboarding-needed` cookie (the
 * same signal the middleware uses to nudge users to /onboarding) and send them
 * straight there. Otherwise we return them to their original destination.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const returnToParam = url.searchParams.get('returnTo') || '/'
  // Only honor relative, same-site destinations.
  const returnTo = returnToParam.startsWith('/') ? returnToParam : '/'

  // Build redirects against the public origin (via X-Forwarded-* headers), NOT
  // request.url — behind Railway's proxy request.url resolves to the internal
  // host (localhost:3000) and would redirect users off the real domain.
  const base = publicBaseUrl(request)

  const session = await auth()
  if (!session?.user?.id) {
    // No session — sign-in didn't take. Send them back to sign in.
    return NextResponse.redirect(new URL('/auth/signin', base))
  }

  let onboardingNeeded = false
  try {
    const userExtended = await prisma.userExtended.findUnique({
      where: { userId: session.user.id },
      select: { civicProfileCompleted: true, onboardingDismissed: true },
    })
    onboardingNeeded =
      !!userExtended &&
      !userExtended.civicProfileCompleted &&
      !userExtended.onboardingDismissed
  } catch (error) {
    console.error('Error checking onboarding status in /auth/complete:', error)
  }

  const destination = onboardingNeeded
    ? new URL(`/onboarding?returnTo=${encodeURIComponent(returnTo)}`, base)
    : new URL(returnTo, base)

  const response = NextResponse.redirect(destination)

  if (onboardingNeeded) {
    // Persist the nudge so the middleware keeps routing to onboarding until the
    // user completes or dismisses it (both of which delete this cookie).
    response.cookies.set('onboarding-needed', '1', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    })
  }

  return response
}
