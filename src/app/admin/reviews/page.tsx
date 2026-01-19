import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyReviews } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import ReviewsList from '@/components/admin/ReviewsList'
import ImportReviewsButton from '@/components/admin/ImportReviewsButton'
import { Plus, Star, Lock } from 'lucide-react'

export default async function ReviewsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  // Check feature access
  if (!hasFeature(company.tier, 'manage_reviews')) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pro Feature</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Manage your customer reviews with our Pro plan.
          Import from Checkatrade and display on your site.
        </p>
        <Link
          href="/admin/billing"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Upgrade to Pro
        </Link>
      </div>
    )
  }

  const reviews = await getCompanyReviews(company.id)

  // Calculate stats
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0'
  const fiveStarCount = reviews.filter(r => r.rating === 5).length

  const canGenerateGraphics = hasFeature(company.tier, 'review_graphics')
  const canPost = hasFeature(company.tier, 'auto_posting') && company.posting_enabled

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Reviews
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your customer reviews
          </p>
        </div>
        <Link
          href="/admin/reviews/new"
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Review
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600 fill-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{avgRating}</p>
              <p className="text-sm text-gray-500">Avg Rating</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">{reviews.length}</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-sm text-gray-500">Total Reviews</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-yellow-600">⭐</span>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{fiveStarCount}</p>
              <p className="text-sm text-gray-500">5-Star Reviews</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import from Checkatrade */}
      {company.checkatrade_url && (
        <ImportReviewsButton />
      )}

      {/* Reviews list */}
      {reviews.length > 0 ? (
        <ReviewsList
          reviews={reviews}
          canGenerateGraphics={canGenerateGraphics}
          canPost={canPost}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h2>
          <p className="text-gray-600 mb-6">
            Add reviews manually or import from Checkatrade
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/reviews/new"
              className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
            >
              <Plus className="w-5 h-5" />
              Add Review
            </Link>
            {company.checkatrade_url && (
              <ImportReviewsButton variant="secondary" />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
