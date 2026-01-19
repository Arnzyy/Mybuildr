import { getCompanyBySlug, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { renderTemplate } from '@/lib/templates/render'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyBySlug(slug)

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
  const { slug } = await params
  const company = await getCompanyBySlug(slug)

  if (!company || !company.is_published) {
    notFound()
  }

  const [projects, reviews] = await Promise.all([
    getCompanyProjects(company.id),
    getCompanyReviews(company.id),
  ])

  return renderTemplate({ company, projects, reviews })
}
