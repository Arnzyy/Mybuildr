'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Edit2, Trash2, Save, X } from 'lucide-react'
import { format } from 'date-fns'

interface PostDetailActionsProps {
  post: {
    id: string
    status: string
    scheduled_for: string
    caption: string
    hashtags: string[]
  }
}

export default function PostDetailActions({ post }: PostDetailActionsProps) {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [scheduledFor, setScheduledFor] = useState(
    format(new Date(post.scheduled_for), "yyyy-MM-dd'T'HH:mm")
  )
  const [caption, setCaption] = useState(post.caption)
  const [hashtags, setHashtags] = useState(post.hashtags?.join(', ') || '')
  const [saving, setSaving] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return

    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        router.push('/admin/posts')
      } else {
        alert('Failed to delete post')
      }
    } catch {
      alert('Failed to delete post')
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/posts/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduled_for: new Date(scheduledFor).toISOString(),
          caption,
          hashtags: hashtags.split(',').map(h => h.trim()).filter(Boolean),
        }),
      })

      if (res.ok) {
        setIsEditing(false)
        router.refresh()
      } else {
        alert('Failed to save changes')
      }
    } catch {
      alert('Failed to save changes')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Edit Form */}
      {isEditing && post.status === 'pending' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Edit Post</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Scheduled For
              </label>
              <input
                type="datetime-local"
                value={scheduledFor}
                onChange={(e) => setScheduledFor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Caption
              </label>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtags
              </label>
              <input
                type="text"
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="hashtag1, hashtag2, hashtag3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setIsEditing(false)
                  setScheduledFor(format(new Date(post.scheduled_for), "yyyy-MM-dd'T'HH:mm"))
                  setCaption(post.caption)
                  setHashtags(post.hashtags?.join(', ') || '')
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
        <div className="space-y-2">
          {post.status === 'pending' && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit Post
            </button>
          )}

          {(post.status === 'pending' || post.status === 'failed') && (
            <button
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Post
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
