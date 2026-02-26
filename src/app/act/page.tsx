import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageCard } from '@/components/content/ProposeNewPageCard'
import { TagFilterBar } from '@/components/content/TagFilterBar'
import { TOPIC_TAGS } from '@/lib/tags'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Act',
  description: 'Take meaningful action with concrete, low-barrier opportunities for civic participation',
}

export default async function ActPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag: activeTag } = await searchParams
  const allPages = getAllPages('act')

  // Collect topic tags that exist on at least one page (exclude status tags)
  const availableTags = [
    ...new Set(
      allPages.flatMap((p) => p.tags ?? []).filter((t) => TOPIC_TAGS.includes(t))
    ),
  ]

  const actPages = activeTag
    ? allPages.filter((p) => p.tags?.includes(activeTag))
    : allPages

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Act</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Take meaningful action with concrete opportunities for civic participation.
          From quick actions (under 5 minutes) to sustained engagement.
        </p>
      </div>

      <TagFilterBar
        section="act"
        activeTag={activeTag}
        availableTags={availableTags}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actPages.map((page) => {
          const topicTags = (page.tags ?? []).filter((t) => TOPIC_TAGS.includes(t))
          const statusTags = (page.tags ?? []).filter((t) => !TOPIC_TAGS.includes(t))
          return (
            <Link
              key={page.slug}
              href={`/act/${page.slug}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-500 transition-all"
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
                      className="px-2 py-0.5 text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200 rounded-full"
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
                </div>
              )}
            </Link>
          )
        })}
        {!activeTag && <ProposeNewPageCard section="act" />}
      </div>

      {actPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No pages found for &ldquo;{activeTag}&rdquo;.
          </p>
        </div>
      )}
    </div>
  )
}
