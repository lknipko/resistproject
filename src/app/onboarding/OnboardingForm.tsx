'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCivicProfile } from '@/app/profile/actions'
import { dismissOnboarding } from './actions'
import { validateZipCode, validatePhoneNumber, validateName, formatPhoneNumber } from '@/lib/validation'

interface OnboardingFormProps {
  returnTo: string
}

export default function OnboardingForm({ returnTo }: OnboardingFormProps) {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string
    lastName?: string
    zipCode?: string
    phoneNumber?: string
  }>({})

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setFieldErrors({})

    const errors: typeof fieldErrors = {}

    const firstNameValidation = validateName(firstName, 'First name')
    if (!firstNameValidation.valid) errors.firstName = firstNameValidation.error

    const lastNameValidation = validateName(lastName, 'Last name')
    if (!lastNameValidation.valid) errors.lastName = lastNameValidation.error

    const zipCodeValidation = validateZipCode(zipCode)
    if (!zipCodeValidation.valid) errors.zipCode = zipCodeValidation.error

    const phoneValidation = validatePhoneNumber(phoneNumber)
    if (!phoneValidation.valid) errors.phoneNumber = phoneValidation.error

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsSaving(true)
    const result = await updateCivicProfile({ firstName, lastName, zipCode, phoneNumber })
    setIsSaving(false)

    if (result.error) {
      setFieldErrors({ firstName: result.error })
      return
    }

    router.push(returnTo || '/')
    router.refresh()
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    await dismissOnboarding()
    router.push(returnTo || '/')
    router.refresh()
  }

  const handlePhoneBlur = () => {
    if (phoneNumber) {
      const validation = validatePhoneNumber(phoneNumber)
      if (validation.valid) {
        setPhoneNumber(formatPhoneNumber(phoneNumber))
      }
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-5">
      {/* Name row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-steel-500"
            maxLength={100}
            placeholder="Jane"
            autoFocus
          />
          {fieldErrors.firstName && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isSaving}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-steel-500"
            maxLength={100}
            placeholder="Doe"
          />
          {fieldErrors.lastName && (
            <p className="text-sm text-red-600 mt-1">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      {/* Zip code */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Zip Code <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          onBlur={() => {
            if (zipCode) {
              const v = validateZipCode(zipCode)
              if (!v.valid) setFieldErrors(prev => ({ ...prev, zipCode: v.error }))
              else setFieldErrors(prev => { const n = { ...prev }; delete n.zipCode; return n })
            }
          }}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-steel-500"
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

      {/* Phone number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          onBlur={handlePhoneBlur}
          disabled={isSaving}
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-steel-500"
          maxLength={20}
          placeholder="(202) 555-1234"
        />
        {fieldErrors.phoneNumber && (
          <p className="text-sm text-red-600 mt-1">{fieldErrors.phoneNumber}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          For pre-filling call scripts when contacting representatives
        </p>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSaving || isSkipping}
          className="w-full sm:w-auto px-6 py-2.5 bg-steel-600 text-white font-medium rounded-md hover:bg-steel-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving…' : 'Save & Continue'}
        </button>
        <button
          type="button"
          onClick={handleSkip}
          disabled={isSaving || isSkipping}
          className="w-full sm:w-auto px-4 py-2.5 text-gray-500 hover:text-gray-700 text-sm transition-colors disabled:opacity-50"
        >
          {isSkipping ? 'Skipping…' : 'Skip for now'}
        </button>
      </div>

      <p className="text-xs text-gray-400">
        You can always update this later in{' '}
        <a href="/profile/settings" className="underline hover:text-gray-600">
          Profile Settings
        </a>
        .
      </p>
    </form>
  )
}
