'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { List, Calendar } from 'lucide-react'

export default function PostsViewToggle() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'list'

  return (
    <div className="flex gap-2 mb-6">
      <button
        onClick={() => router.push('/admin/posts?view=list')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          view === 'list'
            ? 'bg-orange-500 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <List className="w-4 h-4" />
        <span className="text-sm font-medium">List View</span>
      </button>
      <button
        onClick={() => router.push('/admin/posts?view=timeline')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          view === 'timeline'
            ? 'bg-orange-500 text-white'
            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span className="text-sm font-medium">Timeline</span>
      </button>
    </div>
  )
}
