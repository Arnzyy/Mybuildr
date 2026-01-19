import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { scrapeCheckatradeReviews } from '@/lib/scrapers/checkatrade'
import { hasFeature } from '@/lib/features'

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

    if (!hasFeature(company.tier, 'manage_reviews')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    if (!company.checkatrade_url) {
      return NextResponse.json({ error: 'No Checkatrade URL configured' }, { status: 400 })
    }

    // Scrape reviews
    const scrapedReviews = await scrapeCheckatradeReviews(company.checkatrade_url, 20)

    if (scrapedReviews.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        message: 'No reviews found to import'
      })
    }

    const admin = createAdminClient()

    // Get existing review texts to avoid duplicates
    const { data: existingReviews } = await admin
      .from('reviews')
      .select('review_text')
      .eq('company_id', company.id)

    const existingTexts = new Set(
      existingReviews?.map(r => r.review_text?.substring(0, 50)) || []
    )

    // Filter out duplicates
    const newReviews = scrapedReviews.filter(
      r => !existingTexts.has(r.review_text.substring(0, 50))
    )

    if (newReviews.length === 0) {
      return NextResponse.json({
        success: true,
        imported: 0,
        message: 'All reviews already imported'
      })
    }

    // Insert new reviews
    const { error } = await admin
      .from('reviews')
      .insert(
        newReviews.map(r => ({
          company_id: company.id,
          reviewer_name: r.reviewer_name,
          rating: r.rating,
          review_text: r.review_text,
          review_date: r.review_date,
          source: 'checkatrade',
        }))
      )

    if (error) {
      console.error('Failed to insert reviews:', error)
      return NextResponse.json({ error: 'Failed to import reviews' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      imported: newReviews.length,
      message: `Imported ${newReviews.length} new reviews`
    })
  } catch (error: unknown) {
    console.error('Scrape error:', error)
    const message = error instanceof Error ? error.message : 'Failed to scrape reviews'
    return NextResponse.json({
      error: message
    }, { status: 500 })
  }
}
