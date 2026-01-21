import Anthropic from '@anthropic-ai/sdk'
import { Company, Project, MediaItem } from '@/lib/supabase/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GeneratedCaption {
  caption: string
  hashtags: string[]
}

export type Platform = 'instagram' | 'facebook' | 'google'

export async function generateCaption(
  company: Company,
  project: Project | null,
  media?: MediaItem | null,
  platform: Platform = 'instagram'
): Promise<GeneratedCaption> {
  // Build context from media or project
  const context = {
    title: media?.title || project?.title || 'Recent work',
    description: media?.description || project?.description || '',
    location: media?.location || project?.location || company.city || 'Local area',
    workType: media?.work_type || project?.project_type || company.trade_type || 'construction work',
  }

  // Build custom guidelines section
  const customGuidelines = company.caption_guidelines
    ? `\n\nAdditional guidelines from the business owner:\n${company.caption_guidelines}`
    : ''

  // Build custom hashtags instruction
  const customHashtagsInstruction = company.hashtag_preferences?.length
    ? `\nAlways include these hashtags: ${company.hashtag_preferences.join(', ')}`
    : ''

  const prompt = `You are a social media manager for a ${company.trade_type || 'construction'} company called "${company.name}" based in ${company.city || 'the UK'}.

Generate a caption for a project photo. The work shown is:
- Title: ${context.title}
- Description: ${context.description || 'No description provided'}
- Location: ${context.location}
- Type: ${context.workType}

Rules:
1. Keep it SHORT - max 2-3 sentences
2. Sound like a real tradesperson, not a marketing agency
3. Be proud of the work but not boastful
4. Include a subtle call to action (contact us, get in touch, etc.)
5. Don't use emojis excessively (1-2 max)
6. Sound authentic, not salesy${customGuidelines}

Also provide 5-8 relevant hashtags for the UK construction/trades market.${customHashtagsInstruction}

Respond in this exact JSON format:
{
  "caption": "Your caption here",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"]
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

    // Parse JSON response
    const parsed = JSON.parse(text)

    // Get the appropriate sign-off for this platform
    let signoff = ''
    if (platform === 'instagram' && company.caption_signoff_instagram) {
      signoff = company.caption_signoff_instagram
    } else if (platform === 'facebook' && company.caption_signoff_facebook) {
      signoff = company.caption_signoff_facebook
    } else if (platform === 'google' && company.caption_signoff_google) {
      signoff = company.caption_signoff_google
    }

    // Append sign-off if configured
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

    // Get sign-off for fallback
    let signoff = ''
    if (platform === 'instagram' && company.caption_signoff_instagram) {
      signoff = `\n\n${company.caption_signoff_instagram}`
    } else if (platform === 'facebook' && company.caption_signoff_facebook) {
      signoff = `\n\n${company.caption_signoff_facebook}`
    } else if (platform === 'google' && company.caption_signoff_google) {
      signoff = `\n\n${company.caption_signoff_google}`
    }

    // Fallback caption
    const fallbackCaption = `Another great ${context.workType} completed${context.location ? ` in ${context.location}` : ''}. Get in touch for a free quote!${signoff}`

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
