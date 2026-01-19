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
  } catch (error) {
    console.error('Instagram post error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}
