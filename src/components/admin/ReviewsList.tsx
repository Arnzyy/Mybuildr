'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import type { Review } from '@/lib/supabase/types'
import { Star, Edit, Trash2, Image, Share2, Loader2 } from 'lucide-react'
import Link from 'next/link'

interface ReviewsListProps {
  reviews: Review[]
  canGenerateGraphics: boolean
  canPost: boolean
}

export default function ReviewsList({
  reviews: initialReviews,
  canGenerateGraphics,
  canPost,
}: ReviewsListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [loadingGraphic, setLoadingGraphic] = useState<string | null>(null)
  const [loadingPost, setLoadingPost] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this review?')) return

    setDeleting(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setReviews(reviews.filter(r => r.id !== id))
      } else {
        alert('Failed to delete review')
      }
    } catch {
      alert('Failed to delete review')
    } finally {
      setDeleting(null)
    }
  }

  const handleGenerateGraphic = async (id: string) => {
    setLoadingGraphic(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}/graphic`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setReviews(reviews.map(r =>
          r.id === id ? { ...r, graphic_url: data.graphicUrl } : r
        ))
      } else {
        alert(data.error || 'Failed to generate graphic')
      }
    } catch {
      alert('Failed to generate graphic')
    } finally {
      setLoadingGraphic(null)
    }
  }

  const handleShareToSocial = async (id: string) => {
    setLoadingPost(id)

    try {
      const res = await fetch(`/api/admin/reviews/${id}/post`, {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert('Review scheduled for posting!')
        setReviews(reviews.map(r =>
          r.id === id ? { ...r, used_in_post: true } : r
        ))
      } else {
        alert(data.error || 'Failed to schedule post')
      }
    } catch {
      alert('Failed to schedule post')
    } finally {
      setLoadingPost(null)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-white rounded-xl border border-gray-200 p-6"
        >
          <div className="flex gap-6">
            {/* Graphic preview */}
            {review.graphic_url && (
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={review.graphic_url}
                  alt="Review graphic"
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  {renderStars(review.rating)}
                  <p className="font-semibold text-gray-900 mt-2">
                    {review.reviewer_name || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {review.review_date && format(new Date(review.review_date), 'MMM d, yyyy')}
                    {review.source !== 'manual' && (
                      <span className="ml-2 bg-gray-100 px-2 py-0.5 rounded">
                        {review.source}
                      </span>
                    )}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/reviews/${review.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting === review.id}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Review text */}
              <p className="text-gray-700 mt-3 line-clamp-3">
                &ldquo;{review.review_text}&rdquo;
              </p>

              {/* Action buttons */}
              <div className="flex items-center gap-3 mt-4">
                {canGenerateGraphics && (
                  <button
                    onClick={() => handleGenerateGraphic(review.id)}
                    disabled={loadingGraphic === review.id}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
                  >
                    {loadingGraphic === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Image className="w-4 h-4" />
                    )}
                    {review.graphic_url ? 'Regenerate Graphic' : 'Generate Graphic'}
                  </button>
                )}

                {canPost && review.graphic_url && !review.used_in_post && (
                  <button
                    onClick={() => handleShareToSocial(review.id)}
                    disabled={loadingPost === review.id}
                    className="flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
                  >
                    {loadingPost === review.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Share2 className="w-4 h-4" />
                    )}
                    Share to Social
                  </button>
                )}

                {review.used_in_post && (
                  <span className="text-xs text-green-600">✓ Shared</span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
