import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteFooter from '../builder-site/SiteFooter'
import SiteContact from '../builder-site/SiteContact'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone } from 'lucide-react'
import { Company, Project } from '@/lib/supabase/types'

// Minimal hero for showcase - lets images speak
function ShowcaseHero({ company }: { company: Company }) {
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
function ShowcaseGallery({ projects }: { projects: Project[] }) {
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
      <ShowcaseGallery projects={projects} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
