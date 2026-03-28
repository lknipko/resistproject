'use client'

import { useState } from 'react'

interface EmailSignupPromptProps {
  source: string // tracking: "post-zip", "homepage", etc.
  compact?: boolean // for inline/homepage use
}

export function EmailSignupPrompt({ source, compact = false }: EmailSignupPromptProps) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setStatus('loading')
    try {
      const res = await fetch('/api/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'You\'re signed up for weekly updates!')
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  if (status === 'success') {
    return (
      <div className={`${compact ? 'py-3' : 'mt-4 p-4 bg-green-50 border border-green-200 rounded-lg'}`}>
        <p className={`text-green-700 font-medium ${compact ? 'text-sm text-center' : ''}`}>
          {message}
        </p>
      </div>
    )
  }

  if (compact) {
    // Inline version for homepage
    return (
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 shrink-0"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
    )
  }

  // Post-action version
  return (
    <div className="mt-4 p-3 md:p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-sm font-medium text-gray-700 mb-2">
        Get weekly action alerts delivered to your inbox
      </p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          inputMode="email"
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-50 shrink-0"
        >
          {status === 'loading' ? '...' : 'Subscribe'}
        </button>
      </form>
      <p className="text-xs text-gray-500 mt-1.5">1 email per week. Unsubscribe anytime.</p>
      {status === 'error' && <p className="text-xs text-red-600 mt-1">{message}</p>}
    </div>
  )
}
