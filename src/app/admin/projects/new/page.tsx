import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ProjectForm from '@/components/admin/ProjectForm'

export default async function NewProjectPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  if (!hasFeature(company.tier, 'upload_projects')) {
    redirect('/admin/projects')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Add New Project
        </h1>
        <p className="text-gray-600 mt-1">
          Showcase your work with photos and details
        </p>
      </div>

      <ProjectForm companySlug={company.slug} />
    </div>
  )
}
