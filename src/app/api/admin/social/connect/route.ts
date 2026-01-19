import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { hasFeature } from '@/lib/features'
import {
  getInstagramAuthUrl,
  getFacebookAuthUrl,
  getGoogleAuthUrl
} from '@/lib/oauth/config'

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

    if (!hasFeature(company.tier, 'social_connections')) {
      return NextResponse.json({ error: 'Upgrade required' }, { status: 403 })
    }

    const { platform } = await request.json()

    let authUrl: string

    switch (platform) {
      case 'instagram':
        authUrl = getInstagramAuthUrl(company.id)
        break
      case 'facebook':
        authUrl = getFacebookAuthUrl(company.id)
        break
      case 'google':
        authUrl = getGoogleAuthUrl(company.id)
        break
      default:
        return NextResponse.json({ error: 'Invalid platform' }, { status: 400 })
    }

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Connect error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
