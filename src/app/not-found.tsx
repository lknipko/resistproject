import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-gray-600 mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4 justify-center">
        <Link
          href="/"
          className="bg-teal text-white px-6 py-3 rounded font-semibold hover:bg-teal-dark transition-colors"
        >
          Go Home
        </Link>
        <Link
          href="/learn"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded font-semibold hover:bg-gray-300 transition-colors"
        >
          Browse LEARN
        </Link>
      </div>
    </div>
  )
}
