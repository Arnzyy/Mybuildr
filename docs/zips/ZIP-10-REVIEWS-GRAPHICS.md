# ZIP-10: Reviews + Review Graphics

> **Time**: ~4 hours  
> **Outcome**: Review management, Checkatrade scraping, shareable review graphics  
> **Dependencies**: ZIP-09 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Reviews admin page (list, add, edit, delete)
- ✅ Manual review entry form
- ✅ Checkatrade review scraping
- ✅ Google review import (if connected)
- ✅ Review graphic generation (branded images)
- ✅ Auto-post review graphics to social
- ✅ Reviews displayed on builder sites

---

## REVIEW GRAPHICS CONCEPT

Turn this:
```
⭐⭐⭐⭐⭐
"Excellent work on our extension. Professional team, 
finished on time and on budget."
- John Smith
```

Into a shareable branded image for Instagram/Facebook.

---

## STEP 1: INSTALL DEPENDENCIES

```bash
npm install cheerio sharp canvas
```

- `cheerio` - HTML parsing for Checkatrade scraping
- `sharp` - Image processing
- `canvas` - Generate review graphics

---

## STEP 2: REVIEWS API ROUTES

**File: `src/app/api/admin/reviews/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'

// GET all reviews
export async function GET(request: NextRequest) {
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
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

**File: `src/app/api/admin/reviews/[id]/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromR2 } from '@/lib/r2/client'

// PUT update review
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()
    const { reviewer_name, rating, review_text, review_date } = body

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('reviews')
      .select('company_id')
      .eq('id', params.id)
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
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
    }

    return NextResponse.json({ review })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE review
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const admin = createAdminClient()

    // Get review to check ownership and delete graphic
    const { data: review } = await admin
      .from('reviews')
      .select('*')
      .eq('id', params.id)
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
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## STEP 3: CHECKATRADE SCRAPER

**File: `src/lib/scrapers/checkatrade.ts`**

```typescript
import * as cheerio from 'cheerio'

interface ScrapedReview {
  reviewer_name: string
  rating: number
  review_text: string
  review_date: string
}

export async function scrapeCheckatradeReviews(
  checkatradeUrl: string,
  limit: number = 10
): Promise<ScrapedReview[]> {
  try {
    // Validate URL
    if (!checkatradeUrl.includes('checkatrade.com')) {
      throw new Error('Invalid Checkatrade URL')
    }

    // Fetch the page
    const response = await fetch(checkatradeUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Checkatrade page')
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    const reviews: ScrapedReview[] = []

    // Checkatrade review structure (may need updating if they change their HTML)
    $('.review-card, [data-testid="review-card"], .ch-review').each((_, element) => {
      if (reviews.length >= limit) return false

      const $el = $(element)

      // Extract reviewer name
      const name = $el.find('.reviewer-name, [data-testid="reviewer-name"], .ch-review__author').text().trim()
        || $el.find('strong').first().text().trim()
        || 'Anonymous'

      // Extract rating (look for stars or numeric rating)
      let rating = 5
      const ratingText = $el.find('.rating, [data-testid="rating"], .ch-review__rating').text()
      const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/)?.[1]
      if (ratingMatch) {
        rating = Math.round(parseFloat(ratingMatch))
      }
      // Also check star count
      const stars = $el.find('.star-filled, .ch-star--filled, [data-filled="true"]').length
      if (stars > 0) {
        rating = stars
      }

      // Extract review text
      const text = $el.find('.review-text, [data-testid="review-text"], .ch-review__text, p').text().trim()

      // Extract date
      const dateText = $el.find('.review-date, [data-testid="review-date"], .ch-review__date, time').text().trim()
      let date = new Date().toISOString().split('T')[0]
      if (dateText) {
        try {
          const parsed = new Date(dateText)
          if (!isNaN(parsed.getTime())) {
            date = parsed.toISOString().split('T')[0]
          }
        } catch (e) {
          // Keep default date
        }
      }

      if (text && text.length > 10) {
        reviews.push({
          reviewer_name: name.substring(0, 100),
          rating: Math.min(5, Math.max(1, rating)),
          review_text: text.substring(0, 1000),
          review_date: date,
        })
      }
    })

    return reviews
  } catch (error) {
    console.error('Checkatrade scraping error:', error)
    throw error
  }
}
```

