import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()

  try {
    // Get posts due for execution
    const { data: duePosts, error } = await supabase
      .from('scheduled_posts')
      .select(`
        *,
        company:companies(*)
      `)
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString())
      .limit(10) // Process in batches

    if (error || !duePosts) {
      return NextResponse.json({ error: 'Failed to fetch due posts' }, { status: 500 })
    }

    const results: { postId: string; status: string; error?: string }[] = []

    for (const post of duePosts) {
      try {
        // TODO: Actually post to social media (ZIP-09)
        // For now, just mark as posted

        // This is where we'll call Instagram/Facebook/Google APIs
        // const instagramResult = await postToInstagram(post)
        // const facebookResult = await postToFacebook(post)
        // const googleResult = await postToGoogle(post)

        // Mark as posted (placeholder until ZIP-09)
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'posted',
            posted_at: new Date().toISOString(),
          })
          .eq('id', post.id)

        // Update project's last_posted_at
        await supabase
          .from('projects')
          .update({
            used_in_post: true,
            last_posted_at: new Date().toISOString(),
          })
          .eq('id', post.project_id)

        results.push({ postId: post.id, status: 'posted' })
      } catch (postError: unknown) {
        const errorMessage = postError instanceof Error ? postError.message : 'Unknown error'
        // Mark as failed
        await supabase
          .from('scheduled_posts')
          .update({
            status: 'failed',
            error_message: errorMessage,
            retry_count: (post.retry_count || 0) + 1,
          })
          .eq('id', post.id)

        results.push({ postId: post.id, status: 'failed', error: errorMessage })
      }
    }

    return NextResponse.json({
      success: true,
      postsProcessed: duePosts.length,
      results,
    })
  } catch (error) {
    console.error('Cron execute-posts error:', error)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}
