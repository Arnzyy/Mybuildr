'use client'

import { useEffect, useState } from 'react'
import { Company, Project } from '@/lib/supabase/types'

interface DaxaHeroProps {
  company: Company
  projects: Project[]
}

const stats = [
  { number: 50, suffix: '+', label: 'Years Experience' },
  { number: 500, suffix: '+', label: 'Projects Completed' },
  { number: 100, suffix: '%', label: 'Satisfaction Rate' },
]

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    let current = 0

    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export default function DaxaHero({ company, projects }: DaxaHeroProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Build slides from company hero image and project images
  const slides = [
    company.hero_image_url,
    ...projects.slice(0, 3).map(p => p.featured_image_url),
  ].filter(Boolean) as string[]

  // Fallback if no images
  const displaySlides = slides.length > 0 ? slides : ['/placeholder-hero.jpg']

  useEffect(() => {
    setIsVisible(true)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  useEffect(() => {
    if (displaySlides.length <= 1) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % displaySlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [displaySlides.length])

  const formattedPhone = company.phone?.replace(/(\d{5})(\d{6})/, '$1 $2') || ''

  return (
    <section id="home" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Slides with Parallax */}
      {displaySlides.map((image, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ${
            index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[2000ms]"
            style={{
              backgroundImage: `url('${image}')`,
              transform: `scale(1.1) translate(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px)`,
            }}
          />
        </div>
      ))}

      {/* Overlay - directional gradient with depth */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-slate-900/70" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-transparent to-slate-900/80" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#BE185D]/10 via-transparent to-[#1E40AF]/15" />
      </div>

      {/* Animated Orbs */}
      <div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-[#E91E8C]/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '4s' }}
      />
      <div
        className="absolute bottom-1/4 -right-32 w-[600px] h-[600px] bg-[#38BDF8]/20 rounded-full blur-[100px] animate-pulse"
        style={{ animationDuration: '5s', animationDelay: '1s' }}
      />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Content - Center aligned */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40">
        <div className="max-w-4xl mx-auto text-center">
          {/* Checkatrade Badge */}
          {company.checkatrade_url && (
            <a
              href={company.checkatrade_url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/20 backdrop-blur-sm mb-8 transition-all duration-1000 hover:bg-green-500/20 cursor-pointer ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-green-300 font-medium">Checkatrade Approved</span>
              <span className="text-sm text-green-300/70 group-hover:text-green-300 transition-colors">— View Profile</span>
              <svg className="w-4 h-4 text-green-400 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}

          {/* Headline */}
          <h1
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 transition-all duration-1000 delay-150 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Building{' '}
            <span className="relative inline-block">
              <span
                className="text-transparent bg-clip-text bg-gradient-to-r from-[#E91E8C] to-[#38BDF8]"
                style={{
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  fontWeight: 800
                }}
              >
                Excellence
              </span>
              <span className="absolute -bottom-0.5 left-[5%] w-[90%] h-[2px] bg-gradient-to-r from-[#E91E8C] to-[#38BDF8] rounded-full opacity-70" />
            </span>
            <br />
            <span className="text-white/90">Across {company.city || 'Somerset'}</span>
          </h1>

          {/* Subheadline */}
          <p
            className={`text-xl sm:text-2xl text-white/60 leading-relaxed mb-10 max-w-2xl mx-auto transition-all duration-1000 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            Family-run building company delivering{' '}
            <span className="text-white font-medium">exceptional craftsmanship</span>.
            {company.description ? ` ${company.description}` : ' From extensions to complete renovations — we bring your vision to life.'}
          </p>

          {/* CTAs - Centered */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full transition-all duration-1000 delay-450 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <a
              href="#contact"
              className="group px-8 py-4 bg-[#BE185D] hover:bg-[#9D174D] text-white font-semibold rounded-lg transition-all duration-300 shadow-md shadow-black/15 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-3"
            >
              <span>Get Free Quote</span>
              <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {formattedPhone}
              </a>
            )}
          </div>

          {/* Stats - Glass cards */}
          <div
            className={`grid grid-cols-3 gap-4 max-w-2xl mx-auto transition-all duration-1000 delay-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {stats.map((stat, index) => (
              <div key={index} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-5 text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                  <Counter target={stat.number} suffix={stat.suffix} />
                </div>
                <div className="text-xs sm:text-sm text-white/50">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide Indicators */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? 'w-10 bg-gradient-to-r from-[#E91E8C] to-[#38BDF8]'
                  : 'w-2 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 right-8 hidden lg:flex flex-col items-center gap-2">
        <span className="text-white/40 text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
          <div className="w-1.5 h-3 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}
