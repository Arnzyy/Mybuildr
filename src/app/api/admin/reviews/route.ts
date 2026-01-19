import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// GET all reviews
export async function GET() {
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

    // Check feature access
    if (!hasFeature(company.tier, 'manage_reviews')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()
    const { data: reviews, error } = await admin
      .from('reviews')
      .select('*')
      .eq('company_id', company.id)
      .order('review_date', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Reviews GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST create new review
export async function POST(request: NextRequest) {
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

    // Check feature access
    if (!hasFeature(company.tier, 'manage_reviews')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const body = await request.json()
    const { reviewer_name, rating, review_text, review_date, source } = body

    if (!reviewer_name || !rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: review, error } = await admin
      .from('reviews')
      .insert({
        company_id: company.id,
        reviewer_name,
        rating: Math.min(5, Math.max(1, rating)),
        review_text,
        review_date: review_date || new Date().toISOString().split('T')[0],
        source: source || 'manual',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    console.error('Reviews POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
