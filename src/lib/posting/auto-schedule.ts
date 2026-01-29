import { fillPostQueue, scheduleMediaItem } from './scheduler'
import type { Company, MediaItem } from '@/lib/supabase/types'
import { hasFeature } from '@/lib/features'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Automatically schedule a specific media item immediately on upload.
 * This is the "upload and forget" flow - every upload gets scheduled.
 */
export async function autoScheduleMedia(company: Company, media: MediaItem): Promise<void> {
  try {
    if (!hasFeature(company.tier, 'auto_posting') || !company.posting_enabled) {
      return
    }

    await scheduleMediaItem(company, media)
    console.log('[Auto-Schedule] Scheduled media item for company:', company.slug)
  } catch (error) {
    console.error('[Auto-Schedule] Failed to schedule media item:', {
      error,
      companyId: company.id,
      mediaId: media.id,
    })
  }
}

/**
 * Automatically schedule all media items from a project on upload.
 * Picks one representative image from the project to create a single carousel post.
 */
export async function autoScheduleProject(company: Company, projectId: string): Promise<void> {
  try {
    if (!hasFeature(company.tier, 'auto_posting') || !company.posting_enabled) {
      return
    }

    const supabase = createAdminClient()

    // Get the first media item from this project (it will be used as the carousel representative)
    const { data: media } = await supabase
      .from('media_library')
      .select('*')
      .eq('source_project_id', projectId)
      .eq('is_available', true)
      .or('times_posted.eq.0,times_posted.is.null')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (!media) {
      console.log('[Auto-Schedule] No available media found for project:', projectId)
      return
    }

    await scheduleMediaItem(company, media as MediaItem)

    // Mark all project images as scheduled
    const { data: allProjectMedia } = await supabase
      .from('media_library')
      .select('id, times_posted')
      .eq('source_project_id', projectId)
      .neq('id', media.id)

    if (allProjectMedia) {
      for (const item of allProjectMedia) {
        await supabase
          .from('media_library')
          .update({
            times_posted: (item.times_posted || 0) + 1,
            last_posted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', item.id)
      }
    }

    console.log('[Auto-Schedule] Scheduled project for company:', company.slug)
  } catch (error) {
    console.error('[Auto-Schedule] Failed to schedule project:', {
      error,
      companyId: company.id,
      projectId,
    })
  }
}

/**
 * Fill the post queue (used by cron and generate button).
 * Kept for backwards compatibility.
 */
export async function autoSchedulePosts(company: Company): Promise<void> {
  try {
    if (!hasFeature(company.tier, 'auto_posting') || !company.posting_enabled) {
      return
    }

    await fillPostQueue(company, 14)
    console.log('[Auto-Schedule] Successfully scheduled posts for company:', company.slug)
  } catch (error) {
    console.error('[Auto-Schedule] Failed to auto-schedule posts:', {
      error,
      companyId: company.id,
      companySlug: company.slug
    })
  }
}
