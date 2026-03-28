import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { email, source } = await request.json()

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: { extended: true },
    })

    if (existingUser) {
      // Ensure notifications are enabled
      if (existingUser.extended) {
        await prisma.userExtended.update({
          where: { userId: existingUser.id },
          data: { emailNotifications: true },
        })
      } else {
        // User exists but no UserExtended record — create one
        await prisma.userExtended.create({
          data: {
            userId: existingUser.id,
            email: normalizedEmail,
            displayName: normalizedEmail.split('@')[0],
            emailNotifications: true,
            weeklyDigest: true,
          },
        })
      }
      return NextResponse.json({ message: "You're signed up for weekly updates!" })
    }

    // Create new user with just email (no password, no OAuth)
    // When they later sign in via magic link, NextAuth will find this user by email
    await prisma.user.create({
      data: {
        email: normalizedEmail,
        extended: {
          create: {
            email: normalizedEmail,
            emailNotifications: true,
            weeklyDigest: true,
            displayName: normalizedEmail.split('@')[0],
          },
        },
      },
    })

    return NextResponse.json({ message: "You're signed up for weekly updates!" })
  } catch (error) {
    console.error('Email signup error:', error)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
