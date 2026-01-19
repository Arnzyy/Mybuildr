import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect, notFound } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import ProjectForm from '@/components/admin/ProjectForm'

export default async function EditProjectPage({
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

  if (!hasFeature(company.tier, 'upload_projects')) {
    redirect('/admin/projects')
  }

  // Get project
  const admin = createAdminClient()
  const { data: project } = await admin
    .from('projects')
    .select('*')
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (!project) {
    notFound()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Edit Project
        </h1>
        <p className="text-gray-600 mt-1">
          Update project details and images
        </p>
      </div>

      <ProjectForm companySlug={company.slug} project={project} />
    </div>
  )
}
