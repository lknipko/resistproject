import Link from 'next/link'
import { TOPIC_TAGS } from '@/lib/tags'

interface PageMetaProps {
  tags?: string[]
  lastUpdated: string
  /** 'learn' or 'act' — used to build tag filter links */
  section?: 'learn' | 'act'
}

export function PageMeta({ tags, lastUpdated, section }: PageMetaProps) {
  const topicTags = (tags ?? []).filter((t) => TOPIC_TAGS.includes(t))
  const statusTags = (tags ?? []).filter((t) => !TOPIC_TAGS.includes(t))

  return (
    <div className="mt-8 pt-4 border-t border-gray-200 text-sm text-gray-600">
      {topicTags.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="font-semibold text-gray-700">Tags:</span>
          {topicTags.map((tag) =>
            section ? (
              <Link
                key={tag}
                href={`/${section}?tag=${encodeURIComponent(tag)}`}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full border transition-colors
                  border-gray-300 text-gray-600 hover:border-teal-400 hover:text-teal-700 hover:bg-teal-50"
              >
                {tag}
              </Link>
            ) : (
              <span
                key={tag}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full border border-gray-200 text-gray-600"
              >
                {tag}
              </span>
            )
          )}
          {statusTags.map((tag) => (
            <span
              key={tag}
              className={[
                'px-2.5 py-0.5 text-xs font-medium rounded-full border',
                tag === 'Urgent'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : tag === 'Under Litigation'
                  ? 'border-amber-200 bg-amber-50 text-amber-700'
                  : 'border-gray-200 text-gray-400',
              ].join(' ')}
            >
              {tag}
            </span>
          ))}
        </div>
      )}
      <p className="mb-2">
        <strong>Last Updated:</strong> {lastUpdated}
      </p>
      <p>
        <strong>Sources Verified:</strong> {lastUpdated}
      </p>
    </div>
  )
}
