'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Project } from '@/lib/supabase/types'

interface DaxaGalleryProps {
  projects: Project[]
}

export default function DaxaGallery({ projects }: DaxaGalleryProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true)
      },
      { threshold: 0.1 }
    )
    if (sectionRef.current) observer.observe(sectionRef.current)
    return () => observer.disconnect()
  }, [])

  if (projects.length === 0) {
    return null
  }

  return (
    <section id="gallery" ref={sectionRef} className="py-20 lg:py-32 bg-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div
          className={`text-center max-w-2xl mx-auto mb-14 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Recent Projects
          </h2>
          <p className="text-white/50 text-lg leading-relaxed">
            A selection of our completed work across Somerset.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {projects.slice(0, 8).map((project, index) => (
            <div
              key={project.id}
              className={`group relative aspect-square overflow-hidden rounded-lg transition-all duration-500 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              } ${index === 0 || index === 5 ? 'md:col-span-2 md:row-span-2' : ''}`}
              style={{ transitionDelay: `${index * 60}ms` }}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              {project.featured_image_url && (
                <Image
                  src={project.featured_image_url}
                  alt={project.title}
                  fill
                  className={`object-cover transition-transform duration-500 ${
                    hoveredIndex === index ? 'scale-105' : 'scale-100'
                  }`}
                />
              )}
              <div
                className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
                  hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                }`}
              />
              <div
                className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${
                  hoveredIndex === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                }`}
              >
                <p className="text-white/70 text-xs mb-1">{project.project_type || 'Project'}</p>
                <h3 className="text-white font-medium">{project.title}</h3>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className={`mt-10 text-center transition-all duration-1000 delay-300 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-medium transition-colors"
          >
            <span>Get in touch to discuss your project</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}
