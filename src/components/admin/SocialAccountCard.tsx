'use client'

import { useState } from 'react'
import { Check, Loader2, Instagram, Facebook, MapPin } from 'lucide-react'

interface Platform {
  id: string
  name: string
  color: string
  description: string
}

const platformIcons = {
  instagram: Instagram,
  facebook: Facebook,
  google: MapPin,
}

interface Token {
  account_name?: string
  is_connected: boolean
  token_expires_at?: string
}

interface SocialAccountCardProps {
  platform: Platform
  token: Token | null | undefined
  isConnected: boolean
  companyId: string
}

export default function SocialAccountCard({
  platform,
  token,
  isConnected,
}: SocialAccountCardProps) {
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/admin/social/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id }),
      })

      const data = await res.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else {
        alert(data.error || 'Failed to start connection')
        setLoading(false)
      }
    } catch {
      alert('Failed to connect')
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm(`Disconnect ${platform.name}? Auto-posting will stop for this platform.`)) {
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/social/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform: platform.id }),
      })

      if (res.ok) {
        window.location.reload()
      } else {
        alert('Failed to disconnect')
      }
    } catch {
      alert('Failed to disconnect')
    } finally {
      setLoading(false)
    }
  }

  const Icon = platformIcons[platform.id as keyof typeof platformIcons] || MapPin

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header with icon */}
      <div className={`${platform.color} p-6 text-white`}>
        <Icon className="w-8 h-8 mb-3" />
        <h3 className="text-lg font-semibold">{platform.name}</h3>
        <p className="text-sm opacity-90">{platform.description}</p>
      </div>

      {/* Content */}
      <div className="p-6">
        {isConnected && token ? (
          <>
            {/* Connected state */}
            <div className="flex items-center gap-3 mb-4">
              <div>
                <p className="font-medium text-gray-900">
                  {token.account_name || 'Connected'}
                </p>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Connected
                </p>
              </div>
            </div>

            {/* Token expiry warning */}
            {token.token_expires_at && new Date(token.token_expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && (
              <p className="text-xs text-yellow-600 mb-4">
                Token expires soon. Reconnect to continue posting.
              </p>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleConnect}
                disabled={loading}
                className="flex-1 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Reconnect
              </button>
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="py-2 px-4 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                Disconnect
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Disconnected state */}
            <p className="text-sm text-gray-500 mb-4">
              Not connected
            </p>
            <button
              onClick={handleConnect}
              disabled={loading}
              className={`w-full py-3 rounded-lg font-medium text-white transition-colors disabled:opacity-50 ${platform.color}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </span>
              ) : (
                `Connect ${platform.name}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
