'use client'

import { trackExternalLink } from '@/app/actions/track-link'
import { usePathname } from 'next/navigation'

/**
 * TrackableLink - Wrapper for external links that tracks clicks
 *
 * PRIVACY GUARANTEE:
 * - Tracks ONLY that a link was clicked (aggregate count)
 * - NO personal data, NO user IDs, NO IP addresses
 * - Works without cookies
 *
 * Usage:
 * <TrackableLink
 *   href="https://house.gov/find-representative"
 *   category="contact-congress"
 * >
 *   Find Your Representative
 * </TrackableLink>
 */

interface TrackableLinkProps {
  href: string
  category: string
  label?: string
  children: React.ReactNode
  className?: string
  target?: string
  rel?: string
}

// Auto-detect category from URL if not provided
function detectCategory(url: string): string {
  const urlLower = url.toLowerCase()

  // Government sites
  if (urlLower.includes('house.gov') || urlLower.includes('senate.gov') || urlLower.includes('congress.gov')) {
    return 'contact-congress'
  }
  if (urlLower.includes('regulations.gov')) {
    return 'public-comment'
  }

  // Advocacy organizations
  if (urlLower.includes('aclu.org')) return 'advocacy-aclu'
  if (urlLower.includes('plannedparenthood') || urlLower.includes('ppaction')) return 'advocacy-planned-parenthood'
  if (urlLower.includes('reproductiverights.org')) return 'advocacy-crr'
  if (urlLower.includes('reproductivefreedom')) return 'advocacy-reproductive-freedom'

  // Abortion funds
  if (urlLower.includes('abortionfunds.org')) return 'abortion-fund-national'
  if (urlLower.includes('prochoice.org')) return 'abortion-fund-naf'
  if (urlLower.includes('wrrap.org')) return 'abortion-fund-wrrap'
  if (urlLower.includes('abortion') && urlLower.includes('fund')) return 'abortion-fund-regional'

  // Donations
  if (urlLower.includes('/donate')) return 'donate'

  // Petitions
  if (urlLower.includes('petition') || urlLower.includes('sign')) return 'petition'

  // Default
  return 'external-resource'
}

export default function TrackableLink({
  href,
  category,
  label,
  children,
  className = '',
  target = '_blank',
  rel = 'noopener noreferrer',
}: TrackableLinkProps) {
  const pathname = usePathname()

  const handleClick = async () => {
    // Determine source section
    const sourceSection = pathname?.startsWith('/act') ? 'act' : 'learn'

    // Auto-detect category if not provided
    const finalCategory = category || detectCategory(href)

    // Track the click (fire-and-forget, don't wait)
    trackExternalLink({
      url: href,
      category: finalCategory,
      label: label || (typeof children === 'string' ? children : undefined),
      sourcePage: pathname || 'unknown',
      sourceSection,
    }).catch(() => {
      // Silently fail - never block user navigation
    })
  }

  return (
    <a
      href={href}
      target={target}
      rel={rel}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}
