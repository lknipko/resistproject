'use client'

import { useState } from 'react'
import { updateEmailPreferences } from '../actions'

interface EmailPreferencesFormProps {
  initialEmailNotifications: boolean
  initialWeeklyDigest: boolean
}

export default function EmailPreferencesForm({
  initialEmailNotifications,
  initialWeeklyDigest,
}: EmailPreferencesFormProps) {
  const [emailNotifications, setEmailNotifications] = useState(initialEmailNotifications)
  const [weeklyDigest, setWeeklyDigest] = useState(initialWeeklyDigest)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const hasChanges =
    emailNotifications !== initialEmailNotifications || weeklyDigest !== initialWeeklyDigest

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    const result = await updateEmailPreferences(emailNotifications, weeklyDigest)

    setIsSaving(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Preferences saved!' })
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="email-notifications"
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="email-notifications" className="font-medium text-gray-900">
              Email Notifications
            </label>
            <p className="text-sm text-gray-600">
              Receive notifications when your edits are reviewed or approved
            </p>
          </div>
        </div>

        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="weekly-digest"
              type="checkbox"
              checked={weeklyDigest}
              onChange={(e) => setWeeklyDigest(e.target.checked)}
              className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="weekly-digest" className="font-medium text-gray-900">
              Weekly Digest
            </label>
            <p className="text-sm text-gray-600">
              Get a weekly summary of platform activity and trending content
            </p>
          </div>
        </div>
      </div>

      {hasChanges && (
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      )}

      {message && (
        <p
          className={`text-sm ${
            message.type === 'success' ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  )
}
