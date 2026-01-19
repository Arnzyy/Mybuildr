import { createAdminClient } from '@/lib/supabase/admin'

interface PostResult {
  success: boolean
  postId?: string
  error?: string
}

interface TokenRecord {
  id: string
  access_token: string
  refresh_token: string | null
  expires_at: string
  platform_user_id: string
  page_id: string
}

// Refresh Google token if expired
async function refreshGoogleToken(tokenRecord: TokenRecord): Promise<string | null> {
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
    const refreshed = await refreshGoogleToken(token as TokenRecord)
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
  } catch (error) {
    console.error('Google post error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
