import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromR2 } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

// PUT update review
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

    if (!hasFeature(company.tier, 'manage_reviews')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const body = await request.json()
    const { reviewer_name, rating, review_text, review_date } = body

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('reviews')
      .select('company_id')
      .eq('id', id)
      .single()

    if (!existing || existing.company_id !== company.id) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    const { data: review, error } = await admin
      .from('reviews')
      .update({
        reviewer_name,
        rating: Math.min(5, Math.max(1, rating)),
        review_text,
        review_date,
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Review PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE review
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

    if (!hasFeature(company.tier, 'manage_reviews')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get review to check ownership and delete graphic
    const { data: review } = await admin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Delete graphic from R2 if exists
    if (review.graphic_url) {
      try {
        await deleteFromR2(review.graphic_url)
      } catch (e) {
        console.error('Failed to delete graphic:', e)
      }
    }

    // Delete review
    const { error } = await admin
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Review DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
