'use client'

import { useState } from 'react'
import { Download, Loader2 } from 'lucide-react'

interface ImportReviewsButtonProps {
  variant?: 'primary' | 'secondary'
}

export default function ImportReviewsButton({
  variant = 'primary'
}: ImportReviewsButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleImport = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch('/api/admin/reviews/scrape', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok) {
        setResult({ success: true, message: data.message })
        if (data.imported > 0) {
          setTimeout(() => window.location.reload(), 1500)
        }
      } else {
        setResult({ success: false, message: data.error || 'Import failed' })
      }
    } catch {
      setResult({ success: false, message: 'Import failed' })
    } finally {
      setLoading(false)
    }
  }

  const buttonClass = variant === 'primary'
    ? 'bg-blue-600 text-white hover:bg-blue-700'
    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'

  return (
    <div className="mb-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-medium text-blue-900">Import from Checkatrade</p>
          <p className="text-sm text-blue-700">Pull your latest reviews automatically</p>
        </div>
        <button
          onClick={handleImport}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${buttonClass}`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          {loading ? 'Importing...' : 'Import Reviews'}
        </button>
      </div>

      {result && (
        <p className={`mt-2 text-sm ${result.success ? 'text-green-600' : 'text-red-600'}`}>
          {result.message}
        </p>
      )}
    </div>
  )
}
