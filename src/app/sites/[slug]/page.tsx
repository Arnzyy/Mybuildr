import { getCompanyBySlug, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { renderTemplate } from '@/lib/templates/render'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { LocalBusinessJsonLd } from '@/components/JsonLd'
import { SITE_CONFIG } from '@/lib/constants'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const company = await getCompanyBySlug(slug)

  if (!company) {
    return { title: 'Not Found' }
  }

  const title = `${company.name} - ${company.trade_type || 'Construction'} in ${company.city || 'UK'}`
  const description = company.description || `Professional ${company.trade_type?.toLowerCase() || 'construction'} services in ${company.city || 'your area'}. Contact us for a free quote.`

  return {
    title,
    description,
    keywords: [
      company.trade_type?.toLowerCase(),
      `${company.trade_type?.toLowerCase()} ${company.city?.toLowerCase()}`,
      'local builder',
      'tradesman near me',
      ...(company.services || []),
    ].filter(Boolean) as string[],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_GB',
      images: company.hero_image_url ? [{ url: company.hero_image_url }] : company.logo_url ? [{ url: company.logo_url }] : [],
    },
    robots: {
      index: true,
      follow: true,
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

  // Calculate average rating for JSON-LD
  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : undefined

  return (
    <>
      <LocalBusinessJsonLd
        name={company.name}
        description={company.description}
        address={{ city: company.city }}
        phone={company.phone}
        email={company.email}
        url={`https://${SITE_CONFIG.domain}/sites/${company.slug}`}
        image={company.logo_url}
        rating={avgRating && reviews.length > 0 ? { value: avgRating, count: reviews.length } : undefined}
      />
      {renderTemplate({ company, projects, reviews })}
    </>
  )
}
