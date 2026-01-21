import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { hasFeature } from '@/lib/features'

// GET - List all media for company
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, available, unavailable
    const sort = searchParams.get('sort') || 'newest' // newest, oldest, least_posted

    const admin = createAdminClient()
    let query = admin
      .from('media_library')
      .select('*')
      .eq('company_id', company.id)

    // Apply filter
    if (filter === 'available') {
      query = query.eq('is_available', true)
    } else if (filter === 'unavailable') {
      query = query.eq('is_available', false)
    }

    // Apply sort
    if (sort === 'newest') {
      query = query.order('created_at', { ascending: false })
    } else if (sort === 'oldest') {
      query = query.order('created_at', { ascending: true })
    } else if (sort === 'least_posted') {
      query = query.order('times_posted', { ascending: true })
    }

    const { data: media, error } = await query

    if (error) {
      console.error('Failed to fetch media:', error)
      return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 })
    }

    return NextResponse.json({ media: media || [] })
  } catch (error) {
    console.error('Media GET error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// POST - Create new media item
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
    const { image_url, title, description, location, work_type } = body

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: media, error } = await admin
      .from('media_library')
      .insert({
        company_id: company.id,
        image_url,
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
      console.error('Failed to create media:', error)
      return NextResponse.json({ error: 'Failed to create media' }, { status: 500 })
    }

    return NextResponse.json({ media })
  } catch (error) {
    console.error('Media POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
