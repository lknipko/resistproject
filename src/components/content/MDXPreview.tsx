'use client'

import { useState, useEffect } from 'react'
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote'
import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import { mdxComponents } from '@/components/mdx-components'

interface MDXPreviewProps {
  content: string
}

export function MDXPreview({ content }: MDXPreviewProps) {
  const [mdxSource, setMdxSource] = useState<MDXRemoteSerializeResult | null>(null)
  const [isCompiling, setIsCompiling] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
        const result = await serialize(content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [rehypeSlug],
          },
        })

        if (!isCancelled) {
          setMdxSource(result)
          setIsCompiling(false)
        }
      } catch (err) {
        if (!isCancelled) {
          console.error('MDX compilation error:', err)
          setError('Preview error: Invalid markdown/MDX syntax')
          setIsCompiling(false)
        }
      }
    }

    // Debounce compilation to avoid excessive re-renders while typing
    const timeoutId = setTimeout(compileMDX, 500)

    return () => {
      isCancelled = true
      clearTimeout(timeoutId)
    }
  }, [content])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
        <p className="font-semibold">⚠️ {error}</p>
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
      <MDXRemote {...mdxSource} components={mdxComponents} />
    </div>
  )
}
