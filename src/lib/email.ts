import { Resend } from 'resend'
import crypto from 'crypto'

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined
}

export function getResend(): Resend {
  if (!globalForResend.resend) {
    globalForResend.resend = new Resend(process.env.RESEND_API_KEY)
  }
  return globalForResend.resend
}

const FROM = process.env.EMAIL_FROM || 'noreply@resistproject.com'
const BASE_URL = process.env.NEXTAUTH_URL || 'https://resistproject.com'

export function generateUnsubscribeToken(email: string): string {
  const secret = process.env.AUTH_SECRET!
  return crypto.createHmac('sha256', secret).update(email).digest('hex')
}

export function generateUnsubscribeUrl(email: string): string {
  const token = generateUnsubscribeToken(email)
  return `${BASE_URL}/api/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`
}

export function verifyUnsubscribeToken(email: string, token: string): boolean {
  const expected = generateUnsubscribeToken(email)
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

interface BatchRecipient {
  email: string
  htmlBody: string
}

export async function sendBatchEmails(
  subject: string,
  recipients: BatchRecipient[]
): Promise<{ successCount: number; failureCount: number }> {
  const BATCH_SIZE = 100
  let successCount = 0
  let failureCount = 0

  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const chunk = recipients.slice(i, i + BATCH_SIZE)
    try {
      await getResend().batch.send(
        chunk.map((r) => ({
          from: FROM,
          to: r.email,
          subject,
          html: r.htmlBody,
          headers: {
            'List-Unsubscribe': `<${generateUnsubscribeUrl(r.email)}>`,
          },
        }))
      )
      successCount += chunk.length
    } catch (error) {
      failureCount += chunk.length
      console.error(`Batch send failed for chunk starting at index ${i}:`, error)
    }

    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return { successCount, failureCount }
}

export async function notifyAdminOfNewProposal(proposal: {
  pagePath: string
  editSummary: string
  proposerEmail: string | null
  proposerTier: number
  status: string
}): Promise<void> {
  try {
    await getResend().emails.send({
      from: FROM,
      to: 'lknipko@gmail.com',
      subject: `New edit proposal: ${proposal.pagePath}`,
      html: `
        <h2>New Edit Proposal Submitted</h2>
        <p><strong>Page:</strong> ${proposal.pagePath}</p>
        <p><strong>Summary:</strong> ${proposal.editSummary}</p>
        <p><strong>Proposer:</strong> ${proposal.proposerEmail || 'Unknown'} (Tier ${proposal.proposerTier})</p>
        <p><strong>Status:</strong> ${proposal.status}</p>
        <p><a href="${BASE_URL}/review">Review in the queue</a></p>
      `
    })
  } catch (error) {
    console.error('Failed to send edit notification email:', error)
  }
}
