interface FeaturedPage {
  title: string
  description: string
  path: string
  type: 'learn' | 'act'
  tags: string[]
}

interface BroadcastEmailParams {
  introText: string
  featuredPages: FeaturedPage[]
  unsubscribeUrl: string
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
}: BroadcastEmailParams): string {
  const BASE_URL = process.env.NEXTAUTH_URL || 'https://resistproject.com'

  const pageCards = featuredPages
    .map((page) => {
      const isAct = page.type === 'act'
      const accentColor = isAct ? '#ea580c' : '#0d9488'
      const badgeColor = isAct ? '#fff7ed' : '#f0fdfa'
      const badgeTextColor = isAct ? '#c2410c' : '#0f766e'
      const typeLabel = isAct ? 'Take Action' : 'Learn More'
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Resist Project Update</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; background: linear-gradient(135deg, #1e3a5f 0%, #2d5a87 100%); text-align: center;">
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
              <p style="margin: 8px 0 0; font-size: 14px; color: #93c5fd;">Civic Action Alert</p>
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
              <a href="${BASE_URL}" style="display: inline-block; padding: 12px 32px; font-size: 15px; font-weight: 600; color: #ffffff; background-color: #1e3a5f; border-radius: 8px; text-decoration: none;">Visit Resist Project</a>
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
