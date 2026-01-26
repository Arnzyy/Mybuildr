import { fillPostQueue } from './scheduler'
import type { Company } from '@/lib/supabase/types'
import { hasFeature } from '@/lib/features'

/**
 * Automatically generates and schedules posts for a company
 * Called when new content is uploaded (projects, media, reviews)
 * Silently fails if posting is disabled or company doesn't have the feature
 */
export async function autoSchedulePosts(company: Company): Promise<void> {
  try {
    // Only auto-schedule if company has the feature
    if (!hasFeature(company.tier, 'auto_posting')) {
      return
    }

    // Only auto-schedule if posting is enabled
    if (!company.posting_enabled) {
      return
    }

    // Fill queue with 14 days of posts
    await fillPostQueue(company, 14)

    console.log('[Auto-Schedule] Successfully scheduled posts for company:', company.slug)
  } catch (error) {
    // Log but don't throw - we don't want upload failures due to scheduling issues
    console.error('[Auto-Schedule] Failed to auto-schedule posts:', {
      error,
      companyId: company.id,
      companySlug: company.slug
    })
  }
}
