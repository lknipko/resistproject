import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageCard } from '@/components/content/ProposeNewPageCard'
import { TagFilterBar } from '@/components/content/TagFilterBar'
import { ENVIRONMENT_TOPIC_TAGS } from '@/lib/environment-tags'

export const revalidate = 300

export const metadata = {
  title: 'Environment Hub',
  description: 'Track environmental rollbacks, protect public lands, and take action for clean air, water, and wildlife.',
}

export default async function EnvironmentPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag: activeTag } = await searchParams
  const allPages = getAllPages('environment')

  const availableTags = [
    ...new Set(
      allPages.flatMap((p) => p.tags ?? []).filter((t) => ENVIRONMENT_TOPIC_TAGS.includes(t))
    ),
  ]

  const filteredPages = activeTag
    ? allPages.filter((p) => p.tags?.includes(activeTag))
    : allPages

  // Sort: urgent first, then alphabetical
  const sortedPages = [...filteredPages].sort((a, b) => {
    const aUrgent = a.tags?.includes('Urgent') ? 1 : 0
    const bUrgent = b.tags?.includes('Urgent') ? 1 : 0
    if (aUrgent !== bUrgent) return bUrgent - aUrgent
    return a.title.localeCompare(b.title)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <div className="mb-10 bg-gradient-to-r from-forest-700 to-forest-600 rounded-2xl p-8 md:p-12 text-white">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">Environment Hub</h1>
        <p className="text-xl text-forest-100 max-w-3xl">
          Track environmental rollbacks, protect public lands and wildlife, monitor air and water quality,
          and take action for a healthier planet.
        </p>
      </div>

      {availableTags.length > 0 && (
        <TagFilterBar
          section="environment"
          activeTag={activeTag}
          availableTags={availableTags}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedPages.map((page) => {
          const topicTags = (page.tags ?? []).filter((t) => ENVIRONMENT_TOPIC_TAGS.includes(t))
          const statusTags = (page.tags ?? []).filter((t) => !ENVIRONMENT_TOPIC_TAGS.includes(t))
          return (
            <Link
              key={page.slug}
              href={`/environment/${page.slug}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-forest-500 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900">{page.title}</h2>
                {statusTags.includes('Urgent') && (
                  <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded uppercase tracking-wide">
                    Urgent
                  </span>
                )}
              </div>
              {page.description && (
                <p className="text-gray-600 text-sm line-clamp-3">{page.description}</p>
              )}
              {topicTags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {topicTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {statusTags.includes('Ongoing') && (
                    <span className="px-2 py-0.5 text-xs text-gray-400 border border-gray-200 rounded-full">
                      Ongoing
                    </span>
                  )}
                  {statusTags.includes('Under Litigation') && (
                    <span className="px-2 py-0.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-full">
                      Under Litigation
                    </span>
                  )}
                  {statusTags.includes('Comment Period Open') && (
                    <span className="px-2 py-0.5 text-xs font-medium text-forest-700 bg-forest-50 border border-forest-200 rounded-full">
                      Comment Period Open
                    </span>
                  )}
                </div>
              )}
            </Link>
          )
        })}
        {!activeTag && <ProposeNewPageCard section="environment" />}
      </div>

      {sortedPages.length === 0 && (
        <div className="text-center py-12">
          {activeTag ? (
            <p className="text-gray-500 text-lg">
              No pages found for &ldquo;{activeTag}&rdquo;.
            </p>
          ) : (
            <p className="text-gray-500 text-lg">
              Environment content is coming soon. Check back shortly!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
