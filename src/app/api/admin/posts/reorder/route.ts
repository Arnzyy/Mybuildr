import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { post1_id, post1_time, post2_id, post2_time } = await request.json()

    if (!post1_id || !post1_time || !post2_id || !post2_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Update both posts with swapped scheduled times
    const { error: error1 } = await admin
      .from('scheduled_posts')
      .update({ scheduled_for: post1_time })
      .eq('id', post1_id)

    const { error: error2 } = await admin
      .from('scheduled_posts')
      .update({ scheduled_for: post2_time })
      .eq('id', post2_id)

    if (error1 || error2) {
      console.error('Error reordering posts:', error1 || error2)
      return NextResponse.json({ error: 'Failed to reorder posts' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in reorder API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
