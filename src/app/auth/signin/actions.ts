'use server'

import { signIn } from '@/lib/auth'
import { redirect } from 'next/navigation'

// Route post-authentication through /auth/complete, which handles onboarding
// routing (and its cookie) as a normal request — safely outside the Auth.js
// sign-in callbacks.
function completeUrl(callbackUrl: string): string {
  const safe = callbackUrl.startsWith('/') ? callbackUrl : '/'
  return `/auth/complete?returnTo=${encodeURIComponent(safe)}`
}

export async function emailSignIn(formData: FormData) {
  const email = formData.get('email') as string
  const callbackUrl = (formData.get('callbackUrl') as string) || '/'

  try {
    await signIn('resend', {
      email,
      redirectTo: completeUrl(callbackUrl),
    })
  } catch (error) {
    // signIn throws NEXT_REDIRECT which we should allow
    throw error
  }

  redirect('/auth/verify-request')
}

export async function googleSignIn(callbackUrl: string = '/') {
  await signIn('google', {
    redirectTo: completeUrl(callbackUrl),
  })
}
