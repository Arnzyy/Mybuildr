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
