import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { ENVIRONMENT_TOPIC_TAGS, ENVIRONMENT_STATUS_TAGS } from '@/lib/environment-tags'
import HeroSlideshow from '@/components/environment/HeroSlideshow'

export const revalidate = 300

export const metadata = {
  title: 'Our Home | Resist Project',
  description: 'Track threats to the natural world — and how to fight back. Climate, land, water, wildlife, and more.',
}

// --- Theme definitions ---

const THEMES = [
  {
    tag: 'Climate & Atmosphere',
    label: 'Climate & Atmosphere',
    description: 'Rising temperatures, extreme weather, air quality, and the science behind it all.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Sun */}
        <circle cx="12" cy="10" r="3" />
        <path d="M12 2v2M12 16v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 10h2M20 10h2M4.22 15.78l1.42-1.42M18.36 1.64l1.42 1.42" />
        {/* Cloud base */}
        <path d="M7 20a3 3 0 0 1-.17-6A5 5 0 0 1 17 16.9 3 3 0 0 1 17 23H7z" />
      </svg>
    ),
  },
  {
    tag: 'Land & Wilderness',
    label: 'Land & Wilderness',
    description: 'Public lands, forests, wildlife, endangered species, and the fight to protect them.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Mountain range */}
        <path d="M3 20 L8 9 L12 15 L16 7 L21 20 Z" />
        {/* Snow cap */}
        <path d="M14 10.5 L16 7 L18 10.5" />
      </svg>
    ),
  },
  {
    tag: 'Water & Oceans',
    label: 'Water & Oceans',
    description: 'Clean water access, rivers and lakes, ocean health, and plastic pollution.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Water drop */}
        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
      </svg>
    ),
  },
  {
    tag: 'Energy & Extraction',
    label: 'Energy & Extraction',
    description: 'Fossil fuels, renewables, fracking, drilling, and the transition away from carbon.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Lightning bolt */}
        <path d="M13 2 L4.5 13.5 H11 L10 22 L19.5 10.5 H13 L13 2 Z" />
      </svg>
    ),
  },
  {
    tag: 'Toxics & Health',
    label: 'Toxics & Health',
    description: 'PFAS, pesticides, carcinogens, pollution, and the health toll on communities.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Beaker/flask */}
        <path d="M9 3h6" />
        <path d="M10 3v5.5L6 15a3 3 0 0 0 2.7 4.3h6.6A3 3 0 0 0 18 15l-4-6.5V3" />
        <path d="M7.5 14.5h9" />
      </svg>
    ),
  },
  {
    tag: 'People & Justice',
    label: 'People & Justice',
    description: 'Environmental racism, indigenous rights, corporate accountability, and frontline communities.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Two people */}
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.85" />
      </svg>
    ),
  },
  {
    tag: 'Utah & Local',
    label: 'Utah & Local',
    description: 'Great Salt Lake, Bears Ears, air quality, water rights, and development pressure.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {/* Map pin */}
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
]

// --- Status badge helper ---

function StatusBadge({ tags }: { tags: string[] }) {
  if (tags.includes('Urgent')) {
    return (
      <span className="shrink-0 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-700 rounded uppercase tracking-wide">
        Urgent
      </span>
    )
  }
  if (tags.includes('Comment Period Open')) {
    return (
      <span className="shrink-0 px-2 py-0.5 text-xs font-semibold bg-forest-100 text-forest-700 rounded uppercase tracking-wide">
        Comment Open
      </span>
    )
  }
  if (tags.includes('Under Litigation')) {
    return (
      <span className="shrink-0 px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700 rounded uppercase tracking-wide">
        In Court
      </span>
    )
  }
  return null
}

// --- Page ---

export default async function EnvironmentPage() {
  const allPages = getAllPages('environment')

  // Active issues: Urgent or Comment Period Open, max 4.
  // Rank Urgent above Comment-Period-Open, then surface the most recently
  // updated first so the freshest stories win the limited slots and stale
  // pages fall off automatically (lastUpdated is a "YYYY-MM-DD" string).
  const statusRank = (p: (typeof allPages)[number]) =>
    p.tags?.includes('Urgent') ? 2 : 1
  const activePages = allPages
    .filter((p) =>
      p.tags?.includes('Urgent') || p.tags?.includes('Comment Period Open')
    )
    .sort((a, b) => {
      const diff = statusRank(b) - statusRank(a)
      if (diff !== 0) return diff
      return (b.lastUpdated ?? '').localeCompare(a.lastUpdated ?? '')
    })
    .slice(0, 4)

  // Page counts per theme tag
  const tagCounts: Record<string, number> = {}
  for (const tag of ENVIRONMENT_TOPIC_TAGS) {
    tagCounts[tag] = allPages.filter((p) => p.tags?.includes(tag)).length
  }

  return (
    <div>
      {/* Hero */}
      <HeroSlideshow hasActiveIssues={activePages.length > 0} />

      <div className="max-w-7xl mx-auto px-4">
        {/* Active Issues */}
        {activePages.length > 0 && (
          <section id="active" className="py-12 border-b border-gray-200">
            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-5">
              Active Issues
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {activePages.map((page) => {
                const statusTags = (page.tags ?? []).filter((t) =>
                  ENVIRONMENT_STATUS_TAGS.includes(t)
                )
                const topicTags = (page.tags ?? []).filter((t) =>
                  ENVIRONMENT_TOPIC_TAGS.includes(t)
                )
                return (
                  <Link
                    key={page.slug}
                    href={`/ourhome/${page.slug}`}
                    className="block p-5 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-forest-400 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-gray-900 leading-snug">
                        {page.title}
                      </h3>
                      <StatusBadge tags={statusTags} />
                    </div>
                    {page.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{page.description}</p>
                    )}
                    {topicTags[0] && (
                      <div className="mt-3">
                        <span className="px-2 py-0.5 text-xs font-medium bg-forest-50 text-forest-700 border border-forest-200 rounded-full">
                          {topicTags[0]}
                        </span>
                      </div>
                    )}
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Browse by Theme */}
        <section className="py-12">
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-5">
            Browse by Theme
          </h2>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {THEMES.map((theme) => (
              <Link
                key={theme.tag}
                href={`/ourhome/topics?tag=${encodeURIComponent(theme.tag)}`}
                className="group flex flex-col gap-3 p-5 bg-white border border-gray-200 rounded-lg hover:border-forest-400 hover:shadow-md transition-all"
              >
                <div className="w-9 h-9 text-forest-600 group-hover:text-forest-700 transition-colors">
                  {theme.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm mb-1 group-hover:text-forest-800 transition-colors">
                    {theme.label}
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {theme.description}
                  </p>
                </div>
                <div className="mt-auto pt-1 text-xs text-forest-600 font-medium">
                  {tagCounts[theme.tag] ?? 0} topics
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Footer nudge */}
        <div className="pb-12 text-center">
          <p className="text-sm text-gray-500">
            {allPages.length} topics total &mdash;{' '}
            <Link href="/ourhome/topics" className="text-forest-600 hover:underline font-medium">
              browse all
            </Link>
            {' '}or{' '}
            <Link href="/ourhome/topics#propose" className="text-forest-600 hover:underline font-medium">
              propose a new topic
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
