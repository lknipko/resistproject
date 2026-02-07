/**
 * Page Registry Utility
 *
 * Provides runtime lazy initialization of PageMetadata records for MDX files.
 * Acts as a fallback if seed script hasn't been run or new pages are added.
 */

import { prisma } from './db'
import { PageMetadata } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

interface PageFrontmatter {
  title: string
  subtitle?: string
  type: string
  tags?: string[]
  lastUpdated?: string
  description?: string
}

/**
 * Ensure a PageMetadata record exists for a given page path.
 * If it doesn't exist, create it on-demand.
 *
 * @param section - 'learn' or 'act'
 * @param slug - Page slug (e.g., 'digital-rights')
 * @returns PageMetadata record
 */
export async function ensurePageMetadata(
  section: 'learn' | 'act',
  slug: string
): Promise<PageMetadata> {
  const pagePath = `/${section}/${slug}`

  // Check if PageMetadata already exists
  let metadata = await prisma.pageMetadata.findFirst({
    where: { pagePath }
  })

  if (metadata) {
    return metadata
  }

  // PageMetadata doesn't exist - create it
  console.log(`📝 Creating PageMetadata for ${pagePath} (lazy init)`)

  // Get the next available pageId
  const maxPage = await prisma.pageMetadata.findFirst({
    orderBy: { pageId: 'desc' },
    select: { pageId: true }
  })
  const nextPageId = (maxPage?.pageId || 0) + 1

  // Try to read frontmatter from file
  let frontmatter: PageFrontmatter | null = null
  try {
    const contentDirectory = path.join(process.cwd(), 'content')
    const filePath = path.join(contentDirectory, section, `${slug}.mdx`)

    if (fs.existsSync(filePath)) {
      const fileContents = fs.readFileSync(filePath, 'utf8')
      const { data } = matter(fileContents)
      frontmatter = data as PageFrontmatter
    }
  } catch (error) {
    console.warn(`⚠️  Could not read frontmatter for ${pagePath}:`, error)
  }

  // Create PageMetadata record
  metadata = await prisma.pageMetadata.create({
    data: {
      pageId: nextPageId,
      pagePath,
      contentType: frontmatter?.type || section,
      issueTags: (frontmatter?.tags || []) as any[],
      tier: 3, // Default tier
      status: 'active',
      baseScore: 100,
      currentScore: 100,
      urgencyFactor: 1.0,
      freshnessFactor: 1.0
    }
  })

  return metadata
}

/**
 * Get PageMetadata by page path.
 * Returns null if not found (does NOT create).
 *
 * @param section - 'learn' or 'act'
 * @param slug - Page slug
 * @returns PageMetadata record or null
 */
export async function getPageMetadata(
  section: 'learn' | 'act',
  slug: string
): Promise<PageMetadata | null> {
  const pagePath = `/${section}/${slug}`

  return await prisma.pageMetadata.findFirst({
    where: { pagePath }
  })
}

/**
 * Get all PageMetadata records for a section.
 *
 * @param section - 'learn' or 'act'
 * @returns Array of PageMetadata records
 */
export async function getAllPageMetadata(
  section: 'learn' | 'act'
): Promise<PageMetadata[]> {
  return await prisma.pageMetadata.findMany({
    where: {
      pagePath: {
        startsWith: `/${section}/`
      }
    },
    orderBy: { pageId: 'asc' }
  })
}
