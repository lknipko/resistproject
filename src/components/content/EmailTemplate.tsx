'use client'

import { useState, useEffect, Children, isValidElement } from 'react'
import Link from 'next/link'
import { useUserProfile } from '@/hooks/useUserProfile'
import { useRepresentatives } from '@/hooks/useRepresentatives'
import { Representative } from '@/app/api/representatives/route'
import { trackCivicActionClient } from '@/lib/tracking'

interface EmailMessageProps {
  topic: string
  subject: string
  body: string
}

// EmailMessage component - just a data holder, doesn't render
export function EmailMessage({ topic, subject, body }: EmailMessageProps) {
  return null
}

interface EmailTemplateProps {
  subject?: string
  body?: string
  repType?: 'senator' | 'representative' | 'all'
  children?: React.ReactNode
}

interface ParsedMessage {
  topic: string
  subject: string
  body: string
}

/**
 * EmailTemplate Component
 *
 * Displays personalized email templates for contacting representatives.
 * Automatically substitutes variables like {firstName}, {repName}, etc.
 *
 * Props:
 * - subject: Email subject with variables
 * - body: Email body with variables
 * - repType: Which reps to show ('senator', 'representative', or 'all')
 * - children: Fallback content if user not signed in
 */
export default function EmailTemplate({
  subject,
  body,
  repType = 'all',
  children,
}: EmailTemplateProps) {
  // All hooks must be called at the top, before any conditional returns
  const [showPreview, setShowPreview] = useState(false)
  const [selectedLoggedOutIndex, setSelectedLoggedOutIndex] = useState(0)
  const [copiedLoggedOut, setCopiedLoggedOut] = useState(false)
  const { user, loading: userLoading } = useUserProfile()

  // Anonymous zip code state — syncs across all instances on the page via custom event
  const [anonZipCode, setAnonZipCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('anon_zipCode') || ''
    }
    return ''
  })
  const [zipSubmitted, setZipSubmitted] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!sessionStorage.getItem('anon_zipCode')
    }
    return false
  })
  const [zipError, setZipError] = useState<string | null>(null)

  // Listen for zip code changes from other EmailTemplate/CallRepButton instances
  useEffect(() => {
    function handleZipChange(e: Event) {
      const zip = (e as CustomEvent).detail
      if (zip) {
        setAnonZipCode(zip)
        setZipSubmitted(true)
      } else {
        setAnonZipCode('')
        setZipSubmitted(false)
      }
    }
    window.addEventListener('anonZipChanged', handleZipChange)
    return () => window.removeEventListener('anonZipChanged', handleZipChange)
  }, [])

  const { representatives, loading: repsLoading, error: repsError } = useRepresentatives(
    user?.zipCode || null,
    zipSubmitted ? anonZipCode : null
  )

  function handleZipSubmit() {
    const cleaned = anonZipCode.trim()
    if (/^\d{5}(-\d{4})?$/.test(cleaned)) {
      setZipError(null)
      sessionStorage.setItem('anon_zipCode', cleaned)
      setAnonZipCode(cleaned)
      setZipSubmitted(true)
      window.dispatchEvent(new CustomEvent('anonZipChanged', { detail: cleaned }))
    } else {
      setZipError('Please enter a valid 5-digit zip code.')
    }
  }

  function handleChangeZip() {
    sessionStorage.removeItem('anon_zipCode')
    setZipSubmitted(false)
    setAnonZipCode('')
    setZipError(null)
    window.dispatchEvent(new CustomEvent('anonZipChanged', { detail: null }))
  }

  // Parse children to extract EmailMessage components
  const messages: ParsedMessage[] = []

  if (children) {
    Children.forEach(children, (child) => {
      // Check if child has EmailMessage props (topic, subject, body)
      if (isValidElement(child) &&
          typeof child.props === 'object' &&
          child.props !== null &&
          'topic' in child.props &&
          'subject' in child.props &&
          'body' in child.props) {
        const props = child.props as EmailMessageProps
        messages.push({
          topic: props.topic,
          subject: props.subject,
          body: props.body,
        })
      }
    })
  }

  // If no children or legacy mode, use subject/body props
  const hasMultipleMessages = messages.length > 0
  const legacyMessage: ParsedMessage | null = (!hasMultipleMessages && subject && body)
    ? { topic: '', subject, body }
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
      <div className="my-4 md:my-6 p-3 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Determine title based on repType
  const getTitle = () => {
    if (repType === 'senator') return 'Email Template for your Senators'
    if (repType === 'representative') return 'Email Template for your Representative'
    return 'Email Template for your Representatives'
  }

  // Not signed in — show zip code input or personalized templates
  if (!user) {
    const displayMessages = hasMultipleMessages ? messages : (legacyMessage ? [legacyMessage] : [])

    if (displayMessages.length === 0) {
      return null // No content to display
    }

    const currentDisplayMessage = displayMessages[selectedLoggedOutIndex]

    // If zip submitted and reps loaded, show personalized cards
    if (zipSubmitted && !repsLoading && !repsError && filteredReps.length > 0) {
      const anonUser = {
        firstName: null as string | null,
        lastName: null as string | null,
        zipCode: anonZipCode,
        phoneNumber: null as string | null,
      }

      return (
        <div className="my-4 md:my-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing representatives for <strong>{anonZipCode}</strong>
            </p>
            <button
              onClick={handleChangeZip}
              className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium"
            >
              Change zip code
            </button>
          </div>
          {filteredReps.map((rep, index) => (
            <RepresentativeEmailCard
              key={index}
              representative={rep}
              messages={displayMessages}
              user={anonUser}
            />
          ))}
          <p className="text-xs text-gray-500">
            <Link href="/auth/signin" className="text-orange-600 hover:underline">
              Sign in
            </Link>{' '}
            to save your preferences and personalize with your name.
          </p>
        </div>
      )
    }

    // If zip submitted and loading
    if (zipSubmitted && repsLoading) {
      return (
        <div className="my-4 md:my-6 p-3 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-600"></div>
            <p className="text-sm text-gray-700">Looking up your representatives...</p>
          </div>
        </div>
      )
    }

    // If zip submitted but error
    if (zipSubmitted && repsError) {
      return (
        <div className="my-4 md:my-6 bg-gray-50 border-l-4 border-orange-500 rounded-lg p-3 md:p-6">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{getTitle()}</h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-red-800">{repsError}</p>
              <button
                onClick={handleChangeZip}
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium mt-1"
              >
                Try a different zip code
              </button>
            </div>
          </div>
        </div>
      )
    }

    // If zip submitted but no reps found
    if (zipSubmitted && !repsLoading && filteredReps.length === 0) {
      return (
        <div className="my-4 md:my-6 bg-gray-50 border-l-4 border-orange-500 rounded-lg p-3 md:p-6">
          <div className="mb-3">
            <h3 className="text-lg font-bold text-gray-900 mb-1">{getTitle()}</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
              <p className="text-sm text-yellow-800">No representatives found for zip code {anonZipCode}.</p>
              <button
                onClick={handleChangeZip}
                className="text-sm text-orange-600 hover:text-orange-700 hover:underline font-medium mt-1"
              >
                Try a different zip code
              </button>
            </div>
          </div>
        </div>
      )
    }

    // Show generic template with zip code input
    const genericSubject = currentDisplayMessage.subject
      .replace(/\{firstName\}/g, '[FIRST NAME]')
      .replace(/\{lastName\}/g, '[LAST NAME]')
      .replace(/\{zipCode\}/g, '[ZIP CODE]')
      .replace(/\{repName\}/g, '[SENATOR/REPRESENTATIVE NAME]')

    const genericBody = currentDisplayMessage.body
      .replace(/\{firstName\}/g, '[FIRST NAME]')
      .replace(/\{lastName\}/g, '[LAST NAME]')
      .replace(/\{zipCode\}/g, '[ZIP CODE]')
      .replace(/\{repName\}/g, '[SENATOR/REPRESENTATIVE NAME]')

    return (
      <div className="my-4 md:my-6 bg-gray-50 border-l-4 border-orange-500 rounded-lg p-3 md:p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{getTitle()}</h3>

          {/* Zip code input for anonymous users */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4 mb-3">
            <p className="text-sm text-gray-700 mb-2 font-medium">Enter your zip code to personalize with your representatives:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={anonZipCode}
                onChange={(e) => { setAnonZipCode(e.target.value); setZipError(null) }}
                placeholder="12345"
                maxLength={10}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
                inputMode="numeric"
              />
              <button
                onClick={handleZipSubmit}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors text-sm"
              >
                Go
              </button>
            </div>
            {zipError && (
              <p className="text-xs text-red-600 mt-1.5">{zipError}</p>
            )}
            <p className="text-xs text-gray-500 mt-1.5">Used only to find your representatives. Not stored.</p>
          </div>

          <p className="text-sm text-gray-600">
            <strong>Or find your representatives manually:</strong>{' '}
            <a href="https://www.house.gov/representatives/find-your-representative" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              House.gov
            </a>
            {' | '}
            <a href="https://www.senate.gov/senators/senators-contact.htm" target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline">
              Senate.gov
            </a>
          </p>
        </div>

        {/* Collapsed by default for logged-out users */}
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          {showPreview ? '▾ Hide Message' : '▸ Show Message Template'}
        </button>

        {showPreview && (
          <div className="mt-3 p-2 md:p-4 bg-white border border-gray-200 rounded-md text-sm">
            {/* Topic Selector and Copy button */}
            <div className="flex justify-between items-center mb-3 gap-3">
              {/* Topic Selector (if multiple messages) */}
              {displayMessages.length > 1 ? (
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">Topic:</label>
                  <select
                    value={selectedLoggedOutIndex}
                    onChange={(e) => setSelectedLoggedOutIndex(Number(e.target.value))}
                    className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                  >
                    {displayMessages.map((msg, idx) => (
                      <option key={idx} value={idx}>
                        {msg.topic}
                      </option>
                    ))}
                  </select>
                </div>
              ) : <div />}

              {/* Copy button */}
              <button
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(`Subject: ${genericSubject}\n\n${genericBody}`)
                    setCopiedLoggedOut(true)
                    setTimeout(() => setCopiedLoggedOut(false), 2000)
                  } catch (err) {
                    console.error('Failed to copy:', err)
                  }
                }}
                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copiedLoggedOut ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mb-3">
              <strong className="text-gray-700">Subject:</strong>
              <span className="ml-2 text-gray-900">{genericSubject}</span>
            </div>
            <div>
              <strong className="text-gray-700">Message:</strong>
              <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-900">{genericBody}</pre>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Profile incomplete - prompt to complete
  if (!user.civicProfileCompleted) {
    return (
      <div className="my-4 md:my-6 p-3 md:p-6 bg-orange-50 border border-orange-200 rounded-lg">
        <h3 className="text-lg font-semibold text-orange-900 mb-2">
          Complete your profile for personalized templates
        </h3>
        <p className="text-orange-800 mb-4">
          Add your name and zip code to get customized email templates for contacting your representatives.
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
      <div className="my-4 md:my-6 p-3 md:p-6 bg-gray-50 border border-gray-200 rounded-lg">
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
      <div className="my-4 md:my-6 p-3 md:p-6 bg-red-50 border border-red-200 rounded-lg">
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
      <div className="my-4 md:my-6 p-3 md:p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
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

  // Success - render email templates
  return (
    <div className="my-4 md:my-6 space-y-4">
      {filteredReps.map((rep, index) => (
        <RepresentativeEmailCard
          key={index}
          representative={rep}
          messages={hasMultipleMessages ? messages : (legacyMessage ? [legacyMessage] : [])}
          user={user}
        />
      ))}
    </div>
  )
}

/**
 * Individual representative email card
 */
function RepresentativeEmailCard({
  representative,
  messages,
  user,
}: {
  representative: Representative
  messages: ParsedMessage[]
  user: {
    firstName: string | null
    lastName: string | null
    zipCode: string | null
    phoneNumber: string | null
  }
}) {
  const [showPreview, setShowPreview] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(0)

  if (messages.length === 0) {
    return null
  }

  const hasMultipleMessages = messages.length > 1
  const currentMessage = messages[selectedMessageIndex]

  // Substitute variables in template
  const substituteVariables = (template: string): string => {
    return template
      .replace(/\{firstName\}/g, user.firstName || '[Your First Name]')
      .replace(/\{lastName\}/g, user.lastName || '[Your Last Name]')
      .replace(/\{zipCode\}/g, user.zipCode || '[Your Zip Code]')
      .replace(/\{repName\}/g, representative.name)
  }

  const personalizedSubject = substituteVariables(currentMessage.subject)
  const personalizedBody = substituteVariables(currentMessage.body)

  // For anonymous users (no firstName/lastName), use "A concerned constituent" as sign-off
  const displayBody = (!user.firstName && !user.lastName)
    ? personalizedBody
        .replace(/\[Your First Name\] \[Your Last Name\]/g, 'A concerned constituent')
        .replace(/\[Your First Name\]/g, '')
        .replace(/\[Your Last Name\]/g, '')
    : personalizedBody

  const displaySubject = (!user.firstName && !user.lastName)
    ? personalizedSubject
        .replace(/\[Your First Name\] \[Your Last Name\]/g, 'A concerned constituent')
        .replace(/\[Your First Name\]/g, '')
        .replace(/\[Your Last Name\]/g, '')
    : personalizedSubject

  // Generate mailto: link
  const mailtoLink = `mailto:${representative.emails[0] || ''}?subject=${encodeURIComponent(displaySubject)}&body=${encodeURIComponent(displayBody)}`

  // Email available
  const hasEmail = representative.emails && representative.emails.length > 0

  // Track email click (NO PII - only rep name and office)
  const handleEmailClick = () => {
    trackCivicActionClient({
      actionType: 'email_clicked',
      repName: representative.name,
      repOffice: representative.office,
    })
  }

  return (
    <div className="bg-gray-50 border-l-4 border-orange-500 rounded-lg p-2.5 md:p-4">
      {/* Horizontal layout: Image - Info - Button */}
      <div className="flex items-center gap-4 mb-3">
        {/* Photo */}
        {representative.photoUrl && (
          <img
            src={representative.photoUrl}
            alt={representative.name}
            className="w-16 h-16 rounded-full object-cover flex-shrink-0"
            referrerPolicy="no-referrer"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
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

        {/* Email/Contact Button */}
        {hasEmail ? (
          <a
            href={mailtoLink}
            onClick={handleEmailClick}
            className="px-6 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors whitespace-nowrap flex-shrink-0"
          >
            Send Email →
          </a>
        ) : (
          representative.urls[0] && (
            <a
              href={representative.urls[0]}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleEmailClick}
              className="px-3 py-2 bg-orange-600 text-white font-semibold rounded-md hover:bg-orange-700 transition-colors text-center w-20 sm:w-auto"
            >
              Open Contact Form →
            </a>
          )
        )}
      </div>

      {/* Preview Toggle (below main card) */}
      <button
        onClick={() => setShowPreview(!showPreview)}
        className="text-sm text-orange-600 hover:text-orange-700 font-medium"
      >
        {showPreview ? '▾ Hide Message' : '▸ Preview Message'}
      </button>

      {showPreview && (
        <div className="mt-3 p-2 md:p-4 bg-white border border-gray-200 rounded-md text-sm">
          {/* Topic selector (left) and Copy button (right) */}
          <div className="flex justify-between items-center mb-3 gap-3">
            {/* Topic Selector */}
            {hasMultipleMessages ? (
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Topic:</label>
                <select
                  value={selectedMessageIndex}
                  onChange={(e) => setSelectedMessageIndex(Number(e.target.value))}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white text-gray-700 hover:border-orange-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none"
                >
                  {messages.map((msg, idx) => (
                    <option key={idx} value={idx}>
                      {msg.topic}
                    </option>
                  ))}
                </select>
              </div>
            ) : <div />}

            {/* Copy button - always visible */}
            <button
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(`Subject: ${displaySubject}\n\n${displayBody}`)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                } catch (err) {
                  console.error('Failed to copy:', err)
                }
              }}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>

          {hasEmail && (
            <div className="mb-3">
              <strong className="text-gray-700">To:</strong>
              <span className="ml-2 text-gray-900">{representative.emails[0]}</span>
            </div>
          )}
          <div className="mb-3">
            <strong className="text-gray-700">Subject:</strong>
            <span className="ml-2 text-gray-900">{displaySubject}</span>
          </div>
          <div>
            <strong className="text-gray-700">Message:</strong>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-900">{displayBody}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
