import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { uploadToR2, createUploadParams } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'
import { generateCaption } from '@/lib/ai/captions'
import { getNextPostingSlot } from '@/lib/posting/scheduler'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const title = formData.get('title') as string | null
    const description = formData.get('description') as string | null
    const location = formData.get('location') as string | null
    const work_type = formData.get('work_type') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Upload to R2
    const { filename } = createUploadParams(file.name, company.slug)
    const buffer = Buffer.from(await file.arrayBuffer())
    const imageUrl = await uploadToR2(buffer, filename, file.type)

    // Create media library entry
    const admin = createAdminClient()
    const { data: media, error } = await admin
      .from('media_library')
      .insert({
        company_id: company.id,
        image_url: imageUrl,
        title: title || null,
        description: description || null,
        location: location || null,
        work_type: work_type || null,
        is_available: true,
        times_posted: 0,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create media entry:', error)
      return NextResponse.json({ error: 'Failed to save media' }, { status: 500 })
    }

    // Schedule a post for this image directly
    try {
      const { data: existingPosts } = await admin
        .from('scheduled_posts')
        .select('scheduled_for')
        .eq('company_id', company.id)
        .eq('status', 'pending')
        .gte('scheduled_for', new Date().toISOString())

      const existingSlots = (existingPosts || []).map((p: { scheduled_for: string }) => new Date(p.scheduled_for))
      const scheduledFor = getNextPostingSlot(existingSlots)

      // Create post with fallback caption first - don't let AI block the insert
      const workType = work_type || company.trade_type || 'work'
      const loc = location || company.city || ''
      const fallbackCaption = `Another great ${workType} project completed${loc ? ` in ${loc}` : ''}. Get in touch for a free quote!\n\n${company.name}${company.phone ? ` | Call: ${company.phone}` : ''}${company.city ? ` | ${company.city}` : ''}`
      const fallbackHashtags = [
        company.trade_type?.toLowerCase().replace(/\s+/g, '') || 'construction',
        'ukbuilder',
        company.city?.toLowerCase().replace(/\s+/g, '') || 'local',
        ...(company.hashtag_preferences || []),
      ]

      console.log('[Media Upload] Creating scheduled post for media:', media.id)

      const { data: post, error: postError } = await admin
        .from('scheduled_posts')
        .insert({
          company_id: company.id,
          media_id: media.id,
          image_url: imageUrl,
          media_type: media.media_type || 'image',
          caption: fallbackCaption,
          hashtags: fallbackHashtags,
          scheduled_for: scheduledFor.toISOString(),
          status: 'pending',
        })
        .select()
        .single()

      if (postError) {
        console.error('[Media Upload] DB insert failed:', JSON.stringify(postError))
      } else {
        console.log('[Media Upload] Post created:', post.id)

        try {
          const { caption, hashtags } = await generateCaption(company, null, media, 'instagram')
          await admin
            .from('scheduled_posts')
            .update({ caption, hashtags })
            .eq('id', post.id)
          console.log('[Media Upload] Caption upgraded with AI')
        } catch (aiErr) {
          console.log('[Media Upload] AI caption failed, keeping fallback:', aiErr)
        }

        // Mark media as used so cron doesn't pick it again
        await admin
          .from('media_library')
          .update({ times_posted: 1, last_posted_at: new Date().toISOString() })
          .eq('id', media.id)
      }
    } catch (scheduleErr) {
      console.error('[Media Upload] Error scheduling post:', scheduleErr)
    }

    return NextResponse.json({ media, url: imageUrl })
  } catch (error) {
    console.error('Media upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
