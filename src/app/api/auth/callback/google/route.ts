import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { OAUTH_CONFIG, getRedirectUri } from '@/lib/oauth/config'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL

  if (error) {
    return NextResponse.redirect(`${baseUrl}/admin/social?error=google_denied`)
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

    // Exchange code for tokens
    const tokenResponse = await fetch(OAUTH_CONFIG.google.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri('google'),
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData)
      return NextResponse.redirect(`${baseUrl}/admin/social?error=token_failed`)
    }

    // Get business accounts
    const accountsResponse = await fetch(
      'https://mybusinessaccountmanagement.googleapis.com/v1/accounts',
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )
    const accountsData = await accountsResponse.json()

    if (!accountsData.accounts || accountsData.accounts.length === 0) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=no_google_business`)
    }

    const account = accountsData.accounts[0]

    // Get locations for this account
    const locationsResponse = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account.name}/locations`,
      {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      }
    )
    const locationsData = await locationsResponse.json()

    const location = locationsData.locations?.[0]
    const locationName = location?.name || account.name

    // Store tokens
    const admin = createAdminClient()
    const expiresAt = new Date(Date.now() + (tokenData.expires_in || 3600) * 1000).toISOString()

    await admin
      .from('social_tokens')
      .upsert({
        company_id: company.id,
        platform: 'google',
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: expiresAt,
        platform_user_id: account.name,
        platform_username: account.accountName || 'Google Business',
        page_id: locationName,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,platform',
      })

    return NextResponse.redirect(`${baseUrl}/admin/social?success=google`)
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/admin/social?error=unknown`)
  }
}
