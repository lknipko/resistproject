import Link from 'next/link'
import { getAllPages } from '@/lib/content'
import { TOPIC_TAGS } from '@/lib/tags'
import { ENVIRONMENT_TOPIC_TAGS } from '@/lib/environment-tags'
import type { PageMetadata } from '@/types/content'

interface RelatedContentProps {
  currentSlug: string
  currentSection: 'learn' | 'act' | 'environment'
  currentTags: string[]
}

interface Candidate {
  page: PageMetadata
  section: 'learn' | 'act' | 'environment'
  score: number
}

function getTopicTagsForSection(section: 'learn' | 'act' | 'environment'): string[] {
  return section === 'environment' ? ENVIRONMENT_TOPIC_TAGS : TOPIC_TAGS
}

export function RelatedContent({ currentSlug, currentSection, currentTags }: RelatedContentProps) {
  const sectionTopicTags = getTopicTagsForSection(currentSection)
  const topicTags = currentTags.filter((t) => sectionTopicTags.includes(t))
  if (topicTags.length === 0) return null

  const allSections: Array<'learn' | 'act' | 'environment'> = ['learn', 'act', 'environment']
  const otherSections = allSections.filter((s) => s !== currentSection)

  const candidates: Candidate[] = []

  // Score pages from other sections (cross-section preferred).
  // Environment uses its own tag taxonomy so cross-section matching
  // only applies within learn ↔ act.
  for (const otherSection of otherSections) {
    const otherTopicTags = getTopicTagsForSection(otherSection)
    for (const page of getAllPages(otherSection)) {
      const sharedTags = (page.tags ?? []).filter(
        (t) => otherTopicTags.includes(t) && topicTags.includes(t)
      ).length
      if (sharedTags === 0) continue

      const correspondingBonus = page.slug === currentSlug ? 100 : 0
      candidates.push({ page, section: otherSection, score: sharedTags + correspondingBonus })
    }
  }

  // Fill remaining slots from same section (exclude current page)
  for (const page of getAllPages(currentSection)) {
    if (page.slug === currentSlug) continue
    const sharedTags = (page.tags ?? []).filter(
      (t) => sectionTopicTags.includes(t) && topicTags.includes(t)
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
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 mt-4 pb-12">
      <div className="pt-8 border-t border-gray-200">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Related Pages</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {related.map(({ page, section }) => {
            const cardStyles: Record<string, { card: string; badge: string }> = {
              learn: { card: 'border-teal-100 bg-teal-50/40 hover:border-teal-300', badge: 'bg-teal-100 text-teal-800' },
              act: { card: 'border-orange-100 bg-orange-50/40 hover:border-orange-300', badge: 'bg-orange-100 text-orange-800' },
              environment: { card: 'border-forest-100 bg-forest-50/40 hover:border-forest-300', badge: 'bg-forest-100 text-forest-800' },
            }
            const s = cardStyles[section] ?? cardStyles.learn
            return (
              <Link
                key={`${section}/${page.slug}`}
                href={`/${section}/${page.slug}`}
                className={[
                  'block p-4 rounded-lg border transition-all hover:shadow-sm',
                  s.card,
                ].join(' ')}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span
                    className={[
                      'px-1.5 py-0.5 text-xs font-bold rounded uppercase tracking-wide',
                      s.badge,
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
