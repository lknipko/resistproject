interface FeaturedPage {
  title: string
  description: string
  path: string
  type: 'learn' | 'act' | 'environment'
  tags: string[]
}

interface BroadcastEmailParams {
  introText: string
  featuredPages: FeaturedPage[]
  unsubscribeUrl: string
  theme?: 'main' | 'ourhome'
}

// Convert **bold** markdown to <strong> tags (after HTML escaping)
function formatIntroText(text: string): string {
  let html = escapeHtml(text)
  // Replace **bold** with <strong>
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Line breaks
  html = html.replace(/\n/g, '<br/>')
  return html
}

// Logo hosted on production - must be a remote URL for email clients
const LOGO_URL = 'https://resistproject.com/logo-icon-white.svg'

export function renderBroadcastEmail({
  introText,
  featuredPages,
  unsubscribeUrl,
  theme = 'main',
}: BroadcastEmailParams): string {
  const BASE_URL = process.env.NEXTAUTH_URL || 'https://resistproject.com'
  const isOurHome = theme === 'ourhome'

  const pageCards = featuredPages
    .map((page) => {
      const isAct = page.type === 'act'
      const isEnv = page.type === 'environment'
      let accentColor: string, badgeColor: string, badgeTextColor: string, typeLabel: string
      if (isEnv) {
        accentColor = '#15803d'   // forest-700
        badgeColor  = '#f0fdf4'   // forest-50
        badgeTextColor = '#166534' // forest-800
        typeLabel = 'Read & Act'
      } else if (isAct) {
        accentColor = '#ea580c'
        badgeColor  = '#fff7ed'
        badgeTextColor = '#c2410c'
        typeLabel = 'Take Action'
      } else {
        accentColor = '#0d9488'
        badgeColor  = '#f0fdfa'
        badgeTextColor = '#0f766e'
        typeLabel = 'Learn More'
      }
      const isUrgent = page.tags.includes('Urgent')
      const url = `${BASE_URL}${page.path}`

      return `
        <tr>
          <td style="padding: 0 0 16px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e5e7eb; border-left: 4px solid ${accentColor}; border-radius: 8px; overflow: hidden;">
              <tr>
                <td style="padding: 16px 20px;">
                  <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td>
                        ${isUrgent ? `<span style="display: inline-block; padding: 2px 8px; font-size: 11px; font-weight: 700; color: #dc2626; background: #fef2f2; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Urgent</span><br/>` : ''}
                        <a href="${url}" style="color: ${accentColor}; font-size: 18px; font-weight: 600; text-decoration: none; line-height: 1.4;">${escapeHtml(page.title)}</a>
                      </td>
                    </tr>
                    ${page.description ? `<tr><td style="padding-top: 8px; color: #4b5563; font-size: 14px; line-height: 1.5;">${escapeHtml(page.description)}</td></tr>` : ''}
                    <tr>
                      <td style="padding-top: 12px;">
                        <a href="${url}" style="display: inline-block; padding: 6px 16px; font-size: 13px; font-weight: 600; color: ${badgeTextColor}; background: ${badgeColor}; border-radius: 6px; text-decoration: none;">${typeLabel} &rarr;</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>`
    })
    .join('')

  // Theme-specific values
  const headerBg = isOurHome
    ? 'linear-gradient(135deg, #14532d 0%, #166534 100%)'   // forest-900 → forest-800
    : 'linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%)'
  const ctaBg    = isOurHome ? '#166534' : '#1e3a5f'
  const ctaLabel = isOurHome ? 'Visit Our Home' : 'Visit Resist Project'
  const ctaUrl   = isOurHome ? `${BASE_URL}/ourhome` : BASE_URL
  const subtitleColor = isOurHome ? '#86efac' : '#93c5fd'  // forest-300 vs blue-300

  const headerContent = isOurHome ? `
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <!-- Logo dimmed, like the Our Home site header -->
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${LOGO_URL}" alt="Resist Project" width="26" height="28" style="display: block; opacity: 0.45;" />
                  </td>
                  <!-- Stacked: RESIST PROJECT above Our Home -->
                  <td style="vertical-align: middle; text-align: left;">
                    <div style="font-size: 13px; font-weight: 700; color: rgba(255,255,255,0.4); letter-spacing: 0.12em; text-transform: uppercase; line-height: 1;">RESIST PROJECT</div>
                    <div style="font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.02em; line-height: 1.15; margin-top: 3px;">Our Home</div>
                  </td>
                </tr>
              </table>
              <p style="margin: 10px 0 0; font-size: 13px; color: ${subtitleColor};">Environmental Action Update</p>` : `
              <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">
                    <img src="${LOGO_URL}" alt="Resist Project" width="36" height="38" style="display: block;" />
                  </td>
                  <td style="vertical-align: middle; text-align: left;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">Resist Project</h1>
                  </td>
                </tr>
              </table>
              <p style="margin: 8px 0 0; font-size: 14px; color: ${subtitleColor};">Civic Action Alert</p>`

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${isOurHome ? 'Our Home — Resist Project' : 'Resist Project Update'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: ${headerBg}; text-align: center;">
              ${headerContent}
            </td>
          </tr>

          <!-- Intro -->
          <tr>
            <td style="padding: 28px 32px 20px;">
              <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #374151;">${formatIntroText(introText)}</p>
            </td>
          </tr>

          <!-- Featured Pages -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                ${pageCards}
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding: 0 32px 32px; text-align: center;">
              <a href="${ctaUrl}" style="display: inline-block; padding: 12px 32px; font-size: 15px; font-weight: 600; color: #ffffff; background-color: ${ctaBg}; border-radius: 8px; text-decoration: none;">${ctaLabel}</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                You're receiving this because you signed up at resistproject.com and have email notifications enabled.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af; line-height: 1.5;">
                <a href="${unsubscribeUrl}" style="color: #6b7280; text-decoration: underline;">Unsubscribe</a> from these emails, or manage your preferences in your <a href="${BASE_URL}/profile/settings" style="color: #6b7280; text-decoration: underline;">account settings</a>.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}
