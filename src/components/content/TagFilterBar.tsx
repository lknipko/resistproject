'use client'

import { useRouter } from 'next/navigation'
import { TOPIC_TAGS } from '@/lib/tags'
import { ENVIRONMENT_TOPIC_TAGS } from '@/lib/environment-tags'

export { TOPIC_TAGS }

interface TagFilterBarProps {
  section: 'learn' | 'act' | 'environment'
  activeTag?: string
  /** Only the topic tags that appear on at least one page in this section */
  availableTags: string[]
  /** Override the base path used for tag routing (defaults to /{section}) */
  basePath?: string
}

export function TagFilterBar({ section, activeTag, availableTags, basePath }: TagFilterBarProps) {
  const router = useRouter()
  const base = basePath ?? `/${section}`

  const sectionStyles: Record<string, { active: string; hover: string; clear: string }> = {
    learn: {
      active: 'bg-steel-600 border-steel-600 text-white',
      hover: 'hover:border-teal-400 hover:text-steel-700',
      clear: 'text-steel-600',
    },
    act: {
      active: 'bg-orange-500 border-orange-500 text-white',
      hover: 'hover:border-orange-400 hover:text-orange-700',
      clear: 'text-orange-600',
    },
    environment: {
      active: 'bg-forest-600 border-forest-600 text-white',
      hover: 'hover:border-forest-400 hover:text-forest-700',
      clear: 'text-forest-600',
    },
  }
  const styles = sectionStyles[section] ?? sectionStyles.learn
  const activeClasses = styles.active
  const hoverClasses = styles.hover
  const clearClasses = styles.clear

  const canonicalOrder = section === 'environment' ? ENVIRONMENT_TOPIC_TAGS : TOPIC_TAGS
  const visibleTags = canonicalOrder.filter((t) => availableTags.includes(t))

  const handleTagClick = (tag: string) => {
    if (tag === activeTag) {
      router.push(base)
    } else {
      router.push(`${base}?tag=${encodeURIComponent(tag)}`)
    }
  }

  return (
    <div className="sticky top-[64px] z-40 bg-white shadow-sm mb-8 -mx-4 px-4 py-3">
      <div
        className="flex flex-nowrap gap-2 items-center overflow-x-auto scrollbar-hide"
        style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
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
            onClick={() => router.push(base)}
            className={`${clearClasses} hover:underline font-medium`}
          >
            Show all
          </button>
        </p>
      )}
    </div>
  )
}
