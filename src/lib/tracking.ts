/**
 * Privacy-Friendly Civic Action Tracking
 *
 * Tracks aggregate action counts with NO personally identifiable information.
 * Used to measure civic engagement impact: "How many people contacted Congress?"
 *
 * Privacy guarantees:
 * - NO user IDs, emails, or names
 * - NO IP addresses or session tracking
 * - ONLY representative data (who was contacted) and timestamps
 * - Aggregate data only (cannot trace back to individual users)
 */

import { prisma } from '@/lib/db'

/**
 * Track a civic action (email click or call click)
 *
 * @param params - Action details (NO PII)
 * @returns Promise (silent fail - never breaks UX)
 */
export async function trackCivicAction(params: {
  actionType: 'email_clicked' | 'call_clicked'
  repName?: string
  repOffice?: string
  sourcePage: string
}): Promise<void> {
  try {
    await prisma.civicAction.create({
      data: {
        actionType: params.actionType,
        repName: params.repName || null,
        repOffice: params.repOffice || null,
        sourcePage: params.sourcePage,
        actionDate: new Date(),
      },
    })
  } catch (error) {
    // Silent fail - never break user experience for analytics
    console.error('Failed to track civic action:', error)
  }
}

/**
 * Get aggregate civic action stats for a page
 *
 * @param sourcePage - Page path (e.g., "/act/contact-congress")
 * @param days - Number of days to look back (default: 7)
 * @returns Aggregate stats
 */
export async function getCivicActionStats(
  sourcePage: string,
  days: number = 7
): Promise<{
  emailClicks: number
  callClicks: number
  totalActions: number
  byRepOffice: Array<{ office: string; count: number }>
}> {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  try {
    // Get counts by action type
    const [emailClicks, callClicks] = await Promise.all([
      prisma.civicAction.count({
        where: {
          sourcePage,
          actionType: 'email_clicked',
          actionDate: { gte: startDate },
        },
      }),
      prisma.civicAction.count({
        where: {
          sourcePage,
          actionType: 'call_clicked',
          actionDate: { gte: startDate },
        },
      }),
    ])

    // Get counts by representative office
    const byOffice = await prisma.civicAction.groupBy({
      by: ['repOffice'],
      where: {
        sourcePage,
        actionDate: { gte: startDate },
        repOffice: { not: null },
      },
      _count: true,
    })

    const byRepOffice = byOffice.map(item => ({
      office: item.repOffice || 'Unknown',
      count: item._count,
    }))

    return {
      emailClicks,
      callClicks,
      totalActions: emailClicks + callClicks,
      byRepOffice,
    }
  } catch (error) {
    console.error('Failed to get civic action stats:', error)
    return {
      emailClicks: 0,
      callClicks: 0,
      totalActions: 0,
      byRepOffice: [],
    }
  }
}

/**
 * Client-side tracking function (uses sendBeacon for reliability)
 *
 * Call this from components when user clicks "Send Email" or "Call Now"
 */
export function trackCivicActionClient(params: {
  actionType: 'email_clicked' | 'call_clicked'
  repName?: string
  repOffice?: string
}): void {
  try {
    const sourcePage = window.location.pathname

    // Use sendBeacon for reliability (fire-and-forget, works even on page unload)
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const data = JSON.stringify({
        actionType: params.actionType,
        repName: params.repName,
        repOffice: params.repOffice,
        sourcePage,
      })

      navigator.sendBeacon('/api/track/civic-action', data)
    } else {
      // Fallback to fetch (may not work if page unloads)
      fetch('/api/track/civic-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: params.actionType,
          repName: params.repName,
          repOffice: params.repOffice,
          sourcePage,
        }),
        keepalive: true,
      }).catch(() => {
        // Silent fail
      })
    }
  } catch (error) {
    // Silent fail - never break UX for tracking
    console.error('Client tracking failed:', error)
  }
}
