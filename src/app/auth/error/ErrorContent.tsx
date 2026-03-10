'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

const errorMessages = {
  Configuration: 'There is a problem with the server configuration.',
  AccessDenied: 'You do not have permission to sign in.',
  Verification: 'The sign-in link is no longer valid. It may have been used already or expired.',
  Default: 'An error occurred during sign-in.',
}

export default function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error') as keyof typeof errorMessages

  return (
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
          className="flex w-full justify-center rounded-md border border-transparent bg-steel-600 px-4 py-2 text-sm font-medium text-white hover:bg-steel-700 focus:outline-none focus:ring-2 focus:ring-steel-500 focus:ring-offset-2"
        >
          Try again
        </Link>
      </div>

      <div className="mt-4 text-center">
        <Link href="/" className="text-sm text-steel-600 hover:text-steel-700">
          Return to homepage
        </Link>
      </div>
    </div>
  )
}
