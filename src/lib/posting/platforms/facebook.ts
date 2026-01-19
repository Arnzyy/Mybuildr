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
  } catch (error) {
    console.error('Facebook post error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
