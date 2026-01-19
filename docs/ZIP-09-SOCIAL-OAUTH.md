# ZIP-09: Social OAuth (Instagram/Facebook/Google)

> **Time**: ~5 hours  
> **Outcome**: Connect social accounts, actually post to platforms  
> **Dependencies**: ZIP-08 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Instagram Business OAuth connection
- ✅ Facebook Page OAuth connection
- ✅ Google Business Profile OAuth connection
- ✅ Social accounts management page
- ✅ Actual posting to connected platforms
- ✅ Token refresh handling
- ✅ Disconnect/reconnect accounts

---

## IMPORTANT: API REQUIREMENTS

Before starting, you need:

### Instagram/Facebook (Meta)
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create an App → Business type
3. Add "Instagram Graph API" product
4. Add "Facebook Login for Business" product
5. Get App ID and App Secret
6. Set OAuth redirect URI: `https://bytrade.co.uk/api/auth/callback/instagram`

### Google Business Profile
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project
3. Enable "Google My Business API"
4. Create OAuth 2.0 credentials
5. Set redirect URI: `https://bytrade.co.uk/api/auth/callback/google`

---

## STEP 1: UPDATE ENV VARS

**File: `.env.local`** (add)

```env
# Meta (Instagram/Facebook)
META_APP_ID=your-meta-app-id
META_APP_SECRET=your-meta-app-secret

# Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=https://bytrade.co.uk
```

---

## STEP 2: OAUTH CONFIG

**File: `src/lib/oauth/config.ts`**

```typescript
export const OAUTH_CONFIG = {
  instagram: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: [
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_comments',
      'pages_show_list',
      'pages_read_engagement',
      'business_management',
    ].join(','),
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/instagram`,
  },
  facebook: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'pages_read_user_content',
      'business_management',
    ].join(','),
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/facebook`,
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: [
      'https://www.googleapis.com/auth/business.manage',
    ].join(' '),
    redirectUri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/callback/google`,
  },
}

export function getInstagramAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: OAUTH_CONFIG.instagram.redirectUri,
    scope: OAUTH_CONFIG.instagram.scope,
    response_type: 'code',
    state,
  })
  return `${OAUTH_CONFIG.instagram.authUrl}?${params}`
}

export function getFacebookAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: OAUTH_CONFIG.facebook.redirectUri,
    scope: OAUTH_CONFIG.facebook.scope,
    response_type: 'code',
    state,
  })
  return `${OAUTH_CONFIG.facebook.authUrl}?${params}`
}

export function getGoogleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: OAUTH_CONFIG.google.redirectUri,
    scope: OAUTH_CONFIG.google.scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${OAUTH_CONFIG.google.authUrl}?${params}`
}
```

---

## STEP 3: INSTAGRAM OAUTH CALLBACK

**File: `src/app/api/auth/callback/instagram/route.ts`**

