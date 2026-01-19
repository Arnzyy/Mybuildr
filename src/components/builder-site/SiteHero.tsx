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
