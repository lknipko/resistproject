import { Metadata } from 'next'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Check Your Email - Resist Project',
}

async function VerifyContent() {
  const session = await auth()

  // If already signed in, redirect to homepage after a brief delay
  if (session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <h1 className="text-2xl font-bold text-gray-900">Signing you in...</h1>
          <p className="text-gray-600">You'll be redirected shortly.</p>
          <meta httpEquiv="refresh" content="1;url=/" />
        </div>
      </div>
    )
  }

  // Not signed in yet, show the "check your email" message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full text-center space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">Check your email</h1>
        <p className="text-gray-600">
          A sign-in link has been sent to your email address.
        </p>
        <p className="text-sm text-gray-500">
          Click the link in the email to complete sign-in.
        </p>
      </div>
    </div>
  )
}

export default function VerifyRequestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        </div>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}
