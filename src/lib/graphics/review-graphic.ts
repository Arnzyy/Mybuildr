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

  // Generate stars string
  const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)

  // Truncate and split review text into lines
  const reviewText = review.review_text || ''
  const truncated = reviewText.length > 250
    ? reviewText.substring(0, 250) + '...'
    : reviewText

  const lines = splitTextToLines(truncated, 40)
  const maxLines = 5
  const displayLines = lines.slice(0, maxLines)

  // Build tspan elements for review text
  const tspanElements = displayLines.map((line, index) =>
    `<tspan x="540" dy="${index === 0 ? 0 : 50}">${escapeXml(line)}</tspan>`
  ).join('\n        ')

  // Create SVG
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&amp;display=swap');
        </style>
      </defs>

      <!-- Background -->
      <rect width="100%" height="100%" fill="${backgroundColor}"/>

      <!-- Accent bar at top -->
      <rect width="100%" height="8" fill="${accentColor}"/>

      <!-- Subtle pattern -->
      <pattern id="dots" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="2" r="1.5" fill="rgba(255,255,255,0.03)"/>
      </pattern>
      <rect width="100%" height="100%" fill="url(#dots)"/>

      <!-- Stars -->
      <text x="540" y="200" text-anchor="middle" font-size="56" fill="#fbbf24" font-family="Arial, sans-serif">${stars}</text>

      <!-- Opening quote -->
      <text x="80" y="340" font-size="120" fill="${accentColor}" font-family="Georgia, serif">"</text>

      <!-- Review text -->
      <text x="540" y="420" text-anchor="middle" font-size="32" fill="white" font-family="Arial, sans-serif">
        ${tspanElements}
      </text>

      <!-- Closing quote -->
      <text x="980" y="${420 + (displayLines.length * 50) + 40}" font-size="120" fill="${accentColor}" font-family="Georgia, serif">"</text>

      <!-- Reviewer name -->
      <text x="80" y="880" font-size="32" fill="white" font-weight="bold" font-family="Arial, sans-serif">— ${escapeXml(review.reviewer_name || 'Happy Customer')}</text>

      <!-- Source badge -->
      ${review.source && review.source !== 'manual' ? `
      <rect x="80" y="900" width="150" height="35" rx="6" fill="rgba(255,255,255,0.1)"/>
      <text x="95" y="924" font-size="16" fill="rgba(255,255,255,0.7)" font-family="Arial, sans-serif">via ${review.source}</text>
      ` : ''}

      <!-- Company name -->
      <text x="80" y="1020" font-size="24" fill="rgba(255,255,255,0.5)" font-family="Arial, sans-serif">${escapeXml(company.name)}</text>

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
