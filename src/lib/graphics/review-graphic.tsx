import { ImageResponse } from '@vercel/og'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import type { Company, Review } from '@/lib/supabase/types'

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

  // Truncate and split review text into lines
  const reviewText = review.review_text || ''
  const truncated = reviewText.length > 200
    ? reviewText.substring(0, 200) + '...'
    : reviewText

  const lines = splitTextToLines(truncated, 40)
  const maxLines = 5
  const displayLines = lines.slice(0, maxLines)

  // Generate the image using Vercel OG
  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: backgroundColor,
          position: 'relative',
        }}
      >
        {/* Accent bar at top */}
        <div style={{ width: '100%', height: '8px', background: accentColor }} />

        {/* Stars */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            justifyContent: 'center',
            marginTop: '140px',
            fontSize: '48px',
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              style={{
                color: i < review.rating ? '#fbbf24' : 'rgba(255,255,255,0.3)',
              }}
            >
              ★
            </div>
          ))}
        </div>

        {/* Hashtag */}
        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: accentColor,
            marginTop: '80px',
            textAlign: 'center',
          }}
        >
          #YourComments
        </div>

        {/* Review box */}
        <div
          style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '12px',
            padding: '40px',
            margin: '40px 100px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px',
          }}
        >
          {/* Review text */}
          <div
            style={{
              fontSize: '26px',
              color: '#1a1a1a',
              textAlign: 'center',
              lineHeight: 1.4,
            }}
          >
            {displayLines.join(' ')}
          </div>

          {/* Reviewer name */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#333',
              textAlign: 'center',
            }}
          >
            - {review.reviewer_name || 'Happy Customer'}
          </div>
        </div>

        {/* Logo placeholder */}
        <div
          style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '8px',
            width: '180px',
            height: '60px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            fontWeight: 700,
            color: 'white',
          }}
        >
          LOGO
        </div>

        {/* Company name */}
        <div
          style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            marginTop: '20px',
          }}
        >
          {company.name}
        </div>

        {/* Accent bar at bottom */}
        <div
          style={{
            width: '100%',
            height: '8px',
            background: accentColor,
            position: 'absolute',
            bottom: 0,
          }}
        />
      </div>
    ),
    {
      width,
      height,
    }
  )

  // Convert the Response to a buffer
  const arrayBuffer = await imageResponse.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  return url
}
