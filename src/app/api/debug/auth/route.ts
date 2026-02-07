import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()

    // Check database connection
    let dbConnected = false
    let userExtendedExists = false
    let tableCount = 0

    try {
      await prisma.$queryRaw`SELECT 1`
      dbConnected = true

      // Check if UserExtended table exists
      const tables = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
      `
      tableCount = tables.length
      userExtendedExists = tables.some(t => t.tablename === 'users_extended')
    } catch (error) {
      console.error('DB check error:', error)
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      session: session ? {
        userId: session.user?.id,
        email: session.user?.email,
        name: session.user?.name
      } : null,
      database: {
        connected: dbConnected,
        tableCount,
        userExtendedTableExists: userExtendedExists
      },
      environment: {
        hasAuthSecret: !!process.env.AUTH_SECRET,
        hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
        hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}
