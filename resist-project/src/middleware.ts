import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware - auth will be added later
export function middleware(request: NextRequest) {
  // All routes are public for now
  // Admin protection will be added when authentication is configured
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
