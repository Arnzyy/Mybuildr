'use client'

import { useState } from 'react'

interface BillingPortalButtonProps {
  customerId: string
  label?: string
}

export default function BillingPortalButton({
  customerId,
  label = 'Manage Billing'
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })

      const { url, error } = await res.json()

      if (error) {
        alert('Failed to open billing portal. Please try again.')
        return
      }

      window.location.href = url
    } catch {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}
