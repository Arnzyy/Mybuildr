import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyProjects } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import ProjectsList from '@/components/admin/ProjectsList'
import { Plus, Lock } from 'lucide-react'

export default async function ProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canManageProjects = hasFeature(company.tier, 'upload_projects')

  if (!canManageProjects) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Project management is available on Pro and Full Package plans.
          Upgrade to add and manage your project portfolio.
        </p>
        <Link
          href="/admin/billing"
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          View Plans
        </Link>
      </div>
    )
  }

  const projects = await getCompanyProjects(company.id)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Projects
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your portfolio of work
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="flex items-center justify-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          <Plus className="w-5 h-5" />
          Add Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h2>
          <p className="text-gray-600 mb-6">
            Add your first project to showcase your work on your website
          </p>
          <Link
            href="/admin/projects/new"
            className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            <Plus className="w-5 h-5" />
            Add Your First Project
          </Link>
        </div>
      ) : (
        <ProjectsList initialProjects={projects} />
      )}
    </div>
  )
}
