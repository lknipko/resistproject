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
      allowDangerousEmailAccountLinking: true,
    }),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "noreply@resistproject.com",
      allowDangerousEmailAccountLinking: true,
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
      // Create or link UserExtended record
      if (user.id && user.email) {
        try {
          // First check if UserExtended exists for this userId
          let existing = await prisma.userExtended.findUnique({
            where: { userId: user.id }
          })

          // If not found by userId, check by email (account linking scenario)
          if (!existing) {
            const existingByEmail = await prisma.userExtended.findUnique({
              where: { email: user.email }
            })

            if (existingByEmail) {
              // Link existing UserExtended to new provider's userId
              // This happens when user signs in with different provider but same email
              await prisma.userExtended.update({
                where: { email: user.email },
                data: { userId: user.id }
              })
              console.log(`Linked existing UserExtended (${user.email}) to new account (${user.id})`)
            } else {
              // No existing record - create new one
              // Generate display name from email
              let baseDisplayName = user.email.split('@')[0]
              baseDisplayName = baseDisplayName.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)

              if (!baseDisplayName) {
                baseDisplayName = 'user'
              }

              // Make it unique
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

              if (attempts >= 100) {
                displayName = `${baseDisplayName}_${Date.now()}`
              }

              await prisma.userExtended.create({
                data: {
                  userId: user.id,
                  email: user.email,
                  displayName: displayName,
                  userTier: 1,
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
              console.log(`Created new UserExtended for ${user.email}`)
            }
          }
        } catch (error) {
          console.error('Error creating/linking UserExtended record:', error)
          // User can still sign in
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
