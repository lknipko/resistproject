'use client'

import { useState, useEffect, useRef } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { mdxComponents } from '@/components/mdx-components'

interface MDXPreviewProps {
  content: string
}

/**
 * Compile MDX via the server API endpoint, which uses the same plugins
 * as the production pipeline (remarkSectionWrapper, remarkPhoneLinks, etc.).
 * Falls back to client-side compilation with basic plugins if the API is unavailable.
 */
async function compileViaServer(content: string): Promise<MDXRemoteSerializeResult> {
  const response = await fetch('/api/preview-mdx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data.error || `Server returned ${response.status}`)
  }

  const data = await response.json()
  return data.mdxSource as MDXRemoteSerializeResult
}

/**
 * Fallback: compile client-side with only basic plugins (no section wrapper).
 * Used when the server API is unreachable.
 */
async function compileClientSide(content: string): Promise<MDXRemoteSerializeResult> {
  return await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [rehypeSlug],
    },
  })
}

export function MDXPreview({ content }: MDXPreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    let isCancelled = false

    const compileMDX = async () => {
      if (!content.trim()) {
        setMdxSource(null)
        return
      }

      setIsCompiling(true)
      setError(null)

      try {
        // Try server-side compilation first (full plugin pipeline)
        const result = await compileViaServer(content)

        if (!isCancelled) {
          setMdxSource(result)
          setUsingFallback(false)
          setIsCompiling(false)
        }
      } catch (serverErr) {
        if (isCancelled) return

        // If the server error indicates bad MDX syntax, show the error
        // rather than falling back (fallback would also fail)
        const isNetworkError = serverErr instanceof TypeError
          && (serverErr.message.includes('fetch') || serverErr.message.includes('network'))

        if (!isNetworkError) {
          // MDX compilation error from server - show it
          console.error('MDX server compilation error:', serverErr)
          setError(
            serverErr instanceof Error
              ? `Preview error: ${serverErr.message}`
              : 'Preview error: Invalid markdown/MDX syntax'
          )
          setIsCompiling(false)
          return
        }

        // Network/availability error - fall back to client-side compilation
        try {
          const result = await compileClientSide(content)
          if (!isCancelled) {
            setMdxSource(result)
            setUsingFallback(true)
            setIsCompiling(false)
          }
        } catch (clientErr) {
          if (!isCancelled) {
            console.error('MDX client compilation error:', clientErr)
            setError('Preview error: Invalid markdown/MDX syntax')
            setIsCompiling(false)
          }
        }
      }
    }

    // Debounce compilation to reduce API calls while typing
    const timeoutId = setTimeout(compileMDX, 1000)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [content])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
        <p className="font-semibold">{error}</p>
        <p className="text-xs mt-1">Check your markdown syntax and try again</p>
      </div>
    )
  }

  if (isCompiling) {
    return (
      <div className="p-4 text-gray-500 text-sm animate-pulse">
        Compiling preview...
      </div>
    )
  }

  if (!mdxSource) {
    return (
      <div className="p-4 text-gray-400 text-sm italic">
        Start editing to see preview...
      </div>
    )
  }

  return (
    <div className="mdx-preview">
      {usingFallback && (
        <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-xs">
          Preview is showing basic formatting only. Full styling will appear on the published page.
        </div>
      )}
      <MDXRemote {...mdxSource} components={mdxComponents} />
    </div>
  )
}
