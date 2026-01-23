import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'

export default async function PhotosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          My Photos
        </h1>
        <p className="text-gray-600 mt-1">
          Upload and manage your project photos
        </p>
      </div>

      {/* Upload CTA */}
      <div className="bg-white rounded-xl border border-gray-200 p-8 md:p-12 text-center mb-6">
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Camera className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Upload Your Photos
        </h2>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Add photos from your completed projects. They'll appear on your website and get posted to social media automatically.
        </p>
        <Link
          href="/admin/media"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Go to Media Library
        </Link>
      </div>

      {/* Info card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>📸 Coming Soon:</strong> Unified photo management with drag-and-drop upload, project grouping, and more.
          For now, use the Media Library link above.
        </p>
      </div>
    </div>
  )
}
