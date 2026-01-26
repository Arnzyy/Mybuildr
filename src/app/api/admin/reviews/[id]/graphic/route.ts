import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReviewGraphic } from '@/lib/graphics/review-graphic'
import { hasFeature } from '@/lib/features'
import { autoSchedulePosts } from '@/lib/posting/auto-schedule'
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
    let graphicUrl
    try {
      graphicUrl = await generateReviewGraphic(
        company as Company,
        review as Review
      )
    } catch (graphicError) {
      console.error('Graphic generation error details:', {
        error: graphicError,
        message: graphicError instanceof Error ? graphicError.message : 'Unknown error',
        stack: graphicError instanceof Error ? graphicError.stack : undefined,
        companyId: company.id,
        reviewId: review.id
      })
      return NextResponse.json({
        error: 'Failed to generate graphic',
        details: graphicError instanceof Error ? graphicError.message : 'Unknown error'
      }, { status: 500 })
    }

    // Update review with graphic URL
    await admin
      .from('reviews')
      .update({ graphic_url: graphicUrl })
      .eq('id', id)

    // Auto-schedule posts when new review graphic is generated
    await autoSchedulePosts(company)

    return NextResponse.json({
      success: true,
      graphicUrl,
    })
  } catch (error) {
    console.error('Graphic generation error:', error)
    return NextResponse.json({
      error: 'Failed to generate graphic',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
