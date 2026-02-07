/**
 * Content Resolver
 *
 * Applies approved edit proposals to base content files.
 * Returns resolved content with version tracking.
 */

import { prisma } from '@/lib/db'
import { getPageBySlug } from '@/lib/content'
import { cache } from 'react'

interface ResolvedContent {
  content: string
  version: number
  appliedEdits: number[]
  baseContent: string
}

/**
 * Get resolved content for a page by applying all approved edits.
 *
 * @param section - 'learn' or 'act'
 * @param slug - page slug
 * @returns Resolved content with version info
 */
export async function getResolvedContent(
  section: 'learn' | 'act',
  slug: string
): Promise<ResolvedContent> {
  // 1. Load base file content
  const page = getPageBySlug(section, slug)
  if (!page) {
    throw new Error(`Page not found: /${section}/${slug}`)
  }

  const baseContent = page.content
  const pagePath = page.metadata.path

  // 2. Get PageMetadata
  const pageMetadata = await prisma.pageMetadata.findFirst({
    where: { pagePath }
  })

  if (!pageMetadata) {
    // No metadata = no edits yet, return base content
    return {
      content: baseContent,
      version: 0,
      appliedEdits: [],
      baseContent
    }
  }

  // 3. Fetch all approved edits in chronological order
  const approvedEdits = await prisma.editProposal.findMany({
    where: {
      pageId: pageMetadata.pageId,
      status: 'approved',
    },
    orderBy: {
      resolvedAt: 'asc', // Apply in order they were approved
    },
    select: {
      id: true,
      proposedContent: true,
      resolvedAt: true,
    }
  })

  if (approvedEdits.length === 0) {
    // No approved edits, return base content
    return {
      content: baseContent,
      version: 0,
      appliedEdits: [],
      baseContent
    }
  }

  // 4. Apply edits sequentially
  // For now, we use a simple replacement strategy:
  // The most recent approved edit's proposedContent becomes the current content
  // TODO: In future, implement smart merging for overlapping edits

  const latestEdit = approvedEdits[approvedEdits.length - 1]
  const resolvedContent = latestEdit.proposedContent

  return {
    content: resolvedContent,
    version: approvedEdits.length,
    appliedEdits: approvedEdits.map(e => e.id),
    baseContent
  }
}

/**
 * Cached version of getResolvedContent for performance.
 * React will cache this per-request.
 */
export const getCachedResolvedContent = cache(getResolvedContent)

/**
 * Check if a page has any approved edits.
 */
export async function hasApprovedEdits(
  section: 'learn' | 'act',
  slug: string
): Promise<boolean> {
  const pagePath = `/${section}/${slug}`

  const pageMetadata = await prisma.pageMetadata.findFirst({
    where: { pagePath }
  })

  if (!pageMetadata) {
    return false
  }

  const count = await prisma.editProposal.count({
    where: {
      pageId: pageMetadata.pageId,
      status: 'approved',
    }
  })

  return count > 0
}

/**
 * Get edit history for a page.
 */
export async function getPageEditHistory(
  section: 'learn' | 'act',
  slug: string
) {
  const pagePath = `/${section}/${slug}`

  const pageMetadata = await prisma.pageMetadata.findFirst({
    where: { pagePath }
  })

  if (!pageMetadata) {
    return []
  }

  const edits = await prisma.editProposal.findMany({
    where: {
      pageId: pageMetadata.pageId,
      status: 'approved',
    },
    include: {
      proposer: {
        select: {
          id: true,
          name: true,
          image: true,
        }
      }
    },
    orderBy: {
      resolvedAt: 'desc',
    }
  })

  return edits
}
