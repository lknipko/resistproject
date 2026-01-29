import Link from 'next/link'
import { getAllPages } from '@/lib/content'

export const metadata = {
  title: 'Act',
  description: 'Take meaningful action with concrete, low-barrier opportunities for civic participation',
}

export default function ActPage() {
  const actPages = getAllPages('act')

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Act
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl">
          Take meaningful action with concrete opportunities for civic participation.
          From quick actions (under 5 minutes) to sustained engagement.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {actPages.map((page) => (
          <Link
            key={page.slug}
            href={`/act/${page.slug}`}
            className="block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-orange-500 transition-all"
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
                    className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>

      {actPages.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No actions available yet. Check back soon!
          </p>
        </div>
      )}
    </div>
  )
}
