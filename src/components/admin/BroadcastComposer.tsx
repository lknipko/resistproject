'use client'

import { useState, useTransition } from 'react'
import { sendBroadcast, previewBroadcast, sendTestEmail } from '@/app/admin/broadcasts/actions'

interface PageOption {
  title: string
  description: string
  path: string
  type: 'learn' | 'act'
  tags: string[]
  slug: string
}

interface BroadcastComposerProps {
  pages: PageOption[]
  recipientCount: number
  adminEmail: string
}

export function BroadcastComposer({ pages, recipientCount, adminEmail }: BroadcastComposerProps) {
  const [subject, setSubject] = useState('')
  const [introText, setIntroText] = useState('')
  // Ordered array of selected page paths (order = display order in email)
  const [orderedPaths, setOrderedPaths] = useState<string[]>([])
  const [filter, setFilter] = useState<'all' | 'urgent' | 'learn' | 'act'>('urgent')
  const [previewHtml, setPreviewHtml] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    error?: string
    recipientCount?: number
    successCount?: number
    failureCount?: number
  } | null>(null)

  const [isPending, startTransition] = useTransition()

  const selectedPaths = new Set(orderedPaths)

  const filteredPages = pages.filter((p) => {
    if (filter === 'urgent') return p.tags.includes('Urgent')
    if (filter === 'learn') return p.type === 'learn'
    if (filter === 'act') return p.type === 'act'
    return true
  })

  // Sort: urgent first, then alphabetical
  const sortedPages = [...filteredPages].sort((a, b) => {
    const aUrgent = a.tags.includes('Urgent') ? 0 : 1
    const bUrgent = b.tags.includes('Urgent') ? 0 : 1
    if (aUrgent !== bUrgent) return aUrgent - bUrgent
    return a.title.localeCompare(b.title)
  })

  function togglePage(path: string) {
    setOrderedPaths((prev) => {
      if (prev.includes(path)) return prev.filter((p) => p !== path)
      return [...prev, path]
    })
  }

  function movePageUp(path: string) {
    setOrderedPaths((prev) => {
      const idx = prev.indexOf(path)
      if (idx <= 0) return prev
      const next = [...prev]
      next[idx] = next[idx - 1]
      next[idx - 1] = path
      return next
    })
  }

  function movePageDown(path: string) {
    setOrderedPaths((prev) => {
      const idx = prev.indexOf(path)
      if (idx < 0 || idx >= prev.length - 1) return prev
      const next = [...prev]
      next[idx] = next[idx + 1]
      next[idx + 1] = path
      return next
    })
  }

  function getSelectedPages() {
    const pageMap = new Map(pages.map((p) => [p.path, p]))
    return orderedPaths
      .map((path) => pageMap.get(path))
      .filter((p): p is PageOption => !!p)
      .map(({ title, description, path, type, tags }) => ({ title, description, path, type, tags }))
  }

  function handlePreview() {
    if (!introText.trim()) return
    const selected = getSelectedPages()
    if (selected.length === 0) return

    startTransition(async () => {
      const res = await previewBroadcast({ introText, selectedPages: selected })
      if ('html' in res) {
        setPreviewHtml(res.html)
      } else {
        setResult({ error: res.error })
      }
    })
  }

  function handleSend() {
    if (!subject.trim() || !introText.trim()) return
    const selected = getSelectedPages()
    if (selected.length === 0) return

    startTransition(async () => {
      const res = await sendBroadcast({ subject, introText, selectedPages: selected })
      setResult(res)
      setShowConfirm(false)
      if (res.success) {
        setPreviewHtml(null)
      }
    })
  }

  function handleTestSend() {
    if (!subject.trim() || !introText.trim()) return
    const selected = getSelectedPages()
    if (selected.length === 0) return

    startTransition(async () => {
      const res = await sendTestEmail({
        subject: `[TEST] ${subject}`,
        introText,
        testEmail: adminEmail,
        selectedPages: selected,
      })
      setResult(res)
    })
  }

  const canSend = subject.trim() && introText.trim() && orderedPaths.length > 0
  const FREE_TIER_LIMIT = 100

  return (
    <div className="space-y-6">
      {/* Subject */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Subject Line</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          placeholder="e.g., Urgent: New Actions Available on Iran War"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-500 focus:border-transparent"
        />
        <p className="mt-1 text-xs text-gray-500">{subject.length}/200 characters</p>
      </div>

      {/* Intro Text */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
        <textarea
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          rows={4}
          placeholder="Write a brief message to your subscribers about why this update matters..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-steel-500 focus:border-transparent resize-y"
        />
        <p className="mt-1 text-xs text-gray-500">
          Use <code className="bg-gray-100 px-1 rounded">**bold text**</code> for emphasis.
        </p>
      </div>

      {/* Selected Pages Order */}
      {orderedPaths.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Page Order in Email (drag or use arrows to reorder)
          </label>
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-100">
            {orderedPaths.map((path, idx) => {
              const page = pages.find((p) => p.path === path)
              if (!page) return null
              return (
                <div key={path} className="flex items-center gap-2 px-4 py-2 bg-blue-50">
                  <span className="text-xs font-bold text-gray-400 w-5 text-center">{idx + 1}</span>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => movePageUp(path)}
                      disabled={idx === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-xs leading-none"
                      title="Move up"
                    >
                      &#9650;
                    </button>
                    <button
                      onClick={() => movePageDown(path)}
                      disabled={idx === orderedPaths.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-25 disabled:cursor-not-allowed text-xs leading-none"
                      title="Move down"
                    >
                      &#9660;
                    </button>
                  </div>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    page.type === 'act' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {page.type === 'act' ? 'ACT' : 'LEARN'}
                  </span>
                  <span className="font-medium text-gray-900 text-sm flex-1 truncate">{page.title}</span>
                  <button
                    onClick={() => togglePage(path)}
                    className="text-gray-400 hover:text-red-600 text-lg leading-none"
                    title="Remove"
                  >
                    &times;
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Page Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {orderedPaths.length > 0 ? 'Add More Pages' : 'Featured Pages'} ({orderedPaths.length} selected)
        </label>

        {/* Filter buttons */}
        <div className="flex gap-2 mb-3">
          {(['urgent', 'all', 'learn', 'act'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                filter === f
                  ? 'bg-steel-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f === 'urgent' ? 'Urgent' : f === 'all' ? 'All' : f === 'learn' ? 'Learn' : 'Act'}
            </button>
          ))}
        </div>

        {/* Page list */}
        <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
          {sortedPages.map((page) => (
            <label
              key={page.path}
              className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                selectedPaths.has(page.path) ? 'bg-blue-50' : ''
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPaths.has(page.path)}
                onChange={() => togglePage(page.path)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-steel-600 focus:ring-steel-500"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                    page.type === 'act'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}>
                    {page.type === 'act' ? 'ACT' : 'LEARN'}
                  </span>
                  <span className="font-medium text-gray-900 truncate">{page.title}</span>
                  {page.tags.includes('Urgent') && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-700 rounded uppercase">
                      Urgent
                    </span>
                  )}
                </div>
                {page.description && (
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{page.description}</p>
                )}
              </div>
            </label>
          ))}
          {sortedPages.length === 0 && (
            <p className="px-4 py-6 text-center text-gray-500 text-sm">No pages match this filter.</p>
          )}
        </div>
      </div>

      {/* Recipient info + rate limit warning */}
      <div className={`p-4 rounded-lg border ${
        recipientCount > FREE_TIER_LIMIT
          ? 'bg-yellow-50 border-yellow-200'
          : 'bg-blue-50 border-blue-200'
      }`}>
        <p className="text-sm font-medium text-gray-700">
          Will send to <span className="font-bold">{recipientCount}</span> user{recipientCount !== 1 ? 's' : ''} with notifications enabled.
        </p>
        {recipientCount > FREE_TIER_LIMIT && (
          <p className="text-xs text-yellow-700 mt-1">
            Warning: Resend free tier allows {FREE_TIER_LIMIT} emails/day. You have {recipientCount} recipients.
            Some emails may fail unless you&apos;ve upgraded your Resend plan.
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handlePreview}
          disabled={isPending || !introText.trim() || orderedPaths.length === 0}
          className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending && !showConfirm ? 'Loading...' : 'Preview Email'}
        </button>
        <button
          onClick={() => setShowConfirm(true)}
          disabled={isPending || !canSend}
          className="px-5 py-2.5 bg-steel-600 text-white rounded-lg font-medium hover:bg-steel-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Send Broadcast
        </button>
        <button
          onClick={handleTestSend}
          disabled={isPending || !canSend}
          className="px-5 py-2.5 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isPending ? 'Sending...' : `Send Test to ${adminEmail}`}
        </button>
      </div>

      {/* Confirmation dialog */}
      {showConfirm && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm font-semibold text-red-900 mb-3">
            Are you sure you want to send &quot;{subject}&quot; to {recipientCount} user{recipientCount !== 1 ? 's' : ''}?
          </p>
          <div className="flex gap-3">
            <button
              onClick={handleSend}
              disabled={isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isPending ? 'Sending...' : 'Yes, Send Now'}
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              disabled={isPending}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className={`p-4 rounded-lg border ${
          result.error
            ? 'bg-red-50 border-red-200'
            : 'bg-green-50 border-green-200'
        }`}>
          {result.error ? (
            <p className="text-sm text-red-700 font-medium">{result.error}</p>
          ) : (
            <div className="text-sm text-green-700">
              <p className="font-semibold">Broadcast sent successfully!</p>
              <p className="mt-1">
                {result.successCount} of {result.recipientCount} emails delivered.
                {result.failureCount! > 0 && (
                  <span className="text-yellow-700"> ({result.failureCount} failed)</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Preview */}
      {previewHtml && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Email Preview</h3>
            <button
              onClick={() => setPreviewHtml(null)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Close preview
            </button>
          </div>
          <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            <iframe
              srcDoc={previewHtml}
              title="Email Preview"
              className="w-full border-0"
              style={{ minHeight: '600px' }}
              sandbox=""
            />
          </div>
        </div>
      )}
    </div>
  )
}
