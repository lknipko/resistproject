import { NextRequest, NextResponse } from 'next/server'
import { trackCivicAction } from '@/lib/tracking'

export const runtime = 'nodejs'

/**
 * POST /api/track/civic-action
 *
 * Privacy-friendly tracking endpoint for civic actions.
 * NO user PII is collected or stored.
 *
 * Accepts: { actionType, repName?, repOffice?, sourcePage }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { actionType, repName, repOffice, sourcePage } = body

    // Validate required fields
    if (!actionType || !sourcePage) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate actionType
    if (actionType !== 'email_clicked' && actionType !== 'call_clicked') {
      return NextResponse.json(
        { error: 'Invalid action type' },
        { status: 400 }
      )
    }

    // Track action (silent fail built-in)
    await trackCivicAction({
      actionType,
      repName,
      repOffice,
      sourcePage,
    })

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('Civic action tracking error:', error)
    // Return success even on error (don't break user experience)
    return NextResponse.json({ success: true }, { status: 200 })
  }
}
