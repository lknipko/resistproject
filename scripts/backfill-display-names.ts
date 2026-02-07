/**
 * Backfill Display Names
 *
 * Generates display names for existing users who don't have one
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function backfillDisplayNames() {
  try {
    console.log('\nBackfilling display names for existing users...\n')

    // Find all users without display names
    const usersWithoutDisplayName = await prisma.userExtended.findMany({
      where: {
        displayName: null
      },
      include: {
        user: {
          select: {
            email: true
          }
        }
      }
    })

    if (usersWithoutDisplayName.length === 0) {
      console.log('✓ All users already have display names!\n')
      return
    }

    console.log(`Found ${usersWithoutDisplayName.length} user(s) without display names\n`)

    for (const userExtended of usersWithoutDisplayName) {
      const email = userExtended.email

      // Generate display name from email
      let baseDisplayName = email.split('@')[0]
      // Clean it up - remove special chars, limit length
      baseDisplayName = baseDisplayName.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20)

      // Make it unique by checking if it exists
      let displayName = baseDisplayName
      let counter = 1
      while (true) {
        const nameExists = await prisma.userExtended.findUnique({
          where: { displayName }
        })
        if (!nameExists) break
        displayName = `${baseDisplayName}${counter}`
        counter++
      }

      // Update the user
      await prisma.userExtended.update({
        where: { id: userExtended.id },
        data: { displayName }
      })

      console.log(`✓ ${email} → ${displayName}`)
    }

    console.log(`\n✅ Successfully backfilled ${usersWithoutDisplayName.length} display names!\n`)

  } catch (error) {
    console.error('❌ Error backfilling display names:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillDisplayNames()