```typescript
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

  if (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=instagram_denied`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=missing_code`
    )
  }

  try {
    // Verify user session
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/login?redirect=/admin/social`
      )
    }

    const company = await getCompanyForUser(user.email!)
    if (!company) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=no_company`
      )
    }

    // Verify state matches company ID
    if (state !== company.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=invalid_state`
      )
    }

    // Exchange code for access token
    const tokenResponse = await fetch(OAUTH_CONFIG.instagram.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.META_APP_ID!,
        client_secret: process.env.META_APP_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.instagram.redirectUri,
        code,
      }),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=token_failed`
      )
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

    if (!pagesData.data || pagesData.data.length === 0) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=no_pages`
      )
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=no_instagram_business`
      )
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
    await admin
      .from('social_tokens')
      .upsert({
        company_id: company.id,
        platform: 'instagram',
        access_token: pageAccessToken,
        refresh_token: null, // Meta doesn't use refresh tokens
        expires_at: expiresAt,
        platform_user_id: instagramAccountId,
        platform_username: igInfo.username,
        platform_avatar_url: igInfo.profile_picture_url,
        page_id: pageId,
        is_connected: true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,platform',
      })

    // Enable posting for the company
    await admin
      .from('companies')
      .update({ posting_enabled: true })
      .eq('id', company.id)

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?success=instagram`
    )
  } catch (error) {
    console.error('Instagram OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=unknown`
    )
  }
}
```

---

## STEP 4: FACEBOOK OAUTH CALLBACK

**File: `src/app/api/auth/callback/facebook/route.ts`**

```typescript
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

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=facebook_denied`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=missing_code`
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`)
    }

    const company = await getCompanyForUser(user.email!)
    if (!company || state !== company.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=invalid_state`
      )
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=no_pages`
      )
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

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?success=facebook`
    )
  } catch (error) {
    console.error('Facebook OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=unknown`
    )
  }
}
```

---

## STEP 5: GOOGLE OAUTH CALLBACK

**File: `src/app/api/auth/callback/google/route.ts`**

```typescript
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

  if (error) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=google_denied`
    )
  }

  if (!code || !state) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=missing_code`
    )
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/login`)
    }

    const company = await getCompanyForUser(user.email!)
    if (!company || state !== company.id) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=invalid_state`
      )
    }

    // Exchange code for tokens
    const tokenResponse = await fetch(OAUTH_CONFIG.google.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.google.redirectUri,
        code,
      }),
    })

    const tokenData = await tokenResponse.json()

    if (!tokenData.access_token) {
      console.error('Google token error:', tokenData)
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=token_failed`
      )
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
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=no_google_business`
      )
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

    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?success=google`
    )
  } catch (error) {
    console.error('Google OAuth error:', error)
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/admin/social?error=unknown`
    )
  }
}
```

---

## STEP 6: CONNECT ENDPOINTS

**File: `src/app/api/admin/social/connect/route.ts`**

```typescript
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
```

---

## STEP 7: DISCONNECT ENDPOINT

**File: `src/app/api/admin/social/disconnect/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'

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

    const { platform } = await request.json()

    const admin = createAdminClient()

    // Update token to disconnected
    await admin
      .from('social_tokens')
      .update({
        is_connected: false,
        access_token: null,
        refresh_token: null,
        updated_at: new Date().toISOString(),
      })
      .eq('company_id', company.id)
      .eq('platform', platform)

    // Check if any platforms are still connected
    const { data: remaining } = await admin
      .from('social_tokens')
      .select('id')
      .eq('company_id', company.id)
      .eq('is_connected', true)

    // If no platforms connected, disable posting
    if (!remaining || remaining.length === 0) {
      await admin
        .from('companies')
        .update({ posting_enabled: false })
        .eq('id', company.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Disconnect error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## STEP 8: SOCIAL POSTING SERVICE

**File: `src/lib/posting/platforms/instagram.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

interface PostResult {
  success: boolean
  postId?: string
  error?: string
}

export async function postToInstagram(
  companyId: string,
  imageUrl: string,
  caption: string
): Promise<PostResult> {
  const supabase = createAdminClient()

  // Get Instagram token
  const { data: token } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('company_id', companyId)
    .eq('platform', 'instagram')
    .eq('is_connected', true)
    .single()

  if (!token) {
    return { success: false, error: 'Instagram not connected' }
  }

  try {
    // Step 1: Create media container
    const containerResponse = await fetch(
      `https://graph.facebook.com/v18.0/${token.platform_user_id}/media`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: imageUrl,
          caption,
          access_token: token.access_token,
        }),
      }
    )

    const containerData = await containerResponse.json()

    if (containerData.error) {
      console.error('Instagram container error:', containerData.error)
      return { success: false, error: containerData.error.message }
    }

    const containerId = containerData.id

    // Step 2: Wait for container to be ready (poll status)
    let ready = false
    let attempts = 0
    while (!ready && attempts < 10) {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const statusResponse = await fetch(
        `https://graph.facebook.com/v18.0/${containerId}?fields=status_code&access_token=${token.access_token}`
      )
      const statusData = await statusResponse.json()
      
      if (statusData.status_code === 'FINISHED') {
        ready = true
      } else if (statusData.status_code === 'ERROR') {
        return { success: false, error: 'Media processing failed' }
      }
      
      attempts++
    }

    if (!ready) {
      return { success: false, error: 'Media processing timeout' }
    }

    // Step 3: Publish the container
    const publishResponse = await fetch(
      `https://graph.facebook.com/v18.0/${token.platform_user_id}/media_publish`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: token.access_token,
        }),
      }
    )

    const publishData = await publishResponse.json()

    if (publishData.error) {
      return { success: false, error: publishData.error.message }
    }

    return { success: true, postId: publishData.id }
  } catch (error: any) {
    console.error('Instagram post error:', error)
    return { success: false, error: error.message }
  }
}
```

**File: `src/lib/posting/platforms/facebook.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

