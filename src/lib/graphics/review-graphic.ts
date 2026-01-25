import sharp from 'sharp'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import type { Company, Review } from '@/lib/supabase/types'

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function generateReviewGraphic(
  company: Company,
  review: Review
): Promise<string> {
  try {
    const width = 1080
    const height = 1080
    const backgroundColor = company.primary_color || '#1e3a5f'
    const accentColor = company.secondary_color || '#f97316'

    console.log('[Review Graphic] Starting generation', {
      reviewId: review.id,
      companyId: company.id
    })

    // Generate stars using SVG paths (font-independent)
    const starPath = 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z'
    const stars = Array.from({ length: 5 }, (_, i) => {
      const x = 370 + (i * 68)
      const fillColor = i < review.rating ? '#fbbf24' : 'rgba(255,255,255,0.3)'
      return `<g transform="translate(${x}, 160)">
        <path d="${starPath}" fill="${fillColor}" transform="scale(1.8)"/>
      </g>`
    }).join('\n      ')

    // Truncate review text
    const reviewText = review.review_text || ''
    const truncated = reviewText.length > 150
      ? reviewText.substring(0, 150) + '...'
      : reviewText

    // Simple SVG with basic text
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <!-- Background -->
        <rect width="100%" height="100%" fill="${backgroundColor}"/>

        <!-- Top accent bar -->
        <rect width="100%" height="8" fill="${accentColor}"/>

        <!-- Subtle pattern -->
        <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.05)"/>
        </pattern>
        <rect width="100%" height="100%" fill="url(#dots)"/>

        <!-- Stars -->
        ${stars}

        <!-- Hashtag -->
        <text x="540" y="330" font-size="52" font-weight="bold" fill="${accentColor}" text-anchor="middle" font-family="Arial,sans-serif">#YourComments</text>

        <!-- White review box -->
        <rect x="100" y="380" width="880" height="380" rx="12" fill="rgba(255,255,255,0.95)"/>

        <!-- Review text -->
        <text x="540" y="480" font-size="24" fill="#1a1a1a" text-anchor="middle" font-family="Arial,sans-serif">
          <tspan x="540" dy="0">${escapeXml(truncated.substring(0, 40))}</tspan>
          ${truncated.length > 40 ? `<tspan x="540" dy="35">${escapeXml(truncated.substring(40, 80))}</tspan>` : ''}
          ${truncated.length > 80 ? `<tspan x="540" dy="35">${escapeXml(truncated.substring(80, 120))}</tspan>` : ''}
          ${truncated.length > 120 ? `<tspan x="540" dy="35">${escapeXml(truncated.substring(120, 150))}</tspan>` : ''}
        </text>

        <!-- Reviewer name -->
        <text x="540" y="700" font-size="20" font-weight="bold" fill="#333" text-anchor="middle" font-family="Arial,sans-serif">- ${escapeXml(review.reviewer_name || 'Happy Customer')}</text>

        <!-- Logo placeholder -->
        <rect x="450" y="880" width="180" height="60" rx="8" fill="rgba(255,255,255,0.15)"/>
        <text x="540" y="918" font-size="24" font-weight="bold" fill="white" text-anchor="middle" font-family="Arial,sans-serif">LOGO</text>

        <!-- Company name -->
        <text x="540" y="1020" font-size="18" fill="rgba(255,255,255,0.6)" text-anchor="middle" font-family="Arial,sans-serif">${escapeXml(company.name)}</text>

        <!-- Bottom accent bar -->
        <rect y="1072" width="100%" height="8" fill="${accentColor}"/>
      </svg>
    `

    console.log('[Review Graphic] SVG created, converting with Sharp')

    const buffer = await sharp(Buffer.from(svg))
      .png()
      .toBuffer()

    console.log('[Review Graphic] Buffer created, uploading to R2', {
      bufferSize: buffer.length
    })

    const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
    const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

    console.log('[Review Graphic] Upload complete', { url })

    return url
  } catch (error) {
    console.error('[Review Graphic] Generation failed:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      reviewId: review.id,
      companyId: company.id
    })
    throw error
  }
}
