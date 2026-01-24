import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyMedia } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import MediaLibrary from '@/components/admin/MediaLibrary'
import { Lock, Image as ImageIcon, FolderOpen } from 'lucide-react'

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
            Media Library
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and manage photos for your website & social media
          </p>
        </div>
      </div>

      {media.length === 0 ? (
        <div>
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center mb-6">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No media yet</h2>
            <p className="text-gray-600 mb-6">
              Upload photos of your work. They'll appear on your website and get posted to social media automatically.
            </p>
          </div>

          {/* Upload options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Upload Project */}
            <Link
              href="/admin/projects/new"
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border-2 border-orange-200 p-6 hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <FolderOpen className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Project</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Create a project with multiple images
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Posts as carousel on Instagram/Facebook</li>
                    <li>• Shows as portfolio project on website</li>
                    <li>• Add title, description & location</li>
                  </ul>
                </div>
              </div>
            </Link>

            {/* Upload Images - Can't use input here, show placeholder */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border-2 border-blue-200 p-6 opacity-50">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">Upload Images</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Batch upload single images
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Posts as individual images to social media</li>
                    <li>• Shows in gallery on website</li>
                    <li>• Quick upload, no project details needed</li>
                  </ul>
                  <p className="text-xs text-gray-500 mt-3 italic">
                    Upload your first project to enable image uploads
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <MediaLibrary initialMedia={media} />
      )}
    </div>
  )
}
