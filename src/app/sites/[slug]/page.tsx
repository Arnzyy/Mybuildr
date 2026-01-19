import { getCompanyBySlug, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'

export default async function BuilderSitePage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const company = await getCompanyBySlug(slug)

  if (!company) {
    notFound()
  }

  const projects = await getCompanyProjects(company.id)
  const reviews = await getCompanyReviews(company.id)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
        <p className="text-gray-600 mb-4">{company.description}</p>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Trade:</strong> {company.trade_type}
          </div>
          <div>
            <strong>Template:</strong> {company.template}
          </div>
          <div>
            <strong>Tier:</strong> {company.tier}
          </div>
          <div>
            <strong>Phone:</strong> {company.phone}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Projects ({projects.length})</h2>
          {projects.length === 0 && <p className="text-gray-500">No projects yet</p>}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Reviews ({reviews.length})</h2>
          {reviews.length === 0 && <p className="text-gray-500">No reviews yet</p>}
        </div>

        <p className="text-sm text-gray-400 mt-8">
          Builder site template coming in ZIP-04
        </p>
      </div>
    </div>
  )
}
