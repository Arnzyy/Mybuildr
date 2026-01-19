import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ReviewForm from '@/components/admin/ReviewForm'
import type { Review } from '@/lib/supabase/types'

export default async function EditReviewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  if (!hasFeature(company.tier, 'manage_reviews')) {
    redirect('/admin/reviews')
  }

  const admin = createAdminClient()
  const { data: review } = await admin
    .from('reviews')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!review) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Edit Review
        </h1>
        <p className="text-gray-600 mt-1">
          Update review details
        </p>
      </div>

      <ReviewForm review={review as Review} />
    </div>
  )
}
