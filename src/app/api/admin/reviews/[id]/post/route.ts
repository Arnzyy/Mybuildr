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

    if (!hasFeature(company.tier, 'auto_posting')) {
      return NextResponse.json({ error: 'Upgrade to Full Package for auto-posting' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get review
    const { data: review } = await admin
      .from('reviews')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Generate graphic if not exists
    let graphicUrl = review.graphic_url
    if (!graphicUrl) {
      graphicUrl = await generateReviewGraphic(
        company as Company,
        review as Review
      )

      await admin
        .from('reviews')
        .update({ graphic_url: graphicUrl })
        .eq('id', id)
    }

    // Create caption for review post
    const stars = '⭐'.repeat(review.rating)
    const reviewText = review.review_text || ''
    const truncatedText = reviewText.length > 150
      ? reviewText.substring(0, 150) + '...'
      : reviewText
    const caption = `${stars}\n\n"${truncatedText}"\n\n— ${review.reviewer_name || 'Happy Customer'}\n\nThank you for the kind words! 🙏`

    // Schedule post for 2 hours from now
    const scheduledFor = new Date()
    scheduledFor.setHours(scheduledFor.getHours() + 2)

    // Build hashtags
    const hashtags = ['review', '5stars', 'happycustomer', 'testimonial']
    if (company.trade_type) {
      hashtags.push(company.trade_type.replace(/\s+/g, '').toLowerCase())
    }

    const { data: post, error } = await admin
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        image_url: graphicUrl,
        caption,
        hashtags,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to schedule post:', error)
      return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
    }

    // Mark review as used
    await admin
      .from('reviews')
      .update({
        used_in_post: true,
        last_posted_at: new Date().toISOString(),
      })
      .eq('id', id)

    return NextResponse.json({
      success: true,
      postId: post.id,
      scheduledFor: scheduledFor.toISOString(),
    })
  } catch (error) {
    console.error('Schedule review post error:', error)
    return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
  }
}
