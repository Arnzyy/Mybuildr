'use client'

import { useRouter, useSearchParams } from 'next/navigation'

export default function PostsStatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'all'
  const view = searchParams.get('view') || 'list'

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams()
    if (newStatus !== 'all') {
      params.set('status', newStatus)
    }
    if (view !== 'list') {
      params.set('view', view)
    }
    router.push(`/admin/posts${params.toString() ? '?' + params.toString() : ''}`)
  }

  const tabs = [
    { value: 'all', label: 'All Posts' },
    { value: 'pending', label: 'Scheduled' },
    { value: 'posted', label: 'Posted' },
  ]

  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => handleStatusChange(tab.value)}
          className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 -mb-px ${
            status === tab.value
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
