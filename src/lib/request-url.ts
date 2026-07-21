import type { NextRequest } from 'next/server'

/**
 * Resolve the public-facing base URL (origin) for an incoming request, honoring
 * the reverse proxy's `X-Forwarded-*` headers.
 *
 * Behind Railway (and most proxies) the Next.js container sees an internal host
 * such as `localhost:3000`, so building redirects from `request.url` /
 * `request.nextUrl` sends users to the wrong origin (e.g. `https://localhost:3000`).
 * This mirrors how NextAuth's `trustHost` resolves the URL, keeping redirects on
 * the real public domain.
 *
 * Safe to use from both Edge middleware and Node route handlers (headers only).
 */
export function publicBaseUrl(request: NextRequest): string {
  const host =
    request.headers.get('x-forwarded-host') ?? request.headers.get('host')

  if (host) {
    const proto =
      request.headers.get('x-forwarded-proto') ??
      (host.startsWith('localhost') || host.startsWith('127.0.0.1')
        ? 'http'
        : 'https')
    return `${proto}://${host}`
  }

  return request.nextUrl.origin
}
