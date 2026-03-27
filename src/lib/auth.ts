import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import Resend from "next-auth/providers/resend"
import Google from "next-auth/providers/google"
import { cookies } from "next/headers"
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
      allowDangerousEmailAccountLinking: false,
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
  events: {
    // createUser fires AFTER the User row is inserted into the DB.
    // This is the safe place to create UserExtended (no FK issues).
    async createUser({ user }) {
      if (!user.id || !user.email) return

      try {
        // Check if UserExtended already exists by email (account-linking scenario)
        const existingByEmail = await prisma.userExtended.findUnique({
          where: { email: user.email },
        })

        if (existingByEmail) {
          // Link the existing record to this new provider's userId
          await prisma.userExtended.update({
            where: { email: user.email },
            data: { userId: user.id },
          })
          console.log(`Linked existing UserExtended (${user.email}) to new account (${user.id})`)
        } else {
          // Generate a unique display name from the email
          let baseDisplayName = user.email.split('@')[0]
          baseDisplayName = baseDisplayName.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)
          if (!baseDisplayName) baseDisplayName = 'user'

          let displayName = baseDisplayName
          let counter = 1
          let attempts = 0
          while (attempts < 100) {
            const nameExists = await prisma.userExtended.findUnique({ where: { displayName } })
            if (!nameExists) break
            displayName = `${baseDisplayName}${counter}`
            counter++
            attempts++
          }
          if (attempts >= 100) displayName = `${baseDisplayName}_${Date.now()}`

          await prisma.userExtended.create({
            data: {
              userId: user.id,
              email: user.email,
              displayName,
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
            },
          })
          console.log(`Created new UserExtended for ${user.email}`)
        }

        // New user always needs onboarding
        const cookieStore = await cookies()
        cookieStore.set('onboarding-needed', '1', {
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24, // 24 hours
        })
      } catch (error) {
        console.error('Error in createUser event:', error)
      }
    },
  },
  callbacks: {
    async signIn({ user }) {
      // For RETURNING users, check if they still need onboarding and set the cookie.
      // New users are handled by the createUser event above.
      if (user.id && user.email) {
        try {
          const userExtended = await prisma.userExtended.findUnique({
            where: { userId: user.id },
            select: { civicProfileCompleted: true, onboardingDismissed: true },
          })

          // If no userExtended found, this is likely a new user whose User record
          // hasn't been created yet (email provider initial phase). Skip silently.
          if (userExtended && !userExtended.civicProfileCompleted && !userExtended.onboardingDismissed) {
            const cookieStore = await cookies()
            cookieStore.set('onboarding-needed', '1', {
              httpOnly: false,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 60 * 60 * 24,
            })
          }
        } catch (error) {
          console.error('Error in signIn callback:', error)
        }
      }
      return true
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id
        // Include userTier in session so client components can access it
        // without a separate Prisma query
        const userExtended = await prisma.userExtended.findUnique({
          where: { userId: user.id },
          select: { userTier: true },
        })
        session.user.userTier = userExtended?.userTier ?? 1
      }
      return session
    },
  },
})
