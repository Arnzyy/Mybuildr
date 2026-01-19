'use client'

import { useState } from 'react'
import { Project } from '@/lib/supabase/types'
import Link from 'next/link'
import Image from 'next/image'
import { GripVertical, Edit, Trash2, Image as ImageIcon } from 'lucide-react'

interface ProjectsListProps {
  initialProjects: Project[]
}

export default function ProjectsList({ initialProjects }: ProjectsListProps) {
  const [projects, setProjects] = useState(initialProjects)
  const [deleting, setDeleting] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) {
      return
    }

    setDeleting(id)

    try {
      const res = await fetch(`/api/admin/projects/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setProjects(projects.filter(p => p.id !== id))
      } else {
        alert('Failed to delete project')
      }
    } catch {
      alert('Failed to delete project')
    } finally {
      setDeleting(null)
    }
  }

  const handleReorder = async (dragIndex: number, dropIndex: number) => {
    const newProjects = [...projects]
    const [removed] = newProjects.splice(dragIndex, 1)
    newProjects.splice(dropIndex, 0, removed)
    setProjects(newProjects)

    // Save new order
    try {
      await fetch('/api/admin/projects/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectIds: newProjects.map(p => p.id),
        }),
      })
    } catch {
      console.error('Failed to save order')
    }
  }

  return (
    <div className="space-y-4">
      {projects.map((project, index) => (
        <div
          key={project.id}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          {/* Mobile layout */}
          <div className="flex gap-3 sm:hidden">
            {/* Image preview */}
            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              {project.images && project.images[0] ? (
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-6 h-6 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info and actions */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-gray-900 truncate text-sm">{project.title}</h3>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(project.id)}
                    disabled={deleting === project.id}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {project.description || 'No description'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {project.images?.length || 0} images
                {project.location && ` • ${project.location}`}
              </p>
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Drag handle */}
            <button className="cursor-grab text-gray-400 hover:text-gray-600">
              <GripVertical className="w-5 h-5" />
            </button>

            {/* Image preview */}
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 relative">
              {project.images && project.images[0] ? (
                <Image
                  src={project.images[0]}
                  alt={project.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{project.title}</h3>
              <p className="text-sm text-gray-500 truncate">
                {project.description || 'No description'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {project.images?.length || 0} images
                {project.location && ` • ${project.location}`}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/projects/${project.id}`}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <Edit className="w-5 h-5" />
              </Link>
              <button
                onClick={() => handleDelete(project.id)}
                disabled={deleting === project.id}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      ))}

      <p className="text-sm text-gray-500 text-center pt-4 hidden sm:block">
        Drag projects to reorder how they appear on your website
      </p>
    </div>
  )
}
