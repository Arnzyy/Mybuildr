import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { deleteFromR2 } from '@/lib/r2/client'

// GET - Get single media item
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
    const { data: media, error } = await admin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (error || !media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Media GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// PUT - Update media item
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

    const body = await request.json()
    const { title, description, location, work_type, is_available } = body

    const admin = createAdminClient()

    // Verify ownership
    const { data: existing } = await admin
      .from('media_library')
      .select('company_id')
      .eq('id', id)
      .single()

    if (!existing || existing.company_id !== company.id) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const { data: media, error } = await admin
      .from('media_library')
      .update({
        title,
        description,
        location,
        work_type,
        is_available: is_available !== undefined ? is_available : true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update media:', error)
      return NextResponse.json({ error: 'Failed to update media' }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Media PUT error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Delete media item
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

    // Get media to delete image from R2
    const { data: media } = await admin
      .from('media_library')
      .select('*')
      .eq('id', id)
      .eq('company_id', company.id)
      .single()

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Delete image from R2
    try {
      await deleteFromR2(media.image_url)
    } catch (e) {
      console.error('Failed to delete image from R2:', e)
      // Continue with database deletion even if R2 fails
    }

    // Delete from database
    const { error } = await admin
      .from('media_library')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete media:', error)
      return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Media DELETE error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
