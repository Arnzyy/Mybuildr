import Anthropic from '@anthropic-ai/sdk'
import { Company, Project, MediaItem, Review } from '@/lib/supabase/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GeneratedCaption {
  caption: string
  hashtags: string[]
}

export type Platform = 'instagram' | 'facebook' | 'google'

// Generate a default sign-off from company data
function generateDefaultSignoff(company: Company, platform: Platform): string {
  const parts: string[] = []

  // Company name
  parts.push(company.name)

  // Contact info based on platform
  if (platform === 'instagram' || platform === 'facebook') {
    // Social platforms - encourage DMs and calls
    if (company.phone) {
      parts.push(`Call: ${company.phone}`)
    }
  } else if (platform === 'google') {
    // Google Business - include website and phone
    if (company.phone) {
      parts.push(`Call: ${company.phone}`)
    }
  }

  // Location
  if (company.city) {
    parts.push(company.city)
  }

  return parts.join(' | ')
}

export async function generateCaption(
  company: Company,
  project: Project | null,
  media?: MediaItem | null,
  platform: Platform = 'instagram'
): Promise<GeneratedCaption> {
  // Get the image URL to analyze
  const imageUrl = media?.image_url || project?.featured_image_url || project?.images?.[0]

  // Build context hints from media or project (used as hints, not facts)
  const contextHints = {
    title: media?.title || project?.title || null,
    description: media?.description || project?.description || null,
    location: media?.location || project?.location || company.city || null,
    workType: media?.work_type || project?.project_type || company.trade_type || null,
  }

  // Build custom guidelines section
  const customGuidelines = company.caption_guidelines
    ? `\n\nAdditional guidelines from the business owner:\n${company.caption_guidelines}`
    : ''

  // Build custom hashtags instruction
  const customHashtagsInstruction = company.hashtag_preferences?.length
    ? `\nAlways include these hashtags: ${company.hashtag_preferences.join(', ')}`
    : ''

  // Context hints section - only include if we have data
  const hintsSection = []
  if (contextHints.title) hintsSection.push(`- Title hint: ${contextHints.title}`)
  if (contextHints.description) hintsSection.push(`- Description hint: ${contextHints.description}`)
  if (contextHints.location) hintsSection.push(`- Location hint: ${contextHints.location}`)
  if (contextHints.workType) hintsSection.push(`- Work type hint: ${contextHints.workType}`)

  const prompt = `You are a social media manager for a ${company.trade_type || 'construction'} company called "${company.name}" based in ${company.city || 'the UK'}.

Analyze this image and write a caption for it.

${hintsSection.length > 0 ? `Context hints (use only if they match what you see in the image):\n${hintsSection.join('\n')}\n` : ''}

CRITICAL RULES - YOU MUST FOLLOW THESE:
1. ONLY describe what you can actually SEE in the image - never make up details
2. If you cannot clearly identify something, be vague rather than specific
3. NEVER invent specifics like "custom oak cabinets" unless you can clearly see oak wood
4. NEVER claim specific materials, brands, or techniques unless clearly visible
5. Use general terms like "quality finish", "professional work", "great result" rather than inventing details
6. If the image is unclear, focus on the general impression rather than specifics
7. Keep it SHORT - max 2-3 sentences
8. Sound like a real tradesperson, not a marketing agency
9. Be proud of the work but not boastful
10. Include a subtle call to action (contact us, get in touch, etc.)
11. Don't use emojis excessively (1-2 max)
12. Sound authentic, not salesy${customGuidelines}

Also provide 5-8 relevant hashtags for the UK construction/trades market based on what you see.${customHashtagsInstruction}

Respond in this exact JSON format:
{
  "caption": "Your caption here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
}

Only respond with the JSON, nothing else.`

  try {
    // Build message content - use vision if we have an image URL
    const messageContent: Anthropic.MessageCreateParams['messages'][0]['content'] = imageUrl
      ? [
          {
            type: 'image',
            source: {
              type: 'url',
              url: imageUrl,
            },
          },
          {
            type: 'text',
            text: prompt,
          },
        ]
      : prompt

    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        { role: 'user', content: messageContent }
      ],
    })

    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    // Parse JSON response
    const parsed = JSON.parse(text)

    // Get the appropriate sign-off for this platform (only if enabled)
    let signoff = ''
    if (company.caption_signoff_enabled !== false) {
      // Check for custom sign-off first
      if (platform === 'instagram' && company.caption_signoff_instagram) {
        signoff = company.caption_signoff_instagram
      } else if (platform === 'facebook' && company.caption_signoff_facebook) {
        signoff = company.caption_signoff_facebook
      } else if (platform === 'google' && company.caption_signoff_google) {
        signoff = company.caption_signoff_google
      } else {
        // No custom sign-off, generate default from company data
        signoff = generateDefaultSignoff(company, platform)
      }
    }

    // Append sign-off if we have one
    let finalCaption = parsed.caption
    if (signoff) {
      finalCaption = `${finalCaption}\n\n${signoff}`
    }

    // Merge custom hashtags with generated ones
    const generatedHashtags = parsed.hashtags.map((h: string) => h.replace('#', ''))
    const customHashtags = company.hashtag_preferences || []
    const allHashtags = [...new Set([...generatedHashtags, ...customHashtags])]

    return {
      caption: finalCaption,
      hashtags: allHashtags,
    }
  } catch (error) {
    console.error('Caption generation failed:', error)

    // Get sign-off for fallback (only if enabled)
    let signoff = ''
    if (company.caption_signoff_enabled !== false) {
      if (platform === 'instagram' && company.caption_signoff_instagram) {
        signoff = company.caption_signoff_instagram
      } else if (platform === 'facebook' && company.caption_signoff_facebook) {
        signoff = company.caption_signoff_facebook
      } else if (platform === 'google' && company.caption_signoff_google) {
        signoff = company.caption_signoff_google
      } else {
        signoff = generateDefaultSignoff(company, platform)
      }
    }

    // Fallback caption
    const workType = contextHints.workType || 'work'
    const location = contextHints.location
    let fallbackCaption = `Another great ${workType} completed${location ? ` in ${location}` : ''}. Get in touch for a free quote!`
    if (signoff) {
      fallbackCaption = `${fallbackCaption}\n\n${signoff}`
    }

    return {
      caption: fallbackCaption,
      hashtags: [
        company.trade_type?.toLowerCase().replace(/\s+/g, '') || 'construction',
        'ukbuilder',
        'tradesman',
        company.city?.toLowerCase().replace(/\s+/g, '') || 'local',
        'qualitywork',
        ...(company.hashtag_preferences || []),
      ],
    }
  }
}

