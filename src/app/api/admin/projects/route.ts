import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'
import { generateCaption } from '@/lib/ai/captions'
import { getNextPostingSlot } from '@/lib/posting/scheduler'

// GET all projects
export async function GET() {
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

    const admin = createAdminClient()
    const { data: projects, error } = await admin
      .from('projects')
      .select('*')
      .eq('company_id', company.id)
      .order('display_order', { ascending: true })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Projects fetch error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST create new project
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

    const body = await request.json()
    const { title, description, location, project_type, images } = body

    if (!title) {
      return NextResponse.json({ error: 'Title required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Get max display order
    const { data: maxOrder } = await admin
      .from('projects')
      .select('display_order')
      .eq('company_id', company.id)
      .order('display_order', { ascending: false })
      .limit(1)
      .single()

    const nextOrder = (maxOrder?.display_order || 0) + 1

    const { data: project, error } = await admin
      .from('projects')
      .insert({
        company_id: company.id,
        title,
        description,
        location,
        project_type,
        images: images || [],
        featured_image_url: images?.[0] || null,
        display_order: nextOrder,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create project:', error)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    // Schedule a post for this project directly - no indirection, no silent failures
    if (images && images.length > 0 && project) {
      try {
        // Get existing pending posts to find the next available slot
        const { data: existingPosts } = await admin
          .from('scheduled_posts')
          .select('scheduled_for')
          .eq('company_id', company.id)
          .eq('status', 'pending')
          .gte('scheduled_for', new Date().toISOString())

        const existingSlots = (existingPosts || []).map((p: { scheduled_for: string }) => new Date(p.scheduled_for))
        const scheduledFor = getNextPostingSlot(existingSlots)

        // Generate caption using the project context
        const mediaContext = {
          id: project.id,
          company_id: company.id,
          image_url: images[0],
          title: title,
          description: description || null,
          location: location || null,
          work_type: project_type || null,
          media_type: 'image' as const,
          is_available: true,
          times_posted: 0,
          source_project_id: project.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_posted_at: null,
        }

        const { caption, hashtags } = await generateCaption(company, null, mediaContext, 'instagram')

        // Create the scheduled post directly
        const { data: post, error: postError } = await admin
          .from('scheduled_posts')
          .insert({
            company_id: company.id,
            project_id: project.id,
            image_url: images[0],
            media_type: 'image',
            caption,
            hashtags,
            scheduled_for: scheduledFor.toISOString(),
            status: 'pending',
          })
          .select()
          .single()

        if (postError) {
          console.error('[Projects] Failed to create scheduled post:', postError)
        } else {
          console.log('[Projects] Scheduled post', post.id, 'for', scheduledFor.toISOString())
        }
      } catch (scheduleErr) {
        console.error('[Projects] Error scheduling post:', scheduleErr)
      }
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
