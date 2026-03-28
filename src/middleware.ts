import { NextRequest, NextResponse } from 'next/server'

// ---------------------------------------------------------------------------
// In-memory sliding-window rate limiter
// Safe for Railway Hobby (single instance) — no external store needed.
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Periodically purge expired entries to prevent unbounded memory growth
let lastCleanup = Date.now()
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes

function cleanupStaleEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, value] of rateLimitMap) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

function isRateLimited(ip: string, limit: number, windowMs: number): boolean {
  cleanupStaleEntries()
  const now = Date.now()
  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return false
  }

  record.count++
  return record.count > limit
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

export function middleware(request: NextRequest) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'

  const path = request.nextUrl.pathname

  // --- Rate limiting (runs first) -------------------------------------------
  // Skip rate limiting entirely for the session endpoint — NextAuth polls it
  // frequently (every few seconds when the tab is focused) and it's a
  // read-only cached response with no abuse vector.
  if (path !== '/api/auth/session') {
    const windowMs = 60 * 1000 // 1-minute window
    let limit: number

    if (
      path.startsWith('/api/auth') &&
      !path.startsWith('/api/auth/verify-request')
    ) {
      limit = 20 // auth sign-in/callback endpoints: tight limit to prevent brute force
    } else if (path.startsWith('/api/')) {
      limit = 30 // other API routes
    } else {
      limit = 120 // page requests: generous for normal browsing
    }

    if (isRateLimited(ip, limit, windowMs)) {
      // For API routes, return plain text
      if (path.startsWith('/api/')) {
        return new NextResponse('Too Many Requests', {
          status: 429,
          headers: { 'Retry-After': '60', 'Content-Type': 'text/plain' },
        })
      }
      // For page routes, return styled HTML
      return new NextResponse(`
        <!DOCTYPE html>
        <html><head><title>Too Many Requests</title></head>
        <body style="font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb;">
          <div style="text-align: center; max-width: 400px; padding: 2rem;">
            <h1 style="font-size: 1.5rem; color: #111827; margin-bottom: 0.5rem;">Slow down</h1>
            <p style="color: #6b7280;">You're making requests too quickly. Please wait a moment and try again.</p>
            <a href="/" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #1a4f6e; color: white; border-radius: 0.5rem; text-decoration: none;">Go Home</a>
          </div>
        </body></html>
      `, {
        status: 429,
        headers: { 'Retry-After': '60', 'Content-Type': 'text/html' },
      })
    }
  }

  // --- Onboarding redirect (existing logic) ---------------------------------
  const needsOnboarding = request.cookies.get('onboarding-needed')?.value === '1'
  if (needsOnboarding) {
    // Skip redirect for API routes and auth routes so they still function
    if (!path.startsWith('/api/') && !path.startsWith('/auth/')) {
      const returnTo = encodeURIComponent(path + request.nextUrl.search)
      return NextResponse.redirect(
        new URL(`/onboarding?returnTo=${returnTo}`, request.url),
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  // Match all routes except Next.js internals, static assets, and the
  // onboarding page itself.  API and auth routes are now INCLUDED so they
  // are covered by rate limiting.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|onboarding).*)',
  ],
}
