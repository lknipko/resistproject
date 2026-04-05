import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageCard } from '@/components/content/ProposeNewPageCard'
import { TagFilterBar } from '@/components/content/TagFilterBar'
import { ENVIRONMENT_TOPIC_TAGS, ENVIRONMENT_STATUS_TAGS } from '@/lib/environment-tags'

export const revalidate = 300

export const metadata = {
  title: 'All Topics | Our Home | Resist Project',
  description: 'Browse all environment topics — climate, land, water, energy, toxics, justice, and Utah issues.',
}

export default async function EnvironmentTopicsPage({
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

  const sortedPages = [...filteredPages].sort((a, b) => {
    const aUrgent = a.tags?.includes('Urgent') ? 1 : 0
    const bUrgent = b.tags?.includes('Urgent') ? 1 : 0
    if (aUrgent !== bUrgent) return bUrgent - aUrgent
    return a.title.localeCompare(b.title)
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-forest-600 mb-3">
          <Link href="/ourhome" className="hover:underline">Our Home</Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600">All Topics</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Topics</h1>
        <p className="text-gray-600">
          {allPages.length} topics across climate, land, water, energy, toxics, justice, and local issues.
        </p>
      </div>

      {availableTags.length > 0 && (
        <TagFilterBar
          section="environment"
          activeTag={activeTag}
          availableTags={availableTags}
          basePath="/ourhome/topics"
        />
      )}

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {sortedPages.map((page) => {
          const topicTags = (page.tags ?? []).filter((t) => ENVIRONMENT_TOPIC_TAGS.includes(t))
          const statusTags = (page.tags ?? []).filter((t) => ENVIRONMENT_STATUS_TAGS.includes(t))
          const isUrgent = statusTags.includes('Urgent')
          return (
            <Link
              key={page.slug}
              href={`/ourhome/${page.slug}`}
              className="block p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-forest-400 transition-all"
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <h2 className="text-base font-semibold text-gray-900 leading-snug">{page.title}</h2>
                {isUrgent && (
                  <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded uppercase tracking-wide">
                    Urgent
                  </span>
                )}
              </div>
              {page.description && (
                <p className="text-gray-500 text-sm line-clamp-2">{page.description}</p>
              )}
              {topicTags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {topicTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
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

      {sortedPages.length === 0 && activeTag && (
        <div className="text-center py-16">
          <p className="text-gray-500">
            No topics found for &ldquo;{activeTag}&rdquo;.{' '}
            <Link href="/ourhome/topics" className="text-forest-600 hover:underline">
              Show all topics
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
