'use client'

/**
 * EditPageButton Component
 *
 * Displays a "Suggest Edit" button at the bottom of learn/act pages.
 * Opens EditProposalModal when clicked.
 * Shows sign-in prompt for unauthenticated users.
 */

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { EditProposalModal } from './EditProposalModal'

interface EditPageButtonProps {
  section: 'learn' | 'act'
  slug: string
  currentContent: string
}

export function EditPageButton({ section, slug, currentContent }: EditPageButtonProps) {
  const { data: session, status } = useSession()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Loading state
  if (status === 'loading') {
    return (
      <div className="mt-12 p-6 bg-gray-100 rounded-lg text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto mb-4"></div>
          <div className="h-10 bg-gray-300 rounded w-1/3 mx-auto"></div>
        </div>
      </div>
    )
  }

  // Not authenticated
  if (!session) {
    return (
      <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg border-2 border-blue-200 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-blue-500 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <p className="text-gray-800 font-semibold mb-2">
          See something that needs updating?
        </p>
        <p className="text-gray-700 text-sm mb-4">
          Help improve this page by suggesting edits, adding sources, or updating information.
        </p>
        <a
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors"
        >
          Sign in to suggest edits
        </a>
      </div>
    )
  }

  // Authenticated
  return (
    <>
      <div className="mt-12 p-6 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg border-2 border-teal-200 text-center">
        <div className="mb-4">
          <svg
            className="w-12 h-12 text-teal-600 mx-auto mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
            />
          </svg>
        </div>
        <p className="text-gray-800 font-semibold mb-2">
          Help improve this page
        </p>
        <p className="text-gray-700 text-sm mb-4">
          Suggest edits, add sources, or update information.
          Your contributions help keep this wiki accurate and up-to-date.
        </p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-block px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-md"
        >
          <span className="flex items-center justify-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
              />
            </svg>
            Suggest Edit
          </span>
        </button>
        <p className="text-xs text-gray-600 mt-3">
          All edits are reviewed by the community before being published
        </p>
      </div>

      {isModalOpen && (
        <EditProposalModal
          section={section}
          slug={slug}
          currentContent={currentContent}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  )
}
