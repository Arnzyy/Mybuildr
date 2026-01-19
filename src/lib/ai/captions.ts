import Anthropic from '@anthropic-ai/sdk'
import { Company, Project } from '@/lib/supabase/types'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface GeneratedCaption {
  caption: string
  hashtags: string[]
}

export async function generateCaption(
  company: Company,
  project: Project,
  imageIndex: number = 0
): Promise<GeneratedCaption> {
  const prompt = `You are a social media manager for a ${company.trade_type || 'construction'} company called "${company.name}" based in ${company.city || 'the UK'}.

Generate an Instagram caption for a project photo. The project is:
- Title: ${project.title}
- Description: ${project.description || 'No description provided'}
- Location: ${project.location || company.city || 'Local area'}
- Type: ${project.project_type || 'construction work'}

Rules:
1. Keep it SHORT - max 2-3 sentences
2. Sound like a real tradesperson, not a marketing agency
3. Be proud of the work but not boastful
4. Include a subtle call to action (contact us, get in touch, etc.)
5. Don't use emojis excessively (1-2 max)
6. Sound authentic, not salesy

Also provide 5-8 relevant hashtags for the UK construction/trades market.

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

    return {
      caption: parsed.caption,
      hashtags: parsed.hashtags.map((h: string) => h.replace('#', '')),
    }
  } catch (error) {
    console.error('Caption generation failed:', error)

    // Fallback caption
    return {
      caption: `Another great ${project.project_type || 'project'} completed${project.location ? ` in ${project.location}` : ''}. Get in touch for a free quote!`,
      hashtags: [
        company.trade_type?.toLowerCase().replace(/\s+/g, '') || 'construction',
        'ukbuilder',
        'tradesman',
        company.city?.toLowerCase().replace(/\s+/g, '') || 'local',
        'qualitywork',
      ],
    }
  }
}

// Generate multiple caption variants
export async function generateCaptionVariants(
  company: Company,
  project: Project,
  count: number = 3
): Promise<GeneratedCaption[]> {
  const variants: GeneratedCaption[] = []

  for (let i = 0; i < count; i++) {
    const caption = await generateCaption(company, project, i)
    variants.push(caption)
  }

  return variants
}
