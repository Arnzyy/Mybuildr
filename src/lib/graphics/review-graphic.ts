// Review graphic generator with proper font loading using node-canvas
import { createCanvas, registerFont, loadImage, CanvasRenderingContext2D } from 'canvas'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Company, Review } from '@/lib/supabase/types'
import path from 'path'
import fs from 'fs'

// =============================================================================
// FONT SETUP - Critical for proper text rendering
// =============================================================================

const FONTS_DIR = path.join(process.cwd(), 'public', 'fonts')

function registerFonts() {
  try {
    const regularFont = path.join(FONTS_DIR, 'Inter-Regular.ttf')
    const boldFont = path.join(FONTS_DIR, 'Inter-Bold.ttf')

    if (fs.existsSync(regularFont)) {
      registerFont(regularFont, { family: 'Inter', weight: 'normal' })
    }
    if (fs.existsSync(boldFont)) {
      registerFont(boldFont, { family: 'Inter', weight: 'bold' })
    }

    return true
  } catch (error) {
    console.error('Font registration failed:', error)
    return false
  }
}

// Register fonts on module load
const fontsRegistered = registerFonts()
const FONT_FAMILY = fontsRegistered ? 'Inter' : 'Arial, Helvetica, sans-serif'

// =============================================================================
// DESIGN CONSTANTS
// =============================================================================

const CANVAS_SIZE = 1080
const STAR_SIZE = 36
const STAR_GAP = 12

const COLORS = {
  text: '#1F2937',
  textLight: '#6B7280',
  star: '#FBBF24',
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  color: string
) {
  const spikes = 5
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.4

  ctx.beginPath()
  ctx.fillStyle = color

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / spikes
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius

    if (i === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  }

  ctx.closePath()
  ctx.fill()
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  fontSize: number
): string[] {
  ctx.font = `normal ${fontSize}px ${FONT_FAMILY}`

  const words = text.split(' ')
  const lines: string[] = []
  let currentLine = ''

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
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

// =============================================================================
// MAIN GRAPHIC GENERATOR
// =============================================================================

export async function generateReviewGraphic(
  company: Company,
  review: Review
): Promise<string> {
  const primaryColor = company.primary_color || '#f97316'

  console.log('[Review Graphic] Starting canvas generation', {
    reviewId: review.id,
    companyId: company.id,
    fontsRegistered
  })

  const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE)
  const ctx = canvas.getContext('2d')

  // Background - white base
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  // Main colored card
  const cardMargin = 40
  const cardRadius = 30

  ctx.fillStyle = primaryColor
  ctx.beginPath()
  ctx.roundRect(cardMargin, cardMargin, CANVAS_SIZE - cardMargin * 2, CANVAS_SIZE - cardMargin * 2, cardRadius)
  ctx.fill()

  // Stars at top
  let currentY = 140
  const totalStarsWidth = (STAR_SIZE * 5) + (STAR_GAP * 4)
  const starsStartX = (CANVAS_SIZE - totalStarsWidth) / 2

  for (let i = 0; i < 5; i++) {
    const starX = starsStartX + (i * (STAR_SIZE + STAR_GAP)) + (STAR_SIZE / 2)
    const color = i < review.rating ? COLORS.star : 'rgba(255,255,255,0.3)'
    drawStar(ctx, starX, currentY, STAR_SIZE, color)
  }

  currentY += 80

  // White quote box
  const boxMargin = 80
  const boxPadding = 40
  const boxWidth = CANVAS_SIZE - boxMargin * 2
  const boxHeight = 400

  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.beginPath()
  ctx.roundRect(boxMargin, currentY, boxWidth, boxHeight, 16)
  ctx.fill()

  // Quote text inside box
  const reviewText = review.review_text || 'Great service!'
  const maxTextWidth = boxWidth - boxPadding * 2
  const fontSize = reviewText.length > 150 ? 24 : 28
  const quotedText = `"${reviewText}"`
  const lines = wrapText(ctx, quotedText, maxTextWidth, fontSize)
  const displayLines = lines.slice(0, 6)

  if (lines.length > 6) {
    displayLines[5] = displayLines[5].slice(0, -3) + '..."'
  }

  ctx.fillStyle = COLORS.text
  ctx.font = `normal ${fontSize}px ${FONT_FAMILY}`
  ctx.textAlign = 'center'

  let textY = currentY + boxPadding + 40
  const lineHeight = fontSize * 1.6

  for (const line of displayLines) {
    ctx.fillText(line, CANVAS_SIZE / 2, textY)
    textY += lineHeight
  }

  // Reviewer name inside box
  ctx.fillStyle = COLORS.textLight
  ctx.font = `bold 22px ${FONT_FAMILY}`
  ctx.fillText(`— ${review.reviewer_name || 'Happy Customer'}`, CANVAS_SIZE / 2, currentY + boxHeight - boxPadding)

  // Company name at bottom
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `bold 28px ${FONT_FAMILY}`
  ctx.textAlign = 'center'
  ctx.fillText(company.name, CANVAS_SIZE / 2, CANVAS_SIZE - 100)

  console.log('[Review Graphic] Canvas created, uploading to R2')

  const buffer = canvas.toBuffer('image/png')
  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  console.log('[Review Graphic] Upload complete', { url })

  return url
}
