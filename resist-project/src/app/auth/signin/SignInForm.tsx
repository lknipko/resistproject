'use client'

import { useSearchParams } from 'next/navigation'
import { emailSignIn } from './actions'
import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      disabled={pending}
      className="group relative flex w-full justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? 'Sending...' : 'Send sign-in link'}
    </button>
  )
}

export default function SignInForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  return (
    <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md">
      <div>
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to Resist Project
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email to receive a sign-in link
        </p>
      </div>

      <form action={emailSignIn} className="mt-8 space-y-6">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />

        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
            placeholder="Email address"
          />
        </div>

        <div>
          <SubmitButton />
        </div>
      </form>

      <div className="text-center text-xs text-gray-500">
        <p>Authentication is only required for contributors.</p>
        <p className="mt-1">All content is publicly accessible.</p>
      </div>
    </div>
  )
}
