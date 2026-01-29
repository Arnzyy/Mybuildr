'use client'

import Image from 'next/image'
import { ImageIcon } from 'lucide-react'
import { useState } from 'react'

interface MediaPreviewProps {
  mediaUrl: string
  mediaType: 'image' | 'video'
  alt: string
  className?: string
}

export default function MediaPreview({ mediaUrl, mediaType, alt, className = '' }: MediaPreviewProps) {
  const [errored, setErrored] = useState(false)

  if (!mediaUrl || errored) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 w-full h-full ${className}`}>
        <ImageIcon className="w-8 h-8 text-gray-400" />
      </div>
    )
  }

  if (mediaType === 'video') {
    return (
      <video
        src={mediaUrl}
        className={`object-cover ${className}`}
        controls={false}
        muted
        playsInline
        preload="metadata"
      />
    )
  }

  return (
    <Image
      src={mediaUrl}
      alt={alt}
      fill
      className={`object-cover ${className}`}
      onError={() => setErrored(true)}
    />
  )
}
