import { NextResponse } from 'next/server'
import { getAllPages } from '@/lib/content'
import { getPageBySlug } from '@/lib/content'

/**
 * Strip MDX/markdown syntax to produce plain text suitable for full-content search indexing.
 */
function extractExcerpt(raw: string): string {
  return raw
    // Remove frontmatter block
    .replace(/^---[\s\S]*?---\n/, '')
    // Strip JSX/HTML tags but KEEP the text content inside them
    .replace(/<[^>]+\/>/g, '')   // self-closing tags
    .replace(/<[^>]+>/g, ' ')    // opening/closing tags → space so words don't run together
    // Remove markdown headings markers (keep the heading text)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove markdown bold/italic markers (keep the text)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/__([^_]+)__/g, '$1')
    .replace(/_([^_]+)_/g, '$1')
    // Remove markdown links (keep label text)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove backtick inline code markers (keep the code text)
    .replace(/`([^`]+)`/g, '$1')
    // Remove table row separators
    .replace(/^\|[-:\s|]+\|$/gm, '')
    .replace(/\|/g, ' ')
    // Remove blockquote markers
    .replace(/^>\s*/gm, '')
    // Collapse whitespace
    .replace(/\s+/g, ' ')
    .trim()
}

export interface SearchIndexEntry {
  slug: string
  section: 'learn' | 'act'
  title: string
  description: string
  tags: string[]
  path: string
  excerpt: string
}

export async function GET() {
  const learnPages = getAllPages('learn')
  const actPages = getAllPages('act')

  const index: SearchIndexEntry[] = []

  for (const page of learnPages) {
    const full = getPageBySlug('learn', page.slug)
    index.push({
      slug: page.slug,
      section: 'learn',
      title: page.title,
      description: page.description ?? '',
      tags: page.tags ?? [],
      path: `/learn/${page.slug}`,
      excerpt: full ? extractExcerpt(full.content) : '',
    })
  }

  for (const page of actPages) {
    const full = getPageBySlug('act', page.slug)
    index.push({
      slug: page.slug,
      section: 'act',
      title: page.title,
      description: page.description ?? '',
      tags: page.tags ?? [],
      path: `/act/${page.slug}`,
      excerpt: full ? extractExcerpt(full.content) : '',
    })
  }

  return NextResponse.json(index, {
    headers: {
      // Cache for 5 minutes on CDN edge, revalidate in background
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
    },
  })
}
