import { createAdminClient } from '@/lib/supabase/admin'
import { generateCaption } from '@/lib/ai/captions'
import { Company, Project } from '@/lib/supabase/types'

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

// Get an unused image from company's projects
async function getUnusedImage(companyId: string): Promise<{
  project: Project
  imageUrl: string
  imageIndex: number
} | null> {
  const supabase = createAdminClient()

  // Get all projects with images
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (!projects || projects.length === 0) return null

  // Find an image that hasn't been posted recently
  for (const project of projects) {
    if (!project.images || project.images.length === 0) continue

    for (let i = 0; i < project.images.length; i++) {
      const imageUrl = project.images[i]

      // Check if this image was posted in the last 30 days
      const { data: recentPost } = await supabase
        .from('scheduled_posts')
        .select('id')
        .eq('image_url', imageUrl)
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .single()

      if (!recentPost) {
        return {
          project: project as Project,
          imageUrl,
          imageIndex: i,
        }
      }
    }
  }

  // If all images used recently, pick random one
  const randomProject = projects[Math.floor(Math.random() * projects.length)]
  if (randomProject.images && randomProject.images.length > 0) {
    const randomIndex = Math.floor(Math.random() * randomProject.images.length)
    return {
      project: randomProject as Project,
      imageUrl: randomProject.images[randomIndex],
      imageIndex: randomIndex,
    }
  }

  return null
}

// Schedule a new post for a company
export async function schedulePost(company: Company): Promise<{
  success: boolean
  postId?: string
  error?: string
}> {
  const supabase = createAdminClient()

  try {
    // Get unused image
    const imageData = await getUnusedImage(company.id)
    if (!imageData) {
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

    // Generate caption
    const { caption, hashtags } = await generateCaption(
      company,
      imageData.project,
      imageData.imageIndex
    )

    // Create scheduled post
    const { data: post, error } = await supabase
      .from('scheduled_posts')
      .insert({
        company_id: company.id,
        project_id: imageData.project.id,
        image_url: imageData.imageUrl,
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
