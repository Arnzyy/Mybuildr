import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import PostsList from '@/components/admin/PostsList'
import PostsTimeline from '@/components/admin/PostsTimeline'
import PostsViewToggle from '@/components/admin/PostsViewToggle'
import GeneratePostsButton from '@/components/admin/GeneratePostsButton'
import { Lock, Calendar, Zap } from 'lucide-react'

export default async function PostsPage({ searchParams }: { searchParams: { view?: string } }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canViewPosts = hasFeature(company.tier, 'view_scheduled_posts')
  const view = searchParams.view || 'list'

  if (!canViewPosts) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade to Full Package</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Automated social media posting is available on the Full Package plan.
          We&apos;ll post to Instagram, Facebook, and Google 5x per week - automatically.
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

  // Get scheduled posts
  const admin = createAdminClient()
  const { data: posts } = await admin
    .from('scheduled_posts')
    .select(`
      *,
      project:projects(title)
    `)
    .eq('company_id', company.id)
    .order('scheduled_for', { ascending: true })
    .limit(50)

  // Count by status
  const pendingCount = posts?.filter(p => p.status === 'pending').length || 0
  const postedCount = posts?.filter(p => p.status === 'posted').length || 0
  const failedCount = posts?.filter(p => p.status === 'failed').length || 0

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Scheduled Posts
          </h1>
          <p className="text-gray-600 mt-1">
            Your upcoming and past social media posts
          </p>
        </div>

        {company.posting_enabled && (
          <GeneratePostsButton />
        )}
      </div>

      {/* Posting frequency info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-medium text-blue-900">Posting frequency</p>
            <p className="text-sm text-blue-700">
              Currently posting <strong>
                {company.posts_per_week >= 14
                  ? `${Math.floor(company.posts_per_week / 7)}x per day`
                  : `${company.posts_per_week || 5}x per week`}
              </strong> across connected platforms
            </p>
          </div>
          <Link
            href="/admin/settings"
            className="text-blue-600 text-sm font-medium hover:underline whitespace-nowrap"
          >
            Change settings
          </Link>
        </div>
      </div>

      {/* Status cards - compact on mobile */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Scheduled</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{postedCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Posted</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-center sm:text-left">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-red-600 font-bold text-sm">!</span>
            </div>
            <div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{failedCount}</p>
              <p className="text-xs sm:text-sm text-gray-500">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Posting status */}
      {!company.posting_enabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6">
          <p className="text-yellow-800">
            <strong>Posting is paused.</strong> Connect your social accounts to enable automatic posting.
          </p>
          <Link
            href="/admin/social"
            className="text-yellow-600 hover:underline text-sm mt-1 inline-block"
          >
            Connect accounts &rarr;
          </Link>
        </div>
      )}

      {/* View toggle */}
      {posts && posts.length > 0 && <PostsViewToggle />}

      {/* Posts list or timeline */}
      {posts && posts.length > 0 ? (
        view === 'timeline' ? (
          <PostsTimeline initialPosts={posts} />
        ) : (
          <PostsList initialPosts={posts} />
        )
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h2>
          <p className="text-gray-600 mb-6">
            Add some projects with photos and we&apos;ll start generating posts automatically.
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Add a Project
          </Link>
        </div>
      )}
    </div>
  )
}