interface PostResult {
  success: boolean
  postId?: string
  error?: string
}

export async function postToFacebook(
  companyId: string,
  imageUrl: string,
  caption: string
): Promise<PostResult> {
  const supabase = createAdminClient()

  const { data: token } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('company_id', companyId)
    .eq('platform', 'facebook')
    .eq('is_connected', true)
    .single()

  if (!token) {
    return { success: false, error: 'Facebook not connected' }
  }

  try {
    // Post photo to page
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${token.page_id}/photos`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: imageUrl,
          message: caption,
          access_token: token.access_token,
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      return { success: false, error: data.error.message }
    }

    return { success: true, postId: data.id || data.post_id }
  } catch (error: any) {
    console.error('Facebook post error:', error)
    return { success: false, error: error.message }
  }
}
```

**File: `src/lib/posting/platforms/google.ts`**

```typescript
import { createAdminClient } from '@/lib/supabase/admin'

interface PostResult {
  success: boolean
  postId?: string
  error?: string
}

// Refresh Google token if expired
async function refreshGoogleToken(tokenRecord: any): Promise<string | null> {
  if (!tokenRecord.refresh_token) {
    return null
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: tokenRecord.refresh_token,
        grant_type: 'refresh_token',
      }),
    })

    const data = await response.json()

    if (data.access_token) {
      // Update token in database
      const supabase = createAdminClient()
      await supabase
        .from('social_tokens')
        .update({
          access_token: data.access_token,
          expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
        })
        .eq('id', tokenRecord.id)

      return data.access_token
    }

    return null
  } catch (error) {
    console.error('Google token refresh error:', error)
    return null
  }
}

export async function postToGoogleBusiness(
  companyId: string,
  imageUrl: string,
  caption: string
): Promise<PostResult> {
  const supabase = createAdminClient()

  const { data: token } = await supabase
    .from('social_tokens')
    .select('*')
    .eq('company_id', companyId)
    .eq('platform', 'google')
    .eq('is_connected', true)
    .single()

  if (!token) {
    return { success: false, error: 'Google Business not connected' }
  }

  // Check if token is expired
  let accessToken = token.access_token
  if (new Date(token.expires_at) < new Date()) {
    const refreshed = await refreshGoogleToken(token)
    if (!refreshed) {
      return { success: false, error: 'Token expired and refresh failed' }
    }
    accessToken = refreshed
  }

  try {
    // Create a local post
    const response = await fetch(
      `https://mybusiness.googleapis.com/v4/${token.page_id}/localPosts`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          languageCode: 'en-GB',
          summary: caption,
          media: [
            {
              mediaFormat: 'PHOTO',
              sourceUrl: imageUrl,
            },
          ],
          topicType: 'STANDARD',
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      return { success: false, error: data.error.message }
    }

    return { success: true, postId: data.name }
  } catch (error: any) {
    console.error('Google post error:', error)
    return { success: false, error: error.message }
  }
}
```

---

## STEP 9: UPDATE POSTER SERVICE

**File: `src/lib/posting/poster.ts`** (update)

```typescript
import { createAdminClient } from '@/lib/supabase/admin'
import { postToInstagram } from './platforms/instagram'
import { postToFacebook } from './platforms/facebook'
import { postToGoogleBusiness } from './platforms/google'

