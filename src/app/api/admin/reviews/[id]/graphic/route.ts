import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReviewGraphic } from '@/lib/graphics/review-graphic'
import { hasFeature } from '@/lib/features'
import type { Company, Review } from '@/lib/supabase/types'

export async function POST(
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

    if (!hasFeature(company.tier, 'review_graphics')) {
      return NextResponse.json({ error: 'Upgrade to Full Package for review graphics' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get review
    const { data: review, error } = await admin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (error || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Generate graphic
    const graphicUrl = await generateReviewGraphic(
      company as Company,
      review as Review
    )

    // Update review with graphic URL
    await admin
      .from('reviews')
      .update({ graphic_url: graphicUrl })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      graphicUrl,
    })
  } catch (error) {
    console.error('Graphic generation error:', error)
    return NextResponse.json({ error: 'Failed to generate graphic' }, { status: 500 })
  }
}
