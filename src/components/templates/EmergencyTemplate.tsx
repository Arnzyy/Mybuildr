import { TemplateProps } from '@/lib/templates/types'
import SiteServices from '../builder-site/SiteServices'
import SiteGallery from '../builder-site/SiteGallery'
import SiteReviews from '../builder-site/SiteReviews'
import SiteContact from '../builder-site/SiteContact'
import SiteFooter from '../builder-site/SiteFooter'
import WhatsAppButton from '../builder-site/WhatsAppButton'
import { Phone, Clock, Shield, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { Company } from '@/lib/supabase/types'

// Emergency header - phone VERY prominent
function EmergencyHeader({ company }: { company: Company }) {
  return (
    <header className="sticky top-0 z-50">
      {/* Top bar - phone number */}
      <div className="bg-red-600 text-white py-2">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-center gap-4">
          <Clock className="w-5 h-5" />
          <span className="font-bold">24/7 Emergency Service</span>
          {company.phone && (
            <>
              <span>|</span>
              <a href={`tel:${company.phone}`} className="font-bold text-lg hover:underline">
                {company.phone}
              </a>
            </>
          )}
        </div>
      </div>

      {/* Main header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logo_url && (
              <img src={company.logo_url} alt={company.name} className="h-10 w-auto" />
            )}
            <span className="text-xl font-bold text-gray-900">{company.name}</span>
          </div>

          <div className="flex items-center gap-4">
            <WhatsAppButton company={company} variant="header" />
            {company.phone && (
              <a
                href={`tel:${company.phone}`}
                className="hidden md:flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-700 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call Now
              </a>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

// Emergency hero - urgent feel
function EmergencyHero({ company }: { company: Company }) {
  return (
    <section className="bg-gray-900 text-white py-16 md:py-24">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            {/* 24/7 Badge */}
            <div className="inline-flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold mb-6">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              24/7 EMERGENCY SERVICE
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {company.trade_type || 'Emergency'} Services
              <br />
              <span className="text-red-500">When You Need It</span>
            </h1>

            <p className="text-xl text-gray-300 mb-8">
              {company.description || `Fast, reliable ${company.trade_type} services available around the clock. We're here when you need us most.`}
            </p>

            {/* CTAs - Very prominent */}
            <div className="space-y-4">
              {company.phone && (
                <a
                  href={`tel:${company.phone}`}
                  className="flex items-center justify-center gap-3 bg-red-600 text-white px-8 py-5 rounded-lg font-bold text-xl hover:bg-red-700 transition-colors w-full sm:w-auto"
                >
                  <Phone className="w-6 h-6" />
                  {company.phone}
                </a>
              )}
              <div className="flex gap-4">
                <WhatsAppButton company={company} variant="inline" className="flex-1 sm:flex-none" />
                <a
                  href="#contact"
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 border border-white/30 px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
                >
                  Request Callback
                </a>
              </div>
            </div>
          </div>

          {/* Trust signals */}
          <div className="space-y-4">
            {[
              { icon: Clock, title: 'Fast Response', desc: 'Usually within 30-60 minutes' },
              { icon: Shield, title: 'Fully Insured', desc: 'Complete peace of mind' },
              { icon: Zap, title: 'No Call Out Fee', desc: 'Free quotes on all jobs' },
              { icon: CheckCircle, title: 'Satisfaction Guaranteed', desc: 'Quality work every time' },
            ].map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-4 bg-white/10 rounded-lg p-4"
              >
                <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-bold">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// Areas covered - important for emergency services
function EmergencyAreas({ company }: { company: Company }) {
  if (!company.areas_covered || company.areas_covered.length === 0) return null

  return (
    <section className="py-12 bg-red-600 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-wrap items-center justify-center gap-4">
          <span className="font-bold">We Cover:</span>
          {company.areas_covered.map((area: string) => (
            <span
              key={area}
              className="bg-white/20 px-4 py-2 rounded-full text-sm font-medium"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

// Emergency CTA bar - repeated throughout
function EmergencyCTABar({ company }: { company: Company }) {
  return (
    <section className="py-8 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <div>
              <p className="font-bold text-lg">Need Emergency Help?</p>
              <p className="text-gray-400 text-sm">We&apos;re available 24 hours a day, 7 days a week</p>
            </div>
          </div>
          {company.phone && (
            <a
              href={`tel:${company.phone}`}
              className="flex items-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition-colors"
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

export default function EmergencyTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <div className="min-h-screen">
      <EmergencyHeader company={company} />
      <EmergencyHero company={company} />
      <EmergencyAreas company={company} />
      <SiteServices company={company} />
      <EmergencyCTABar company={company} />
      <SiteGallery projects={projects} primaryColor={company.primary_color} />
      <SiteReviews reviews={reviews} primaryColor={company.primary_color} />
      <EmergencyCTABar company={company} />
      <SiteContact company={company} />
      <SiteFooter company={company} />
      {/* BOTH floating WhatsApp AND floating phone for emergency */}
      <WhatsAppButton company={company} variant="floating" className="bottom-24" />
      {company.phone && (
        <a
          href={`tel:${company.phone}`}
          className="fixed bottom-6 right-6 z-50 bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-colors"
          aria-label="Call now"
        >
          <Phone className="w-6 h-6" />
        </a>
      )}
    </div>
  )
}
