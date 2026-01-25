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
  const primaryColor = company.primary_color || '#2563EB'

  console.log('[Review Graphic] Starting premium generation', {
    reviewId: review.id,
    companyId: company.id,
    fontsLoaded
  })

  loadFonts()

  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')

  // Background
  drawMarbleBackground(ctx)

  // Header
  let y = 100
  ctx.fillStyle = '#1a1a1a'
  ctx.font = `600 34px ${FONT}`
  ctx.textAlign = 'center'
  drawTextWithShadow(ctx, '#CustomerReview', SIZE / 2, y, 'rgba(0,0,0,0.05)', 2, 1)

  y += 90

  // Stars
  const starSize = 48
  const starGap = 16
  const starsWidth = starSize * 5 + starGap * 4
  const starsX = (SIZE - starsWidth) / 2

  for (let i = 0; i < 5; i++) {
    const cx = starsX + i * (starSize + starGap) + starSize / 2
    drawStar(ctx, cx, y, starSize, i < review.rating)
  }

  y += starSize + 70

  // Quote text
  const reviewText = review.review_text || 'Great service!'
  const maxTextWidth = SIZE - 180
  const textLength = reviewText.length

  // Dynamic font size
  let fontSize = 42
  if (textLength > 200) fontSize = 30
  else if (textLength > 150) fontSize = 34
  else if (textLength > 100) fontSize = 38

  ctx.font = `400 ${fontSize}px ${FONT}`
  const lines = wrapText(ctx, reviewText, maxTextWidth)

  // Limit lines
  let displayLines = lines.slice(0, 6)
  if (lines.length > 6) {
    let lastLine = displayLines[5]
    if (lastLine.length > 35) lastLine = lastLine.slice(0, 35)
    displayLines[5] = lastLine + '...'
  }

  // Opening quote mark
  ctx.fillStyle = primaryColor
  ctx.font = `700 80px Georgia, serif`
  ctx.globalAlpha = 0.15
  ctx.fillText('"', SIZE / 2 - ctx.measureText(displayLines[0] || '').width / 2 - 30, y + 10)
  ctx.globalAlpha = 1

  // Quote text
  ctx.fillStyle = '#2D3748'
  ctx.font = `400 ${fontSize}px ${FONT}`
  ctx.textAlign = 'center'

  const lineHeight = fontSize * 1.6

  for (const line of displayLines) {
    ctx.fillText(line, SIZE / 2, y)
    y += lineHeight
  }

  y += 30

  // Avatar with initials
  const avatarSize = 80
  const avatarX = SIZE / 2
  const avatarY = y + avatarSize / 2

  ctx.save()

  // Outer ring
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2 + 4, 0, Math.PI * 2)
  ctx.fillStyle = primaryColor
  ctx.fill()

  // Inner circle
  ctx.beginPath()
  ctx.arc(avatarX, avatarY, avatarSize / 2, 0, Math.PI * 2)

  const avatarGradient = ctx.createLinearGradient(
    avatarX - avatarSize/2, avatarY - avatarSize/2,
    avatarX + avatarSize/2, avatarY + avatarSize/2
  )
  avatarGradient.addColorStop(0, '#F3F4F6')
  avatarGradient.addColorStop(1, '#E5E7EB')
  ctx.fillStyle = avatarGradient
  ctx.fill()

  // Initials
  const reviewerName = review.reviewer_name || 'Happy Customer'
  const initials = reviewerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  ctx.fillStyle = '#4B5563'
  ctx.font = `600 32px ${FONT}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(initials, avatarX, avatarY)
  ctx.textBaseline = 'alphabetic'

  ctx.restore()

  y += avatarSize + 25

  // Reviewer name
  ctx.fillStyle = '#1F2937'
  ctx.font = `600 28px ${FONT}`
  ctx.textAlign = 'center'
  ctx.fillText(reviewerName, SIZE / 2, y)

  // Footer
  const footerY = SIZE - 80

  // Company name
  ctx.fillStyle = primaryColor
  ctx.font = `700 26px ${FONT}`
  ctx.textAlign = 'left'
  ctx.fillText(company.name, 90, footerY + 8)

  // Logo placeholder
  ctx.save()
  ctx.fillStyle = '#1a1a1a'
  ctx.font = `700 18px ${FONT}`
  ctx.textAlign = 'center'

  const placeholderWidth = 80
  const placeholderHeight = 40
  const placeholderX = SIZE - 90 - placeholderWidth/2

  ctx.strokeStyle = '#1a1a1a'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.roundRect(placeholderX, footerY - placeholderHeight/2, placeholderWidth, placeholderHeight, 8)
  ctx.stroke()

  ctx.fillText('LOGO', SIZE - 90, footerY + 6)
  ctx.restore()

  // Subtle line
  ctx.strokeStyle = 'rgba(0,0,0,0.05)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(90, footerY - 40)
  ctx.lineTo(SIZE - 90, footerY - 40)
  ctx.stroke()

  console.log('[Review Graphic] Canvas created, uploading')

  const buffer = canvas.toBuffer('image/png')
  const { filename } = createUploadParams(`review-${review.id}.png`, company.slug)
  const url = await uploadToR2(buffer, `graphics/${filename}`, 'image/png')

  console.log('[Review Graphic] Upload complete', { url })

  return url
}
