import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'
import { fillPostQueue } from '@/lib/posting/scheduler'

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

    // Auto-schedule posts if company has social features and images were uploaded
    if (images && images.length > 0 && hasFeature(company.tier, 'social_connections')) {
      try {
        // Fill up the post queue (schedules posts for the next week)
        await fillPostQueue(company, company.posts_per_week || 7)
      } catch (scheduleError) {
        console.error('Failed to auto-schedule posts:', scheduleError)
        // Don't fail the request - project was created successfully
      }
    }

    return NextResponse.json({ project })
  } catch (error) {
    console.error('Project create error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
