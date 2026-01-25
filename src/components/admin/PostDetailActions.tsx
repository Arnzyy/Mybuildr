'use client'

import { useRouter } from 'next/navigation'
import { Edit2, Trash2 } from 'lucide-react'

interface PostDetailActionsProps {
  post: {
    id: string
    status: string
  }
}

export default function PostDetailActions({ post }: PostDetailActionsProps) {
  const router = useRouter()

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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-3">Actions</h3>
      <div className="space-y-2">
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
  )
}
