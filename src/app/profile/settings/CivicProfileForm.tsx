'use client'

import { useState } from 'react'
import { updateCivicProfile } from '../actions'
import { validateZipCode, validatePhoneNumber, validateName, formatPhoneNumber } from '@/lib/validation'

interface CivicProfileFormProps {
  initialFirstName: string
  initialLastName: string
  initialZipCode: string
  initialPhoneNumber: string
}

export default function CivicProfileForm({
  initialFirstName,
  initialLastName,
  initialZipCode,
  initialPhoneNumber,
}: CivicProfileFormProps) {
  const [firstName, setFirstName] = useState(initialFirstName)
  const [lastName, setLastName] = useState(initialLastName)
  const [zipCode, setZipCode] = useState(initialZipCode)
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Field-specific validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string
    lastName?: string
    zipCode?: string
    phoneNumber?: string
  }>({})

  const handleSave = async () => {
    // Clear previous errors
    setFieldErrors({})
    setMessage(null)

    // Validate all fields before submission
    const errors: typeof fieldErrors = {}

    const firstNameValidation = validateName(firstName, 'First name')
    if (!firstNameValidation.valid) {
      errors.firstName = firstNameValidation.error
    }

    const lastNameValidation = validateName(lastName, 'Last name')
    if (!lastNameValidation.valid) {
      errors.lastName = lastNameValidation.error
    }

    const zipCodeValidation = validateZipCode(zipCode)
    if (!zipCodeValidation.valid) {
      errors.zipCode = zipCodeValidation.error
    }

    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.valid) {
      errors.phoneNumber = phoneValidation.error
    }

    // If any validation errors, show them and don't submit
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSaving(true)

    const result = await updateCivicProfile({
      firstName,
      lastName,
      zipCode,
      phoneNumber,
    })

    setIsSaving(false)

    if (result.error) {
      setMessage({ type: 'error', text: result.error })
    } else {
      setMessage({ type: 'success', text: 'Civic profile updated!' })
      setIsEditing(false)
    }

    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000)
  }

  const handleCancel = () => {
    setFirstName(initialFirstName)
    setLastName(initialLastName)
    setZipCode(initialZipCode)
    setPhoneNumber(initialPhoneNumber)
    setIsEditing(false)
    setMessage(null)
    setFieldErrors({})
  }

  const handlePhoneBlur = () => {
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber)
      if (validation.valid) {
        // Format phone number on blur
        setPhoneNumber(formatPhoneNumber(phoneNumber))
      } else {
        setFieldErrors(prev => ({ ...prev, phoneNumber: validation.error }))
      }
    }
  }

  const handleZipBlur = () => {
    if (zipCode) {
      const validation = validateZipCode(zipCode)
      if (!validation.valid) {
        setFieldErrors(prev => ({ ...prev, zipCode: validation.error }))
      } else {
        // Clear error if valid
        setFieldErrors(prev => {
          const newErrors = { ...prev }
          delete newErrors.zipCode
          return newErrors
        })
      }
    }
  }

  const isComplete = firstName && lastName && zipCode && phoneNumber
  const hasChanges =
    firstName !== initialFirstName ||
    lastName !== initialLastName ||
    zipCode !== initialZipCode ||
    phoneNumber !== initialPhoneNumber

  return (
    <div className="space-y-4">
      {/* Profile Complete Indicator */}
      {isComplete && !isEditing && (
        <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Profile Complete
        </div>
      )}

      {/* First Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          First Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          disabled={!isEditing || isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-50"
          maxLength={100}
          placeholder="John"
        />
        {fieldErrors.firstName && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>
        )}
      </div>

      {/* Last Name Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Last Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          disabled={!isEditing || isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-50"
          maxLength={100}
          placeholder="Doe"
        />
        {fieldErrors.lastName && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>
        )}
      </div>

      {/* Zip Code Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zip Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          onBlur={handleZipBlur}
          disabled={!isEditing || isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-50"
          maxLength={10}
          placeholder="12345"
        />
        {fieldErrors.zipCode && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.zipCode}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Used to identify your federal representatives
        </p>
      </div>

      {/* Phone Number Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onBlur={handlePhoneBlur}
          disabled={!isEditing || isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 disabled:bg-gray-50"
          maxLength={20}
          placeholder="(202) 555-1234"
        />
        {fieldErrors.phoneNumber && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.phoneNumber}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          For contacting representatives (optional for templates)
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-2">
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
              disabled={isSaving || !hasChanges || Object.keys(fieldErrors).length > 0}
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

      {/* Success/Error Message */}
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
