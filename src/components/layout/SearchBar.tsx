'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import type { SearchIndexEntry } from '@/app/api/search-index/route'

let cachedIndex: SearchIndexEntry[] | null = null

async function loadIndex(): Promise<SearchIndexEntry[]> {
  if (cachedIndex) return cachedIndex
  // no-store ensures we always get fresh content in dev; CDN handles caching in prod
  const res = await fetch('/api/search-index', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load search index')
  cachedIndex = await res.json()
  return cachedIndex!
}

function buildFuse(entries: SearchIndexEntry[]) {
  return new Fuse(entries, {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'description', weight: 2 },
      { name: 'tags', weight: 2 },
      { name: 'excerpt', weight: 1 },
    ],
    threshold: 0.35,
    ignoreLocation: true,   // search entire string, not just near position 0
    includeScore: true,
    minMatchCharLength: 2,
  })
}

const SECTION_LABEL: Record<string, string> = {
  learn: 'LEARN',
  act: 'ACT',
}

const SECTION_COLORS: Record<string, string> = {
  learn: 'bg-teal-100 text-teal-800',
  act: 'bg-orange-100 text-orange-800',
}

export default function SearchBar() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchIndexEntry[]>([])
  const [selected, setSelected] = useState(-1)
  const [fuseReady, setFuseReady] = useState(false)
  const fuseRef = useRef<Fuse<SearchIndexEntry> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Preload index when component mounts
  useEffect(() => {
    loadIndex().then((entries) => {
      fuseRef.current = buildFuse(entries)
      setFuseReady(true)
    }).catch(console.error)
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false)
        inputRef.current?.blur()
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [])

  const search = useCallback((q: string) => {
    if (!fuseRef.current || q.trim().length < 2) {
      setResults([])
      return
    }
    const hits = fuseRef.current.search(q, { limit: 8 })
    setResults(hits.map((h) => h.item))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value
    setQuery(q)
    setSelected(-1)
    search(q)
    setOpen(true)
  }

  const handleFocus = () => {
    setOpen(true)
    if (query.trim().length >= 2) search(query)
  }

  const navigate = (result: SearchIndexEntry) => {
    setOpen(false)
    setQuery('')
    setResults([])
    router.push(result.path)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelected((s) => Math.min(s + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelected((s) => Math.max(s - 1, -1))
    } else if (e.key === 'Enter' && selected >= 0) {
      e.preventDefault()
      navigate(results[selected])
    }
  }

  const showDropdown = open && query.trim().length >= 2

  return (
    <div ref={containerRef} className="relative">
      {/* Search input */}
      <div className="flex items-center gap-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg px-3 py-1.5 border border-white/20">
        <svg
          className="w-4 h-4 text-white/70 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          placeholder={fuseReady ? 'Search…' : 'Loading…'}
          disabled={!fuseReady}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-white placeholder-white/50 text-sm outline-none w-40 md:w-52"
          aria-label="Search pages"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          role="combobox"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); inputRef.current?.focus() }}
            className="text-white/50 hover:text-white transition-colors"
            aria-label="Clear search"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && (
        <div className="absolute top-full mt-2 right-0 w-80 md:w-96 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul role="listbox">
              {results.map((result, i) => (
                <li key={result.path} role="option" aria-selected={i === selected}>
                  <button
                    onClick={() => navigate(result)}
                    onMouseEnter={() => setSelected(i)}
                    className={[
                      'w-full text-left px-4 py-3 flex gap-3 items-start transition-colors',
                      i === selected ? 'bg-gray-50' : 'hover:bg-gray-50',
                      i > 0 ? 'border-t border-gray-100' : '',
                    ].join(' ')}
                  >
                    <span
                      className={`shrink-0 mt-0.5 px-1.5 py-0.5 text-xs font-bold rounded uppercase tracking-wide ${
                        SECTION_COLORS[result.section]
                      }`}
                    >
                      {SECTION_LABEL[result.section]}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">
                        {result.title}
                      </p>
                      {result.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                          {result.description}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-400">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </span>
            <span className="text-xs text-gray-400">↑↓ navigate · ↵ open · esc close</span>
          </div>
        </div>
      )}
    </div>
  )
}
