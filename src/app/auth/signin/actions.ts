'use server'

import { signIn } from '@/lib/auth'
import { AuthError } from 'next-auth'

export async function emailSignIn(email: string, callbackUrl: string = '/') {
  try {
    await signIn('resend', {
      email,
      redirectTo: callbackUrl,
    })
    return { success: true }
  } catch (error) {
    if (error instanceof AuthError) {
      return { success: false, error: error.message }
    }
    throw error
  }
}
