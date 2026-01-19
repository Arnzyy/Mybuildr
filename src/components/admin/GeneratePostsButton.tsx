'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function GeneratePostsButton() {
  const [loading, setLoading] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/posts/generate', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Generated ${data.postsScheduled} new posts!`)
        window.location.reload()
      } else {
        alert(data.error || 'Failed to generate posts')
      }
    } catch {
      alert('Failed to generate posts')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleGenerate}
      disabled={loading}
      className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
    >
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Generating...' : 'Generate Posts'}
    </button>
  )
}
