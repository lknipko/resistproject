import { verifyUnsubscribeToken } from '@/lib/email'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get('email')
  const token = searchParams.get('token')

  if (!email || !token) {
    return new Response('Invalid unsubscribe link.', { status: 400 })
  }

  if (!verifyUnsubscribeToken(email, token)) {
    return new Response('Invalid or expired unsubscribe link.', { status: 403 })
  }

  await prisma.userExtended.updateMany({
    where: { email },
    data: { emailNotifications: false },
  })

  const settingsUrl =
    (process.env.NEXTAUTH_URL || 'https://resistproject.com') + '/profile/settings'

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Unsubscribed</title></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 500px; margin: 60px auto; padding: 0 20px; text-align: center; color: #374151;">
  <h2 style="color: #1e3a5f; margin-bottom: 16px;">Unsubscribed</h2>
  <p>You've been unsubscribed from Resist Project email notifications.</p>
  <p style="margin-top: 24px; font-size: 14px; color: #6b7280;">
    You can re-enable notifications anytime in your
    <a href="${settingsUrl}" style="color: #2d5a87;">account settings</a>.
  </p>
</body>
</html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
