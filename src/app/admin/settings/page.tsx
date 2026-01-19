import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Update your company information and branding
        </p>
      </div>

      <SettingsForm company={company} />
    </div>
  )
}
