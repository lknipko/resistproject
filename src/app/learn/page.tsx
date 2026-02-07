import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ProposeNewPageButton } from '@/components/content/ProposeNewPageButton'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Learn',
  description: 'Understand government actions with verified facts and primary sources',
}

export default async function LearnPage() {
  const learnPages = getAllPages('learn')

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Learn
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl">
              Understand government actions with verified facts and primary sources.
              Every claim is backed by official documents and court filings.
            </p>
          </div>
          <div className="flex-shrink-0">
            <ProposeNewPageButton section="learn" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learnPages.map((page) => (
          <Link
            key={page.slug}
            href={`/learn/${page.slug}`}
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-500 transition-all"
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {page.title}
            </h2>
            {page.description && (
              <p className="text-gray-600 text-sm line-clamp-3">
                {page.description}
              </p>
            )}
            {page.tags && page.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {page.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {learnPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No content available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
