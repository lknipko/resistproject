import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageCard } from '@/components/content/ProposeNewPageCard'
import { TagFilterBar } from '@/components/content/TagFilterBar'
import { TOPIC_TAGS } from '@/lib/tags'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Learn',
  description: 'Understand government actions with verified facts and primary sources',
}

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>
}) {
  const { tag: activeTag } = await searchParams
  const allPages = getAllPages('learn')

  // Collect topic tags that exist on at least one page (exclude status tags)
  const availableTags = [
    ...new Set(
      allPages.flatMap((p) => p.tags ?? []).filter((t) => TOPIC_TAGS.includes(t))
    ),
  ]

  const learnPages = activeTag
    ? allPages.filter((p) => p.tags?.includes(activeTag))
    : allPages

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Learn</h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Understand government actions with verified facts and primary sources.
          Every claim is backed by official documents and court filings.
        </p>
      </div>

      <TagFilterBar
        section="learn"
        activeTag={activeTag}
        availableTags={availableTags}
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learnPages.map((page) => {
          const topicTags = (page.tags ?? []).filter((t) => TOPIC_TAGS.includes(t))
          const statusTags = (page.tags ?? []).filter((t) => !TOPIC_TAGS.includes(t))
          return (
            <Link
              key={page.slug}
              href={`/learn/${page.slug}`}
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-teal-500 transition-all"
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
                      className="px-2 py-0.5 text-xs font-medium bg-teal-50 text-teal-800 border border-teal-200 rounded-full"
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
        {!activeTag && <ProposeNewPageCard section="learn" />}
      </div>

      {learnPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No pages found for &ldquo;{activeTag}&rdquo;.
          </p>
        </div>
      )}
    </div>
  )
}
