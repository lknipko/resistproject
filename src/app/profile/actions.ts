'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { validateZipCode, validatePhoneNumber, validateName, formatPhoneNumber } from '@/lib/validation'
import { createAuditLog } from '@/lib/audit'

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

export async function updateCivicProfile(data: {
  firstName: string
  lastName: string
  zipCode: string
  phoneNumber: string
}) {
  const session = await auth()

  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  // Validate all fields
  const firstNameValidation = validateName(data.firstName, 'First name')
  if (!firstNameValidation.valid) {
    return { error: firstNameValidation.error }
  }

  const lastNameValidation = validateName(data.lastName, 'Last name')
  if (!lastNameValidation.valid) {
    return { error: lastNameValidation.error }
  }

  const zipCodeValidation = validateZipCode(data.zipCode)
  if (!zipCodeValidation.valid) {
    return { error: zipCodeValidation.error }
  }

  const phoneValidation = validatePhoneNumber(data.phoneNumber)
  if (!phoneValidation.valid) {
    return { error: phoneValidation.error }
  }

  // Format phone number consistently
  const formattedPhone = formatPhoneNumber(data.phoneNumber)

  try {
    // Get old values for audit log
    const oldData = await prisma.userExtended.findUnique({
      where: { userId: session.user.id },
      select: {
        firstName: true,
        lastName: true,
        zipCode: true,
        phoneNumber: true,
        civicProfileCompleted: true,
      },
    })

    // Update profile
    const updated = await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        zipCode: data.zipCode.trim(),
        phoneNumber: formattedPhone,
        civicProfileCompleted: true, // Set to true when all fields are filled
      },
    })

    // Log to audit trail
    await createAuditLog({
      actionType: 'civic_profile_updated',
      actionCategory: 'user',
      actorId: session.user.id,
      description: 'User updated civic engagement profile',
      oldValue: oldData,
      newValue: {
        firstName: updated.firstName,
        lastName: updated.lastName,
        zipCode: updated.zipCode,
        phoneNumber: updated.phoneNumber,
        civicProfileCompleted: updated.civicProfileCompleted,
      },
    })

    revalidatePath('/profile')
    revalidatePath('/profile/settings')

    return { success: true }
  } catch (error) {
    console.error('Error updating civic profile:', error)
    return { error: 'Failed to update civic profile' }
  }
}
