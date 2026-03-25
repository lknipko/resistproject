'use server'

import { cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function dismissOnboarding() {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  try {
    await prisma.userExtended.update({
      where: { userId: session.user.id },
      data: { onboardingDismissed: true },
    })

    const cookieStore = await cookies()
    cookieStore.delete('onboarding-needed')

    return { success: true }
  } catch (error) {
    console.error('Error dismissing onboarding:', error)
    return { error: 'Failed to skip onboarding' }
  }
}
