'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We&apos;re sorry, but something unexpected happened. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
