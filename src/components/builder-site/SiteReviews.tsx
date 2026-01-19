import { Review } from '@/lib/supabase/types'
import { Star } from 'lucide-react'

interface SiteReviewsProps {
  reviews: Review[]
  primaryColor?: string
}

export default function SiteReviews({ reviews, primaryColor = '#1e3a5f' }: SiteReviewsProps) {
  if (reviews.length === 0) return null

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <section id="reviews" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-lg font-semibold ml-2">{avgRating.toFixed(1)}</span>
          </div>
          <p className="text-gray-600">{reviews.length} reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Review text */}
              {review.review_text && (
                <p className="text-gray-700 mb-4">
                  &quot;{review.review_text.substring(0, 200)}
                  {review.review_text.length > 200 ? '...' : ''}&quot;
                </p>
              )}

              {/* Reviewer */}
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {review.reviewer_name || 'Customer'}
                </p>
                {review.source && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {review.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
