'use client'

import { useState } from 'react'
import Image from 'next/image'
import { format } from 'date-fns'
import { Calendar, Check, X, AlertCircle, Edit2, Trash2 } from 'lucide-react'

interface Post {
  id: string
  image_url: string
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
  const [posts, setPosts] = useState(initialPosts)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editHashtags, setEditHashtags] = useState('')

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this scheduled post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setPosts(posts.map(p =>
          p.id === id ? { ...p, status: 'skipped' } : p
        ))
      }
    } catch {
      alert('Failed to cancel post')
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
        setPosts(posts.map(p =>
          p.id === editingId
            ? { ...p, caption: editCaption, hashtags: editHashtags.split(',').map(h => h.trim()) }
            : p
        ))
        setEditingId(null)
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

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex gap-4">
            {/* Image */}
            <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              <Image
                src={post.image_url}
                alt="Post preview"
                fill
                className="object-cover"
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
                    <button
                      onClick={() => startEdit(post)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleCancel(post.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
