# ZIP-04: Builder Templates (4 Core)

> **Time**: ~5 hours  
> **Outcome**: 4 working builder site templates, dynamic data from database  
> **Dependencies**: ZIP-03 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Template system architecture
- ✅ Shared components (Header, Hero, Gallery, Contact, Reviews, Footer)
- ✅ 4 templates: Developer, Tradesman, Showcase, Local
- ✅ WhatsApp button on all templates
- ✅ Dynamic data loading from Supabase
- ✅ Mobile responsive
- ✅ Real builder sites working

---

## TEMPLATE OVERVIEW

| Template | Style | Best For |
|----------|-------|----------|
| **Developer** | Clean, corporate, navy/orange | General builders, established companies |
| **Tradesman** | Trust-focused, badges, reviews prominent | Tradespeople needing credibility |
| **Showcase** | Portfolio-heavy, minimal text, gallery focus | Quality craftsmen with great photos |
| **Local** | Service-area focused, map emphasis | Local services, area coverage |

---

## STEP 1: TEMPLATE TYPES

**File: `src/lib/templates/types.ts`**

```typescript
import type { Company, Project, Review } from '@/lib/supabase/types'

export type TemplateName = 
  | 'developer' 
  | 'tradesman' 
  | 'showcase' 
  | 'bold' 
  | 'local' 
  | 'corporate' 
  | 'craftsman' 
  | 'emergency'

export interface TemplateProps {
  company: Company
  projects: Project[]
  reviews: Review[]
}

export interface TemplateConfig {
  name: TemplateName
  displayName: string
  description: string
  features: string[]
}

export const TEMPLATE_CONFIGS: Record<TemplateName, TemplateConfig> = {
  developer: {
    name: 'developer',
    displayName: 'Developer',
    description: 'Clean, corporate design with professional feel',
    features: ['Hero with CTA', 'Services grid', 'Project gallery', 'Reviews', 'Contact form'],
  },
  tradesman: {
    name: 'tradesman',
    displayName: 'Tradesman',
    description: 'Trust-focused with badges and reviews prominent',
    features: ['Trust badges', 'Reviews first', 'Checkatrade integration', 'Simple contact'],
  },
  showcase: {
    name: 'showcase',
    displayName: 'Showcase',
    description: 'Portfolio-heavy with minimal text',
    features: ['Full-width gallery', 'Lightbox', 'Minimal text', 'Visual impact'],
  },
  bold: {
    name: 'bold',
    displayName: 'Bold',
    description: 'Modern and energetic with strong colors',
    features: ['Bold typography', 'Animated elements', 'Strong CTAs'],
  },
  local: {
    name: 'local',
    displayName: 'Local',
    description: 'Service-area focused with map emphasis',
    features: ['Area coverage', 'Local SEO', 'Service list', 'Quick contact'],
  },
  corporate: {
    name: 'corporate',
    displayName: 'Corporate',
    description: 'Professional for larger companies',
    features: ['Team section', 'Multiple pages feel', 'Formal tone'],
  },
  craftsman: {
    name: 'craftsman',
    displayName: 'Craftsman',
    description: 'Artisan quality focus',
    features: ['Quality messaging', 'Before/after', 'Testimonials'],
  },
  emergency: {
    name: 'emergency',
    displayName: 'Emergency',
    description: '24/7 services with urgent CTAs',
    features: ['Phone prominent', 'Availability badge', 'Fast response'],
  },
}
```

---

## STEP 2: SHARED COMPONENTS - WHATSAPP BUTTON

**File: `src/components/builder-site/WhatsAppButton.tsx`**

