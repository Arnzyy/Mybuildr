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

// Split text into lines that fit within width (approximate character count)
function splitTextToLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine + (currentLine ? ' ' : '') + word

    if (testLine.length > maxCharsPerLine && currentLine) {
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

export async function generateReviewGraphic(
  company: Company,
  review: Review
): Promise<string> {
  const width = 1080
  const height = 1080
  const backgroundColor = company.primary_color || '#1e3a5f'
  const accentColor = company.secondary_color || '#f97316'

  // Generate star circles instead of unicode stars
  const starCircles = Array.from({ length: 5 }, (_, i) => {
    const x = 390 + (i * 60)
    const isFilled = i < review.rating
    return `<circle cx="${x}" cy="180" r="20" fill="${isFilled ? '#fbbf24' : 'rgba(255,255,255,0.2)'}" />`
  }).join('\n      ')

  // Truncate and split review text into lines
  const reviewText = review.review_text || ''
  const truncated = reviewText.length > 200
    ? reviewText.substring(0, 200) + '...'
    : reviewText

  const lines = splitTextToLines(truncated, 35)
  const maxLines = 6
  const displayLines = lines.slice(0, maxLines)

  // Build tspan elements for review text
  const tspanElements = displayLines.map((line, index) =>
    `<tspan x="540" dy="${index === 0 ? 0 : 42}">${escapeXml(line)}</tspan>`
  ).join('\n        ')

  // Create SVG with embedded fonts
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="100%" height="100%" fill="${backgroundColor}"/>

      <!-- Accent bar at top -->
      <rect width="100%" height="8" fill="${accentColor}"/>

      <!-- Subtle pattern -->
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.05)"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#dots)"/>

      <!-- Star rating using circles -->
      ${starCircles}

      <!-- Hashtag icon -->
      <text x="120" y="330" font-size="60" fill="${accentColor}" font-family="Arial, sans-serif" font-weight="bold">#YourComments</text>

      <!-- Review text box -->
      <rect x="100" y="380" width="880" height="${Math.max(300, displayLines.length * 45 + 80)}" rx="12" fill="rgba(255,255,255,0.95)"/>

      <!-- Review text -->
      <text x="540" y="440" text-anchor="middle" font-size="28" fill="#1a1a1a" font-family="Arial, sans-serif" style="line-height: 1.4;">
        ${tspanElements}
      </text>

      <!-- Reviewer name -->
      <text x="540" y="${440 + (displayLines.length * 42) + 60}" text-anchor="middle" font-size="22" fill="#333333" font-family="Arial, sans-serif" font-weight="bold">- ${escapeXml(review.reviewer_name || 'Happy Customer')}</text>

      <!-- Logo placeholder -->
      <rect x="450" y="880" width="180" height="60" rx="8" fill="rgba(255,255,255,0.15)"/>
      <text x="540" y="918" text-anchor="middle" font-size="24" fill="white" font-family="Arial, sans-serif" font-weight="bold">LOGO</text>

      <!-- Company name at bottom -->
      <text x="540" y="1020" text-anchor="middle" font-size="20" fill="rgba(255,255,255,0.6)" font-family="Arial, sans-serif">${escapeXml(company.name)}</text>

      <!-- Accent bar at bottom -->
      <rect y="1072" width="100%" height="8" fill="${accentColor}"/>
    </svg>
  `

  const buffer = await sharp(Buffer.from(svg))
    .png()
    .toBuffer()

  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  return url
}
