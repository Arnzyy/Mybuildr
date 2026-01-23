import { createAdminClient } from '@/lib/supabase/admin'
import { generateCaption, generateReviewCaption } from '@/lib/ai/captions'
import { generateReviewGraphic } from '@/lib/graphics/review-graphic'
import { Company, MediaItem, Review } from '@/lib/supabase/types'

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

// Get next eligible review for posting
async function getNextReview(companyId: string, minRating: number): Promise<Review | null> {
  const supabase = createAdminClient()

  // Get eligible reviews ordered by least-posted first
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .gte('rating', minRating)
    .not('review_text', 'is', null)
    .order('used_in_post', { ascending: true })
    .order('last_posted_at', { ascending: true, nullsFirst: true })
    .limit(10)

  if (!reviews || reviews.length === 0) return null

  // If all reviews have been posted, check for 30-day cooldown on least-recent
  const unpostedReviews = reviews.filter(r => !r.used_in_post)
  if (unpostedReviews.length > 0) {
    // Pick a random unposted review
    return unpostedReviews[Math.floor(Math.random() * unpostedReviews.length)] as Review
  }

  // All have been posted - check cooldown on oldest posted
  const oldestPosted = reviews[0]
  if (oldestPosted.last_posted_at) {
    const daysSince = (Date.now() - new Date(oldestPosted.last_posted_at).getTime()) / (24 * 60 * 60 * 1000)
    if (daysSince < 30) {
      return null // All reviews on cooldown
    }
  }

  return oldestPosted as Review
}

// Update review after scheduling
async function updateReviewAfterScheduling(reviewId: string): Promise<void> {
  const supabase = createAdminClient()

  await supabase
    .from('reviews')
    .update({
      used_in_post: true,
      last_posted_at: new Date().toISOString(),
    })
    .eq('id', reviewId)
}

// Decide whether next post should be a review (roughly every 3rd post)
async function shouldPostReview(companyId: string): Promise<boolean> {
  const supabase = createAdminClient()

  // Count recent posts to determine if we should post a review
  const { data: recentPosts } = await supabase
    .from('scheduled_posts')
    .select('review_id')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })
    .limit(3)

  if (!recentPosts || recentPosts.length === 0) return false

  // If last 2 posts were images (no review_id), next should be a review
  const recentReviewCount = recentPosts.filter(p => p.review_id).length
  return recentReviewCount === 0 && recentPosts.length >= 2
}

// Schedule a new post for a company
export async function schedulePost(company: Company): Promise<{
  success: boolean
  postId?: string
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    // Get existing scheduled posts for slot calculation
    const { data: existingPosts } = await supabase
      .from('scheduled_posts')
      .select('scheduled_for')
      .eq('company_id', company.id)
      .eq('status', 'pending')
      .gte('scheduled_for', new Date().toISOString())

    const existingSlots = (existingPosts || []).map(p => new Date(p.scheduled_for))
    const scheduledFor = getNextPostingSlot(existingSlots, company.posts_per_week || 5)

    // Decide whether to post a review or image
    const postReview = company.review_posting_enabled && await shouldPostReview(company.id)

    if (postReview) {
      // Try to get a review to post
      const review = await getNextReview(company.id, company.review_min_rating || 4)

      if (review) {
        // Generate review graphic if not already created
        let graphicUrl = review.graphic_url
        if (!graphicUrl) {
          graphicUrl = await generateReviewGraphic(company, review)
          // Save graphic URL to review
          await supabase
            .from('reviews')
            .update({ graphic_url: graphicUrl })
            .eq('id', review.id)
        }

        // Generate caption for review
        const { caption, hashtags } = await generateReviewCaption(company, review)

        // Create scheduled post for review
        const { data: post, error } = await supabase
          .from('scheduled_posts')
          .insert({
            company_id: company.id,
            review_id: review.id,
            image_url: graphicUrl,
            media_type: 'image',
            caption,
            hashtags,
            scheduled_for: scheduledFor.toISOString(),
            status: 'pending',
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create review post:', error)
          // Fall through to try image post
        } else {
          await updateReviewAfterScheduling(review.id)
          return { success: true, postId: post.id }
        }
      }
    }

    // Post an image (default or fallback)
    const media = await getNextImage(company.id)
    if (!media) {
      return { success: false, error: 'No images available for posting' }
    }

    // Generate caption using media item
    const { caption, hashtags } = await generateCaption(
      company,
      null,
      media,
      'instagram'
    )

    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        project_id: media.source_project_id || null,
        media_id: media.id,
        image_url: media.image_url,
        media_type: media.media_type || 'image',
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
