export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow-md text-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h2>
          <p className="mt-4 text-sm text-gray-600">
            A sign-in link has been sent to your email address.
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Click the link in the email to sign in.
          </p>
        </div>
        
        <div className="mt-6 text-xs text-gray-500">
          <p>If you don't see the email, check your spam folder.</p>
        </div>
      </div>
    </div>
  )
}
