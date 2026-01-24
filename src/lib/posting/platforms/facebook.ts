import { createAdminClient } from '@/lib/supabase/admin'

interface PostResult {
  success: boolean
  postId?: string
  error?: string
}

export async function postCarouselToFacebook(
  companyId: string,
  imageUrls: string[],
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
    // Step 1: Upload each photo (unpublished)
    const photoIds: string[] = []

    for (const imageUrl of imageUrls) {
      const response = await fetch(
        `https://graph.facebook.com/v18.0/${token.account_id}/photos`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: imageUrl,
            published: false,
            access_token: token.access_token,
          }),
        }
      )

      const data = await response.json()

      if (data.error) {
        console.error('Facebook photo upload error:', data.error)
        return { success: false, error: data.error.message }
      }

      photoIds.push(data.id)
    }

    // Step 2: Create a post with all photos attached
    const attachedMedia = photoIds.map(id => ({ media_fbid: id }))

    const postResponse = await fetch(
      `https://graph.facebook.com/v18.0/${token.account_id}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: caption,
          attached_media: attachedMedia,
          access_token: token.access_token,
        }),
      }
    )

    const postData = await postResponse.json()

    if (postData.error) {
      console.error('Facebook post error:', postData.error)
      return { success: false, error: postData.error.message }
    }

    return { success: true, postId: postData.id }
  } catch (error) {
    console.error('Facebook carousel post error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
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
      `https://graph.facebook.com/v18.0/${token.account_id}/photos`,
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
