'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function PostsStatusFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const status = searchParams.get('status') || 'pending'

  const handleStatusChange = (newStatus: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (newStatus === 'pending') {
      params.delete('status')
    } else {
      params.set('status', newStatus)
    }

    const queryString = params.toString()
    router.push(queryString ? `${pathname}?${queryString}` : pathname)
  }

  const tabs = [
    { value: 'pending', label: 'Scheduled' },
    { value: 'posted', label: 'Posted' },
    { value: 'all', label: 'All Posts' },
  ]

  return (
    <div className="flex gap-2 mb-6 border-b border-gray-200">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
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
