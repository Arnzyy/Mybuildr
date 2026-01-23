import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyMedia } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import MediaLibrary from '@/components/admin/MediaLibrary'
import { Lock, Image as ImageIcon } from 'lucide-react'

export default async function PhotosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const canManageMedia = hasFeature(company.tier, 'upload_projects')

  if (!canManageMedia) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upgrade Required</h1>
        <p className="text-gray-600 mb-6 text-center max-w-md">
          Photo management is available on Pro and Full Package plans.
          Upgrade to upload and manage your images.
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

  const media = await getCompanyMedia(company.id)

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            My Photos
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and manage photos for your website & social media
          </p>
        </div>
      </div>

      {media.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No photos yet</h2>
          <p className="text-gray-600 mb-6">
            Upload photos of your work. They'll appear on your website and get posted to social media automatically.
          </p>
        </div>
      ) : (
        <MediaLibrary initialMedia={media} />
      )}
    </div>
  )
}