// Generate multiple caption variants
export async function generateCaptionVariants(
  company: Company,
  project: Project | null,
  media?: MediaItem | null,
  platform: Platform = 'instagram',
  count: number = 3
): Promise<GeneratedCaption[]> {
  const variants: GeneratedCaption[] = []

  for (let i = 0; i < count; i++) {
    const caption = await generateCaption(company, project, media, platform)
    variants.push(caption)
  }

  return variants
}

// Generate caption for a review post
export async function generateReviewCaption(
  company: Company,
  review: Review,
  platform: Platform = 'instagram'
): Promise<GeneratedCaption> {
  const stars = '⭐'.repeat(review.rating)
  const reviewerName = review.reviewer_name || 'Happy Customer'
  const reviewText = review.review_text || ''
  const truncatedReview = reviewText.length > 100 ? reviewText.substring(0, 100) + '...' : reviewText

  // Build custom guidelines section
  const customGuidelines = company.caption_guidelines
    ? `\n\nAdditional guidelines from the business owner:\n${company.caption_guidelines}`
    : ''

  const prompt = `You are a social media manager for a ${company.trade_type || 'construction'} company called "${company.name}" based in ${company.city || 'the UK'}.

Write a short caption to share this customer review:
- Rating: ${review.rating}/5 stars
- Customer: ${reviewerName}
- Review: "${truncatedReview}"
${review.source && review.source !== 'manual' ? `- Source: ${review.source}` : ''}

CRITICAL RULES:
1. Keep it SHORT - max 2 sentences before the review excerpt
2. Express genuine gratitude for the feedback
3. DON'T repeat the entire review - just reference it
4. Sound authentic, not corporate
5. Include a subtle call to action
6. Don't use emojis excessively (1-2 max)${customGuidelines}

Provide 4-6 relevant hashtags for the UK construction/trades market.

Respond in this exact JSON format:
{
  "caption": "Your caption here",
  "hashtags": ["hashtag1", "hashtag2"]
}

Only respond with the JSON, nothing else.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 300,
      messages: [
        { role: 'user', content: prompt }
      ],
    })

    const text = response.content[0].type === 'text'
      ? response.content[0].text
      : ''

    const parsed = JSON.parse(text)

    // Get sign-off (same logic as regular captions)
    let signoff = ''
    if (company.caption_signoff_enabled !== false) {
      if (platform === 'instagram' && company.caption_signoff_instagram) {
        signoff = company.caption_signoff_instagram
      } else if (platform === 'facebook' && company.caption_signoff_facebook) {
        signoff = company.caption_signoff_facebook
      } else if (platform === 'google' && company.caption_signoff_google) {
        signoff = company.caption_signoff_google
      } else {
        signoff = generateDefaultSignoff(company, platform)
      }
    }

    let finalCaption = parsed.caption
    if (signoff) {
      finalCaption = `${finalCaption}\n\n${signoff}`
    }

    const generatedHashtags = parsed.hashtags.map((h: string) => h.replace('#', ''))
    const customHashtags = company.hashtag_preferences || []
    const allHashtags = [...new Set([...generatedHashtags, ...customHashtags, 'customerreview', 'testimonial'])]

    return {
      caption: finalCaption,
      hashtags: allHashtags,
    }
  } catch (error) {
    console.error('Review caption generation failed:', error)

    // Fallback caption
    let signoff = ''
    if (company.caption_signoff_enabled !== false) {
      signoff = generateDefaultSignoff(company, platform)
    }

    let fallbackCaption = `${stars} Another happy customer! Thank you ${reviewerName} for the wonderful feedback. We love hearing from our customers!`
    if (signoff) {
      fallbackCaption = `${fallbackCaption}\n\n${signoff}`
    }

    return {
      caption: fallbackCaption,
      hashtags: [
        'customerreview',
        'testimonial',
        'happycustomer',
        company.trade_type?.toLowerCase().replace(/\s+/g, '') || 'construction',
        company.city?.toLowerCase().replace(/\s+/g, '') || 'local',
        ...(company.hashtag_preferences || []),
      ],
    }
  }
}
