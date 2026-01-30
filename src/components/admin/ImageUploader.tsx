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
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 })
  const [dragOver, setDragOver] = useState(false)
  const [reorderFrom, setReorderFrom] = useState<number | null>(null)

  const compressImage = async (file: File, maxWidth = 2048, quality = 0.8): Promise<File> => {
    // Skip non-image or already small files
    if (!file.type.startsWith('image/') || file.size < 1024 * 1024) return file

    return new Promise((resolve) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let { width, height } = img
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width)
          width = maxWidth
        }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')!
        ctx.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size < file.size) {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            } else {
              resolve(file)
            }
          },
          'image/jpeg',
          quality
        )
      }
      img.onerror = () => resolve(file)
      img.src = URL.createObjectURL(file)
    })
  }

  const uploadFile = async (file: File): Promise<string | null> => {
    const compressed = await compressImage(file)
    const formData = new FormData()
    formData.append('file', compressed)

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
    setUploadProgress({ current: 0, total: filesToUpload.length })

    const newUrls: string[] = []
    for (let i = 0; i < filesToUpload.length; i++) {
      setUploadProgress({ current: i + 1, total: filesToUpload.length })
      const url = await uploadFile(filesToUpload[i])
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
      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`block border-2 border-dashed rounded-xl p-8 md:p-12 text-center transition-colors cursor-pointer ${
          dragOver
            ? 'border-orange-500 bg-orange-50'
            : 'border-gray-300 hover:border-orange-400 hover:bg-orange-50/50'
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center w-full max-w-xs mx-auto">
            <p className="text-gray-900 font-semibold mb-1">
              Uploading photo {uploadProgress.current} of {uploadProgress.total}
            </p>
            <p className="text-gray-500 text-sm mb-4">Please don&apos;t close this page</p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0}%` }}
              />
            </div>
            <p className="text-gray-400 text-xs mt-2">
              {Math.round(uploadProgress.total > 0 ? (uploadProgress.current / uploadProgress.total) * 100 : 0)}%
            </p>
          </div>
        ) : (
          <>
            <div className="w-16 h-16 md:w-20 md:h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 md:w-10 md:h-10 text-orange-500" />
            </div>
            <p className="text-lg md:text-xl font-semibold text-gray-900 mb-1">
              Tap to add photos
            </p>
            <p className="text-gray-500 text-sm">
              or drag and drop
            </p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/heic"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </>
        )}
      </label>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((url, index) => (
            <div
              key={url}
              className={`relative aspect-square rounded-lg overflow-hidden bg-gray-100 ${
                reorderFrom === index
                  ? 'ring-3 ring-orange-500 scale-95'
                  : reorderFrom !== null
                    ? 'ring-2 ring-dashed ring-gray-300 cursor-pointer'
                    : ''
              }`}
              onClick={() => {
                if (reorderFrom !== null && reorderFrom !== index) {
                  moveImage(reorderFrom, index)
                  setReorderFrom(null)
                } else if (reorderFrom === index) {
                  setReorderFrom(null)
                }
              }}
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Action buttons - always visible on mobile */}
              <div className="absolute top-2 right-2 flex gap-1">
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setReorderFrom(reorderFrom === index ? null : index)
                    }}
                    className={`p-1.5 rounded-lg shadow-sm ${
                      reorderFrom === index
                        ? 'bg-orange-500 text-white'
                        : 'bg-white/90 text-gray-700'
                    }`}
                    title="Move image"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(index)
                  }}
                  className="p-1.5 bg-white/90 rounded-lg text-red-600 shadow-sm"
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

              {/* Drop target indicator */}
              {reorderFrom !== null && reorderFrom !== index && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <span className="bg-white text-gray-700 text-xs font-medium px-2 py-1 rounded shadow">
                    Move here
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {reorderFrom !== null && (
        <p className="text-xs text-orange-600 text-center font-medium">
          Tap where you want to move this photo, or tap the grip icon again to cancel.
        </p>
      )}

      {images.length > 1 && reorderFrom === null && (
        <p className="text-xs text-gray-500 text-center">
          First image is used as the cover photo. Tap the grip icon to reorder.
        </p>
      )}
    </div>
  )
}
