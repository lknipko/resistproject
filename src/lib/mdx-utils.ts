/**
 * MDX Utilities
 *
 * Helper functions for loading and processing MDX content files.
 */

import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface PageData {
  slug: string
  content: string
  frontmatter?: Record<string, any>
}

/**
 * Get a page by section and slug from the file system.
 */
export function getPageBySlug(
  section: 'learn' | 'act',
  slug: string
): PageData | null {
  try {
    const contentDirectory = path.join(process.cwd(), 'content')
    const filePath = path.join(contentDirectory, section, `${slug}.mdx`)

    if (!fs.existsSync(filePath)) {
      return null
    }

    const fileContents = fs.readFileSync(filePath, 'utf8')
    const { content, data } = matter(fileContents)

    return {
      slug,
      content,
      frontmatter: data
    }
  } catch (error) {
    console.error(`Error loading page ${section}/${slug}:`, error)
    return null
  }
}

/**
 * Get all pages in a section.
 */
export function getAllPagesInSection(section: 'learn' | 'act'): PageData[] {
  try {
    const contentDirectory = path.join(process.cwd(), 'content')
    const sectionPath = path.join(contentDirectory, section)

    if (!fs.existsSync(sectionPath)) {
      return []
    }

    const files = fs.readdirSync(sectionPath)
      .filter(file => file.endsWith('.mdx'))

    return files.map(filename => {
      const slug = filename.replace(/\.mdx$/, '')
      return getPageBySlug(section, slug)
    }).filter((page): page is PageData => page !== null)
  } catch (error) {
    console.error(`Error loading pages from ${section}:`, error)
    return []
  }
}
