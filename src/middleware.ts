import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // If the user has a pending onboarding cookie, redirect them to /onboarding
  const needsOnboarding = request.cookies.get('onboarding-needed')?.value === '1'
  if (needsOnboarding) {
    const returnTo = encodeURIComponent(pathname + request.nextUrl.search)
    return NextResponse.redirect(new URL(`/onboarding?returnTo=${returnTo}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  // Run on all routes except Next.js internals, API routes, auth pages,
  // the onboarding page itself, and static assets
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/|auth/|onboarding).*)',
  ],
}
