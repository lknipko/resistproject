'use client'

import { useRouter } from 'next/navigation'
import { TOPIC_TAGS } from '@/lib/tags'

export { TOPIC_TAGS }

interface TagFilterBarProps {
  section: 'learn' | 'act'
  activeTag?: string
  /** Only the topic tags that appear on at least one page in this section */
  availableTags: string[]
}

export function TagFilterBar({ section, activeTag, availableTags }: TagFilterBarProps) {
  const router = useRouter()

  const isLearn = section === 'learn'
  const activeClasses = isLearn
    ? 'bg-teal-600 border-teal-600 text-white'
    : 'bg-orange-500 border-orange-500 text-white'
  const hoverClasses = isLearn
    ? 'hover:border-teal-400 hover:text-teal-700'
    : 'hover:border-orange-400 hover:text-orange-700'
  const clearClasses = isLearn ? 'text-teal-600' : 'text-orange-600'

  const visibleTags = TOPIC_TAGS.filter((t) => availableTags.includes(t))

  const handleTagClick = (tag: string) => {
    if (tag === activeTag) {
      router.push(`/${section}`)
    } else {
      router.push(`/${section}?tag=${encodeURIComponent(tag)}`)
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm text-gray-500 font-medium mr-1 shrink-0">Filter:</span>
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => handleTagClick(tag)}
            aria-pressed={tag === activeTag}
            className={[
              'px-3 py-1 text-sm font-medium rounded-full border-2 transition-colors',
              tag === activeTag
                ? activeClasses
                : `border-gray-200 text-gray-700 bg-white ${hoverClasses}`,
            ].join(' ')}
          >
            {tag}
            {tag === activeTag && <span className="ml-1 opacity-75">×</span>}
          </button>
        ))}
      </div>
      {activeTag && (
        <p className="mt-3 text-sm text-gray-600">
          Showing pages tagged <strong>{activeTag}</strong>
          {' — '}
          <button
            onClick={() => router.push(`/${section}`)}
            className={`${clearClasses} hover:underline font-medium`}
          >
            Show all
          </button>
        </p>
      )}
    </div>
  )
}
