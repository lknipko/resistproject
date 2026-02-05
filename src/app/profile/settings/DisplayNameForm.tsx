'use client'

import { useState } from 'react'
import { updateDisplayName } from '../actions'

interface DisplayNameFormProps {
  initialDisplayName: string
}

export default function DisplayNameForm({ initialDisplayName }: DisplayNameFormProps) {
  const [displayName, setDisplayName] = useState(initialDisplayName)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSave = async () => {
    setIsSaving(true)
    setMessage(null)

    const result = await updateDisplayName(displayName)

    setIsSaving(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Display name updated!' })
      setIsEditing(false)
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCancel = () => {
    setDisplayName(initialDisplayName)
    setIsEditing(false)
    setMessage(null)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          disabled={!isEditing || isSaving}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-50"
          maxLength={100}
        />
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || displayName.trim() === initialDisplayName}
              className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

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
