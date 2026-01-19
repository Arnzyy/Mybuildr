import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const company = await getCompanyForUser(user.email!)

  if (!company) {
    // User exists but no company - show onboarding or error
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Company Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn&apos;t find a company associated with {user.email}.
            If you&apos;ve just signed up, please complete the onboarding process.
          </p>
          <a
            href="/get-started"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Get Started
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <AdminHeader company={company} user={user} />

      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <AdminSidebar company={company} />

        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