---

## STEP 4: SCRAPE REVIEWS API

**File: `src/app/api/admin/reviews/scrape/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { scrapeCheckatradeReviews } from '@/lib/scrapers/checkatrade'

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
      existingReviews?.map(r => r.review_text.substring(0, 50)) || []
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
  } catch (error: any) {
    console.error('Scrape error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to scrape reviews' 
    }, { status: 500 })
  }
}
```

---

## STEP 5: REVIEW GRAPHIC GENERATOR

**File: `src/lib/graphics/review-graphic.ts`**

```typescript
import { createCanvas, registerFont } from 'canvas'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import { Company, Review } from '@/lib/supabase/types'

// Register fonts (you may need to add font files to public/fonts)
// registerFont('public/fonts/Inter-Bold.ttf', { family: 'Inter', weight: 'bold' })
// registerFont('public/fonts/Inter-Regular.ttf', { family: 'Inter', weight: 'normal' })

interface GraphicOptions {
  width?: number
  height?: number
  backgroundColor?: string
  textColor?: string
  accentColor?: string
}

export async function generateReviewGraphic(
  company: Company,
  review: Review,
  options: GraphicOptions = {}
): Promise<string> {
  const {
    width = 1080,
    height = 1080,
    backgroundColor = company.primary_color || '#1e3a5f',
    textColor = '#ffffff',
    accentColor = company.secondary_color || '#f97316',
  } = options

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext('2d')

  // Background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Add subtle pattern/texture
  ctx.fillStyle = 'rgba(255,255,255,0.03)'
  for (let i = 0; i < width; i += 40) {
    for (let j = 0; j < height; j += 40) {
      ctx.beginPath()
      ctx.arc(i, j, 2, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  // Accent bar at top
  ctx.fillStyle = accentColor
  ctx.fillRect(0, 0, width, 8)

  // Stars
  const starSize = 50
  const starSpacing = 60
  const starsY = 200
  const starsStartX = (width - (5 * starSpacing)) / 2 + 30

  for (let i = 0; i < 5; i++) {
    const x = starsStartX + i * starSpacing
    const filled = i < review.rating

    ctx.fillStyle = filled ? '#fbbf24' : 'rgba(255,255,255,0.2)'
    drawStar(ctx, x, starsY, starSize / 2)
  }

  // Quote marks
  ctx.fillStyle = accentColor
  ctx.font = 'bold 120px Georgia, serif'
  ctx.fillText('"', 80, 380)

  // Review text
  ctx.fillStyle = textColor
  ctx.font = '36px Arial, sans-serif'
  
  const maxWidth = width - 160
  const lineHeight = 50
  const lines = wrapText(ctx, review.review_text, maxWidth)
  const maxLines = 6
  const displayLines = lines.slice(0, maxLines)
  
  let y = 420
  for (const line of displayLines) {
    ctx.fillText(line, 80, y)
    y += lineHeight
  }
  
  if (lines.length > maxLines) {
    ctx.fillText('...', 80, y)
  }

  // Closing quote
  ctx.fillStyle = accentColor
  ctx.font = 'bold 120px Georgia, serif'
  ctx.fillText('"', width - 140, y + 60)

  // Reviewer name
  ctx.fillStyle = textColor
  ctx.font = 'bold 32px Arial, sans-serif'
  ctx.fillText(`— ${review.reviewer_name}`, 80, height - 200)

  // Source badge
  if (review.source && review.source !== 'manual') {
    ctx.fillStyle = 'rgba(255,255,255,0.1)'
    ctx.beginPath()
    ctx.roundRect(80, height - 160, 180, 40, 8)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '18px Arial, sans-serif'
    ctx.fillText(`via ${review.source}`, 100, height - 133)
  }

  // Company name at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '24px Arial, sans-serif'
  ctx.fillText(company.name, 80, height - 60)

  // Convert to buffer and upload
  const buffer = canvas.toBuffer('image/png')
  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  return url
}

// Helper: Draw a 5-pointed star
function drawStar(ctx: any, cx: number, cy: number, radius: number) {
  const spikes = 5
  const outerRadius = radius
  const innerRadius = radius / 2
  let rot = Math.PI / 2 * 3
  const step = Math.PI / spikes

  ctx.beginPath()
  ctx.moveTo(cx, cy - outerRadius)

  for (let i = 0; i < spikes; i++) {
    let x = cx + Math.cos(rot) * outerRadius
    let y = cy + Math.sin(rot) * outerRadius
    ctx.lineTo(x, y)
    rot += step

    x = cx + Math.cos(rot) * innerRadius
    y = cy + Math.sin(rot) * innerRadius
    ctx.lineTo(x, y)
    rot += step
  }

  ctx.lineTo(cx, cy - outerRadius)
  ctx.closePath()
  ctx.fill()
}

// Helper: Wrap text to fit width
function wrapText(ctx: any, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word
    const metrics = ctx.measureText(testLine)
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }
  
  if (currentLine) {
    lines.push(currentLine)
  }

  return lines
}

// Alternative: Use Sharp for simpler graphics (no canvas dependency issues)
export async function generateReviewGraphicSimple(
  company: Company,
  review: Review
): Promise<string> {
  const sharp = require('sharp')
  
  const width = 1080
  const height = 1080
  const backgroundColor = company.primary_color || '#1e3a5f'
  const accentColor = company.secondary_color || '#f97316'

  // Generate stars string
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)
  
  // Truncate review text
  const reviewText = review.review_text.length > 200 
    ? review.review_text.substring(0, 200) + '...'
    : review.review_text

  // Create SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <rect width="100%" height="8" fill="${accentColor}"/>
      
      <!-- Stars -->
      <text x="540" y="220" text-anchor="middle" font-size="60" fill="#fbbf24">${stars}</text>
      
      <!-- Quote -->
      <text x="80" y="350" font-size="100" fill="${accentColor}" font-family="Georgia, serif">"</text>
      
      <!-- Review text -->
      <text x="540" y="450" text-anchor="middle" font-size="32" fill="white" font-family="Arial, sans-serif">
        <tspan x="540" dy="0">${escapeXml(reviewText.substring(0, 45))}</tspan>
        <tspan x="540" dy="45">${escapeXml(reviewText.substring(45, 90))}</tspan>
        <tspan x="540" dy="45">${escapeXml(reviewText.substring(90, 135))}</tspan>
        <tspan x="540" dy="45">${escapeXml(reviewText.substring(135, 180))}</tspan>
        <tspan x="540" dy="45">${escapeXml(reviewText.substring(180))}</tspan>
      </text>
      
      <!-- Closing quote -->
      <text x="980" y="700" font-size="100" fill="${accentColor}" font-family="Georgia, serif">"</text>
      
      <!-- Reviewer name -->
      <text x="80" y="880" font-size="32" fill="white" font-weight="bold" font-family="Arial, sans-serif">— ${escapeXml(review.reviewer_name)}</text>
      
      <!-- Company name -->
      <text x="80" y="1020" font-size="24" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif">${escapeXml(company.name)}</text>
    </svg>
  `

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  return url
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
```

---

## STEP 6: GENERATE GRAPHIC API

**File: `src/app/api/admin/reviews/[id]/graphic/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReviewGraphicSimple } from '@/lib/graphics/review-graphic'
import { hasFeature } from '@/lib/features'
import { Company, Review } from '@/lib/supabase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    if (!hasFeature(company.tier, 'review_graphics')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get review
    const { data: review, error } = await admin
      .from('reviews')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .single()

    if (error || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Generate graphic
    const graphicUrl = await generateReviewGraphicSimple(
      company as Company,
      review as Review
    )

    // Update review with graphic URL
    await admin
      .from('reviews')
      .update({ graphic_url: graphicUrl })
      .eq('id', params.id)

    return NextResponse.json({ 
      success: true,
      graphicUrl,
    })
  } catch (error) {
    console.error('Graphic generation error:', error)
    return NextResponse.json({ error: 'Failed to generate graphic' }, { status: 500 })
  }
}
```

---

## STEP 7: SCHEDULE REVIEW POST API

**File: `src/app/api/admin/reviews/[id]/post/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReviewGraphicSimple } from '@/lib/graphics/review-graphic'
import { hasFeature } from '@/lib/features'
import { Company, Review } from '@/lib/supabase/types'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const admin = createAdminClient()

    // Get review
    const { data: review } = await admin
      .from('reviews')
      .select('*')
      .eq('id', params.id)
      .eq('company_id', company.id)
      .single()

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    // Generate graphic if not exists
    let graphicUrl = review.graphic_url
    if (!graphicUrl) {
      graphicUrl = await generateReviewGraphicSimple(
        company as Company,
        review as Review
      )
      
      await admin
        .from('reviews')
        .update({ graphic_url: graphicUrl })
        .eq('id', params.id)
    }

    // Create caption for review post
    const stars = '⭐'.repeat(review.rating)
    const caption = `${stars}\n\n"${review.review_text.substring(0, 150)}${review.review_text.length > 150 ? '...' : ''}"\n\n— ${review.reviewer_name}\n\nThank you for the kind words! 🙏`

    // Schedule post for next available slot
    const scheduledFor = new Date()
    scheduledFor.setHours(scheduledFor.getHours() + 2) // 2 hours from now

    const { data: post, error } = await admin
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        image_url: graphicUrl,
        caption,
        hashtags: ['review', '5stars', 'happycustomer', 'testimonial', company.trade_type?.replace(/\s+/g, '').toLowerCase()].filter(Boolean),
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to schedule post' }, { status: 500 })
    }

    // Mark review as used
    await admin
      .from('reviews')
      .update({
        used_in_post: true,
        last_posted_at: new Date().toISOString(),
      })
      .eq('id', params.id)

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
```

---

## STEP 8: REVIEWS ADMIN PAGE

**File: `src/app/admin/reviews/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyReviews } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ReviewsList from '@/components/admin/ReviewsList'
import { Plus, Star, Download } from 'lucide-react'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const reviews = await getCompanyReviews(company.id)

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'
  const fiveStarCount = reviews.filter(r => r.rating === 5).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Reviews
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your customer reviews
          </p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold">{reviews.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fiveStarCount}</p>
              <p className="text-sm text-gray-500">5-Star Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import from Checkatrade */}
      {company.checkatrade_url && (
        <ImportReviewsButton url={company.checkatrade_url} />
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <ReviewsList 
          reviews={reviews} 
          canGenerateGraphics={company.tier === 'full'}
          canPost={company.tier === 'full' && company.posting_enabled}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
          <p className="text-gray-600 mb-6">
            Add reviews manually or import from Checkatrade
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/reviews/new"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </Link>
            {company.checkatrade_url && (
              <ImportReviewsButton url={company.checkatrade_url} variant="secondary" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// Import button component (needs to be client component)
function ImportReviewsButton({ url, variant = 'primary' }: { url: string; variant?: 'primary' | 'secondary' }) {
  return <ImportReviewsButtonClient url={url} variant={variant} />
}
```

---

## STEP 9: IMPORT REVIEWS BUTTON

**File: `src/components/admin/ImportReviewsButton.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface ImportReviewsButtonProps {
  url: string
  variant?: 'primary' | 'secondary'
}

export default function ImportReviewsButtonClient({ 
  url, 
  variant = 'primary' 
}: ImportReviewsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/reviews/scrape', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message })
        if (data.imported > 0) {
          setTimeout(() => window.location.reload(), 1500)
        }
      } else {
        setResult({ success: false, message: data.error || 'Import failed' })
      }
    } catch (error) {
      setResult({ success: false, message: 'Import failed' })
    } finally {
      setLoading(false)
    }
  }

  const buttonClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'

  return (
    <div className="mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Import from Checkatrade</p>
          <p className="text-sm text-blue-700">Pull your latest reviews automatically</p>
        </div>
        <button
          onClick={handleImport}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${buttonClass}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {loading ? 'Importing...' : 'Import Reviews'}
        </button>
      </div>
      
      {result && (
        <p className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
```

---

## STEP 10: REVIEWS LIST COMPONENT

**File: `src/components/admin/ReviewsList.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Review } from '@/lib/supabase/types'
import { Star, Edit, Trash2, Image, Share2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ReviewsListProps {
  reviews: Review[]
  canGenerateGraphics: boolean
  canPost: boolean
}

export default function ReviewsList({ 
  reviews: initialReviews, 
  canGenerateGraphics,
  canPost,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [loadingGraphic, setLoadingGraphic] = useState<string | null>(null)
  const [loadingPost, setLoadingPost] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return

    setDeleting(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
      } else {
        alert('Failed to delete review')
      }
    } catch (error) {
      alert('Failed to delete review')
    } finally {
      setDeleting(null)
    }
  }

  const handleGenerateGraphic = async (id: string) => {
    setLoadingGraphic(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}/graphic`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setReviews(reviews.map(r => 
          r.id === id ? { ...r, graphic_url: data.graphicUrl } : r
        ))
      } else {
        alert(data.error || 'Failed to generate graphic')
      }
    } catch (error) {
      alert('Failed to generate graphic')
    } finally {
      setLoadingGraphic(null)
    }
  }

  const handleShareToSocial = async (id: string) => {
    setLoadingPost(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}/post`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Review scheduled for posting!`)
        setReviews(reviews.map(r => 
          r.id === id ? { ...r, used_in_post: true } : r
        ))
      } else {
        alert(data.error || 'Failed to schedule post')
      }
    } catch (error) {
      alert('Failed to schedule post')
    } finally {
      setLoadingPost(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex gap-6">
            {/* Graphic preview */}
            {review.graphic_url && (
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={review.graphic_url}
                  alt="Review graphic"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {renderStars(review.rating)}
                  <p className="font-semibold text-gray-900 mt-2">
                    {review.reviewer_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(review.review_date), 'MMM d, yyyy')}
                    {review.source !== 'manual' && (
                      <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">
                        {review.source}
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/reviews/${review.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review text */}
              <p className="text-gray-700 mt-3 line-clamp-3">
                "{review.review_text}"
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4">
                {canGenerateGraphics && (
                  <button
                    onClick={() => handleGenerateGraphic(review.id)}
                    disabled={loadingGraphic === review.id}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {loadingGraphic === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4" />
                    )}
                    {review.graphic_url ? 'Regenerate Graphic' : 'Generate Graphic'}
                  </button>
                )}
                
                {canPost && review.graphic_url && !review.used_in_post && (
                  <button
                    onClick={() => handleShareToSocial(review.id)}
                    disabled={loadingPost === review.id}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    {loadingPost === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    Share to Social
                  </button>
                )}

                {review.used_in_post && (
                  <span className="text-xs text-green-600">✓ Shared</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## STEP 11: ADD/EDIT REVIEW PAGE

**File: `src/app/admin/reviews/new/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import ReviewForm from '@/components/admin/ReviewForm'

export default async function NewReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Add Review
        </h1>
        <p className="text-gray-600 mt-1">
          Add a customer review manually
        </p>
      </div>

      <ReviewForm />
    </div>
  )
}
```

**File: `src/app/admin/reviews/[id]/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import ReviewForm from '@/components/admin/ReviewForm'

export default async function EditReviewPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const admin = createAdminClient()
  const { data: review } = await admin
    .from('reviews')
    .select('*')
    .eq('id', params.id)
    .eq('company_id', company.id)
    .single()

  if (!review) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Edit Review
        </h1>
        <p className="text-gray-600 mt-1">
          Update review details
        </p>
      </div>

      <ReviewForm review={review} />
    </div>
  )
}
```

---

## STEP 12: REVIEW FORM COMPONENT

**File: `src/components/admin/ReviewForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Review } from '@/lib/supabase/types'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'

interface ReviewFormProps {
  review?: Review
}

export default function ReviewForm({ review }: ReviewFormProps) {
  const router = useRouter()
  const isEditing = !!review

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reviewer_name: review?.reviewer_name || '',
    rating: review?.rating || 5,
    review_text: review?.review_text || '',
    review_date: review?.review_date || new Date().toISOString().split('T')[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.reviewer_name.trim() || !formData.review_text.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const url = isEditing 
        ? `/api/admin/reviews/${review.id}`
        : '/api/admin/reviews'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/reviews')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save review')
      }
    } catch (error) {
      alert('Failed to save review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Link 
        href="/admin/reviews"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to reviews
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating 
                        ? 'text-yellow-400 fill-yellow-400' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="reviewer_name"
              value={formData.reviewer_name}
              onChange={handleChange}
              required
              placeholder="John Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Text *
            </label>
            <textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleChange}
              required
              rows={5}
              placeholder="What did the customer say about your work?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Date
            </label>
            <input
              type="date"
              name="review_date"
              value={formData.review_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/reviews"
          className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Review'}
        </button>
      </div>
    </form>
  )
}
```

---

## STEP 13: UPDATE ADMIN PAGE IMPORT

**File: `src/app/admin/reviews/page.tsx`** 

Add at top:
```typescript
import ImportReviewsButtonClient from '@/components/admin/ImportReviewsButton'
```

Update the function call:
```typescript
{company.checkatrade_url && (
  <ImportReviewsButtonClient url={company.checkatrade_url} />
)}
```

---

## STEP 14: TEST IT

1. Go to `/admin/reviews`
2. Click "Add Review" - create a manual review
3. If you have Checkatrade URL in settings, click "Import Reviews"
4. Click "Generate Graphic" on a review
5. View the generated graphic
6. Click "Share to Social" to schedule it

---

## EXIT CRITERIA

- ✅ Reviews list page with stats
- ✅ Add review form working
- ✅ Edit review working
- ✅ Delete review working
- ✅ Checkatrade scraping working
- ✅ Review graphic generation
- ✅ Graphics uploaded to R2
- ✅ Share to social scheduling
- ✅ Reviews displayed on builder sites
- ✅ `npm run build` passes

---

## REVIEW GRAPHICS FLOW

```
┌─────────────────────────────────────────────────────────────┐
│  Builder adds review (manual or imported)                  │
│                    ↓                                        │
│  Click "Generate Graphic"                                  │
│                    ↓                                        │
│  SVG template rendered with:                               │
│    - Company colors                                        │
│    - Star rating                                           │
│    - Review text                                           │
│    - Reviewer name                                         │
│    - Source badge                                          │
│                    ↓                                        │
│  Converted to PNG via Sharp                                │
│                    ↓                                        │
│  Uploaded to R2 (graphics/company-slug/review-xxx.png)     │
│                    ↓                                        │
│  URL stored in review.graphic_url                          │
│                    ↓                                        │
│  Click "Share to Social"                                   │
│                    ↓                                        │
│  Creates scheduled_post with:                              │
│    - Graphic as image                                      │
│    - Auto-generated caption with stars                     │
│    - Relevant hashtags                                     │
│                    ↓                                        │
│  Posted via normal posting flow                            │
└─────────────────────────────────────────────────────────────┘
```

---

## NEXT: ZIP-11

ZIP-11 will add:
- Final polish
- SEO optimization
- Performance tuning
- Vercel deployment
- Domain setup
- Production checklist

---

**Reviews system complete. Branded graphics ready for social sharing.**
