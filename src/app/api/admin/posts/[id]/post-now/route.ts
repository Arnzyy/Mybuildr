import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { postToInstagram, postCarouselToInstagram } from '@/lib/posting/platforms/instagram'
import { postToFacebook, postCarouselToFacebook } from '@/lib/posting/platforms/facebook'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const company = await getCompanyForUser(user.email!)
  if (!company) {
    return NextResponse.json({ error: 'Company not found' }, { status: 404 })
  }

  const { id } = await params
  const admin = createAdminClient()

  // Get the post
  const { data: post, error } = await admin
    .from('scheduled_posts')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  if (post.status !== 'pending') {
    return NextResponse.json({ error: 'Post has already been processed' }, { status: 400 })
  }

  // Get connected platforms
  const { data: tokens } = await admin
    .from('social_tokens')
    .select('platform')
    .eq('company_id', company.id)
    .eq('is_connected', true)

  const connectedPlatforms = tokens?.map(t => t.platform) || []

  if (connectedPlatforms.length === 0) {
    return NextResponse.json({ error: 'No social accounts connected' }, { status: 400 })
  }

  // Build full caption with hashtags
  const fullCaption = post.hashtags && post.hashtags.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`
    : post.caption

  // Check if this is a carousel post
  let isCarousel = false
  let imageUrls: string[] = [post.image_url]

  if (post.project_id) {
    const { data: project } = await admin
      .from('projects')
      .select('images')
      .eq('id', post.project_id)
      .single()

    if (project && project.images && project.images.length > 1) {
      isCarousel = true
      imageUrls = project.images
    }
  }

  interface PostResult {
    platform: string
    success: boolean
    postId?: string
    error?: string
  }

  const results: PostResult[] = []

  // Post to Instagram
  if (connectedPlatforms.includes('instagram')) {
    const result = isCarousel
      ? await postCarouselToInstagram(company.id, imageUrls, fullCaption)
      : await postToInstagram(company.id, post.image_url, fullCaption, post.media_type || 'image')

    results.push({ platform: 'instagram', ...result })

    if (result.success && result.postId) {
      await admin
        .from('scheduled_posts')
        .update({ instagram_post_id: result.postId })
        .eq('id', id)
    }
  }

  // Post to Facebook
  if (connectedPlatforms.includes('facebook')) {
    const result = isCarousel
      ? await postCarouselToFacebook(company.id, imageUrls, fullCaption)
      : await postToFacebook(company.id, post.image_url, fullCaption)

    results.push({ platform: 'facebook', ...result })

    if (result.success && result.postId) {
      await admin
        .from('scheduled_posts')
        .update({ facebook_post_id: result.postId })
        .eq('id', id)
    }
  }

  // Determine overall status
  const anySuccess = results.some(r => r.success)
  const allFailed = results.every(r => !r.success)

  const newStatus = allFailed ? 'failed' : 'posted'
  const errors = results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`)

  await admin
    .from('scheduled_posts')
    .update({
      status: newStatus,
      posted_at: anySuccess ? new Date().toISOString() : null,
      error_message: errors.length > 0 ? errors.join('; ') : null,
    })
    .eq('id', id)

  // Update media library tracking
  if (anySuccess && post.media_id) {
    await admin
      .from('media_library')
      .update({
        last_posted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.media_id)
  }

  // Update project tracking
  if (anySuccess && post.project_id) {
    await admin
      .from('projects')
      .update({
        used_in_post: true,
        last_posted_at: new Date().toISOString(),
      })
      .eq('id', post.project_id)
  }

  if (allFailed) {
    return NextResponse.json({
      error: 'Failed to post',
      details: errors
    }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    results,
    message: `Posted to ${results.filter(r => r.success).map(r => r.platform).join(', ')}`
  })
}
