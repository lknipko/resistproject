'use client'

/**
 * SessionProvider wrapper for NextAuth
 * Wraps the app to provide session context to all components.
 * When no session prop is passed, NextAuth automatically fetches
 * the session client-side via /api/auth/session.
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'

export function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  )
}
