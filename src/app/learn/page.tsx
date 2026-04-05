import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageCard } from '@/components/content/ProposeNewPageCard'
import { TagFilterBar } from '@/components/content/TagFilterBar'
import { TOPIC_TAGS } from '@/lib/tags'

export const revalidate = 300

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
              className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-steel-600 transition-all"
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
                      className="px-2 py-0.5 text-xs font-medium bg-steel-50 text-steel-700 border border-steel-200 rounded-full"
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

      {/* Our Home cross-link */}
      {!activeTag && (
        <Link
          href="/ourhome"
          className="block mt-8 p-6 bg-forest-50 border-2 border-forest-200 rounded-lg hover:border-forest-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-forest-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h2 className="text-lg font-semibold text-forest-800 group-hover:text-forest-900">Looking for environment content?</h2>
              <p className="text-sm text-forest-600">Visit Our Home for climate, water, public lands, and more.</p>
            </div>
            <svg className="w-5 h-5 text-forest-400 group-hover:text-forest-600 flex-shrink-0 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
        </Link>
      )}

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
