import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// DELETE (cancel) a scheduled post
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    if (!hasFeature(company.tier, 'view_scheduled_posts')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Verify ownership and status
    const { data: post } = await admin
      .from('scheduled_posts')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    if (post.status !== 'pending' && post.status !== 'failed') {
      return NextResponse.json({ error: 'Can only delete pending or failed posts' }, { status: 400 })
    }

    // Update to skipped status
    await admin
      .from('scheduled_posts')
      .update({ status: 'skipped' })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT update caption
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    const { caption, hashtags } = await request.json()

    const admin = createAdminClient()

    // Verify ownership
    const { data: post } = await admin
      .from('scheduled_posts')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .single()

    if (!post) {
      return NextResponse.json({ error: 'Post not found or not editable' }, { status: 404 })
    }

    await admin
      .from('scheduled_posts')
      .update({ caption, hashtags })
      .eq('id', id)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
