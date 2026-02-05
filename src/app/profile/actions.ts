'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function updateDisplayName(displayName: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  // Validate display name
  if (!displayName || displayName.trim().length === 0) {
    return { error: 'Display name cannot be empty' }
  }

  if (displayName.length > 100) {
    return { error: 'Display name must be 100 characters or less' }
  }

  const trimmedName = displayName.trim()

  // Check for duplicate display names
  const existingUser = await prisma.userExtended.findFirst({
    where: {
      displayName: trimmedName,
      userId: { not: session.user.id }, // Exclude current user
    },
  })

  if (existingUser) {
    return { error: 'This display name is already taken. Please choose another.' }
  }

  try {
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: { displayName: trimmedName },
    })

    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating display name:', error)
    return { error: 'Failed to update display name' }
  }
}

export async function updateEmailPreferences(
  emailNotifications: boolean,
  weeklyDigest: boolean
) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        emailNotifications,
        weeklyDigest,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating email preferences:', error)
    return { error: 'Failed to update email preferences' }
  }
}
