import { createAdminClient } from '@/lib/supabase/admin'
import { postToInstagram } from './platforms/instagram'
import { postToFacebook } from './platforms/facebook'
import { postToGoogleBusiness } from './platforms/google'

interface PostResult {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

export async function processScheduledPost(postId: string): Promise<boolean> {
  const supabase = createAdminClient()

  // Get the post with company info
  const { data: post, error } = await supabase
    .from('scheduled_posts')
    .select('*, companies(*)')
    .eq('id', postId)
    .single()

  if (error || !post) {
    console.error('Post not found:', postId)
    return false
  }

  // Check if due
  if (new Date(post.scheduled_for) > new Date()) {
    return false
  }

  // Get connected platforms
  const { data: tokens } = await supabase
    .from('social_tokens')
    .select('platform')
    .eq('company_id', post.company_id)
    .eq('is_connected', true)

  const connectedPlatforms = tokens?.map(t => t.platform) || []

  if (connectedPlatforms.length === 0) {
    // No platforms connected, mark as skipped
    await supabase
      .from('scheduled_posts')
      .update({
        status: 'failed',
        error_message: 'No social accounts connected',
      })
      .eq('id', postId)
    return false
  }

  // Build full caption with hashtags
  const fullCaption = post.hashtags && post.hashtags.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`
    : post.caption

  const results: PostResult[] = []

  // Post to each connected platform
  if (connectedPlatforms.includes('instagram')) {
    const result = await postToInstagram(
      post.company_id,
      post.image_url,
      fullCaption,
      post.media_type || 'image'
    )
    results.push({ platform: 'instagram', ...result })

    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ instagram_post_id: result.postId })
        .eq('id', postId)
    }
  }

  if (connectedPlatforms.includes('facebook')) {
    const result = await postToFacebook(post.company_id, post.image_url, fullCaption)
    results.push({ platform: 'facebook', ...result })

    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ facebook_post_id: result.postId })
        .eq('id', postId)
    }
  }

  if (connectedPlatforms.includes('google')) {
    // Google Business doesn't support hashtags well, use plain caption
    const result = await postToGoogleBusiness(post.company_id, post.image_url, post.caption)
    results.push({ platform: 'google', ...result })

    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ google_post_id: result.postId })
        .eq('id', postId)
    }
  }

  // Determine overall status
  const anySuccess = results.some(r => r.success)
  const allFailed = results.every(r => !r.success)

  const newStatus = allFailed ? 'failed' : 'posted'
  const errors = results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`)

  await supabase
    .from('scheduled_posts')
    .update({
      status: newStatus,
      posted_at: anySuccess ? new Date().toISOString() : null,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      retry_count: allFailed ? (post.retry_count || 0) + 1 : post.retry_count,
    })
    .eq('id', postId)

  // Mark image as used (projects table - legacy)
  if (anySuccess && post.project_id) {
    await supabase
      .from('projects')
      .update({
        used_in_post: true,
        last_posted_at: new Date().toISOString(),
      })
      .eq('id', post.project_id)
  }

  // Update media library tracking when post succeeds
  if (anySuccess && post.media_id) {
    await supabase
      .from('media_library')
      .update({
        last_posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.media_id)
  }

  return anySuccess
}

export async function processDuePosts(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const supabase = createAdminClient()

  const { data: duePosts } = await supabase
    .from('scheduled_posts')
    .select('id')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .lt('retry_count', 3)
    .limit(50)

  if (!duePosts || duePosts.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  for (const post of duePosts) {
    const success = await processScheduledPost(post.id)
    if (success) succeeded++
    else failed++

    // Rate limiting - wait between posts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return { processed: duePosts.length, succeeded, failed }
}
