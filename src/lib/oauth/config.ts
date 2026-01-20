// Helper to get base URL at runtime
function getBaseUrl(): string {
  return process.env.NEXT_PUBLIC_BASE_URL || 'https://mybuildr.vercel.app'
}

export const OAUTH_CONFIG = {
  instagram: {
    authUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token',
    scope: [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
    ].join(','),
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
  },
  google: {
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    scope: [
      'https://www.googleapis.com/auth/business.manage',
    ].join(' '),
  },
}

export function getInstagramAuthUrl(state: string): string {
  const redirectUri = `${getBaseUrl()}/api/auth/callback/instagram`
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: OAUTH_CONFIG.instagram.scope,
    response_type: 'code',
    state,
  })
  return `${OAUTH_CONFIG.instagram.authUrl}?${params}`
}

export function getFacebookAuthUrl(state: string): string {
  const redirectUri = `${getBaseUrl()}/api/auth/callback/facebook`
  const params = new URLSearchParams({
    client_id: process.env.META_APP_ID!,
    redirect_uri: redirectUri,
    scope: OAUTH_CONFIG.facebook.scope,
    response_type: 'code',
    state,
  })
  return `${OAUTH_CONFIG.facebook.authUrl}?${params}`
}

export function getGoogleAuthUrl(state: string): string {
  const redirectUri = `${getBaseUrl()}/api/auth/callback/google`
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri,
    scope: OAUTH_CONFIG.google.scope,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    state,
  })
  return `${OAUTH_CONFIG.google.authUrl}?${params}`
}

// Export for use in callback handlers
export function getRedirectUri(platform: 'instagram' | 'facebook' | 'google'): string {
  return `${getBaseUrl()}/api/auth/callback/${platform}`
}
