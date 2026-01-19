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

  // Get connected accounts (handle if table doesn't exist yet)
  interface SocialToken {
    platform: string
    is_connected: boolean
    platform_username?: string
    platform_avatar_url?: string
    expires_at?: string
  }
  let tokens: SocialToken[] = []
  try {
    const admin = createAdminClient()
    const { data, error } = await admin
      .from('social_tokens')
      .select('*')
      .eq('company_id', company.id)

    if (!error && data) {
      tokens = data as SocialToken[]
    }
  } catch {
    // Table might not exist yet - that's ok
  }

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
        <ul className="space-y-2 text-sm text-blue-800">
          <li>&bull; <strong>Instagram:</strong> Must be a Business or Creator account linked to a Facebook Page</li>
          <li>&bull; <strong>Facebook:</strong> Must be a Facebook Business Page (not personal profile)</li>
          <li>&bull; <strong>Google Business:</strong> Must have a verified Google Business Profile</li>
        </ul>
      </div>

      {/* Google Reviews info */}
      <div className="mt-6 bg-green-50 rounded-xl p-6">
        <h3 className="font-semibold text-green-900 mb-2">Google Reviews</h3>
        <p className="text-sm text-green-800 mb-3">
          When you connect Google Business Profile, we can:
        </p>
        <ul className="space-y-1 text-sm text-green-700">
          <li>&bull; Auto-post your project photos to your Google Business Profile</li>
          <li>&bull; Pull your Google Reviews to display on your website</li>
          <li>&bull; Show your Google rating and review count</li>
        </ul>
        <p className="text-xs text-green-600 mt-3">
          You can also manually add reviews from Settings if you prefer.
        </p>
      </div>
    </div>
  )
}
