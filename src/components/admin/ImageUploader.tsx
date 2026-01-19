'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, GripVertical, Loader2 } from 'lucide-react'

interface ImageUploaderProps {
  images: string[]
  onChange: (images: string[]) => void
  companySlug: string
  maxImages?: number
}

export default function ImageUploader({
  images,
  onChange,
  companySlug,
  maxImages = 10
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const uploadFile = async (file: File): Promise<string | null> => {
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.ok) {
        const { url } = await res.json()
        return url
      } else {
        const { error } = await res.json()
        alert(error || 'Upload failed')
        return null
      }
    } catch {
      alert('Upload failed')
      return null
    }
  }

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (remainingSlots <= 0) {
      alert(`Maximum ${maxImages} images allowed`)
      return
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots)
    setUploading(true)

    const newUrls: string[] = []
    for (const file of filesToUpload) {
      const url = await uploadFile(file)
      if (url) {
        newUrls.push(url)
      }
    }

    if (newUrls.length > 0) {
      onChange([...images, ...newUrls])
    }

    setUploading(false)
  }, [images, maxImages, onChange])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }, [])

  const removeImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [removed] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, removed)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragOver
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-2" />
            <p className="text-gray-600">Uploading...</p>
          </div>
        ) : (
          <>
            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-2">
              Drag & drop images here, or{' '}
              <label className="text-orange-500 hover:underline cursor-pointer">
                browse
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFiles(e.target.files)}
                  className="hidden"
                />
              </label>
            </p>
            <p className="text-xs text-gray-400">
              JPG, PNG or WebP. Max 10MB per file. {images.length}/{maxImages} images.
            </p>
          </>
        )}
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100"
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Drag handle */}
                <button
                  type="button"
                  className="p-2 bg-white rounded-lg text-gray-700 hover:bg-gray-100"
                  title="Drag to reorder"
                >
                  <GripVertical className="w-4 h-4" />
                </button>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-white rounded-lg text-red-600 hover:bg-red-50"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* First image badge */}
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs px-2 py-1 rounded">
                  Cover
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p className="text-xs text-gray-500 text-center">
          First image is used as the cover photo. Drag to reorder.
        </p>
      )}
    </div>
  )
}
