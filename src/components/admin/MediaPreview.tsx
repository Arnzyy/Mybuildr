import Image from 'next/image'

interface MediaPreviewProps {
  mediaUrl: string
  mediaType: 'image' | 'video'
  alt: string
  className?: string
}

export default function MediaPreview({ mediaUrl, mediaType, alt, className = '' }: MediaPreviewProps) {
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
    />
  )
}
