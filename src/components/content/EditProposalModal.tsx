'use client'

/**
 * EditProposalModal Component
 *
 * Full-screen modal for submitting edit proposals.
 * Features:
 * - Edit/Preview tabs
 * - Textarea for content editing
 * - Edit summary field (required)
 * - Edit type selector
 * - Client-side validation
 * - Calls submitEditProposal server action
 */

import { useState, FormEvent, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { MDXPreview } from './MDXPreview'

interface EditProposalModalProps {
  section: 'learn' | 'act'
  slug: string
  currentContent: string
  onClose: () => void
  isNewPage?: boolean
}

export function EditProposalModal({
  section,
  slug,
  currentContent,
  onClose,
  isNewPage = false
}: EditProposalModalProps) {
  const router = useRouter()
  const [proposedContent, setProposedContent] = useState(currentContent)
  const [editSummary, setEditSummary] = useState('')
  const [editType, setEditType] = useState<'content' | 'sources' | 'formatting' | 'metadata'>('content')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit') // For mobile view

  // Refs for synchronized scrolling (desktop only)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const [isSyncingScroll, setIsSyncingScroll] = useState(false)

  // Synchronized scrolling - when one scrolls, update the other
  const handleTextareaScroll = () => {
    if (isSyncingScroll || !textareaRef.current || !previewRef.current) return

    setIsSyncingScroll(true)
    const scrollPercentage = textareaRef.current.scrollTop /
      (textareaRef.current.scrollHeight - textareaRef.current.clientHeight)

    previewRef.current.scrollTop = scrollPercentage *
      (previewRef.current.scrollHeight - previewRef.current.clientHeight)

    setTimeout(() => setIsSyncingScroll(false), 10)
  }

  const handlePreviewScroll = () => {
    if (isSyncingScroll || !textareaRef.current || !previewRef.current) return

    setIsSyncingScroll(true)
    const scrollPercentage = previewRef.current.scrollTop /
      (previewRef.current.scrollHeight - previewRef.current.clientHeight)

    textareaRef.current.scrollTop = scrollPercentage *
      (textareaRef.current.scrollHeight - textareaRef.current.clientHeight)

    setTimeout(() => setIsSyncingScroll(false), 10)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Import the server action dynamically to avoid bundling issues
      const { submitEditProposal } = await import('@/app/edit-proposals/actions')

      const result = await submitEditProposal({
        section,
        slug,
        originalContent: currentContent,
        proposedContent,
        editSummary,
        editType
      })

      if (result.error) {
        setError(result.error)
        setIsSubmitting(false)
      } else {
        setSuccess(true)
        // Show success message briefly, then close
        setTimeout(() => {
          onClose()
          router.refresh() // Refresh to show updated state
        }, 2000)
      }
    } catch (err) {
      setError('Failed to submit edit. Please try again.')
      setIsSubmitting(false)
      console.error('Edit submission error:', err)
    }
  }

  const charactersChanged = Math.abs(proposedContent.length - currentContent.length)
  const hasChanges = proposedContent !== currentContent

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl max-w-[95vw] lg:max-w-7xl w-full max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Suggest Edit</h2>
            <p className="text-sm text-gray-600 mt-1">
              /{section}/{slug}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success State */}
        {success && (
          <div className="p-6 bg-green-50 border-b border-green-200">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <div>
                <p className="font-semibold text-green-900">Edit submitted successfully!</p>
                <p className="text-sm text-green-700">Your edit will be reviewed by the community.</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile: Tabs, Desktop: Side-by-side header */}
        <div className="border-b bg-gray-50">
          {/* Mobile tabs (< md) */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileTab('edit')}
              className={`flex-1 py-3 px-6 font-semibold transition-colors ${
                mobileTab === 'edit'
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setMobileTab('preview')}
              className={`flex-1 py-3 px-6 font-semibold transition-colors ${
                mobileTab === 'preview'
                  ? 'text-teal-600 border-b-2 border-teal-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Preview
            </button>
          </div>

          {/* Desktop headers (>= md) */}
          <div className="hidden md:flex">
            <div className="flex-1 py-3 px-6 font-semibold text-gray-700 border-r">
              Edit (Markdown)
            </div>
            <div className="flex-1 py-3 px-6 font-semibold text-gray-700">
              Preview (Rendered)
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          {/* Content Area - Mobile: Single pane, Desktop: Side-by-side */}
          <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Mobile: Single pane based on tab - ensure proper height */}
            <div className="flex-1 flex flex-col md:hidden min-h-0">
              {mobileTab === 'edit' ? (
                <div className="flex-1 flex flex-col min-h-0">
                  <textarea
                    value={proposedContent}
                    onChange={(e) => setProposedContent(e.target.value)}
                    className="flex-1 p-4 font-mono text-sm border-none focus:ring-0 focus:outline-none resize-none min-h-0"
                    placeholder="Edit the page content here (Markdown format)"
                    disabled={isSubmitting || success}
                    style={{ minHeight: '400px' }}
                  />
                  <div className="flex-shrink-0 flex items-center justify-between p-3 border-t bg-gray-50 text-sm text-gray-600">
                    <span>
                      {proposedContent.length} characters
                      {hasChanges && (
                        <span className="ml-2 text-teal-600 font-medium">
                          ({charactersChanged > 0 ? '+' : ''}{proposedContent.length - currentContent.length})
                        </span>
                      )}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowHelp(!showHelp)}
                      className="text-teal-600 hover:text-teal-700 font-medium text-xs"
                    >
                      {showHelp ? 'Hide' : 'Help'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-4 bg-gray-50 min-h-0">
                  <div className="bg-white rounded-lg shadow-sm p-4 force-mobile-layout">
                    <MDXPreview content={proposedContent} />
                  </div>
                </div>
              )}
            </div>

            {/* Desktop: Side-by-side panes */}
            <div className="hidden md:flex flex-1 overflow-hidden">
              {/* Left: Edit Pane */}
              <div className="flex-1 flex flex-col border-r">
                <textarea
                  ref={textareaRef}
                  value={proposedContent}
                  onChange={(e) => setProposedContent(e.target.value)}
                  onScroll={handleTextareaScroll}
                  className="flex-1 p-4 font-mono text-sm border-none focus:ring-0 focus:outline-none resize-none"
                  placeholder="Edit the page content here (Markdown format)"
                  disabled={isSubmitting || success}
                />
                <div className="flex items-center justify-between p-3 border-t bg-gray-50 text-sm text-gray-600">
                  <span>
                    {proposedContent.length} characters
                    {hasChanges && (
                      <span className="ml-2 text-teal-600 font-medium">
                        ({charactersChanged > 0 ? '+' : ''}{proposedContent.length - currentContent.length})
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowHelp(!showHelp)}
                    className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {showHelp ? 'Hide Help' : 'Help'}
                  </button>
                </div>
              </div>

              {/* Right: Preview Pane */}
              <div className="flex-1 flex flex-col bg-gray-50">
                <div
                  ref={previewRef}
                  onScroll={handlePreviewScroll}
                  className="flex-1 overflow-y-auto p-6"
                >
                  <div className="bg-white rounded-lg shadow-sm min-h-full p-6 force-mobile-layout">
                    <MDXPreview content={proposedContent} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Markdown Help Section (appears between content and metadata when expanded) */}
          {showHelp && (
            <div className="p-3 bg-blue-50 border-t border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2 text-sm">📝 Basic Markdown Guide</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-blue-800">
                <div>
                  <span className="font-semibold">Headings:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">## Heading</code>
                </div>
                <div>
                  <span className="font-semibold">Bold:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">**bold text**</code>
                </div>
                <div>
                  <span className="font-semibold">Italic:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">*italic text*</code>
                </div>
                <div>
                  <span className="font-semibold">Link:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">[text](url)</code>
                </div>
                <div>
                  <span className="font-semibold">List:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">- Item</code>
                </div>
                <div>
                  <span className="font-semibold">Numbered:</span>
                  <code className="block bg-white px-2 py-1 rounded mt-1">1. Item</code>
                </div>
              </div>
            </div>
          )}

          {/* Edit Metadata Section - No scrolling, fixed height */}
          <div className="p-4 border-t bg-white">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="editType" className="block text-sm font-semibold text-gray-700 mb-2">
                  Edit Type
                </label>
                <select
                  id="editType"
                  value={editType}
                  onChange={(e) => setEditType(e.target.value as typeof editType)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={isSubmitting || success}
                >
                  <option value="content">Content update</option>
                  <option value="sources">Add/update sources</option>
                  <option value="formatting">Formatting fix</option>
                  <option value="metadata">Metadata update</option>
                </select>
              </div>

              <div>
                <label htmlFor="editSummary" className="block text-sm font-semibold text-gray-700 mb-2">
                  Edit Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="editSummary"
                  value={editSummary}
                  onChange={(e) => setEditSummary(e.target.value)}
                  placeholder="Briefly describe your changes (required, 10-500 characters)"
                  maxLength={500}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent resize-none"
                  rows={3}
                  disabled={isSubmitting || success}
                />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-sm ${
                    editSummary.length < 10 ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {editSummary.length}/500 characters
                    {editSummary.length < 10 && editSummary.length > 0 && (
                      <span className="ml-2">(minimum 10 characters)</span>
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mx-6 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">Error submitting edit</p>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !hasChanges || editSummary.length < 10 || success}
              className="px-6 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Edit
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
