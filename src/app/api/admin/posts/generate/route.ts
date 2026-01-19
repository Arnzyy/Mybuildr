import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { fillPostQueue } from '@/lib/posting/scheduler'
import { hasFeature } from '@/lib/features'

// POST - manually trigger post generation
export async function POST() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    if (!hasFeature(company.tier, 'auto_posting')) {
      return NextResponse.json({ error: 'Upgrade to Full Package required' }, { status: 403 })
    }

    if (!company.posting_enabled) {
      return NextResponse.json({ error: 'Posting is not enabled' }, { status: 400 })
    }

    const scheduled = await fillPostQueue(company, 7)

    return NextResponse.json({
      success: true,
      postsScheduled: scheduled,
    })
  } catch (error) {
    console.error('Generate posts error:', error)
    return NextResponse.json({ error: 'Failed to generate posts' }, { status: 500 })
  }
}
