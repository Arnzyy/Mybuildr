import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ReviewForm from '@/components/admin/ReviewForm'

export default async function NewReviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  if (!hasFeature(company.tier, 'manage_reviews')) {
    redirect('/admin/reviews')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Add Review
        </h1>
        <p className="text-gray-600 mt-1">
          Add a customer review manually
        </p>
      </div>

      <ReviewForm />
    </div>
  )
}
