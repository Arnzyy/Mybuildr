import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromR2 } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

// GET single project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { data: project, error } = await admin
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (error || !project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT update project
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
    const { title, description, location, project_type, images, is_featured } = body

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('projects')
      .select('company_id')
      .eq('id', id)
      .single()

    if (!existing || existing.company_id !== company.id) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    const { data: project, error } = await admin
      .from('projects')
      .update({
        title,
        description,
        location,
        project_type,
        images,
        featured_image_url: images?.[0] || null,
        is_featured,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }

    return NextResponse.json({ project })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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

    // Get project to delete images
    const { data: project } = await admin
      .from('projects')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }

    // Delete images from R2
    if (project.images && project.images.length > 0) {
      for (const imageUrl of project.images) {
        try {
          await deleteFromR2(imageUrl)
        } catch (e) {
          console.error('Failed to delete image:', imageUrl, e)
        }
      }
    }

    // Delete project
    const { error } = await admin
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
