'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/supabase/types'
import ImageUploader from './ImageUploader'
import { ArrowLeft, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'

interface ProjectFormProps {
  companySlug: string
  project?: Project
}

export default function ProjectForm({ companySlug, project }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!project

  const [loading, setLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(isEditing)
  const [formData, setFormData] = useState({
    title: project?.title || '',
    description: project?.description || '',
    location: project?.location || '',
    project_type: project?.project_type || '',
    is_featured: project?.is_featured || false,
  })
  const [images, setImages] = useState<string[]>(project?.images || [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (images.length === 0) {
      alert('Please add at least one photo')
      return
    }

    // Auto-generate title if not provided
    const title = formData.title.trim() || `Project ${new Date().toLocaleDateString('en-GB')}`

    setLoading(true)

    try {
      const url = isEditing
        ? `/api/admin/projects/${project.id}`
        : '/api/admin/projects'

      const res = await fetch(url, {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          title,
          images,
        }),
      })

      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save')
      }
    } catch {
      alert('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Back link */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* PHOTOS - Main focus */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6">
        <ImageUploader
          images={images}
          onChange={setImages}
          companySlug={companySlug}
        />
      </div>

      {/* Quick submit button */}
      <button
        type="submit"
        disabled={loading || images.length === 0}
        className="w-full py-4 bg-orange-500 text-white rounded-xl font-bold text-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Uploading...' : images.length === 0 ? 'Add Photos to Continue' : 'Upload to Website'}
      </button>

      {/* Optional details - collapsed by default */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
        >
          <span className="text-sm text-gray-600">Add more details (optional)</span>
          {showDetails ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </button>

        {showDetails && (
          <div className="px-4 pb-4 space-y-4 border-t border-gray-100 pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Kitchen Extension"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bristol"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type of Work
              </label>
              <select
                name="project_type"
                value={formData.project_type}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Select type</option>
                <option value="extension">Extension</option>
                <option value="renovation">Renovation</option>
                <option value="new_build">New Build</option>
                <option value="loft_conversion">Loft Conversion</option>
                <option value="kitchen">Kitchen</option>
                <option value="bathroom">Bathroom</option>
                <option value="landscaping">Landscaping</option>
                <option value="roofing">Roofing</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Any details about the work..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  )
}
