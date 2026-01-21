import { createAdminClient } from '@/lib/supabase/admin'
import { generateCaption } from '@/lib/ai/captions'
import { Company, MediaItem } from '@/lib/supabase/types'

// UK timezone
const UK_TIMEZONE = 'Europe/London'

// Optimal posting times (hour in 24h format)
const POSTING_TIMES = [8, 12, 18] // 8am, 12pm, 6pm

// Get next available posting slot
function getNextPostingSlot(
  existingSlots: Date[],
  postsPerWeek: number = 5
): Date {
  const now = new Date()
  const ukNow = new Date(now.toLocaleString('en-US', { timeZone: UK_TIMEZONE }))

  // Start from tomorrow
  const checkDate = new Date(ukNow)
  checkDate.setDate(checkDate.getDate() + 1)
  checkDate.setHours(0, 0, 0, 0)

  // Look for next available slot
  for (let day = 0; day < 14; day++) {
    const date = new Date(checkDate)
    date.setDate(date.getDate() + day)

    // Check each posting time
    for (const hour of POSTING_TIMES) {
      const slot = new Date(date)
      slot.setHours(hour, 0, 0, 0)

      // Skip if in the past
      if (slot <= now) continue

      // Check if slot is already taken
      const slotTaken = existingSlots.some(existing => {
        const existingDate = new Date(existing)
        return Math.abs(existingDate.getTime() - slot.getTime()) < 60 * 60 * 1000 // Within 1 hour
      })

      if (!slotTaken) {
        return slot
      }
    }
  }

  // Fallback: tomorrow at noon
  const fallback = new Date(ukNow)
  fallback.setDate(fallback.getDate() + 1)
  fallback.setHours(12, 0, 0, 0)
  return fallback
}

// Get next available image from media library using rotation logic
async function getNextImage(companyId: string): Promise<MediaItem | null> {
  const supabase = createAdminClient()

  // Get available media items, ordered by times_posted (ascending) and last_posted_at (ascending, nulls first)
  const { data: media } = await supabase
    .from('media_library')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_available', true)
    .order('times_posted', { ascending: true })
    .order('last_posted_at', { ascending: true, nullsFirst: true })
    .limit(10)

  if (!media || media.length === 0) return null

  // If only 1 image, check 14-day cooldown
  if (media.length === 1 && media[0].last_posted_at) {
    const daysSinceLastPost = (Date.now() - new Date(media[0].last_posted_at).getTime()) / (24 * 60 * 60 * 1000)
    if (daysSinceLastPost < 14) {
      // Skip - wait for cooldown period
      return null
    }
  }

  // Pick from least-posted images (those with the same minimum times_posted)
  const minPosted = media[0].times_posted
  const candidates = media.filter(m => m.times_posted === minPosted)
  const selected = candidates[Math.floor(Math.random() * candidates.length)]

  return selected as MediaItem
}

// Update media item after scheduling
async function updateMediaAfterScheduling(mediaId: string): Promise<void> {
  const supabase = createAdminClient()

  // Get current times_posted
  const { data: media } = await supabase
    .from('media_library')
    .select('times_posted')
    .eq('id', mediaId)
    .single()

  if (media) {
    await supabase
      .from('media_library')
      .update({
        times_posted: (media.times_posted || 0) + 1,
        last_posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', mediaId)
  }
}

// Schedule a new post for a company
export async function schedulePost(company: Company): Promise<{
  success: boolean
  postId?: string
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    // Get next image from media library
    const media = await getNextImage(company.id)
    if (!media) {
      return { success: false, error: 'No images available for posting' }
    }

    // Get existing scheduled posts for slot calculation
    const { data: existingPosts } = await supabase
      .from('scheduled_posts')
      .select('scheduled_for')
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .gte('scheduled_for', new Date().toISOString())

    const existingSlots = (existingPosts || []).map(p => new Date(p.scheduled_for))

    // Get next slot
    const scheduledFor = getNextPostingSlot(existingSlots, company.posts_per_week || 5)

    // Generate caption using media item
    const { caption, hashtags } = await generateCaption(
      company,
      null, // No project
      media, // Use media item
      'instagram' // Default platform
    )

    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        project_id: media.source_project_id || null,
        media_id: media.id,
        image_url: media.image_url,
        caption,
        hashtags,
        scheduled_for: scheduledFor.toISOString(),
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create scheduled post:', error)
      return { success: false, error: 'Failed to schedule post' }
    }

    // Update media item tracking
    await updateMediaAfterScheduling(media.id)

    return { success: true, postId: post.id }
  } catch (error) {
    console.error('Schedule post error:', error)
    return { success: false, error: 'Scheduling failed' }
  }
}

// Fill up the post queue for a company
export async function fillPostQueue(
  company: Company,
  targetCount: number = 7 // 1 week ahead
): Promise<number> {
  const supabase = createAdminClient()

  // Count existing pending posts
  const { count: existingCount } = await supabase
    .from('scheduled_posts')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('status', 'pending')
    .gte('scheduled_for', new Date().toISOString())

  const currentCount = existingCount || 0
  const postsNeeded = Math.max(0, targetCount - currentCount)

  let scheduled = 0
  for (let i = 0; i < postsNeeded; i++) {
    const result = await schedulePost(company)
    if (result.success) {
      scheduled++
    } else {
      // Stop if we can't schedule more (e.g., no images)
      break
    }
  }

  return scheduled
}
