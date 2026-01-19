import { NextRequest, NextResponse } from 'next/server'
import { processDuePosts } from '@/lib/posting/poster'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const results = await processDuePosts()

    return NextResponse.json({
      success: true,
      ...results,
    })
  } catch (error) {
    console.error('Cron execute-posts error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
