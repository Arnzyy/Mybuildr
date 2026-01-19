import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { getPresignedUploadUrl, createUploadParams } from '@/lib/r2/client'
import { hasFeature } from '@/lib/features'

export async function POST(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.json({ error: 'No company found' }, { status: 404 })
    }

    // Check feature access
    if (!hasFeature(company.tier, 'upload_projects')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const { filename: originalName, contentType } = await request.json()

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    const { filename } = createUploadParams(originalName, company.slug)
    const { uploadUrl, publicUrl } = await getPresignedUploadUrl(filename, contentType)

    return NextResponse.json({ uploadUrl, publicUrl })
  } catch (error) {
    console.error('Presign error:', error)
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 })
  }
}
