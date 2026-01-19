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
import { Company } from '@/lib/supabase/types'

// Trust badges specific to tradesman template
function TrustBadges({ company }: { company: Company }) {
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
function CheckatradeBadge({ company }: { company: Company }) {
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
            <p className="text-sm text-gray-600">View our reviews on Checkatrade</p>
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