interface PostResult {
  platform: string
  success: boolean
  postId?: string
  error?: string
}

export async function processScheduledPost(postId: string): Promise<boolean> {
  const supabase = createAdminClient()

  // Get the post with company info
  const { data: post, error } = await supabase
    .from('scheduled_posts')
    .select('*, companies(*)')
    .eq('id', postId)
    .single()

  if (error || !post) {
    console.error('Post not found:', postId)
    return false
  }

  // Check if due
  if (new Date(post.scheduled_for) > new Date()) {
    return false
  }

  // Get connected platforms
  const { data: tokens } = await supabase
    .from('social_tokens')
    .select('platform')
    .eq('company_id', post.company_id)
    .eq('is_connected', true)

  const connectedPlatforms = tokens?.map(t => t.platform) || []

  if (connectedPlatforms.length === 0) {
    // No platforms connected, mark as skipped
    await supabase
      .from('scheduled_posts')
      .update({
        status: 'failed',
        error_message: 'No social accounts connected',
      })
      .eq('id', postId)
    return false
  }

  // Build full caption with hashtags
  const fullCaption = post.hashtags && post.hashtags.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`
    : post.caption

  const results: PostResult[] = []

  // Post to each connected platform
  if (connectedPlatforms.includes('instagram')) {
    const result = await postToInstagram(post.company_id, post.image_url, fullCaption)
    results.push({ platform: 'instagram', ...result })
    
    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ instagram_post_id: result.postId })
        .eq('id', postId)
    }
  }

  if (connectedPlatforms.includes('facebook')) {
    const result = await postToFacebook(post.company_id, post.image_url, fullCaption)
    results.push({ platform: 'facebook', ...result })
    
    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ facebook_post_id: result.postId })
        .eq('id', postId)
    }
  }

  if (connectedPlatforms.includes('google')) {
    // Google Business doesn't support hashtags well, use plain caption
    const result = await postToGoogleBusiness(post.company_id, post.image_url, post.caption)
    results.push({ platform: 'google', ...result })
    
    if (result.success && result.postId) {
      await supabase
        .from('scheduled_posts')
        .update({ google_post_id: result.postId })
        .eq('id', postId)
    }
  }

  // Determine overall status
  const anySuccess = results.some(r => r.success)
  const allFailed = results.every(r => !r.success)
  
  const newStatus = allFailed ? 'failed' : 'posted'
  const errors = results.filter(r => !r.success).map(r => `${r.platform}: ${r.error}`)

  await supabase
    .from('scheduled_posts')
    .update({
      status: newStatus,
      posted_at: anySuccess ? new Date().toISOString() : null,
      error_message: errors.length > 0 ? errors.join('; ') : null,
      retry_count: allFailed ? (post.retry_count || 0) + 1 : post.retry_count,
    })
    .eq('id', postId)

  // Mark image as used
  if (anySuccess && post.project_id) {
    await supabase
      .from('projects')
      .update({
        used_in_post: true,
        last_posted_at: new Date().toISOString(),
      })
      .eq('id', post.project_id)
  }

  return anySuccess
}

export async function processDuePosts(): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const supabase = createAdminClient()

  const { data: duePosts } = await supabase
    .from('scheduled_posts')
    .select('id')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .lt('retry_count', 3)
    .limit(50)

  if (!duePosts || duePosts.length === 0) {
    return { processed: 0, succeeded: 0, failed: 0 }
  }

  let succeeded = 0
  let failed = 0

  for (const post of duePosts) {
    const success = await processScheduledPost(post.id)
    if (success) succeeded++
    else failed++
    
    // Rate limiting - wait between posts
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  return { processed: duePosts.length, succeeded, failed }
}
```

---

## STEP 10: SOCIAL ACCOUNTS ADMIN PAGE

**File: `src/app/admin/social/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import SocialAccountCard from '@/components/admin/SocialAccountCard'
import { Lock, Instagram, Facebook, MapPin } from 'lucide-react'

export default async function SocialPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canManageSocial = hasFeature(company.tier, 'social_connections')

  if (!canManageSocial) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Full Package Feature</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Connect your social accounts to enable automatic posting. 
          Available on the Full Package plan.
        </p>
        <Link
          href="/admin/billing"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Upgrade to Full Package
        </Link>
      </div>
    )
  }

  // Get connected accounts
  const admin = createAdminClient()
  const { data: tokens } = await admin
    .from('social_tokens')
    .select('*')
    .eq('company_id', company.id)

  const platforms = [
    {
      id: 'instagram',
      name: 'Instagram',
      icon: Instagram,
      color: 'bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400',
      description: 'Post photos to your Instagram Business account',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600',
      description: 'Post to your Facebook Business Page',
    },
    {
      id: 'google',
      name: 'Google Business',
      icon: MapPin,
      color: 'bg-green-500',
      description: 'Post updates to Google Business Profile',
    },
  ]

  const connectedPlatforms = new Map(
    tokens?.map(t => [t.platform, t]) || []
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Social Accounts
        </h1>
        <p className="text-gray-600 mt-1">
          Connect your social media accounts for automatic posting
        </p>
      </div>

      {/* Status banner */}
      {company.posting_enabled ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-green-800">
            Auto-posting is <strong>enabled</strong> - {company.posts_per_week || 5} posts per week
          </span>
        </div>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8 flex items-center gap-3">
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <span className="text-yellow-800">
            Connect at least one account to enable auto-posting
          </span>
        </div>
      )}

      {/* Platform cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {platforms.map((platform) => {
          const token = connectedPlatforms.get(platform.id)
          const isConnected = token?.is_connected || false

          return (
            <SocialAccountCard
              key={platform.id}
              platform={platform}
              token={token}
              isConnected={isConnected}
              companyId={company.id}
            />
          )
        })}
      </div>

      {/* Help text */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">How it works</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>1. Connect your social media accounts above</li>
          <li>2. Upload project photos in the Projects section</li>
          <li>3. We automatically create posts with AI-written captions</li>
          <li>4. Posts go out {company.posts_per_week || 5}x per week at optimal times</li>
        </ul>
      </div>

      {/* Requirements */}
      <div className="mt-6 bg-blue-50 rounded-xl p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Requirements</h3>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• <strong>Instagram:</strong> Must be a Business or Creator account linked to a Facebook Page</li>
          <li>• <strong>Facebook:</strong> Must be a Facebook Business Page (not personal profile)</li>
          <li>• <strong>Google:</strong> Must have a verified Google Business Profile</li>
        </ul>
      </div>
    </div>
  )
}
```

---

## STEP 11: SOCIAL ACCOUNT CARD COMPONENT

**File: `src/components/admin/SocialAccountCard.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Check, Loader2 } from 'lucide-react'

interface Platform {
  id: string
  name: string
  icon: any
  color: string
  description: string
}

interface Token {
  platform_username?: string
  platform_avatar_url?: string
  is_connected: boolean
  expires_at?: string
}

interface SocialAccountCardProps {
  platform: Platform
  token: Token | null | undefined
  isConnected: boolean
  companyId: string
}

export default function SocialAccountCard({
  platform,
  token,
  isConnected,
  companyId,
}: SocialAccountCardProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id }),
      })

      const data = await res.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert(data.error || 'Failed to start connection')
        setLoading(false)
      }
    } catch (error) {
      alert('Failed to connect')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${platform.name}? Auto-posting will stop for this platform.`)) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/social/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id }),
      })

      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to disconnect')
      }
    } catch (error) {
      alert('Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }

  const Icon = platform.icon

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with icon */}
      <div className={`${platform.color} p-6 text-white`}>
        <Icon className="w-8 h-8 mb-3" />
        <h3 className="text-lg font-semibold">{platform.name}</h3>
        <p className="text-sm opacity-90">{platform.description}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isConnected && token ? (
          <>
            {/* Connected state */}
            <div className="flex items-center gap-3 mb-4">
              {token.platform_avatar_url && (
                <img
                  src={token.platform_avatar_url}
                  alt={token.platform_username}
                  className="w-10 h-10 rounded-full"
                />
              )}
              <div>
                <p className="font-medium text-gray-900">
                  @{token.platform_username || 'Connected'}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Connected
                </p>
              </div>
            </div>

            {/* Token expiry warning */}
            {token.expires_at && new Date(token.expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
              <p className="text-xs text-yellow-600 mb-4">
                ⚠️ Token expires soon. Reconnect to continue posting.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Reconnect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected state */}
            <p className="text-sm text-gray-500 mb-4">
              Not connected
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${platform.color}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                `Connect ${platform.name}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

---

## STEP 12: TEST IT

1. Set up Meta/Google developer apps with OAuth credentials
2. Update `.env.local` with credentials
3. Run dev server

4. Go to `/admin/social`
5. Click "Connect Instagram"
6. Complete OAuth flow
7. Should redirect back with account connected

8. Add a project with images
9. Go to `/admin/posts`
10. Click "Generate Posts"
11. Wait for scheduled time or manually trigger cron

12. Test cron:
```bash
curl "http://localhost:3000/api/cron/process-posts" \
  -H "Authorization: Bearer your-cron-secret"
```

---

## EXIT CRITERIA

- ✅ Instagram OAuth working
- ✅ Facebook OAuth working
- ✅ Google Business OAuth working
- ✅ Social accounts page showing connection status
- ✅ Connect/disconnect buttons working
- ✅ Token storage in database
- ✅ Actual posting to Instagram working
- ✅ Actual posting to Facebook working
- ✅ Actual posting to Google working
- ✅ Token refresh for Google
- ✅ Error handling for failed posts
- ✅ Feature gated to Full Package
- ✅ `npm run build` passes

---

## OAUTH FLOW SUMMARY

```
┌─────────────────────────────────────────────────────────────┐
│  User clicks "Connect Instagram"                           │
│                    ↓                                        │
│  API returns Meta OAuth URL with scopes                    │
│                    ↓                                        │
│  User redirected to Facebook login                         │
│                    ↓                                        │
│  User approves permissions                                 │
│                    ↓                                        │
│  Callback receives authorization code                      │
│                    ↓                                        │
│  Exchange code for access token                            │
│                    ↓                                        │
│  Get long-lived token (60 days)                           │
│                    ↓                                        │
│  Get Facebook Pages                                        │
│                    ↓                                        │
│  Get Instagram Business Account linked to page             │
│                    ↓                                        │
│  Store tokens in social_tokens table                       │
│                    ↓                                        │
│  Enable posting_enabled on company                         │
│                    ↓                                        │
│  Redirect to /admin/social with success                    │
└─────────────────────────────────────────────────────────────┘
```

---

## IMPORTANT NOTES

### Instagram Requirements
- Must be Instagram Business or Creator account
- Must be linked to a Facebook Page
- Facebook Page must have admin access

### Facebook Requirements
- Must be a Facebook Business Page
- User must be Page admin

### Google Requirements
- Must have Google Business Profile
- Profile must be verified
- Must have owner/manager access

### Token Expiry
- Meta tokens: 60 days (need to reconnect)
- Google tokens: Use refresh token to auto-renew

---

## NEXT: ZIP-10

ZIP-10 will add:
- Reviews management
- Review graphics generation
- Checkatrade scraping

---

**Social accounts connected. Actually posting to real platforms.**
