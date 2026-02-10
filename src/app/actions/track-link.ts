'use server'

import { prisma } from '@/lib/db'

/**
 * Track an external link click
 *
 * PRIVACY: This function collects ZERO personal information.
 * - No user IDs
 * - No IP addresses
 * - No session tracking
 * - No cookies
 *
 * Only aggregate data: "How many times was this link clicked?"
 */
export async function trackExternalLink(data: {
  url: string
  category: string
  label?: string
  sourcePage: string
  sourceSection: 'learn' | 'act'
}) {
  try {
    await prisma.externalLinkClick.create({
      data: {
        url: data.url,
        category: data.category,
        label: data.label,
        sourcePage: data.sourcePage,
        sourceSection: data.sourceSection,
      },
    })

    return { success: true }
  } catch (error) {
    // Silently fail - don't block user action if tracking fails
    console.error('Failed to track link click:', error)
    return { success: false }
  }
}
