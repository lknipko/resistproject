import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import type { PageMetadata, PageContent, PageFrontmatter } from '@/types/content'

const contentDirectory = path.join(process.cwd(), 'content')

/**
 * Get all MDX files from a specific section (learn or act)
 */
export function getContentFiles(section: 'learn' | 'act'): string[] {
  const sectionPath = path.join(contentDirectory, section)

  if (!fs.existsSync(sectionPath)) {
    return []
  }

  return fs.readdirSync(sectionPath).filter((file) => file.endsWith('.mdx'))
}

/**
 * Get metadata for all pages in a section
 */
export function getAllPages(section: 'learn' | 'act'): PageMetadata[] {
  const files = getContentFiles(section)

  return files.map((filename) => {
    const slug = filename.replace(/\.mdx$/, '')
    const filePath = path.join(contentDirectory, section, filename)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data } = matter(fileContents)

    return {
      ...data,
      slug,
      path: `/${section}/${slug}`,
    } as PageMetadata
  })
}

/**
 * Get a single page by slug
 */
export function getPageBySlug(section: 'learn' | 'act', slug: string): PageContent | null {
  try {
    const filePath = path.join(contentDirectory, section, `${slug}.mdx`)
    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { data, content } = matter(fileContents)

    return {
      metadata: {
        ...data,
        slug,
        path: `/${section}/${slug}`,
      } as PageMetadata,
      content,
    }
  } catch (error) {
    return null
  }
}

/**
 * Generate static params for all pages in a section
 */
export function generateStaticParams(section: 'learn' | 'act') {
  const files = getContentFiles(section)
  return files.map((filename) => ({
    slug: filename.replace(/\.mdx$/, ''),
  }))
}
