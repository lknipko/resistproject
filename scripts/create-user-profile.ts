/**
 * Create User Profile Script
 *
 * Creates a UserExtended profile for a user by email
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createUserProfile(email: string) {
  try {
    console.log(`\nCreating user profile for ${email}...`)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      console.error(`❌ User not found with email: ${email}`)
      console.log(`\n💡 The user needs to sign in at least once before creating a profile.`)
      return
    }

    console.log(`✓ Found user: ${user.id}`)

    // Check if profile already exists
    const existing = await prisma.userExtended.findUnique({
      where: { userId: user.id }
    })

    if (existing) {
      console.log(`✓ User profile already exists (Tier ${existing.userTier})`)
      return
    }

    // Create UserExtended record
    const userExtended = await prisma.userExtended.create({
      data: {
        userId: user.id,
        email: user.email!,
        userTier: 1, // Start at tier 1
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

    console.log(`✓ User profile created successfully`)
    console.log(`✓ User Tier: ${userExtended.userTier}`)
    console.log(`\n✅ Success! ${email} can now vote and edit.\n`)

  } catch (error) {
    console.error('❌ Error creating user profile:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
const email = process.argv[2]

if (!email) {
  console.error('❌ Please provide an email address')
  console.log('\nUsage: npx tsx scripts/create-user-profile.ts <email>\n')
  process.exit(1)
}

createUserProfile(email)
