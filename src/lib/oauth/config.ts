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
