/**
 * Grant Admin Rights Script
 *
 * Promotes a user to Tier 5 (Administrator) and sets display name
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function grantAdmin(email: string, displayName: string) {
  try {
    console.log(`\nGranting admin rights to ${email}...`)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        extended: true
      }
    })

    if (!user) {
      console.error(`❌ User not found with email: ${email}`)
      return
    }

    console.log(`✓ Found user: ${user.id}`)

    // Update or create UserExtended record
    const userExtended = await prisma.userExtended.upsert({
      where: { userId: user.id },
      update: {
        userTier: 5, // Administrator
        displayName: displayName,
        reputationScore: 1000, // Give admin level reputation
      },
      create: {
        userId: user.id,
        email: user.email!, // Required field
        userTier: 5,
        displayName: displayName,
        reputationScore: 1000,
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

    console.log(`✓ User promoted to Tier ${userExtended.userTier} (Administrator)`)
    console.log(`✓ Display name set to: ${userExtended.displayName}`)
    console.log(`✓ Reputation score: ${userExtended.reputationScore}`)
    console.log(`\n✅ Success! ${email} now has full admin rights.\n`)

  } catch (error) {
    console.error('❌ Error granting admin rights:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
const email = process.argv[2] || 'lknipko@gmail.com'
const displayName = process.argv[3] || 'nipko'

grantAdmin(email, displayName)
