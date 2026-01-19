'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Review } from '@/lib/supabase/types'
import { ArrowLeft, Star } from 'lucide-react'
import Link from 'next/link'

interface ReviewFormProps {
  review?: Review
}

export default function ReviewForm({ review }: ReviewFormProps) {
  const router = useRouter()
  const isEditing = !!review

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    reviewer_name: review?.reviewer_name || '',
    rating: review?.rating || 5,
    review_text: review?.review_text || '',
    review_date: review?.review_date || new Date().toISOString().split('T')[0],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleRating = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.reviewer_name.trim() || !formData.review_text.trim()) {
      alert('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      const url = isEditing
        ? `/api/admin/reviews/${review.id}`
        : '/api/admin/reviews'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/admin/reviews')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save review')
      }
    } catch {
      alert('Failed to save review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Link
        href="/admin/reviews"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to reviews
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Reviewer name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Customer Name *
            </label>
            <input
              type="text"
              name="reviewer_name"
              value={formData.reviewer_name}
              onChange={handleChange}
              required
              placeholder="John Smith"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Review text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Text *
            </label>
            <textarea
              name="review_text"
              value={formData.review_text}
              onChange={handleChange}
              required
              rows={5}
              placeholder="What did the customer say about your work?"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Review Date
            </label>
            <input
              type="date"
              name="review_date"
              value={formData.review_date}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/reviews"
          className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Review'}
        </button>
      </div>
    </form>
  )
}
