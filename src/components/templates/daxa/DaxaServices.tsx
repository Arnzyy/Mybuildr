'use client'

import { useEffect, useRef, useState } from 'react'
import { Company } from '@/lib/supabase/types'

interface DaxaServicesProps {
  company: Company
}

const serviceDescriptions: Record<string, string> = {
  'Extensions': 'Beautifully designed extensions that blend seamlessly with your home.',
  'Loft Conversions': 'Expert conversions that add valuable living space and property value.',
  'Knock Throughs': 'Open-plan living spaces that modernize your home layout.',
  'Renovations': 'Complete renovations that breathe new life into tired properties.',
  'New Builds': 'Quality construction from foundations to finishing touches.',
  'Garden Work': 'Summer houses, patios, decking, and complete garden makeovers.',
}

const defaultServices = [
  { title: 'Extensions', description: 'Beautifully designed extensions that blend seamlessly with your home.' },
  { title: 'Loft Conversions', description: 'Expert conversions that add valuable living space and property value.' },
  { title: 'Knock Throughs', description: 'Open-plan living spaces that modernize your home layout.' },
  { title: 'Renovations', description: 'Complete renovations that breathe new life into tired properties.' },
  { title: 'New Builds', description: 'Quality construction from foundations to finishing touches.' },
  { title: 'Garden Work', description: 'Summer houses, patios, decking, and complete garden makeovers.' },
]

export default function DaxaServices({ company }: DaxaServicesProps) {
  const [visibleCards, setVisibleCards] = useState<number[]>([])
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  const services = company.services && company.services.length > 0
    ? company.services.map(s => ({
        title: s,
        description: serviceDescriptions[s] || `Professional ${s.toLowerCase()} services.`,
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
              {/* Gradient Background */}
              <div className="relative h-52 overflow-hidden bg-gradient-to-br from-[#1e3a5f] to-[#0f172a]">
                <div
                  className={`absolute inset-0 bg-gradient-to-br from-[#E91E8C]/20 to-[#38BDF8]/20 transition-opacity duration-500 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  }`}
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
