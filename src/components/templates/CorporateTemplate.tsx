import { TemplateProps } from '@/lib/templates/types'
import SiteHeader from '../builder-site/SiteHeader'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Mail, Building2, Users, Award, Clock } from 'lucide-react'
import { Company } from '@/lib/supabase/types'

// Corporate hero - professional, formal
function CorporateHero({ company }: { company: Company }) {
  return (
    <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-4">
              <Building2 className="w-5 h-5" />
              <span className="text-sm uppercase tracking-wider">
                Established {company.trade_type || 'Construction'} Company
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {company.name}
            </h1>
            <p className="text-lg text-gray-300 mb-8">
              {company.description || `Professional ${company.trade_type} services for residential and commercial clients`}
            </p>

            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
                style={{ backgroundColor: company.primary_color, color: 'white' }}
              >
                <Mail className="w-5 h-5" />
                Get a Quote
              </a>
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="inline-flex items-center gap-2 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  {company.phone}
                </a>
              )}
            </div>
          </div>

          {/* Image */}
          {company.hero_image_url && (
            <div className="relative">
              <img
                src={company.hero_image_url}
                alt={company.name}
                className="rounded-lg shadow-2xl w-full"
              />
              {/* Overlay badge */}
              <div className="absolute -bottom-6 -left-6 bg-white text-gray-900 rounded-lg p-4 shadow-lg">
                <p className="text-2xl font-bold" style={{ color: company.primary_color }}>10+</p>
                <p className="text-sm text-gray-600">Years in Business</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

// Company stats bar
function CorporateStats({ company }: { company: Company }) {
  const stats = [
    { icon: Users, value: '50+', label: 'Happy Clients' },
    { icon: Building2, value: '100+', label: 'Projects Completed' },
    { icon: Award, value: '10+', label: 'Years Experience' },
    { icon: Clock, value: '24/7', label: 'Support Available' },
  ]

  return (
    <section className="py-12 bg-gray-100">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon
                className="w-8 h-8 mx-auto mb-3"
                style={{ color: company.primary_color }}
              />
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// About section for corporate
function CorporateAbout({ company }: { company: Company }) {
  return (
    <section className="py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              About {company.name}
            </h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {company.description || `${company.name} is a professional ${company.trade_type} company serving ${company.city || 'the local area'} and surrounding regions. We pride ourselves on delivering exceptional quality and customer service.`}
            </p>
            {company.services && company.services.length > 0 && (
              <div className="space-y-3">
                <p className="font-semibold text-gray-900">Our Services Include:</p>
                <ul className="grid grid-cols-2 gap-2">
                  {company.services.slice(0, 6).map((service: string) => (
                    <li key={service} className="flex items-center gap-2 text-gray-600">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: company.primary_color }}
                      />
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Values/Why choose us */}
          <div className="bg-gray-50 rounded-xl p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Why Choose Us</h3>
            <div className="space-y-4">
              {[
                { title: 'Quality Workmanship', desc: 'Every project completed to the highest standards' },
                { title: 'Experienced Team', desc: 'Skilled professionals with years of expertise' },
                { title: 'Competitive Pricing', desc: 'Fair, transparent quotes with no hidden costs' },
                { title: 'Customer Focused', desc: 'Your satisfaction is our top priority' },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${company.primary_color}15` }}
                  >
                    <Award className="w-5 h-5" style={{ color: company.primary_color }} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default function CorporateTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <SiteHeader company={company} />
      <CorporateHero company={company} />
      <CorporateStats company={company} />
      <CorporateAbout company={company} />
      <SiteServices company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      <WhatsAppButton company={company} variant="floating" />
    </div>
  )
}
