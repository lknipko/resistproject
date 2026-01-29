import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Check Your Email - Resist Project',
}

export default function VerifyRequestPage() {
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
