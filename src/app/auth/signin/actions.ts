'use server'

import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function emailSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const callbackUrl = (formData.get('callbackUrl') as string) || '/'

  try {
    await signIn('resend', {
      email,
      redirectTo: callbackUrl,
    })
  } catch (error) {
    // signIn throws NEXT_REDIRECT which we should allow
    throw error
  }

  redirect('/auth/verify-request')
}

export async function googleSignIn(callbackUrl: string = '/') {
  await signIn('google', {
    redirectTo: callbackUrl,
  })
}
