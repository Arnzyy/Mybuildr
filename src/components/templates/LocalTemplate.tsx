import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { MapPin, CheckCircle } from 'lucide-react'
import { Company } from '@/lib/supabase/types'

// Areas we cover section
function AreasSection({ company }: { company: Company }) {
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
function LocalHero({ company }: { company: Company }) {
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
