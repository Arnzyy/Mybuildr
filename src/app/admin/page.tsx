import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import {
  FolderOpen,
  Star,
  Calendar,
  Eye,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const projects = await getCompanyProjects(company.id)
  const reviews = await getCompanyReviews(company.id)

  // Get enquiries count
  const adminClient = createAdminClient()
  const { count: enquiriesCount } = await adminClient
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('status', 'new')

  // Get scheduled posts count (if tier allows)
  let scheduledPostsCount = 0
  if (hasFeature(company.tier, 'view_scheduled_posts')) {
    const { count } = await adminClient
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'pending')
    scheduledPostsCount = count || 0
  }

  const stats = [
    {
      label: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      href: '/admin/projects',
      color: 'blue',
      locked: false,
    },
    {
      label: 'Reviews',
      value: reviews.length,
      icon: Star,
      href: '/admin/reviews',
      color: 'yellow',
      locked: false,
    },
    {
      label: 'New Enquiries',
      value: enquiriesCount || 0,
      icon: TrendingUp,
      href: '/admin',
      color: 'green',
      locked: false,
    },
    {
      label: 'Scheduled Posts',
      value: scheduledPostsCount,
      icon: Calendar,
      href: '/admin/posts',
      color: 'orange',
      locked: !hasFeature(company.tier, 'view_scheduled_posts'),
    },
  ]

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with {company.name}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.locked ? '#' : stat.href}
            className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${
              stat.locked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100">
                <stat.icon className="w-6 h-6 text-gray-600" />
              </div>
              {stat.locked && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                  Pro+
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* View site */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Website</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {company.slug}.bytrade.co.uk
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Published
              </p>
            </div>
            <a
              href={`/sites/${company.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Eye className="w-4 h-4" />
              View Site
            </a>
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-2">Your Plan</h2>
          <p className="text-3xl font-bold capitalize mb-1">{company.tier}</p>
          <p className="text-orange-100 text-sm mb-4">
            &pound;{company.tier === 'starter' ? '99' : company.tier === 'pro' ? '149' : '199'}/month
          </p>
          {company.tier !== 'full' && (
            <Link
              href="/admin/billing"
              className="inline-flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50"
            >
              Upgrade
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent activity / tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              projects.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {projects.length > 0 ? '✓' : '1'}
            </div>
            <p className={projects.length > 0 ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Add your first project with photos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              company.description ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {company.description ? '✓' : '2'}
            </div>
            <p className={company.description ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Complete your company profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              reviews.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {reviews.length > 0 ? '✓' : '3'}
            </div>
            <p className={reviews.length > 0 ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Add customer reviews
            </p>
          </div>
          {hasFeature(company.tier, 'social_connections') && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gray-100 text-gray-400">
                4
              </div>
              <p className="text-gray-700">
                Connect your social accounts for auto-posting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
