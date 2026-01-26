// Professional review graphic with image background and card overlay
import { createCanvas, registerFont, loadImage, CanvasRenderingContext2D } from 'canvas'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Company, Review } from '@/lib/supabase/types'
import path from 'path'
import fs from 'fs'

// =============================================================================
// FONT SETUP
// =============================================================================

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts')
let fontsLoaded = false

function loadFonts() {
  if (fontsLoaded) return

  try {
    const regular = path.join(FONTS_DIR, 'Inter-Regular.ttf')
    const bold = path.join(FONTS_DIR, 'Inter-Bold.ttf')

    if (fs.existsSync(regular)) registerFont(regular, { family: 'Inter', weight: '400' })
    if (fs.existsSync(bold)) registerFont(bold, { family: 'Inter', weight: '700' })

    fontsLoaded = true
  } catch (e) {
    console.error('Font load error:', e)
  }
}

loadFonts()

const FONT = 'Inter'
const SIZE = 1080

// =============================================================================
// DRAWING HELPERS
// =============================================================================

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  // First, normalize the text by replacing all newlines/paragraph breaks with spaces
  // Also remove emojis since Inter font doesn't support them
  const normalizedText = text
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\u{1F600}-\u{1F64F}]/gu, '') // Emoticons
    .replace(/[\u{1F300}-\u{1F5FF}]/gu, '') // Misc Symbols and Pictographs
    .replace(/[\u{1F680}-\u{1F6FF}]/gu, '') // Transport and Map
    .replace(/[\u{1F1E0}-\u{1F1FF}]/gu, '') // Flags
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Misc symbols
    .replace(/[\u{2700}-\u{27BF}]/gu, '')   // Dingbats
    .replace(/[\u{1F900}-\u{1F9FF}]/gu, '') // Supplemental Symbols and Pictographs
    .replace(/[\u{1FA00}-\u{1FA6F}]/gu, '') // Chess Symbols
    .replace(/[\u{1FA70}-\u{1FAFF}]/gu, '') // Symbols and Pictographs Extended-A
    .trim()

  const words = normalizedText.split(' ')
  const lines: string[] = []
  let line = ''

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word
    if (ctx.measureText(testLine).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = testLine
    }
  }
  if (line) lines.push(line)
  return lines
}

// =============================================================================
// GET RANDOM PROJECT IMAGE
// =============================================================================

