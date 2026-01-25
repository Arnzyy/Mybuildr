'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FolderOpen, Image as ImageIcon, Edit, Trash2, Layers } from 'lucide-react'
import { format } from 'date-fns'
import type { Project, MediaItem } from '@/lib/supabase/types'

interface MediaLibraryViewProps {
  projects: Project[]
  individualImages: MediaItem[]
}

export default function MediaLibraryView({ projects, individualImages }: MediaLibraryViewProps) {
  const router = useRouter()
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  const handleDelete = async (type: 'project' | 'image', id: string) => {
    if (!confirm(`Delete this ${type}?`)) return

    const endpoint = type === 'project' ? `/api/admin/projects/${id}` : `/api/admin/media/${id}`
    const res = await fetch(endpoint, { method: 'DELETE' })

    if (res.ok) {
      router.refresh()
    } else {
      alert(`Failed to delete ${type}`)
    }
  }

  return (
    <div className="space-y-8">
      {/* Projects Section */}
      {projects.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FolderOpen className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold text-gray-900">Projects</h2>
            <span className="text-sm text-gray-500">({projects.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Project Cover Image */}
                <div className="relative aspect-video bg-gray-100">
                  {project.featured_image_url ? (
                    <img
                      src={project.featured_image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FolderOpen className="w-12 h-12 text-gray-300" />
                    </div>
                  )}

                  {/* Carousel Indicator */}
                  {project.images && project.images.length > 1 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs font-medium">
                      <Layers className="w-3 h-3" />
                      {project.images.length} photos
                    </div>
                  )}
                </div>

                {/* Project Details */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{project.title}</h3>
                  {project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {project.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between mt-3">
                    <div className="text-xs text-gray-500">
                      {project.used_in_post ? (
                        <span className="text-green-600">Posted to socials</span>
                      ) : (
                        <span>Not posted yet</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => router.push(`/admin/projects/${project.id}`)}
                        className="p-1.5 text-gray-600 hover:text-orange-500 hover:bg-orange-50 rounded"
                        title="Edit project"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete('project', project.id)}
                        className="p-1.5 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded"
                        title="Delete project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Individual Images Section */}
      {individualImages.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Individual Images</h2>
            <span className="text-sm text-gray-500">({individualImages.length})</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {individualImages.map((image) => (
              <div
                key={image.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={image.image_url}
                    alt={image.title || 'Image'}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="p-3">
                  {image.title && (
                    <p className="text-sm font-medium text-gray-900 truncate mb-1">
                      {image.title}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {image.times_posted > 0 ? (
                        <span className="text-green-600">Posted {image.times_posted}x</span>
                      ) : (
                        <span>Not posted</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleDelete('image', image.id)}
                      className="p-1 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded"
                      title="Delete image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
