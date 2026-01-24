'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, isSameDay } from 'date-fns'
import { Calendar, Check, X, AlertCircle, Edit2, Trash2 } from 'lucide-react'
import MediaPreview from './MediaPreview'

interface Post {
  id: string
  image_url: string
  media_type: 'image' | 'video'
  caption: string
  hashtags: string[]
  scheduled_for: string
  status: string
  posted_at: string | null
  error_message: string | null
  project: { title: string } | null
}

interface PostsTimelineProps {
  initialPosts: Post[]
}

export default function PostsTimeline({ initialPosts }: PostsTimelineProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const statusFilter = searchParams.get('status') || 'pending'

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')

  // Filter posts on client side
  const posts = useMemo(() => {
    if (statusFilter === 'all') {
      return initialPosts
    }
    return initialPosts.filter(p => p.status === statusFilter)
  }, [initialPosts, statusFilter])

  const handleCancel = async (id: string) => {
    if (!confirm('Delete this scheduled post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete post')
      }
    } catch {
      alert('Failed to delete post')
    }
  }

  const startEdit = (post: Post) => {
    setEditingId(post.id)
    setEditCaption(post.caption)
    setEditHashtags(post.hashtags?.join(', ') || '')
  }

  const handleSaveEdit = async () => {
    if (!editingId) return

    try {
      const res = await fetch(`/api/admin/posts/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: editCaption,
          hashtags: editHashtags.split(',').map(h => h.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        setEditingId(null)
        router.refresh()
      } else {
        alert('Failed to save changes')
      }
    } catch {
      alert('Failed to save changes')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
            <Calendar className="w-3 h-3" />
            Scheduled
          </span>
        )
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            <Check className="w-3 h-3" />
            Posted
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            <AlertCircle className="w-3 h-3" />
            Failed
          </span>
        )
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
            <X className="w-3 h-3" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  // Group posts by week
  const groupedPosts = () => {
    if (posts.length === 0) return []

    const weeks: { start: Date; end: Date; days: { date: Date; posts: Post[] }[] }[] = []

    // Find earliest and latest dates
    const dates = posts.map(p => new Date(p.scheduled_for))
    const earliest = new Date(Math.min(...dates.map(d => d.getTime())))
    const latest = new Date(Math.max(...dates.map(d => d.getTime())))

    // Generate weeks
    let currentWeekStart = startOfWeek(earliest, { weekStartsOn: 1 }) // Monday
    const lastWeekEnd = endOfWeek(latest, { weekStartsOn: 1 })

    while (currentWeekStart <= lastWeekEnd) {
      const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })
      const daysInWeek = eachDayOfInterval({ start: currentWeekStart, end: weekEnd })

      const weekData = {
        start: currentWeekStart,
        end: weekEnd,
        days: daysInWeek.map(day => ({
          date: day,
          posts: posts.filter(post => isSameDay(new Date(post.scheduled_for), day))
        })).filter(day => day.posts.length > 0) // Only include days with posts
      }

      if (weekData.days.length > 0) {
        weeks.push(weekData)
      }

      currentWeekStart = addWeeks(currentWeekStart, 1)
    }

    return weeks
  }

  const weeks = groupedPosts()

  const getTimeLabel = (hour: number) => {
    if (hour === 8) return '8am'
    if (hour === 12) return '12pm'
    if (hour === 18) return '6pm'
    return `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`
  }

  return (
    <div className="space-y-8">
      {weeks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No scheduled posts</p>
        </div>
      ) : (
        weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Week of {format(week.start, 'MMM d')} - {format(week.end, 'MMM d, yyyy')}
            </h3>

            <div className="space-y-6">
              {week.days.map((day, dayIdx) => (
                <div key={dayIdx} className="border-l-2 border-gray-200 pl-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">
                    {format(day.date, 'EEEE, MMM d')}
                  </h4>

                  <div className="space-y-3">
                    {[8, 12, 18].map(hour => {
                      const post = day.posts.find(p => {
                        const postDate = new Date(p.scheduled_for)
                        return postDate.getHours() === hour
                      })

                      return (
                        <div key={hour} className="flex gap-3">
                          <div className="w-16 flex-shrink-0">
                            <span className="text-xs font-medium text-gray-500">
                              {getTimeLabel(hour)}
                            </span>
                          </div>

                          {post ? (
                            <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex gap-3">
                                {/* Thumbnail */}
                                <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0 relative">
                                  <MediaPreview
                                    mediaUrl={post.image_url}
                                    mediaType={post.media_type || 'image'}
                                    alt="Post preview"
                                  />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    {getStatusBadge(post.status)}

                                    {post.status === 'pending' && (
                                      <div className="flex gap-1">
                                        <button
                                          onClick={() => startEdit(post)}
                                          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          onClick={() => handleCancel(post.id)}
                                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    )}
                                  </div>

                                  {editingId === post.id ? (
                                    <div className="space-y-2 mt-2">
                                      <textarea
                                        value={editCaption}
                                        onChange={(e) => setEditCaption(e.target.value)}
                                        rows={2}
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      />
                                      <input
                                        type="text"
                                        value={editHashtags}
                                        onChange={(e) => setEditHashtags(e.target.value)}
                                        placeholder="hashtag1, hashtag2"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                      />
                                      <div className="flex gap-2">
                                        <button
                                          onClick={handleSaveEdit}
                                          className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingId(null)}
                                          className="px-2 py-1 bg-gray-200 text-gray-700 rounded text-xs font-medium"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-xs text-gray-700 line-clamp-2 mt-1">
                                      {post.caption}
                                    </p>
                                  )}

                                  {post.error_message && (
                                    <p className="text-xs text-red-600 mt-1">
                                      {post.error_message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex-1 text-xs text-gray-400">
                              —
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
