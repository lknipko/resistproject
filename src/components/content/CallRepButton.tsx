'use client'

import { useState, Children, isValidElement } from 'react'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRepresentatives } from '@/hooks/useRepresentatives'
import { Representative } from '@/app/api/representatives/route'
import { trackCivicActionClient } from '@/lib/tracking'

interface CallScriptProps {
  topic: string
  script: string
}

// CallScript component - just a data holder, doesn't render
export function CallScript({ topic, script }: CallScriptProps) {
  return null
}

interface CallRepButtonProps {
  repType?: 'senator' | 'representative' | 'all'
  script?: string
  children?: React.ReactNode
}

interface ParsedScript {
  topic: string
  script: string
}

/**
 * CallRepButton Component
 *
 * Displays click-to-call buttons for contacting representatives.
 * Optional call script with variable substitution.
 *
 * Props:
 * - repType: Which reps to show ('senator', 'representative', or 'all')
 * - script: Optional call script text with variables like {firstName}, {repName}
 * - children: Fallback content if user not signed in
 */
export default function CallRepButton({
  repType = 'all',
  script,
  children,
}: CallRepButtonProps) {
  // All hooks must be called at the top, before any conditional returns
  const [showScript, setShowScript] = useState(false)
  const [selectedLoggedOutIndex, setSelectedLoggedOutIndex] = useState(0)
  const { user, loading: userLoading } = useUserProfile()
  const { representatives, loading: repsLoading, error: repsError } = useRepresentatives(user?.zipCode || null)

  // Parse children to extract CallScript components
  const scripts: ParsedScript[] = []

  if (children) {
    Children.forEach(children, (child) => {
      // Check if child has CallScript props (topic, script)
      if (isValidElement(child) &&
          typeof child.props === 'object' &&
          child.props !== null &&
          'topic' in child.props &&
          'script' in child.props) {
        const props = child.props as CallScriptProps
        scripts.push({
          topic: props.topic,
          script: props.script,
        })
      }
    })
  }

  // If no children or legacy mode, use script prop
  const hasMultipleScripts = scripts.length > 0
  const legacyScript: ParsedScript | null = (!hasMultipleScripts && script)
    ? { topic: '', script }
    : null

  // Filter representatives based on repType
  const filteredReps = representatives.filter(rep => {
    if (repType === 'all') return true
    if (repType === 'senator') return rep.office.includes('Senate')
    if (repType === 'representative') return rep.office.includes('House')
    return true
  })

  // Loading states
  if (userLoading) {
    return (
      <div className="my-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Not signed in - show script with placeholders and Capitol Switchboard (collapsed by default)
  if (!user) {
    // Use first script if multiple, otherwise use legacy prop
    const displayScripts = hasMultipleScripts ? scripts : (legacyScript ? [legacyScript] : [])

    if (displayScripts.length === 0) {
      return null // No content to display
    }

    const currentDisplayScript = displayScripts[selectedLoggedOutIndex]

    // Show generic script with placeholders
    const genericScript = currentDisplayScript.script
      .replace(/\{firstName\}/g, '[FIRST NAME]')
      .replace(/\{lastName\}/g, '[LAST NAME]')
      .replace(/\{zipCode\}/g, '[ZIP CODE]')
      .replace(/\{repName\}/g, '[SENATOR/REPRESENTATIVE NAME]')

    // Determine title based on repType
    const getTitle = () => {
      if (repType === 'senator') return 'Call Script for your Senators'
      if (repType === 'representative') return 'Call Script for your Representative'
      return 'Call Script for your Representatives'
    }

    return (
      <div className="my-6 bg-white border-2 border-orange-500 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{getTitle()}</h3>
          <p className="text-sm text-gray-600">
            <Link href="/auth/signin" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>{' '}
            to get your representative's phone number and a personalized script.
          </p>
        </div>

        {/* Capitol Switchboard Button */}
        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Call the U.S. Capitol Switchboard:</p>
          <a
            href="tel:+12022243121"
            className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors"
          >
            📞 Call (202) 224-3121
          </a>
          <p className="text-xs text-gray-600 mt-2">Ask to be connected to your Senator or Representative's office</p>
        </div>

        {/* Collapsed by default for logged-out users */}
        {genericScript && (
          <>
            <button
              onClick={() => setShowScript(!showScript)}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {showScript ? '▾ Hide Call Script' : '▸ Show Call Script'}
            </button>

            {showScript && (
              <div className="mt-3 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md text-sm">
                {/* Topic Selector (if multiple scripts) */}
                {displayScripts.length > 1 && (
                  <div className="mb-3 flex items-center gap-2">
                    <label className="text-sm font-medium text-gray-700">Topic:</label>
                    <select
                      value={selectedLoggedOutIndex}
                      onChange={(e) => setSelectedLoggedOutIndex(Number(e.target.value))}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                    >
                      {displayScripts.map((scr, idx) => (
                        <option key={idx} value={idx}>
                          {scr.topic}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <p className="font-medium text-gray-900 mb-2">Suggested Script:</p>
                <pre className="whitespace-pre-wrap font-sans text-gray-800">{genericScript}</pre>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Profile incomplete
  if (!user.civicProfileCompleted) {
    return (
      <div className="my-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          Complete your profile to call your representatives
        </h3>
        <p className="text-orange-800 mb-4">
          Add your zip code to get contact information for your representatives.
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

  // Loading representatives
  if (repsLoading) {
    return (
      <div className="my-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
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
          </Link>{' '}
          or try again later.
        </p>
      </div>
    )
  }

  // No representatives found
  if (filteredReps.length === 0) {
    return (
      <div className="my-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          No representatives found
        </h3>
        <p className="text-yellow-800">
          We couldn't find any {repType === 'all' ? 'representatives' : repType + 's'} for your zip code. Please verify your zip code in{' '}
          <Link href="/profile/settings" className="underline font-medium">
            profile settings
          </Link>.
        </p>
      </div>
    )
  }

  // Success - render call cards
  return (
    <div className="my-6 space-y-4">
      {filteredReps.map((rep, index) => (
        <RepCallCard
          key={index}
          representative={rep}
          scripts={hasMultipleScripts ? scripts : (legacyScript ? [legacyScript] : [])}
          user={user}
        />
      ))}
    </div>
  )
}

/**
 * Individual representative call card
 */
function RepCallCard({
  representative,
  scripts,
  user,
}: {
  representative: Representative
  scripts: ParsedScript[]
  user: {
    firstName: string | null
    lastName: string | null
    zipCode: string | null
    phoneNumber: string | null
  }
}) {
  const [showScript, setShowScript] = useState(false)
  const [selectedScriptIndex, setSelectedScriptIndex] = useState(0)

  if (scripts.length === 0) {
    return null
  }

  const hasMultipleScripts = scripts.length > 1
  const currentScript = scripts[selectedScriptIndex]

  // Substitute variables in script
  const substituteVariables = (template: string): string => {
    return template
      .replace(/\{firstName\}/g, user.firstName || '[Your First Name]')
      .replace(/\{lastName\}/g, user.lastName || '[Your Last Name]')
      .replace(/\{zipCode\}/g, user.zipCode || '[Your Zip Code]')
      .replace(/\{repName\}/g, representative.name)
  }

  const personalizedScript = substituteVariables(currentScript.script)

  // Phone available
  const hasPhone = representative.phones && representative.phones.length > 0
  const phoneNumber = hasPhone ? representative.phones[0] : null

  // Generate tel: link (strip non-digits)
  const telLink = phoneNumber ? `tel:${phoneNumber.replace(/\D/g, '')}` : null

  // Track call click (NO PII - only rep name and office)
  const handleCallClick = () => {
    trackCivicActionClient({
      actionType: 'call_clicked',
      repName: representative.name,
      repOffice: representative.office,
    })
  }

  return (
    <div className="bg-white border-2 border-orange-500 rounded-lg p-4">
      {/* Horizontal layout: Image - Info - Button */}
      <div className="flex items-center gap-4 mb-3">
        {/* Photo */}
        {representative.photoUrl && (
          <img
            src={representative.photoUrl}
            alt={representative.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
          />
        )}

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900">
            {representative.urls[0] ? (
              <a
                href={representative.urls[0]}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 hover:underline"
              >
                {representative.name}
              </a>
            ) : (
              representative.name
            )}
          </h3>
          <p className="text-sm text-gray-600">{representative.office}</p>
          <p className="text-sm text-gray-500">{representative.party}</p>
        </div>

        {/* Call Button */}
        {telLink ? (
          <a
            href={telLink}
            onClick={handleCallClick}
            className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            📞 Call Now
          </a>
        ) : (
          <div className="text-sm text-gray-600 flex-shrink-0">
            Phone not available
          </div>
        )}
      </div>

      {/* Call Script (below main card) */}
      <>
        <button
          onClick={() => setShowScript(!showScript)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          {showScript ? '▾ Hide Call Script' : '▸ Show Call Script'}
        </button>

        {showScript && (
          <div className="mt-3 p-4 bg-orange-50 border-l-4 border-orange-500 rounded-md text-sm">
            {/* Topic Selector (if multiple scripts) */}
            {hasMultipleScripts && (
              <div className="mb-3 flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Topic:</label>
                <select
                  value={selectedScriptIndex}
                  onChange={(e) => setSelectedScriptIndex(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                >
                  {scripts.map((scr, idx) => (
                    <option key={idx} value={idx}>
                      {scr.topic}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <p className="font-medium text-gray-900 mb-2">Suggested Script:</p>
            <pre className="whitespace-pre-wrap font-sans text-gray-800">{personalizedScript}</pre>
          </div>
        )}
      </>
    </div>
  )
}
