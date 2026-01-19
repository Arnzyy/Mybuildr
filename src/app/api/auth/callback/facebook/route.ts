import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { OAUTH_CONFIG } from '@/lib/oauth/config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL

  if (error) {
    return NextResponse.redirect(`${baseUrl}/admin/social?error=facebook_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/admin/social?error=missing_code`)
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login`)
    }

    const company = await getCompanyForUser(user.email!)
    if (!company || state !== company.id) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=invalid_state`)
    }

    // Exchange code for token
    const tokenResponse = await fetch(OAUTH_CONFIG.facebook.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.facebook.redirectUri,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    // Get long-lived token
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: tokenData.access_token,
      })
    )

    const longLivedData = await longLivedResponse.json()
    const accessToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000

    // Get pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )
    const pagesData = await pagesResponse.json()

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=no_pages`)
    }

    const page = pagesData.data[0]

    // Get page info
    const pageInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${page.id}?fields=name,picture&access_token=${page.access_token}`
    )
    const pageInfo = await pageInfoResponse.json()

    // Store token
    const admin = createAdminClient()
    await admin
      .from('social_tokens')
      .upsert({
        company_id: company.id,
        platform: 'facebook',
        access_token: page.access_token,
        expires_at: new Date(Date.now() + expiresIn * 1000).toISOString(),
        platform_user_id: page.id,
        platform_username: pageInfo.name,
        platform_avatar_url: pageInfo.picture?.data?.url,
        page_id: page.id,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,platform',
      })

    return NextResponse.redirect(`${baseUrl}/admin/social?success=facebook`)
  } catch (error) {
    console.error('Facebook OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/admin/social?error=unknown`)
  }
}
