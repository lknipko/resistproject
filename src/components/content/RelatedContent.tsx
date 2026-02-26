import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { TOPIC_TAGS } from '@/lib/tags'
import type { PageMetadata } from '@/types/content'

interface RelatedContentProps {
  currentSlug: string
  currentSection: 'learn' | 'act'
  currentTags: string[]
}

interface Candidate {
  page: PageMetadata
  section: 'learn' | 'act'
  score: number
}

export function RelatedContent({ currentSlug, currentSection, currentTags }: RelatedContentProps) {
  const topicTags = currentTags.filter((t) => TOPIC_TAGS.includes(t))
  if (topicTags.length === 0) return null

  const otherSection: 'learn' | 'act' = currentSection === 'learn' ? 'act' : 'learn'

  const candidates: Candidate[] = []

  // Score pages from the other section (cross-section preferred)
  for (const page of getAllPages(otherSection)) {
    const sharedTags = (page.tags ?? []).filter(
      (t) => TOPIC_TAGS.includes(t) && topicTags.includes(t)
    ).length
    if (sharedTags === 0) continue

    // Large bonus if the slug matches (the "corresponding" page for this topic)
    const correspondingBonus = page.slug === currentSlug ? 100 : 0

    candidates.push({ page, section: otherSection, score: sharedTags + correspondingBonus })
  }

  // Fill remaining slots from same section (exclude current page)
  for (const page of getAllPages(currentSection)) {
    if (page.slug === currentSlug) continue
    const sharedTags = (page.tags ?? []).filter(
      (t) => TOPIC_TAGS.includes(t) && topicTags.includes(t)
    ).length
    if (sharedTags === 0) continue

    candidates.push({ page, section: currentSection, score: sharedTags })
  }

  // Sort by score desc, take top 3
  const related = candidates
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  if (related.length === 0) return null

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 mt-4 pb-12">
      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Related Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map(({ page, section }) => {
            const isLearn = section === 'learn'
            return (
              <Link
                key={`${section}/${page.slug}`}
                href={`/${section}/${page.slug}`}
                className={[
                  'block p-4 rounded-lg border transition-all hover:shadow-sm',
                  isLearn
                    ? 'border-teal-100 bg-teal-50/40 hover:border-teal-300'
                    : 'border-orange-100 bg-orange-50/40 hover:border-orange-300',
                ].join(' ')}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={[
                      'px-1.5 py-0.5 text-xs font-bold rounded uppercase tracking-wide',
                      isLearn ? 'bg-teal-100 text-teal-800' : 'bg-orange-100 text-orange-800',
                    ].join(' ')}
                  >
                    {section}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">{page.title}</p>
                {page.description && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{page.description}</p>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
