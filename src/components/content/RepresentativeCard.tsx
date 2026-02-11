'use client'

import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRepresentatives } from '@/hooks/useRepresentatives'

interface RepresentativeCardProps {
  repType?: 'senator' | 'representative' | 'all'
}

/**
 * RepresentativeCard Component
 *
 * Displays the user's federal representatives (2 Senators + 1 House Rep) in a summary card.
 * Auto-fetches based on signed-in user's zip code.
 *
 * Props:
 * - repType: Filter representatives ('senator', 'representative', or 'all' - default)
 */
export default function RepresentativeCard({ repType = 'all' }: RepresentativeCardProps = {}) {
  const { user, loading: userLoading } = useUserProfile()
  const { representatives, loading: repsLoading, error: repsError } = useRepresentatives(user?.zipCode || null)

  // Filter representatives based on repType
  const filteredReps = representatives.filter(rep => {
    if (repType === 'all') return true
    if (repType === 'senator') return rep.office.includes('Senate')
    if (repType === 'representative') return rep.office.includes('House')
    return true
  })

  // Loading states
  if (userLoading || repsLoading) {
    return (
      <div className="my-6 p-6 bg-teal-50 border border-teal-200 rounded-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-teal-200 rounded w-1/3"></div>
          <div className="space-y-3">
            <div className="h-4 bg-teal-200 rounded w-3/4"></div>
            <div className="h-4 bg-teal-200 rounded w-2/3"></div>
            <div className="h-4 bg-teal-200 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    )
  }

  // Not signed in - show lookup resources
  if (!user) {
    return (
      <div className="my-6 p-6 bg-teal-50 border border-teal-400 rounded-lg">
        <h3 className="text-lg font-semibold text-teal-900 mb-3">
          Your Federal Representatives
        </h3>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-sm font-medium text-teal-900 mb-1">Find Your Senators:</p>
            <a
              href="https://www.senate.gov/senators/senators-contact.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-800 underline text-sm"
            >
              Senate.gov Contact Directory
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-teal-900 mb-1">Find Your House Representative:</p>
            <a
              href="https://www.house.gov/representatives/find-your-representative"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 hover:text-teal-800 underline text-sm"
            >
              House.gov Representative Finder
            </a>
          </div>

          <div>
            <p className="text-sm font-medium text-teal-900 mb-1">Capitol Switchboard:</p>
            <a
              href="tel:+12022243121"
              className="text-teal-700 hover:text-teal-800 underline text-sm font-mono"
            >
              📞 (202) 224-3121
            </a>
            <p className="text-xs text-teal-700 mt-0.5">Ask to be connected to your representative's office</p>
          </div>
        </div>

        <p className="text-xs text-teal-700 border-t border-teal-300 pt-3">
          <Link href="/auth/signin" className="text-teal-800 hover:text-teal-900 underline font-medium">
            Sign in
          </Link>
          {' '}to automatically see your representatives and get pre-filled contact templates.
        </p>
      </div>
    )
  }

  // Profile incomplete
  if (!user.civicProfileCompleted) {
    return (
      <div className="my-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          Your Federal Representatives
        </h3>
        <p className="text-orange-800 mb-4">
          Complete your profile to see your representatives.
        </p>
        <Link
          href="/profile/settings"
          className="inline-block px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
        >
          Complete Profile
        </Link>
      </div>
    )
  }

  // Error fetching representatives
  if (repsError) {
    return (
      <div className="my-6 p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Unable to load representatives
        </h3>
        <p className="text-red-800 mb-4">{repsError}</p>
        <p className="text-sm text-red-700">
          Please check your zip code in{' '}
          <Link href="/profile/settings" className="underline font-medium">
            profile settings
          </Link>.
        </p>
      </div>
    )
  }

  // No representatives found
  if (filteredReps.length === 0) {
    const repTypeLabel = repType === 'senator' ? 'senators' : repType === 'representative' ? 'representative' : 'representatives'
    return (
      <div className="my-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          No {repTypeLabel} found
        </h3>
        <p className="text-yellow-800">
          We couldn't find any {repTypeLabel} for zip code <strong>{user.zipCode}</strong>. Please verify your zip code in{' '}
          <Link href="/profile/settings" className="underline font-medium">
            profile settings
          </Link>.
        </p>
      </div>
    )
  }

  // Success - display representatives
  const title = repType === 'senator' ? 'Your Senators' : repType === 'representative' ? 'Your Representative' : 'Your Federal Representatives'

  return (
    <div className="my-6 p-6 bg-teal-50 border border-teal-400 rounded-lg">
      <h3 className="text-xl font-bold text-teal-900 mb-4">
        {title}
      </h3>
      <p className="text-sm text-teal-800 mb-4">
        Based on zip code: <strong>{user.zipCode}</strong>
      </p>

      <div className="space-y-4">
        {filteredReps.map((rep, index) => (
          <div
            key={index}
            className="flex items-start gap-4 p-4 bg-white border border-teal-200 rounded-md"
          >
            {/* Photo */}
            {rep.photoUrl && (
              <img
                src={rep.photoUrl}
                alt={rep.name}
                className="w-16 h-16 rounded-full object-cover flex-shrink-0"
              />
            )}

            {/* Info */}
            <div className="flex-1">
              <h4 className="text-lg font-bold text-gray-900">{rep.name}</h4>
              <p className="text-sm text-gray-600">{rep.office}</p>
              <p className="text-sm text-gray-500">{rep.party}</p>

              {/* Contact Info */}
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                {rep.phones && rep.phones.length > 0 && (
                  <a
                    href={`tel:${rep.phones[0].replace(/\D/g, '')}`}
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    📞 {rep.phones[0]}
                  </a>
                )}
                {rep.urls && rep.urls.length > 0 && (
                  <a
                    href={rep.urls[0]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-700 font-medium"
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-teal-700 mt-4">
        Not your representatives?{' '}
        <Link href="/profile/settings" className="underline font-medium">
          Update your zip code
        </Link>
      </p>
    </div>
  )
}