async function getRandomProjectImage(companyId: string): Promise<string | null> {
  const supabase = createAdminClient()

  const { data: media, error } = await supabase
    .from('media_library')
    .select('image_url')
    .eq('company_id', companyId)
    .eq('is_available', true)
    .limit(50)

  console.log('[Review Graphic] Media library query result:', {
    companyId,
    mediaCount: media?.length || 0,
    error: error?.message
  })

  if (!media || media.length === 0) {
    console.log('[Review Graphic] No media found in library')
    return null
  }

  // Pick random image
  const randomIndex = Math.floor(Math.random() * media.length)
  const selectedUrl = media[randomIndex].image_url
  console.log('[Review Graphic] Selected random image:', selectedUrl)
  return selectedUrl
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export async function generateReviewGraphic(
  company: Company,
  review: Review
): Promise<string> {
  console.log('[Review Graphic] Starting generation', {
    reviewId: review.id,
    companyId: company.id,
    fontsLoaded
  })

  loadFonts()

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  // Try to load a background image from media library
  const backgroundImageUrl = await getRandomProjectImage(company.id)

  console.log('[Review Graphic] Background image URL:', backgroundImageUrl)

  if (backgroundImageUrl) {
    try {
      console.log('[Review Graphic] Loading background image from:', backgroundImageUrl)
      const bgImage = await loadImage(backgroundImageUrl)
      console.log('[Review Graphic] Image loaded successfully, dimensions:', bgImage.width, 'x', bgImage.height)

      // Draw background image (cover fit)
      const scale = Math.max(SIZE / bgImage.width, SIZE / bgImage.height)
      const x = (SIZE - bgImage.width * scale) / 2
      const y = (SIZE - bgImage.height * scale) / 2

      ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale)

      // Dark overlay
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'
      ctx.fillRect(0, 0, SIZE, SIZE)
    } catch (err) {
      console.error('[Review Graphic] Failed to load background image:', {
        error: err,
        message: err instanceof Error ? err.message : 'Unknown error',
        url: backgroundImageUrl
      })
      // Fallback to solid color
      ctx.fillStyle = company.primary_color || '#1e3a5f'
      ctx.fillRect(0, 0, SIZE, SIZE)
    }
  } else {
    console.log('[Review Graphic] No background image available, using solid color')
    // No images available, use solid color
    ctx.fillStyle = company.primary_color || '#1e3a5f'
    ctx.fillRect(0, 0, SIZE, SIZE)
  }

  // White card in center
  const cardWidth = 750
  const cardHeight = 550
  const cardX = (SIZE - cardWidth) / 2
  const cardY = (SIZE - cardHeight) / 2
  const cardRadius = 28

  // Card shadow
  ctx.save()
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 20

  ctx.fillStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadius)
  ctx.fill()
  ctx.restore()

  // Review content inside card
  const reviewerName = review.reviewer_name || 'Happy Customer'
  const reviewText = review.review_text || 'Great service!'

  let textY = cardY + 90

  // Stars at top
  const starSize = 32
  const starGap = 12
  const starsWidth = starSize * 5 + starGap * 4
  const starsX = (SIZE - starsWidth) / 2

  ctx.save()
  for (let i = 0; i < 5; i++) {
    const cx = starsX + i * (starSize + starGap) + starSize / 2
    const filled = i < review.rating

    // Draw star shape
    const outerRadius = starSize / 2
    const innerRadius = outerRadius * 0.4
    const spikes = 5

    ctx.beginPath()
    for (let j = 0; j < spikes * 2; j++) {
      const radius = j % 2 === 0 ? outerRadius : innerRadius
      const angle = (Math.PI / 2) * -1 + (j * Math.PI) / spikes
      const x = cx + Math.cos(angle) * radius
      const y_pos = textY + Math.sin(angle) * radius

      if (j === 0) ctx.moveTo(x, y_pos)
      else ctx.lineTo(x, y_pos)
    }
    ctx.closePath()

    ctx.fillStyle = filled ? '#f97316' : '#e5e7eb'
    ctx.fill()
  }
  ctx.restore()

  textY += starSize + 60

  // Review text
  const maxTextWidth = cardWidth - 120
  const textLength = reviewText.length

  // Dynamic sizing - larger for short reviews, smaller for very long
  let fontSize = 38
  let maxLines = 5

  if (textLength > 400) {
    fontSize = 18
    maxLines = 7
  } else if (textLength > 300) {
    fontSize = 20
    maxLines = 6
  } else if (textLength > 200) {
    fontSize = 22
    maxLines = 5
  } else if (textLength > 150) {
    fontSize = 24
    maxLines = 5
  } else if (textLength > 100) {
    fontSize = 26
    maxLines = 5
  } else if (textLength > 50) {
    fontSize = 32
    maxLines = 4
  } else if (textLength > 20) {
    fontSize = 36
    maxLines = 3
  }
  // else defaults to 38px, 5 lines for very short reviews

  ctx.font = `400 ${fontSize}px ${FONT}`
  const lines = wrapText(ctx, reviewText, maxTextWidth)

  // Limit lines and add ellipsis if needed
  let displayLines = lines.slice(0, maxLines)
  if (lines.length > maxLines) {
    let lastLine = displayLines[maxLines - 1]
    // Trim to reasonable length and add ellipsis
    const maxLastLineLength = textLength > 300 ? 60 : 40
    if (lastLine.length > maxLastLineLength) {
      lastLine = lastLine.slice(0, maxLastLineLength).trim()
    }
    displayLines[maxLines - 1] = lastLine + '...'
  }

  ctx.fillStyle = '#374151'
  ctx.font = `400 ${fontSize}px ${FONT}`
  ctx.textAlign = 'center'

  const lineHeight = fontSize * 1.6

  for (const line of displayLines) {
    ctx.fillText(line, SIZE / 2, textY)
    textY += lineHeight
  }

  // Reviewer name at bottom
  ctx.fillStyle = '#6b7280'
  ctx.font = `600 26px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(`— ${reviewerName}`, SIZE / 2, cardY + cardHeight - 60)

  console.log('[Review Graphic] Canvas created, uploading')

  const buffer = canvas.toBuffer('image/png')
  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  console.log('[Review Graphic] Upload complete', { url })

  return url
}
