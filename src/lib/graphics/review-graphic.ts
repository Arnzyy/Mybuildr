// Professional review graphic generator with premium design
import { createCanvas, registerFont, loadImage, CanvasRenderingContext2D } from 'canvas'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
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

// Draw a star with golden gradient
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  filled: boolean
) {
  const outerRadius = size / 2
  const innerRadius = outerRadius * 0.4
  const spikes = 5

  ctx.save()
  ctx.beginPath()

  for (let i = 0; i < spikes * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / 2) * -1 + (i * Math.PI) / spikes
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius

    if (i === 0) ctx.moveTo(x, y)
    else ctx.lineTo(x, y)
  }

  ctx.closePath()

  if (filled) {
    // Golden gradient
    const gradient = ctx.createLinearGradient(cx - outerRadius, cy - outerRadius, cx + outerRadius, cy + outerRadius)
    gradient.addColorStop(0, '#FFD700')
    gradient.addColorStop(0.5, '#FFC107')
    gradient.addColorStop(1, '#FFB300')
    ctx.fillStyle = gradient
    ctx.fill()

    // Subtle shadow
    ctx.strokeStyle = 'rgba(0,0,0,0.1)'
    ctx.lineWidth = 1
    ctx.stroke()
  } else {
    ctx.fillStyle = '#E8E8E8'
    ctx.fill()
  }

  ctx.restore()
}

// Draw text with shadow for depth
function drawTextWithShadow(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  shadowColor: string = 'rgba(0,0,0,0.1)',
  shadowBlur: number = 4,
  shadowOffsetY: number = 2
) {
  ctx.save()
  ctx.shadowColor = shadowColor
  ctx.shadowBlur = shadowBlur
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = shadowOffsetY
  ctx.fillText(text, x, y)
  ctx.restore()
}

// Word wrap helper
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
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
// MARBLE BACKGROUND
// =============================================================================

function drawMarbleBackground(ctx: CanvasRenderingContext2D) {
  // Base
  ctx.fillStyle = '#FAFAFA'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Gradient overlay
  const gradient = ctx.createRadialGradient(SIZE * 0.3, SIZE * 0.3, 0, SIZE * 0.5, SIZE * 0.5, SIZE)
  gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)')
  gradient.addColorStop(0.5, 'rgba(245, 245, 245, 0.5)')
  gradient.addColorStop(1, 'rgba(235, 235, 235, 0.3)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Texture
  ctx.globalAlpha = 0.03
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * SIZE
    const y = Math.random() * SIZE
    const r = Math.random() * 40 + 10

    const noiseGradient = ctx.createRadialGradient(x, y, 0, x, y, r)
    noiseGradient.addColorStop(0, '#CCCCCC')
    noiseGradient.addColorStop(1, 'transparent')
    ctx.fillStyle = noiseGradient
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }
  ctx.globalAlpha = 1

  // Marble veins
  ctx.globalAlpha = 0.02
  ctx.strokeStyle = '#AAAAAA'
  ctx.lineWidth = 1

  for (let i = 0; i < 8; i++) {
    ctx.beginPath()
    ctx.moveTo(Math.random() * SIZE, 0)

    let x = Math.random() * SIZE
    for (let j = 0; j < 5; j++) {
      x += (Math.random() - 0.5) * 200
      ctx.quadraticCurveTo(
        x,
        (j + 0.5) * (SIZE / 5),
        x + (Math.random() - 0.5) * 100,
        (j + 1) * (SIZE / 5)
      )
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
}

// =============================================================================
// MAIN GENERATOR
// =============================================================================

export async function generateReviewGraphic(
  company: Company,
  review: Review
): Promise<string> {
  const primaryColor = company.primary_color || '#1e3a5f'

  console.log('[Review Graphic] Starting premium generation', {
    reviewId: review.id,
    companyId: company.id,
    fontsLoaded
  })

  loadFonts()

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  // Solid colored background (company's primary color or default)
  ctx.fillStyle = primaryColor
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Header
  let y = 120
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `700 38px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText('CUSTOMER REVIEW', SIZE / 2, y)

  y += 100

  // Stars
  const starSize = 52
  const starGap = 18
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
      const y_pos = y + Math.sin(angle) * radius

      if (j === 0) ctx.moveTo(x, y_pos)
      else ctx.lineTo(x, y_pos)
    }
    ctx.closePath()

    if (filled) {
      ctx.fillStyle = '#FFD700'
      ctx.fill()
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.4)'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }
  ctx.restore()

  y += starSize + 80

  // Quote text
  const reviewText = review.review_text || 'Great service!'
  const maxTextWidth = SIZE - 200
  const textLength = reviewText.length

  // Dynamic font size
  let fontSize = 36
  if (textLength > 200) fontSize = 28
  else if (textLength > 150) fontSize = 30
  else if (textLength > 100) fontSize = 32

  ctx.font = `400 ${fontSize}px ${FONT}`
  const quotedText = `"${reviewText}"`
  const lines = wrapText(ctx, quotedText, maxTextWidth)

  // Limit lines
  let displayLines = lines.slice(0, 5)
  if (lines.length > 5) {
    let lastLine = displayLines[4]
    if (lastLine.length > 40) lastLine = lastLine.slice(0, 40)
    displayLines[4] = lastLine + '..."'
  }

  // Quote text
  ctx.fillStyle = 'rgba(255,255,255,0.95)'
  ctx.font = `400 ${fontSize}px ${FONT}`
  ctx.textAlign = 'center'

  const lineHeight = fontSize * 1.7

  for (const line of displayLines) {
    ctx.fillText(line, SIZE / 2, y)
    y += lineHeight
  }

  y += 60

  // Reviewer name
  const reviewerName = review.reviewer_name || 'Happy Customer'
  ctx.fillStyle = 'rgba(255,255,255,0.85)'
  ctx.font = `600 32px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(`— ${reviewerName}`, SIZE / 2, y)

  // Footer
  const footerY = SIZE - 100

  // Company name centered at bottom
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.font = `700 32px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(company.name, SIZE / 2, footerY)

  console.log('[Review Graphic] Canvas created, uploading')

  const buffer = canvas.toBuffer('image/png')
  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  console.log('[Review Graphic] Upload complete', { url })

  return url
}
