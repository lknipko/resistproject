'use server'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { canAdminister } from '@/lib/permissions'
import { sendBatchEmails, generateUnsubscribeUrl } from '@/lib/email'
import { renderBroadcastEmail } from '@/lib/email-templates'
import { revalidatePath } from 'next/cache'

interface BroadcastResult {
  success?: boolean
  error?: string
  recipientCount?: number
  successCount?: number
  failureCount?: number
}

export async function getRecipientCount(): Promise<number> {
  return prisma.userExtended.count({
    where: { emailNotifications: true },
  })
}

export async function previewBroadcast(data: {
  introText: string
  selectedPages: Array<{
    title: string
    description: string
    path: string
    type: 'learn' | 'act'
    tags: string[]
  }>
}): Promise<{ html: string } | { error: string }> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
  })
  if (!userExtended) return { error: 'User profile not found' }

  const permission = await canAdminister({ userId: session.user.id, userExtended })
  if (!permission.allowed) return { error: permission.reason || 'Not authorized' }

  const html = renderBroadcastEmail({
    introText: data.introText,
    featuredPages: data.selectedPages,
    unsubscribeUrl: '#preview-unsubscribe',
  })

  return { html }
}

export async function sendBroadcast(data: {
  subject: string
  introText: string
  selectedPages: Array<{
    title: string
    description: string
    path: string
    type: 'learn' | 'act'
    tags: string[]
  }>
}): Promise<BroadcastResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
  })
  if (!userExtended) return { error: 'User profile not found' }

  const permission = await canAdminister({ userId: session.user.id, userExtended })
  if (!permission.allowed) return { error: permission.reason || 'Not authorized' }

  if (!data.subject.trim()) return { error: 'Subject is required' }
  if (!data.introText.trim()) return { error: 'Intro text is required' }
  if (data.selectedPages.length === 0) return { error: 'Select at least one page' }

  // Create broadcast record
  const broadcast = await prisma.emailBroadcast.create({
    data: {
      subject: data.subject,
      introText: data.introText,
      featuredPages: data.selectedPages,
      sentById: session.user.id,
      status: 'sending',
    },
  })

  try {
    // Get all opted-in recipients
    const recipients = await prisma.userExtended.findMany({
      where: { emailNotifications: true },
      select: { email: true },
    })

    if (recipients.length === 0) {
      await prisma.emailBroadcast.update({
        where: { id: broadcast.id },
        data: { status: 'sent', recipientCount: 0, successCount: 0, failureCount: 0, sentAt: new Date() },
      })
      return { success: true, recipientCount: 0, successCount: 0, failureCount: 0 }
    }

    // Generate personalized emails
    const emailRecipients = recipients.map((r) => ({
      email: r.email,
      htmlBody: renderBroadcastEmail({
        introText: data.introText,
        featuredPages: data.selectedPages,
        unsubscribeUrl: generateUnsubscribeUrl(r.email),
      }),
    }))

    const result = await sendBatchEmails(data.subject, emailRecipients)

    // Update broadcast record
    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: {
        status: 'sent',
        recipientCount: recipients.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        sentAt: new Date(),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        actionType: 'broadcast_sent',
        actionCategory: 'email',
        actorId: session.user.id,
        targetType: 'email_broadcast',
        targetId: broadcast.id,
        description: `Sent broadcast "${data.subject}" to ${recipients.length} recipients (${result.successCount} succeeded, ${result.failureCount} failed)`,
        metadata: {
          broadcastId: broadcast.id,
          subject: data.subject,
          pageCount: data.selectedPages.length,
          recipientCount: recipients.length,
          ...result,
        },
      },
    })

    revalidatePath('/admin/broadcasts')

    return {
      success: true,
      recipientCount: recipients.length,
      successCount: result.successCount,
      failureCount: result.failureCount,
    }
  } catch (error) {
    console.error('Broadcast send failed:', error)

    await prisma.emailBroadcast.update({
      where: { id: broadcast.id },
      data: { status: 'failed' },
    })

    return { error: 'Failed to send broadcast. Check server logs.' }
  }
}

export async function sendTestEmail(data: {
  subject: string
  introText: string
  testEmail: string
  selectedPages: Array<{
    title: string
    description: string
    path: string
    type: 'learn' | 'act'
    tags: string[]
  }>
}): Promise<BroadcastResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const userExtended = await prisma.userExtended.findUnique({
    where: { userId: session.user.id },
  })
  if (!userExtended) return { error: 'User profile not found' }

  const permission = await canAdminister({ userId: session.user.id, userExtended })
  if (!permission.allowed) return { error: permission.reason || 'Not authorized' }

  if (!data.subject.trim()) return { error: 'Subject is required' }
  if (!data.introText.trim()) return { error: 'Intro text is required' }
  if (data.selectedPages.length === 0) return { error: 'Select at least one page' }
  if (!data.testEmail.trim()) return { error: 'Test email is required' }

  try {
    const htmlBody = renderBroadcastEmail({
      introText: data.introText,
      featuredPages: data.selectedPages,
      unsubscribeUrl: generateUnsubscribeUrl(data.testEmail),
    })

    const result = await sendBatchEmails(data.subject, [
      { email: data.testEmail, htmlBody },
    ])

    return {
      success: true,
      recipientCount: 1,
      successCount: result.successCount,
      failureCount: result.failureCount,
    }
  } catch (error) {
    console.error('Test email failed:', error)
    return { error: 'Failed to send test email. Check server logs.' }
  }
}
