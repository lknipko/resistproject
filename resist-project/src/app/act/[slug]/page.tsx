import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getPageBySlug, generateStaticParams as getStaticParams } from '@/lib/content'
import { compilePage } from '@/lib/mdx'

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

  const { content } = await compilePage(page.content)

  return (
    <article className="max-w-[1200px] mx-auto px-8 py-12">
      {content}
    </article>
  )
}
