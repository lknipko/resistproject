'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid. It may have been used already or expired.',
  Default: 'An error occurred during sign-in.',
}

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Authentication Error
          </h2>
          <p className="mt-4 text-sm text-red-600">
            {errorMessages[error] || errorMessages.Default}
          </p>
        </div>

        <div className="mt-6">
          <Link
            href="/auth/signin"
            className="flex w-full justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            Try again
          </Link>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-teal-600 hover:text-teal-500">
            Return to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}
