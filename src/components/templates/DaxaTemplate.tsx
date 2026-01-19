import { TemplateProps } from '@/lib/templates/types'
import DaxaHeader from './daxa/DaxaHeader'
import DaxaHero from './daxa/DaxaHero'
import DaxaServices from './daxa/DaxaServices'
import DaxaGallery from './daxa/DaxaGallery'
import DaxaReviews from './daxa/DaxaReviews'
import DaxaContact from './daxa/DaxaContact'
import DaxaFooter from './daxa/DaxaFooter'

export default function DaxaTemplate({ company, projects, reviews }: TemplateProps) {
  return (
    <main className="bg-white">
      <DaxaHeader company={company} />
      <DaxaHero company={company} projects={projects} />
      <DaxaServices company={company} />
      <DaxaGallery projects={projects} />
      <DaxaReviews reviews={reviews} company={company} />
      <DaxaContact company={company} />
      <DaxaFooter company={company} />
    </main>
  )
}
