import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()

    // Check database connection
    const { error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    })
  } catch {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
