import { TemplateProps } from '@/lib/templates/types'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import SiteHeader from '../builder-site/SiteHeader'
import { Phone, ArrowRight, Zap } from 'lucide-react'
import { Company } from '@/lib/supabase/types'

// Bold hero - big text, strong colors, animated feel
function BoldHero({ company }: { company: Company }) {
  const heroImage = company.hero_image_url || '/images/default-hero.jpg'

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background with overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div
        className="absolute inset-0 z-10"
        style={{
          background: `linear-gradient(135deg, ${company.primary_color}ee 0%, ${company.primary_color}99 50%, transparent 100%)`
        }}
      />

      {/* Content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 py-24">
        <div className="max-w-3xl">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
          >
            <Zap className="w-4 h-4" />
            {company.trade_type || 'Construction'} Experts
          </div>

          {/* Main heading - BOLD */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white mb-6 leading-tight">
            {company.name}
          </h1>

          {/* Subheading */}
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-xl">
            {company.description?.substring(0, 120) || `Professional ${company.trade_type} services that deliver results`}
          </p>

          {/* CTAs - Bold style */}
          <div className="flex flex-col sm:flex-row gap-4">
            <WhatsAppButton company={company} variant="inline" className="text-lg px-8 py-4" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
                <ArrowRight className="w-5 h-5" />
              </a>
            )}
          </div>

          {/* Stats row */}
          {company.areas_covered && company.areas_covered.length > 0 && (
            <div className="mt-12 flex gap-8">
              <div>
                <p className="text-4xl font-black text-white">10+</p>
                <p className="text-white/70 text-sm">Years Experience</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">500+</p>
                <p className="text-white/70 text-sm">Projects Done</p>
              </div>
              <div>
                <p className="text-4xl font-black text-white">100%</p>
                <p className="text-white/70 text-sm">Satisfaction</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <div className="w-8 h-12 rounded-full border-2 border-white/50 flex items-start justify-center p-2">
          <div className="w-1 h-3 bg-white rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  )
}

// Bold services - cards with hover effect
function BoldServices({ company }: { company: Company }) {
  if (!company.services || company.services.length === 0) return null

  return (
    <section id="services" className="py-20 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-black mb-12">
          What We <span style={{ color: company.secondary_color || '#f97316' }}>Do</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {company.services.map((service: string, index: number) => (
            <div
              key={service}
              className="group relative bg-gray-800 rounded-xl p-8 hover:bg-gray-700 transition-colors cursor-pointer overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-1 h-full transition-all group-hover:w-2"
                style={{ backgroundColor: company.secondary_color || '#f97316' }}
              />
              <span className="text-6xl font-black text-gray-700 group-hover:text-gray-600 transition-colors">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-bold mt-4">{service}</h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function BoldTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} variant="transparent" />
      <BoldHero company={company} />
      <BoldServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