```typescript
'use client'

import { Company } from '@/lib/supabase/types'

interface WhatsAppButtonProps {
  company: Company
  variant?: 'floating' | 'inline' | 'header'
  className?: string
}

export default function WhatsAppButton({ 
  company, 
  variant = 'floating',
  className = ''
}: WhatsAppButtonProps) {
  if (!company.whatsapp) return null

  const message = encodeURIComponent(
    `Hi, I found ${company.name} on your website and I'm interested in your services.`
  )
  const url = `https://wa.me/${company.whatsapp}?text=${message}`

  if (variant === 'floating') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:bg-[#20BA5C] transition-colors ${className}`}
        aria-label="Contact on WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    )
  }

  if (variant === 'header') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#20BA5C] transition-colors ${className}`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        <span className="hidden sm:inline">WhatsApp</span>
      </a>
    )
  }

  // inline variant
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#20BA5C] transition-colors ${className}`}
    >
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      WhatsApp Us
    </a>
  )
}
```

---

## STEP 3: SHARED - SITE HEADER

**File: `src/components/builder-site/SiteHeader.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { Menu, X, Phone } from 'lucide-react'
import WhatsAppButton from './WhatsAppButton'

interface SiteHeaderProps {
  company: Company
  variant?: 'default' | 'transparent' | 'dark'
}

export default function SiteHeader({ company, variant = 'default' }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)

  const bgClass = {
    default: 'bg-white border-b border-gray-200',
    transparent: 'bg-transparent absolute top-0 left-0 right-0 z-50',
    dark: 'bg-gray-900 text-white',
  }[variant]

  const textClass = variant === 'dark' || variant === 'transparent' ? 'text-white' : 'text-gray-900'

  return (
    <header className={`${bgClass} sticky top-0 z-50`}>
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo / Name */}
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img 
                src={company.logo_url} 
                alt={company.name} 
                className="h-10 w-auto"
              />
            )}
            <span className={`text-xl font-bold ${textClass}`}>
              {company.name}
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#services" className={`${textClass} hover:opacity-80`}>Services</a>
            <a href="#projects" className={`${textClass} hover:opacity-80`}>Projects</a>
            <a href="#reviews" className={`${textClass} hover:opacity-80`}>Reviews</a>
            <a href="#contact" className={`${textClass} hover:opacity-80`}>Contact</a>
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            {company.phone && (
              <a 
                href={`tel:${company.phone}`}
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: company.primary_color }}
              >
                <Phone className="w-4 h-4" />
                {company.phone}
              </a>
            )}
            <WhatsAppButton company={company} variant="header" />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            <nav className="flex flex-col gap-4">
              <a href="#services" className="text-gray-900">Services</a>
              <a href="#projects" className="text-gray-900">Projects</a>
              <a href="#reviews" className="text-gray-900">Reviews</a>
              <a href="#contact" className="text-gray-900">Contact</a>
              {company.phone && (
                <a 
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-2 font-medium"
                  style={{ color: company.primary_color }}
                >
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </a>
              )}
              <WhatsAppButton company={company} variant="inline" />
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
```

---

## STEP 4: SHARED - SITE FOOTER

**File: `src/components/builder-site/SiteFooter.tsx`**

```typescript
import { Company } from '@/lib/supabase/types'
import { Phone, Mail, MapPin } from 'lucide-react'

interface SiteFooterProps {
  company: Company
}

