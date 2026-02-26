import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, generateStaticParams as getStaticParams } from '@/lib/content'
import { compilePage } from '@/lib/mdx'
import { EditPageButton } from '@/components/content/EditPageButton'
import { getCachedResolvedContent } from '@/lib/content-resolver'
import { RelatedContent } from '@/components/content/RelatedContent'

export async function generateStaticParams() {
  return getStaticParams('act')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const page = getPageBySlug('act', slug)

  if (!page) {
    return {
      title: 'Page Not Found',
    }
  }

  return {
    title: page.metadata.title,
    description: page.metadata.description || page.metadata.subtitle,
    openGraph: {
      title: page.metadata.title,
      description: page.metadata.description || page.metadata.subtitle,
      type: 'article',
      tags: page.metadata.tags,
    },
  }
}

export default async function ActPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const page = getPageBySlug('act', slug)

  if (!page) {
    notFound()
  }

  // Get resolved content with approved edits applied
  const resolvedData = await getCachedResolvedContent('act', slug)
  const { content } = await compilePage(resolvedData.content)

  return (
    <article>
      {content}
      {resolvedData.version > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          <p className="font-semibold">
            📝 This page includes {resolvedData.version} community edit{resolvedData.version > 1 ? 's' : ''}
          </p>
          <p className="text-xs mt-1">
            Community members have improved this content through collaborative editing.
          </p>
        </div>
      )}
      <RelatedContent
        currentSlug={slug}
        currentSection="act"
        currentTags={page.metadata.tags ?? []}
      />
      <EditPageButton
        section="act"
        slug={slug}
        currentContent={resolvedData.content}
      />
    </article>
  )
}
