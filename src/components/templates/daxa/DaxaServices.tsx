'use client'

import { useEffect, useRef, useState } from 'react'
import { Company } from '@/lib/supabase/types'

interface DaxaServicesProps {
  company: Company
}

const R2_BASE = 'https://pub-230d2c6e1ece421290be2447f48c41b8.r2.dev/daxa-construction/gallery'

const serviceData: Record<string, { description: string; image: string }> = {
  'Extensions': {
    description: 'Beautifully designed extensions that blend seamlessly with your home.',
    image: `${R2_BASE}/001.jpg`,
  },
  'Loft Conversions': {
    description: 'Expert conversions that add valuable living space and property value.',
    image: `${R2_BASE}/002.jpg`,
  },
  'Knock Throughs': {
    description: 'Open-plan living spaces that modernize your home layout.',
    image: `${R2_BASE}/003.jpg`,
  },
  'Renovations': {
    description: 'Complete renovations that breathe new life into tired properties.',
    image: `${R2_BASE}/004.jpg`,
  },
  'New Builds': {
    description: 'Quality construction from foundations to finishing touches.',
    image: `${R2_BASE}/005.jpg`,
  },
  'Garden Work': {
    description: 'Summer houses, patios, decking, and complete garden makeovers.',
    image: `${R2_BASE}/006.jpg`,
  },
}

const defaultServices = [
  { title: 'Extensions', ...serviceData['Extensions'] },
  { title: 'Loft Conversions', ...serviceData['Loft Conversions'] },
  { title: 'Knock Throughs', ...serviceData['Knock Throughs'] },
  { title: 'Renovations', ...serviceData['Renovations'] },
  { title: 'New Builds', ...serviceData['New Builds'] },
  { title: 'Garden Work', ...serviceData['Garden Work'] },
]

export default function DaxaServices({ company }: DaxaServicesProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Use company services if available, with images from serviceData
  const services = company.services && company.services.length > 0
    ? company.services.map((s, i) => ({
        title: s,
        description: serviceData[s]?.description || `Professional ${s.toLowerCase()} services.`,
        image: serviceData[s]?.image || `${R2_BASE}/${String(i + 1).padStart(3, '0')}.jpg`,
      }))
    : defaultServices

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute('data-index') || '0')
            setVisibleCards((prev) => [...new Set([...prev, index])])
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-index]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section id="services" ref={sectionRef} className="py-20 lg:py-32 bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900 mb-4">
            Our Services
          </h2>
          <p className="text-neutral-500 text-lg leading-relaxed">
            From concept to completion, we deliver outstanding craftsmanship across every aspect of construction and renovation.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <a
              key={service.title}
              href="#contact"
              data-index={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-500 ${
                visibleCards.includes(index)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 80}ms` }}
            >
              {/* Image */}
              <div className="relative h-52 overflow-hidden">
                <div
                  className={`absolute inset-0 bg-cover bg-center transition-transform duration-500 ${
                    hoveredIndex === index ? 'scale-105' : 'scale-100'
                  }`}
                  style={{ backgroundImage: `url('${service.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Title on image */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <h3 className="text-xl font-semibold text-white">
                    {service.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <p className="text-neutral-600 text-sm leading-relaxed">
                  {service.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
