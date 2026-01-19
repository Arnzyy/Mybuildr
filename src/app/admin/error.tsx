'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Admin error:', error)
  }, [error])

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">⚠️</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We encountered an error loading this page. Please try again.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={reset}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600"
          >
            Try Again
          </button>
          <Link
            href="/admin"
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
