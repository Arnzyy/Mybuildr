'use client'

import { useState, useRef } from 'react'
import { MediaItem } from '@/lib/supabase/types'
import Image from 'next/image'
import Link from 'next/link'
import {
  Trash2,
  X,
  Check,
  Edit2,
  Image as ImageIcon,
  MapPin,
  Calendar,
  BarChart,
  FolderOpen,
  Loader2
} from 'lucide-react'

interface MediaLibraryProps {
  initialMedia: MediaItem[]
}

interface PendingUpload {
  file: File
  preview: string
  description: string
  location: string
}

export default function MediaLibrary({ initialMedia }: MediaLibraryProps) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MediaItem>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingUploads, setPendingUploads] = useState<PendingUpload[]>([])
  const [showUploadModal, setShowUploadModal] = useState(false)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Create pending uploads with previews
    const newPending: PendingUpload[] = []
    for (const file of Array.from(files)) {
      const preview = URL.createObjectURL(file)
      newPending.push({
        file,
        preview,
        description: '',
        location: ''
      })
    }

    setPendingUploads(newPending)
    setShowUploadModal(true)

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updatePendingUpload = (index: number, field: 'description' | 'location', value: string) => {
    setPendingUploads(prev => prev.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const removePendingUpload = (index: number) => {
    setPendingUploads(prev => {
      const updated = prev.filter((_, i) => i !== index)
      if (updated.length === 0) {
        setShowUploadModal(false)
      }
      return updated
    })
  }

  const submitUploads = async () => {
    setUploading(true)

    for (const pending of pendingUploads) {
      try {
        const formData = new FormData()
        formData.append('file', pending.file)
        formData.append('description', pending.description)
        formData.append('location', pending.location)

        const res = await fetch('/api/admin/media/upload', {
          method: 'POST',
          body: formData,
        })

        if (res.ok) {
          const { media: newMedia } = await res.json()
          setMedia(prev => [newMedia, ...prev])
        } else {
          const { error } = await res.json()
          alert(error || 'Failed to upload image')
        }
      } catch {
        alert('Failed to upload image')
      }
      // Clean up preview URL
      URL.revokeObjectURL(pending.preview)
    }

    setUploading(false)
    setPendingUploads([])
    setShowUploadModal(false)
  }

  const cancelUploads = () => {
    // Clean up preview URLs
    pendingUploads.forEach(p => URL.revokeObjectURL(p.preview))
    setPendingUploads([])
    setShowUploadModal(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this image? This cannot be undone.')) {
      return
    }

    setDeleting(id)

    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setMedia(media.filter(m => m.id !== id))
      } else {
        alert('Failed to delete image')
      }
    } catch {
      alert('Failed to delete image')
    } finally {
      setDeleting(null)
    }
  }

  const startEditing = (item: MediaItem) => {
    setEditingId(item.id)
    setEditForm({
      title: item.title || '',
      description: item.description || '',
      location: item.location || '',
      work_type: item.work_type || '',
    })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditForm({})
  }

  const saveEdit = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/media/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        const { media: updated } = await res.json()
        setMedia(media.map(m => m.id === id ? updated : m))
        setEditingId(null)
        setEditForm({})
      } else {
        alert('Failed to update image')
      }
    } catch {
      alert('Failed to update image')
    }
  }

  const toggleAvailability = async (item: MediaItem) => {
    try {
      const res = await fetch(`/api/admin/media/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !item.is_available }),
      })

      if (res.ok) {
        const { media: updated } = await res.json()
        setMedia(media.map(m => m.id === item.id ? updated : m))
      }
    } catch {
      console.error('Failed to toggle availability')
    }
  }

  return (
    <div>
      {/* Upload options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Upload Project */}
        <Link
          href="/admin/projects/new"
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:border-orange-400 hover:shadow-md transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">Upload Project</h3>
              <p className="text-sm text-gray-600 mb-2">
                Create a project with multiple images
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Posts as carousel on Instagram/Facebook</li>
                <li>• Shows as portfolio project on website</li>
                <li>• Add title, description & location</li>
              </ul>
            </div>
          </div>
        </Link>

        {/* Upload Images */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 hover:border-blue-400 hover:shadow-md transition-all">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            id="media-upload"
          />
          <label
            htmlFor="media-upload"
            className={`flex items-start gap-4 ${uploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <ImageIcon className="w-6 h-6 text-white" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {uploading ? 'Uploading...' : 'Upload Images'}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                {uploading ? 'Processing your images' : 'Batch upload single images'}
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Posts as individual images to social media</li>
                <li>• Shows in gallery on website</li>
                <li>• Quick upload, no project details needed</li>
              </ul>
            </div>
          </label>
        </div>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {media.map((item) => (
          <div
            key={item.id}
            className={`bg-white rounded-xl border overflow-hidden ${
              item.is_available ? 'border-gray-200' : 'border-gray-300 opacity-60'
            }`}
          >
            {/* Image */}
            <div className="relative aspect-square">
              <Image
                src={item.image_url}
                alt={item.title || 'Media item'}
                fill
                className="object-cover"
              />
              {!item.is_available && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-gray-900/80 text-white px-3 py-1 rounded-full text-sm">
                    Paused
                  </span>
                </div>
              )}
            </div>

            {/* Info/Edit form */}
            <div className="p-4">
              {editingId === item.id ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Title"
                    value={editForm.title || ''}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div>
                    <textarea
                      placeholder="e.g. Kitchen extension nearly finished, just fitting the worktops"
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                      rows={2}
                    />
                    <p className="text-xs text-gray-500 mt-1">This guides the AI caption - describe what&apos;s in the photo</p>
                  </div>
                  <input
                    type="text"
                    placeholder="Location"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Work type"
                    value={editForm.work_type || ''}
                    onChange={(e) => setEditForm({ ...editForm, work_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => saveEdit(item.id)}
                      className="flex-1 flex items-center justify-center gap-1 bg-orange-500 text-white py-2 rounded-lg text-sm hover:bg-orange-600"
                    >
                      <Check className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={cancelEditing}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {item.title || 'Untitled'}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-500 truncate mt-1">
                        {item.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                    {item.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {item.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BarChart className="w-3 h-3" />
                      Posted {item.times_posted}x
                    </span>
                    {item.last_posted_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.last_posted_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAvailability(item)}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        item.is_available
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {item.is_available ? 'Active' : 'Paused'}
                    </button>
                    <button
                      onClick={() => startEditing(item)}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      disabled={deleting === item.id}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {media.length > 0 && (
        <p className="text-sm text-gray-500 text-center mt-6">
          Images are automatically rotated for social posts. Least-posted images are used first.
        </p>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Add Details to Your Images
              </h2>
              <button
                onClick={cancelUploads}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

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
                      onClick={() => removePendingUpload(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
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
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200 flex gap-3">
              <button
                onClick={cancelUploads}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitUploads}
                disabled={uploading}
                className="flex-1 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${pendingUploads.length} Image${pendingUploads.length > 1 ? 's' : ''}`
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
