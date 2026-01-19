'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Project } from '@/lib/supabase/types'
import ImageUploader from './ImageUploader'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface ProjectFormProps {
  companySlug: string
  project?: Project
}

export default function ProjectForm({ companySlug, project }: ProjectFormProps) {
  const router = useRouter()
  const isEditing = !!project

  const [loading, setLoading] = useState(false)
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

    if (!formData.title.trim()) {
      alert('Please enter a project title')
      return
    }

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
          images,
        }),
      })

      if (res.ok) {
        router.push('/admin/projects')
        router.refresh()
      } else {
        const data = await res.json()
        alert(data.error || 'Failed to save project')
      }
    } catch {
      alert('Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Back link */}
      <Link
        href="/admin/projects"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to projects
      </Link>

      {/* Images */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Project Photos</h2>
        <ImageUploader
          images={images}
          onChange={setImages}
          companySlug={companySlug}
        />
      </div>

      {/* Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Project Details</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Kitchen Extension - Bristol"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe the project, what you did, any challenges..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bristol, BS1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Type
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
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="roofing">Roofing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              name="is_featured"
              checked={formData.is_featured}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
            />
            <label htmlFor="is_featured" className="text-sm text-gray-700">
              Feature this project (shows prominently on your website)
            </label>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-end gap-4">
        <Link
          href="/admin/projects"
          className="px-6 py-3 text-gray-700 font-medium hover:text-gray-900"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Project'}
        </button>
      </div>
    </form>
  )
}
