import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import Google from "next-auth/providers/google"
import { prisma } from "./db"

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  basePath: "/api/auth",
  debug: process.env.NODE_ENV === 'development',
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@resistproject.com",
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/auth/signin",
    verifyRequest: "/auth/verify-request",
    error: "/auth/error",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Create UserExtended record if it doesn't exist
      if (user.id && user.email) {
        try {
          const existing = await prisma.userExtended.findUnique({
            where: { userId: user.id }
          })

          if (!existing) {
            // Generate display name from email
            let baseDisplayName = user.email.split('@')[0]
            // Clean it up - remove special chars, limit length
            baseDisplayName = baseDisplayName.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)

            // Fallback if cleaning removed everything
            if (!baseDisplayName) {
              baseDisplayName = 'user'
            }

            // Make it unique by checking if it exists (max 100 attempts)
            let displayName = baseDisplayName
            let counter = 1
            let attempts = 0
            while (attempts < 100) {
              const nameExists = await prisma.userExtended.findUnique({
                where: { displayName }
              })
              if (!nameExists) break
              displayName = `${baseDisplayName}${counter}`
              counter++
              attempts++
            }

            // If we couldn't find a unique name, add timestamp
            if (attempts >= 100) {
              displayName = `${baseDisplayName}_${Date.now()}`
            }

            await prisma.userExtended.create({
              data: {
                userId: user.id,
                email: user.email, // Required field
                displayName: displayName, // Auto-generated, user can change later
                userTier: 1, // New users start at tier 1
                reputationScore: 0,
                badges: [],
                editsProposed: 0,
                editsApproved: 0,
                editsRejected: 0,
                votesCast: 0,
                reviewsCompleted: 0,
                dailyEditCount: 0,
                dailyVoteCount: 0,
                lastActivityReset: new Date(),
                emailNotifications: true,
                weeklyDigest: true,
              }
            })
          }
        } catch (error) {
          // Log error but don't block sign-in
          console.error('Error creating UserExtended record:', error)
          // User can still sign in, profile will be created on next visit
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      // After successful sign-in, redirect to homepage or the original URL
      // If url is relative, prepend baseUrl
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // If url is on the same origin, allow it
      else if (new URL(url).origin === baseUrl) return url
      // Otherwise redirect to homepage
      return baseUrl
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
})
