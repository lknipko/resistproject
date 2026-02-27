'use client'

import { useState, Children, isValidElement } from 'react'
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
  const { user, loading: userLoading } = useUserProfile()
  const { representatives, loading: repsLoading, error: repsError } = useRepresentatives(user?.zipCode || null)

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
      <div className="my-6 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  // Not signed in - show template with placeholders (collapsed by default)
  if (!user) {
    // Use first message if multiple, otherwise use legacy props
    const displayMessages = hasMultipleMessages ? messages : (legacyMessage ? [legacyMessage] : [])

    if (displayMessages.length === 0) {
      return null // No content to display
    }

    const currentDisplayMessage = displayMessages[selectedLoggedOutIndex]

    // Show generic template with placeholders
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

    // Determine title based on repType
    const getTitle = () => {
      if (repType === 'senator') return 'Email Template for your Senators'
      if (repType === 'representative') return 'Email Template for your Representative'
      return 'Email Template for your Representatives'
    }

    return (
      <div className="my-6 bg-gray-50 border-l-4 border-orange-500 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-1">{getTitle()}</h3>
          <p className="text-sm text-gray-600 mb-2">
            <Link href="/auth/signin" className="text-orange-600 hover:underline font-medium">
              Sign in
            </Link>{' '}
            to get this pre-filled with your information and your representative's contact details.
          </p>
          <p className="text-sm text-gray-600">
            <strong>Find your representatives:</strong>{' '}
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
          <div className="mt-3 p-4 bg-white border border-gray-200 rounded-md text-sm">
            {/* Topic Selector (if multiple messages) */}
            {displayMessages.length > 1 && (
              <div className="mb-3">
                <label className="text-sm font-medium text-gray-700 mr-2">Topic:</label>
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
            )}

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
      <div className="my-6 p-6 bg-orange-50 border border-orange-200 rounded-lg">
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

  // Success - render email templates
  return (
    <div className="my-6 space-y-4">
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

  // Generate mailto: link
  const mailtoLink = `mailto:${representative.emails[0] || ''}?subject=${encodeURIComponent(personalizedSubject)}&body=${encodeURIComponent(personalizedBody)}`

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
    <div className="bg-gray-50 border-l-4 border-orange-500 rounded-lg p-4">
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
        <div className="mt-3 p-4 bg-white border border-gray-200 rounded-md text-sm">
          {/* Topic selector (left) and Copy button (right) */}
          {(hasMultipleMessages || !hasEmail) && (
            <div className="flex justify-between items-center mb-3 gap-3">
              {/* Topic Selector */}
              {hasMultipleMessages && (
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
              )}

              {/* Copy button */}
              {!hasEmail && (
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`Subject: ${personalizedSubject}\n\n${personalizedBody}`)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    } catch (err) {
                      console.error('Failed to copy:', err)
                    }
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors whitespace-nowrap"
                >
                  {copied ? (
                    <span className="text-green-600">✓<span className="hidden md:inline"> Copied!</span></span>
                  ) : (
                    <>📋<span className="hidden md:inline"> Copy Message</span></>
                  )}
                </button>
              )}
            </div>
          )}

          {hasEmail && (
            <div className="mb-3">
              <strong className="text-gray-700">To:</strong>
              <span className="ml-2 text-gray-900">{representative.emails[0]}</span>
            </div>
          )}
          <div className="mb-3">
            <strong className="text-gray-700">Subject:</strong>
            <span className="ml-2 text-gray-900">{personalizedSubject}</span>
          </div>
          <div>
            <strong className="text-gray-700">Message:</strong>
            <pre className="mt-2 whitespace-pre-wrap font-sans text-gray-900">{personalizedBody}</pre>
          </div>
        </div>
      )}
    </div>
  )
}
