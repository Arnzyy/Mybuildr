'use client'

import { useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { Calendar, Check, X, AlertCircle, Edit2, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
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

interface PostsListProps {
  initialPosts: Post[]
}

export default function PostsList({ initialPosts }: PostsListProps) {
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

  const handleReorder = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= posts.length) return

    const post1 = posts[index]
    const post2 = posts[newIndex]

    // Swap scheduled times
    try {
      const res = await fetch('/api/admin/posts/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post1_id: post1.id,
          post1_time: post2.scheduled_for,
          post2_id: post2.id,
          post2_time: post1.scheduled_for,
        }),
      })

      if (res.ok) {
        // Refresh the page to show updated order
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to reorder posts')
      }
    } catch (error) {
      console.error('Reorder error:', error)
      alert('Failed to reorder posts. Please try again.')
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

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex gap-4">
            {/* Media (Image or Video) */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              <MediaPreview
                mediaUrl={post.image_url}
                mediaType={post.media_type || 'image'}
                alt="Post preview"
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  {getStatusBadge(post.status)}
                  <p className="text-sm text-gray-500 mt-1">
                    {post.status === 'posted' && post.posted_at
                      ? `Posted ${format(new Date(post.posted_at), 'MMM d, yyyy h:mm a')}`
                      : `Scheduled for ${format(new Date(post.scheduled_for), 'MMM d, yyyy h:mm a')}`
                    }
                  </p>
                </div>

                {post.status === 'pending' && (
                  <div className="flex gap-2">
                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => handleReorder(index, 'up')}
                        disabled={index === 0}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move earlier"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReorder(index, 'down')}
                        disabled={index === posts.length - 1}
                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move later"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => startEdit(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCancel(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {post.status === 'failed' && (
                  <button
                    type="button"
                    onClick={() => handleCancel(post.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Caption */}
              {editingId === post.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    value={editHashtags}
                    onChange={(e) => setEditHashtags(e.target.value)}
                    placeholder="hashtag1, hashtag2, hashtag3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-3 py-1 bg-orange-500 text-white rounded text-sm font-medium"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-700 line-clamp-2">
                    {post.caption}
                  </p>
                  {post.hashtags && post.hashtags.length > 0 && (
                    <p className="text-xs text-blue-500 mt-1">
                      {post.hashtags.map(h => `#${h}`).join(' ')}
                    </p>
                  )}
                </>
              )}

              {/* Error message */}
              {post.status === 'failed' && post.error_message && (
                <p className="text-xs text-red-600 mt-2">
                  Error: {post.error_message}
                </p>
              )}

              {/* Project reference */}
              {post.project && (
                <p className="text-xs text-gray-400 mt-2">
                  From: {post.project.title}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
