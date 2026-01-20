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
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/admin/social?error=instagram_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${baseUrl}/admin/social?error=missing_code`)
  }

  try {
    // Verify user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(`${baseUrl}/login?redirect=/admin/social`)
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=no_company`)
    }

    // Verify state matches company ID
    if (state !== company.id) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=invalid_state`)
    }

    // Exchange code for access token
    const tokenResponse = await fetch(OAUTH_CONFIG.instagram.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: getRedirectUri('instagram'),
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(`${baseUrl}/admin/social?error=token_failed`)
    }

    const tokenData = await tokenResponse.json()
    const shortLivedToken = tokenData.access_token

    // Exchange for long-lived token (60 days)
    const longLivedResponse = await fetch(
      `https://graph.facebook.com/v18.0/oauth/access_token?` +
      new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        fb_exchange_token: shortLivedToken,
      })
    )

    const longLivedData = await longLivedResponse.json()
    const accessToken = longLivedData.access_token
    const expiresIn = longLivedData.expires_in || 5184000 // 60 days default

    // Get user's Facebook pages
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}`
    )
    const pagesData = await pagesResponse.json()

    console.log('Pages API response:', JSON.stringify(pagesData, null, 2))

    if (pagesData.error) {
      console.error('Pages API error:', pagesData.error)
      return NextResponse.redirect(`${baseUrl}/admin/social?error=pages_api_error`)
    }

    if (!pagesData.data || pagesData.data.length === 0) {
      console.error('No pages found. Full response:', pagesData)
      return NextResponse.redirect(`${baseUrl}/admin/social?error=no_pages`)
    }

    // Get the first page (or let user choose later)
    const page = pagesData.data[0]
    const pageAccessToken = page.access_token
    const pageId = page.id

    // Get Instagram Business Account linked to the page
    const igAccountResponse = await fetch(
      `https://graph.facebook.com/v18.0/${pageId}?fields=instagram_business_account&access_token=${pageAccessToken}`
    )
    const igAccountData = await igAccountResponse.json()

    if (!igAccountData.instagram_business_account) {
      return NextResponse.redirect(`${baseUrl}/admin/social?error=no_instagram_business`)
    }

    const instagramAccountId = igAccountData.instagram_business_account.id

    // Get Instagram account info
    const igInfoResponse = await fetch(
      `https://graph.facebook.com/v18.0/${instagramAccountId}?fields=username,profile_picture_url&access_token=${pageAccessToken}`
    )
    const igInfo = await igInfoResponse.json()

    // Store tokens in database
    const admin = createAdminClient()
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

    // Upsert social token
    const { error: upsertError } = await admin
      .from('social_tokens')
      .upsert({
        company_id: company.id,
        platform: 'instagram',
        access_token: pageAccessToken,
        refresh_token: null, // Meta doesn't use refresh tokens
        token_expires_at: expiresAt,
        account_id: instagramAccountId,
        account_name: igInfo.username,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,platform',
      })

    if (upsertError) {
      console.error('Instagram token save error:', upsertError)
      return NextResponse.redirect(`${baseUrl}/admin/social?error=save_failed`)
    }

    // Enable posting for the company
    await admin
      .from('companies')
      .update({ posting_enabled: true })
      .eq('id', company.id)

    return NextResponse.redirect(`${baseUrl}/admin/social?success=instagram`)
  } catch (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(`${baseUrl}/admin/social?error=unknown`)
  }
}
