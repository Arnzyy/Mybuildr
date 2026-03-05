'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'

interface PendingUpload {
  file: File
  preview: string
  description: string
  location: string
}

export default function QuickImageUpload({ variant = 'button' }: { variant?: 'button' | 'card' }) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newPending: PendingUpload[] = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        description: '',
        location: ''
      }))
      setPendingUploads(newPending)
      setShowModal(true)
    }
  }

  const updatePendingUpload = (index: number, field: 'description' | 'location', value: string) => {
    setPendingUploads(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const compressImage = async (file: File, maxWidth = 2048, quality = 0.8): Promise<File> => {
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

  const handleUpload = async () => {
    if (pendingUploads.length === 0) return

    setUploading(true)

    try {
      for (const pending of pendingUploads) {
        const compressed = await compressImage(pending.file)
        const formData = new FormData()
        formData.append('file', compressed)
        formData.append('description', pending.description)
        formData.append('location', pending.location)

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (!res.ok) {
          throw new Error(`Failed to upload ${pending.file.name}`)
        }

        URL.revokeObjectURL(pending.preview)
      }

      setShowModal(false)
      setPendingUploads([])
      router.refresh()
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const removeFile = (index: number) => {
    const removed = pendingUploads[index]
    if (removed) URL.revokeObjectURL(removed.preview)
    setPendingUploads(pendingUploads.filter((_, i) => i !== index))
  }

  return (
    <>
      {/* Upload Button / Card */}
      {variant === 'card' ? (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full text-left bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:border-blue-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Upload Images</h3>
              <p className="text-sm text-gray-600 mb-2">
                Quick upload individual images
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Each image posts as a single social media post</li>
                <li>• Automatically scheduled to post</li>
                <li>• No project details needed</li>
              </ul>
            </div>
          </div>
        </button>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
        >
          <ImageIcon className="w-4 h-4" />
          <span>Upload Images</span>
        </button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFilesSelected}
        className="hidden"
      />

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Add Details to Your Images</h2>
                <p className="text-sm text-gray-600">
                  {pendingUploads.length} {pendingUploads.length === 1 ? 'image' : 'images'} selected
                </p>
              </div>
              <button
                onClick={() => {
                  pendingUploads.forEach(p => URL.revokeObjectURL(p.preview))
                  setPendingUploads([])
                  setShowModal(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg"
                disabled={uploading}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Image Previews with Caption Fields */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {pendingUploads.map((pending, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 flex gap-4">
                  <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image
                      src={pending.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      disabled={uploading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={pending.description}
                        onChange={(e) => updatePendingUpload(index, 'description', e.target.value)}
                        placeholder="e.g. Kitchen extension nearly finished, just fitting the worktops"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                        rows={2}
                        disabled={uploading}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This guides the AI caption - describe what&apos;s in the photo
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location (optional)
                      </label>
                      <input
                        type="text"
                        value={pending.location}
                        onChange={(e) => updatePendingUpload(index, 'location', e.target.value)}
                        placeholder="e.g. Bristol"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => {
                    pendingUploads.forEach(p => URL.revokeObjectURL(p.preview))
                    setPendingUploads([])
                    setShowModal(false)
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                  disabled={uploading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading || pendingUploads.length === 0}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Upload {pendingUploads.length}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
