'use client'

import { useState } from 'react'
import { Project } from '@/lib/supabase/types'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface SiteGalleryProps {
  projects: Project[]
  variant?: 'grid' | 'masonry' | 'carousel'
  primaryColor?: string
}

export default function SiteGallery({
  projects,
  variant = 'grid',
  primaryColor = '#1e3a5f'
}: SiteGalleryProps) {
  const [lightbox, setLightbox] = useState<{ projectIndex: number; imageIndex: number } | null>(null)

  if (projects.length === 0) return null

  // Get all images from all projects
  const allImages = projects.flatMap((project, projectIndex) =>
    (project.images || []).map((image, imageIndex) => ({
      url: image,
      title: project.title,
      projectIndex,
      imageIndex,
    }))
  )

  const openLightbox = (projectIndex: number, imageIndex: number) => {
    setLightbox({ projectIndex, imageIndex })
  }

  const closeLightbox = () => setLightbox(null)

  const currentImageIndex = lightbox
    ? allImages.findIndex(
        img => img.projectIndex === lightbox.projectIndex && img.imageIndex === lightbox.imageIndex
      )
    : -1

  const nextImage = () => {
    if (currentImageIndex < allImages.length - 1) {
      const next = allImages[currentImageIndex + 1]
      setLightbox({ projectIndex: next.projectIndex, imageIndex: next.imageIndex })
    }
  }

  const prevImage = () => {
    if (currentImageIndex > 0) {
      const prev = allImages[currentImageIndex - 1]
      setLightbox({ projectIndex: prev.projectIndex, imageIndex: prev.imageIndex })
    }
  }

  return (
    <section id="projects" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Work
          </h2>
          <p className="text-gray-600">
            See some of our recent projects
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {projects.map((project, pIndex) => (
            project.images?.map((image, iIndex) => (
              <div
                key={`${project.id}-${iIndex}`}
                className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
                onClick={() => openLightbox(pIndex, iIndex)}
              >
                <img
                  src={image}
                  alt={project.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-end">
                  <p className="text-white p-4 opacity-0 group-hover:opacity-100 transition-opacity font-medium">
                    {project.title}
                  </p>
                </div>
              </div>
            ))
          ))}
        </div>

        {/* Lightbox */}
        {lightbox && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={closeLightbox}
          >
            <button
              className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full"
              onClick={closeLightbox}
            >
              <X className="w-8 h-8" />
            </button>

            {currentImageIndex > 0 && (
              <button
                className="absolute left-4 text-white p-2 hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); prevImage() }}
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
            )}

            {currentImageIndex < allImages.length - 1 && (
              <button
                className="absolute right-4 text-white p-2 hover:bg-white/20 rounded-full"
                onClick={(e) => { e.stopPropagation(); nextImage() }}
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            )}

            <div className="max-w-4xl max-h-[90vh] p-4" onClick={(e) => e.stopPropagation()}>
              <img
                src={allImages[currentImageIndex]?.url}
                alt={allImages[currentImageIndex]?.title}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
              />
              <p className="text-white text-center mt-4 text-lg">
                {allImages[currentImageIndex]?.title}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