export default function SiteFooter({ company }: SiteFooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4">{company.name}</h3>
            {company.description && (
              <p className="text-gray-400 text-sm mb-4">
                {company.description.substring(0, 150)}
                {company.description.length > 150 ? '...' : ''}
              </p>
            )}
            {company.checkatrade_url && (
              <a 
                href={company.checkatrade_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-400 hover:underline"
              >
                View on Checkatrade →
              </a>
            )}
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-3 text-sm text-gray-400">
              {company.phone && (
                <a href={`tel:${company.phone}`} className="flex items-center gap-2 hover:text-white">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </a>
              )}
              {company.email && (
                <a href={`mailto:${company.email}`} className="flex items-center gap-2 hover:text-white">
                  <Mail className="w-4 h-4" />
                  {company.email}
                </a>
              )}
              {company.city && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  {company.city}{company.postcode ? `, ${company.postcode}` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Areas */}
          <div>
            <h4 className="font-semibold mb-4">Areas Covered</h4>
            {company.areas_covered && company.areas_covered.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {company.areas_covered.map((area) => (
                  <span 
                    key={area}
                    className="text-xs bg-gray-800 px-2 py-1 rounded"
                  >
                    {area}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Contact us for coverage areas</p>
            )}
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} {company.name}. All rights reserved.
          </p>
          <p className="text-xs text-gray-600">
            Website by <a href="https://bytrade.co.uk" className="hover:text-white">ByTrade</a>
          </p>
        </div>
      </div>
    </footer>
  )
}
```

---

## STEP 5: SHARED - HERO SECTION

**File: `src/components/builder-site/SiteHero.tsx`**

```typescript
import { Company } from '@/lib/supabase/types'
import WhatsAppButton from './WhatsAppButton'
import { Phone } from 'lucide-react'

interface SiteHeroProps {
  company: Company
  variant?: 'default' | 'centered' | 'split'
}

export default function SiteHero({ company, variant = 'default' }: SiteHeroProps) {
  const heroImage = company.hero_image_url || '/images/default-hero.jpg'

  if (variant === 'centered') {
    return (
      <section 
        className="relative min-h-[70vh] flex items-center justify-center text-white text-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            {company.name}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-2">
            {company.trade_type && `Professional ${company.trade_type} services`}
          </p>
          {company.city && (
            <p className="text-lg text-gray-300 mb-8">
              Serving {company.city} and surrounding areas
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <WhatsAppButton company={company} variant="inline" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            )}
          </div>
        </div>
      </section>
    )
  }

  // Default variant
  return (
    <section className="relative bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {company.name}
            </h1>
            {company.description && (
              <p className="text-lg text-gray-300 mb-6">
                {company.description.substring(0, 200)}
                {company.description.length > 200 ? '...' : ''}
              </p>
            )}
            {company.services && company.services.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {company.services.slice(0, 4).map((service) => (
                  <span 
                    key={service}
                    className="text-sm px-3 py-1 rounded-full"
                    style={{ backgroundColor: `${company.primary_color}33`, color: company.primary_color }}
                  >
                    {service}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-4">
              <WhatsAppButton company={company} variant="inline" />
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="inline-flex items-center gap-2 border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {company.phone}
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <img
              src={heroImage}
              alt={company.name}
              className="rounded-lg shadow-2xl w-full aspect-[4/3] object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 6: SHARED - SERVICES SECTION

**File: `src/components/builder-site/SiteServices.tsx`**

```typescript
import { Company } from '@/lib/supabase/types'
import { Wrench, Home, Paintbrush, Zap, Droplets, Hammer } from 'lucide-react'

interface SiteServicesProps {
  company: Company
}

// Map common service keywords to icons
const SERVICE_ICONS: Record<string, any> = {
  'extension': Home,
  'renovation': Hammer,
  'electrical': Zap,
  'plumbing': Droplets,
  'painting': Paintbrush,
  'decorating': Paintbrush,
  'default': Wrench,
}

function getServiceIcon(service: string) {
  const lower = service.toLowerCase()
  for (const [key, Icon] of Object.entries(SERVICE_ICONS)) {
    if (lower.includes(key)) return Icon
  }
  return SERVICE_ICONS.default
}

export default function SiteServices({ company }: SiteServicesProps) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Professional {company.trade_type || 'construction'} services tailored to your needs
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.services.map((service) => {
            const Icon = getServiceIcon(service)
            return (
              <div 
                key={service}
                className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${company.primary_color}15` }}
                >
                  <Icon className="w-6 h-6" style={{ color: company.primary_color }} />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{service}</h3>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 7: SHARED - PROJECT GALLERY

**File: `src/components/builder-site/SiteGallery.tsx`**

```typescript
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
```

---

## STEP 8: SHARED - REVIEWS SECTION

**File: `src/components/builder-site/SiteReviews.tsx`**

```typescript
import { Review } from '@/lib/supabase/types'
import { Star } from 'lucide-react'

interface SiteReviewsProps {
  reviews: Review[]
  primaryColor?: string
}

export default function SiteReviews({ reviews, primaryColor = '#1e3a5f' }: SiteReviewsProps) {
  if (reviews.length === 0) return null

  const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length

  return (
    <section id="reviews" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 ${star <= Math.round(avgRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              />
            ))}
            <span className="text-lg font-semibold ml-2">{avgRating.toFixed(1)}</span>
          </div>
          <p className="text-gray-600">{reviews.length} reviews</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.slice(0, 6).map((review) => (
            <div 
              key={review.id}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>

              {/* Review text */}
              {review.review_text && (
                <p className="text-gray-700 mb-4">
                  "{review.review_text.substring(0, 200)}
                  {review.review_text.length > 200 ? '...' : ''}"
                </p>
              )}

              {/* Reviewer */}
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {review.reviewer_name || 'Customer'}
                </p>
                {review.source && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {review.source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 9: SHARED - CONTACT SECTION

**File: `src/components/builder-site/SiteContact.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { Phone, Mail, MapPin } from 'lucide-react'
import WhatsAppButton from './WhatsAppButton'

interface SiteContactProps {
  company: Company
}

export default function SiteContact({ company }: SiteContactProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await fetch('/api/enquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          ...formData,
        }),
      })
      setSubmitted(true)
    } catch (error) {
      alert('Something went wrong. Please try calling or WhatsApp instead.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="contact" className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Get In Touch
          </h2>
          <p className="text-gray-600">
            Ready to discuss your project? Contact us today
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Contact Details
            </h3>
            <div className="space-y-4">
              {company.phone && (
                <a 
                  href={`tel:${company.phone}`}
                  className="flex items-center gap-4 text-gray-700 hover:text-gray-900"
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Phone className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{company.phone}</p>
                  </div>
                </a>
              )}

              {company.email && (
                <a 
                  href={`mailto:${company.email}`}
                  className="flex items-center gap-4 text-gray-700 hover:text-gray-900"
                >
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Mail className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{company.email}</p>
                  </div>
                </a>
              )}

              {company.city && (
                <div className="flex items-center gap-4 text-gray-700">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <MapPin className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">
                      {company.city}{company.postcode ? `, ${company.postcode}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8">
              <p className="text-sm text-gray-500 mb-3">Prefer WhatsApp?</p>
              <WhatsAppButton company={company} variant="inline" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-8">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">✓</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Message Sent!
                </h3>
                <p className="text-gray-600">
                  We'll get back to you as soon as possible.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                    style={{ '--tw-ring-color': company.primary_color } as any}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    placeholder="Tell us about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg font-semibold text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: company.primary_color }}
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 10: ENQUIRY API

**File: `src/app/api/enquiry/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const { companyId, name, email, phone, message } = await request.json()

    if (!companyId || !name) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('enquiries')
      .insert({
        company_id: companyId,
        name,
        email,
        phone,
        message,
        source: 'website',
      })

    if (error) {
      console.error('Failed to save enquiry:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    // TODO: Send notification email to company

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Enquiry error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## STEP 11: TEMPLATE - DEVELOPER

**File: `src/components/templates/DeveloperTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteHero from '../builder-site/SiteHero'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'

export default function DeveloperTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} />
      <SiteHero company={company} variant="default" />
      <SiteServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 12: TEMPLATE - TRADESMAN

**File: `src/components/templates/TradesmanTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteHero from '../builder-site/SiteHero'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Shield, Clock, ThumbsUp, Award } from 'lucide-react'

// Trust badges specific to tradesman template
function TrustBadges({ company }: { company: any }) {
  const badges = [
    { icon: Shield, text: 'Fully Insured' },
    { icon: Clock, text: 'On Time, Every Time' },
    { icon: ThumbsUp, text: 'Satisfaction Guaranteed' },
    { icon: Award, text: '10+ Years Experience' },
  ]

  return (
    <section className="py-8 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <div key={badge.text} className="flex items-center gap-3 justify-center">
              <badge.icon 
                className="w-8 h-8" 
                style={{ color: company.primary_color }}
              />
              <span className="text-sm font-medium text-gray-700">{badge.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// Checkatrade badge if they have it
function CheckatradeBadge({ company }: { company: any }) {
  if (!company.checkatrade_url) return null

  return (
    <section className="py-8 bg-white">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <a 
          href={company.checkatrade_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-6 py-4 hover:bg-green-100 transition-colors"
        >
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xl font-bold">✓</span>
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900">Checkatrade Verified</p>
            <p className="text-sm text-gray-600">View our reviews on Checkatrade →</p>
          </div>
        </a>
      </div>
    </section>
  )
}

export default function TradesmanTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} />
      <SiteHero company={company} variant="centered" />
      <TrustBadges company={company} />
      <CheckatradeBadge company={company} />
      {/* Reviews first on tradesman - builds trust early */}
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 13: TEMPLATE - SHOWCASE

**File: `src/components/templates/ShowcaseTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteFooter from '../builder-site/SiteFooter'
import SiteContact from '../builder-site/SiteContact'
import SiteGallery from '../builder-site/SiteGallery'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone } from 'lucide-react'

// Minimal hero for showcase - lets images speak
function ShowcaseHero({ company }: { company: any }) {
  return (
    <section className="py-16 md:py-24 text-center">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
          {company.name}
        </h1>
        {company.trade_type && (
          <p className="text-xl text-gray-600 mb-8">
            Quality {company.trade_type} services in {company.city || 'your area'}
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <WhatsAppButton company={company} variant="inline" />
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="inline-flex items-center gap-2 border-2 px-6 py-3 rounded-lg font-semibold transition-colors"
              style={{ borderColor: company.primary_color, color: company.primary_color }}
            >
              <Phone className="w-5 h-5" />
              {company.phone}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

// Full-width gallery for showcase
function ShowcaseGallery({ projects, company }: { projects: any[]; company: any }) {
  if (projects.length === 0) {
    return (
      <section className="py-16 bg-gray-50 text-center">
        <p className="text-gray-500">Projects coming soon</p>
      </section>
    )
  }

  // Get all images
  const images = projects.flatMap(p => 
    (p.images || []).map((img: string) => ({ url: img, title: p.title }))
  )

  return (
    <section className="py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {images.map((image, index) => (
          <div 
            key={index}
            className="aspect-square overflow-hidden"
          >
            <img
              src={image.url}
              alt={image.title}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
        ))}
      </div>
    </section>
  )
}

export default function ShowcaseTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader company={company} />
      <ShowcaseHero company={company} />
      <ShowcaseGallery projects={projects} company={company} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 14: TEMPLATE - LOCAL

**File: `src/components/templates/LocalTemplate.tsx`**

```typescript
import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteHero from '../builder-site/SiteHero'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { MapPin, CheckCircle } from 'lucide-react'

// Areas we cover section
function AreasSection({ company }: { company: any }) {
  if (!company.areas_covered || company.areas_covered.length === 0) return null

  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <MapPin className="w-12 h-12 mx-auto mb-4 text-orange-500" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Areas We Cover
          </h2>
          <p className="text-gray-400">
            Professional {company.trade_type || 'construction'} services across
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          {company.areas_covered.map((area: string) => (
            <div 
              key={area}
              className="flex items-center gap-2 bg-white/10 px-6 py-3 rounded-full"
            >
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="font-medium">{area}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-gray-400 mt-8">
          Not in these areas? Contact us anyway - we may still be able to help!
        </p>
      </div>
    </section>
  )
}

// Local hero with area emphasis
function LocalHero({ company }: { company: any }) {
  const heroImage = company.hero_image_url || '/images/default-hero.jpg'

  return (
    <section 
      className="relative min-h-[60vh] flex items-center text-white"
      style={{
        backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="max-w-2xl">
          {company.city && (
            <div className="flex items-center gap-2 text-orange-400 mb-4">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Serving {company.city} & Surrounding Areas</span>
            </div>
          )}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Your Local {company.trade_type || 'Construction'} Experts
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            {company.description?.substring(0, 150) || `Professional ${company.trade_type} services you can trust`}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <WhatsAppButton company={company} variant="inline" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
              >
                Call {company.phone}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

export default function LocalTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} variant="transparent" />
      <LocalHero company={company} />
      <AreasSection company={company} />
      <SiteServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
```

---

## STEP 15: TEMPLATE RENDERER

**File: `src/lib/templates/render.tsx`**

```typescript
import { TemplateProps, TemplateName } from './types'
import DeveloperTemplate from '@/components/templates/DeveloperTemplate'
import TradesmanTemplate from '@/components/templates/TradesmanTemplate'
import ShowcaseTemplate from '@/components/templates/ShowcaseTemplate'
import LocalTemplate from '@/components/templates/LocalTemplate'

const TEMPLATES: Record<string, React.ComponentType<TemplateProps>> = {
  developer: DeveloperTemplate,
  tradesman: TradesmanTemplate,
  showcase: ShowcaseTemplate,
  local: LocalTemplate,
  // ZIP-05 will add: bold, corporate, craftsman, emergency
}

export function renderTemplate(props: TemplateProps) {
  const Template = TEMPLATES[props.company.template] || DeveloperTemplate
  return <Template {...props} />
}
```

---

## STEP 16: UPDATE BUILDER SITE PAGE

**File: `src/app/sites/[slug]/page.tsx`** (replace entirely)

```typescript
import { getCompanyBySlug, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { renderTemplate } from '@/lib/templates/render'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug)
  
  if (!company) {
    return { title: 'Not Found' }
  }

  return {
    title: `${company.name} | ${company.trade_type || 'Construction'} Services`,
    description: company.description || `Professional ${company.trade_type} services in ${company.city}`,
    openGraph: {
      title: company.name,
      description: company.description || undefined,
      images: company.hero_image_url ? [company.hero_image_url] : undefined,
    },
  }
}

export default async function BuilderSitePage({ params }: Props) {
  const company = await getCompanyBySlug(params.slug)
  
  if (!company || !company.is_published) {
    notFound()
  }

  const [projects, reviews] = await Promise.all([
    getCompanyProjects(company.id),
    getCompanyReviews(company.id),
  ])

  return renderTemplate({ company, projects, reviews })
}
```

---

## STEP 17: ADD TEST DATA

Go to Supabase → SQL Editor → Run:

```sql
-- Add some projects to test company
INSERT INTO projects (company_id, title, description, images, is_featured)
SELECT 
  id,
  'Kitchen Extension',
  'Complete kitchen extension with bi-fold doors',
  ARRAY['https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800', 'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800'],
  true
FROM companies WHERE slug = 'test-builder';

INSERT INTO projects (company_id, title, description, images, is_featured)
SELECT 
  id,
  'Loft Conversion',
  'Full loft conversion with en-suite bathroom',
  ARRAY['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
  false
FROM companies WHERE slug = 'test-builder';

-- Add some reviews
INSERT INTO reviews (company_id, reviewer_name, rating, review_text, source)
SELECT 
  id,
  'John Smith',
  5,
  'Excellent work on our extension. Professional team, clean site, finished on time. Would highly recommend.',
  'checkatrade'
FROM companies WHERE slug = 'test-builder';

INSERT INTO reviews (company_id, reviewer_name, rating, review_text, source)
SELECT 
  id,
  'Sarah Jones',
  5,
  'Very happy with our new kitchen. Great communication throughout the project.',
  'google'
FROM companies WHERE slug = 'test-builder';
```

---

## STEP 18: TEST IT

```bash
npm run dev
```

1. Go to `http://localhost:3000/sites/test-builder`
2. Should see full builder site with Developer template
3. Test each template by updating company in Supabase:
   ```sql
   UPDATE companies SET template = 'tradesman' WHERE slug = 'test-builder';
   ```
4. Refresh page - should see Tradesman template
5. Test: `showcase`, `local`

---

## EXIT CRITERIA

- ✅ 4 templates working (Developer, Tradesman, Showcase, Local)
- ✅ All shared components rendering
- ✅ WhatsApp button on all templates
- ✅ Contact form submitting to database
- ✅ Gallery with lightbox working
- ✅ Reviews displaying
- ✅ Services section working
- ✅ Mobile responsive
- ✅ SEO metadata generating
- ✅ `npm run build` passes

---

## NEXT: ZIP-05

ZIP-05 will add:
- 4 more templates (Bold, Corporate, Craftsman, Emergency)
- Template preview page for onboarding
- Possibly custom domain handling

---

**4 templates done. Builder sites are alive.**
