'use client'

import { useState, useRef } from 'react'
import { MediaItem } from '@/lib/supabase/types'
import Image from 'next/image'
import {
  Trash2,
  Upload,
  X,
  Check,
  Edit2,
  Image as ImageIcon,
  MapPin,
  Calendar,
  BarChart
} from 'lucide-react'

interface MediaLibraryProps {
  initialMedia: MediaItem[]
}

export default function MediaLibrary({ initialMedia }: MediaLibraryProps) {
  const [media, setMedia] = useState(initialMedia)
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<MediaItem>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    for (const file of Array.from(files)) {
      try {
        const formData = new FormData()
        formData.append('file', file)

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
    }

    setUploading(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
      {/* Upload area */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
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
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            uploading
              ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
              : 'border-gray-300 hover:border-orange-500 hover:bg-orange-50'
          }`}
        >
          {uploading ? (
            <>
              <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-gray-600 font-medium">Uploading...</p>
            </>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-gray-600 font-medium">Click to upload images</p>
              <p className="text-sm text-gray-400 mt-1">
                JPG, PNG, WebP, or HEIC (max 10MB each)
              </p>
            </>
          )}
        </label>
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
                  <textarea
                    placeholder="Description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none"
                    rows={2}
                  />
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
    </div>
  )
}
