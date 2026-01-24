import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyForUser, getCompanyProjects, getCompanyMedia } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import {
  Camera,
  Eye,
  Share2,
  FolderOpen,
  CheckCircle2
} from 'lucide-react'
import HealthCheckBanner from '@/components/admin/HealthCheckBanner'
import { format } from 'date-fns'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const projects = await getCompanyProjects(company.id)
  const totalPhotos = projects.reduce((sum, p) => sum + (p.images?.length || 0), 0)
  const hasSocialConnected = hasFeature(company.tier, 'social_connections') && company.posting_enabled

  // Get data for health check
  const media = await getCompanyMedia(company.id)
  const availableMedia = media.filter(m => m.is_available)

  const { data: scheduledPosts } = await supabase
    .from('scheduled_posts')
    .select('*')
    .eq('company_id', company.id)
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: true })
    .limit(1)

  // Use admin client to query social tokens
  const adminClient = createAdminClient()
  const { data: socialTokens } = await adminClient
    .from('social_tokens')
    .select('*')
    .eq('company_id', company.id)
    .eq('is_connected', true)

  const connectedSocialsCount = socialTokens?.length || 0
  const nextPost = scheduledPosts?.[0]

  // Calculate health status
  let healthStatus: {
    status: 'good' | 'warning' | 'critical'
    icon: string
    title: string
    message: string
    action?: { label: string; href: string }
  }

  // Check if posting is paused
  if (!company.posting_enabled) {
    healthStatus = {
      status: 'warning',
      icon: '⏸️',
      title: 'Posting paused',
      message: 'Auto-posting is currently paused. Enable it in Settings to resume.',
      action: { label: 'Go to Settings', href: '/admin/settings' }
    }
  } else if (connectedSocialsCount === 0 && hasFeature(company.tier, 'social_connections')) {
    healthStatus = {
      status: 'critical',
      icon: '🔴',
      title: 'Connect your socials',
      message: 'Connect Instagram or Facebook to start auto-posting',
      action: { label: 'Connect Now', href: '/admin/social' }
    }
  } else if (availableMedia.length < 3) {
    healthStatus = {
      status: 'warning',
      icon: '⚠️',
      title: 'Running low on photos',
      message: `Only ${availableMedia.length} photo${availableMedia.length === 1 ? '' : 's'} left. Upload more to keep posting.`,
      action: { label: 'Upload Photos', href: '/admin/photos' }
    }
  } else {
    healthStatus = {
      status: 'good',
      icon: '✅',
      title: 'All good!',
      message: nextPost
        ? `${availableMedia.length} photos queued. Next post: ${format(new Date(nextPost.scheduled_for), 'EEE d MMM, h:mmaaa').toLowerCase()}`
        : `${availableMedia.length} photos ready to post.`
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Welcome */}
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          {company.name}
        </h1>
        <p className="text-gray-500 mt-1">Upload photos, we do the rest</p>
      </div>

      {/* Health Check Banner */}
      <HealthCheckBanner
        status={healthStatus.status}
        icon={healthStatus.icon}
        title={healthStatus.title}
        message={healthStatus.message}
        action={healthStatus.action}
      />

      {/* BIG UPLOAD BUTTON */}
      <Link
        href="/admin/photos"
        className="block bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all mb-6"
      >
        <div className="w-20 h-20 md:w-24 md:h-24 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-10 h-10 md:w-12 md:h-12" />
        </div>
        <p className="text-2xl md:text-3xl font-bold mb-2">UPLOAD PHOTOS</p>
        <p className="text-orange-100 text-sm md:text-base">
          Upload projects or images to your website & social media
        </p>
      </Link>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Link
          href="/admin/projects"
          className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-sm text-gray-500">Projects</p>
            </div>
          </div>
        </Link>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Camera className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalPhotos}</p>
              <p className="text-sm text-gray-500">Photos</p>
            </div>
          </div>
        </div>
      </div>

      {/* View site button */}
      <a
        href={`/sites/${company.slug}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-3 bg-gray-900 text-white rounded-xl p-4 font-medium hover:bg-gray-800 transition-colors mb-6"
      >
        <Eye className="w-5 h-5" />
        View Your Website
      </a>

      {/* Social connection status */}
      {hasFeature(company.tier, 'social_connections') ? (
        <Link
          href="/admin/social"
          className={`flex items-center justify-between rounded-xl p-4 mb-6 ${
            hasSocialConnected
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          <div className="flex items-center gap-3">
            {hasSocialConnected ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <Share2 className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <p className={`font-medium ${hasSocialConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                {hasSocialConnected ? 'Auto-posting enabled' : 'Connect your socials'}
              </p>
              <p className={`text-sm ${hasSocialConnected ? 'text-green-600' : 'text-yellow-600'}`}>
                {hasSocialConnected
                  ? 'Photos will post automatically'
                  : 'Link Instagram & Facebook to auto-post'
                }
              </p>
            </div>
          </div>
          <span className={`text-sm font-medium ${hasSocialConnected ? 'text-green-600' : 'text-yellow-600'}`}>
            {hasSocialConnected ? 'Manage' : 'Set up'} →
          </span>
        </Link>
      ) : (
        <Link
          href="/admin/billing"
          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6"
        >
          <div className="flex items-center gap-3">
            <Share2 className="w-6 h-6 text-gray-400" />
            <div>
              <p className="font-medium text-gray-700">Auto-post to social media</p>
              <p className="text-sm text-gray-500">Upgrade to Full Package</p>
            </div>
          </div>
          <span className="text-sm font-medium text-orange-500">Upgrade →</span>
        </Link>
      )}

      {/* Simple how it works */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="font-semibold text-gray-900 mb-3">How it works</p>
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">1</span>
            <p className="text-gray-600">Upload photos of your work</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">2</span>
            <p className="text-gray-600">Photos appear on your website instantly</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs">3</span>
            <p className="text-gray-600">We auto-post to your socials with AI captions</p>
          </div>
        </div>
      </div>
    </div>
  )
}
