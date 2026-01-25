import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Check, X, AlertCircle, Layers, Instagram, Facebook } from 'lucide-react'
import { format } from 'date-fns'
import PostDetailActions from '@/components/admin/PostDetailActions'

export default async function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  // Get post with project details
  const admin = createAdminClient()
  const { data: post, error } = await admin
    .from('scheduled_posts')
    .select(`
      *,
      project:projects(id, title, images, description)
    `)
    .eq('id', id)
    .eq('company_id', company.id)
    .single()

  if (error || !post) {
    redirect('/admin/posts')
  }

  // Check if carousel
  const isCarousel = post.project && post.project.images && post.project.images.length > 1
  const images = isCarousel ? post.project.images : [post.image_url]

  // Build full caption
  const fullCaption = post.hashtags && post.hashtags.length > 0
    ? `${post.caption}\n\n${post.hashtags.map((h: string) => `#${h}`).join(' ')}`
    : post.caption

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
            <Calendar className="w-4 h-4" />
            Scheduled
          </span>
        )
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
            <Check className="w-4 h-4" />
            Posted
          </span>
        )
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            Failed
          </span>
        )
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            <X className="w-4 h-4" />
            Cancelled
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link
          href="/admin/posts"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Posts
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Post Preview</h1>
            <p className="text-gray-600 mt-1">
              {post.status === 'posted' && post.posted_at
                ? `Posted ${format(new Date(post.posted_at), 'MMMM d, yyyy \'at\' h:mm a')}`
                : `Scheduled for ${format(new Date(post.scheduled_for), 'MMMM d, yyyy \'at\' h:mm a')}`
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {getStatusBadge(post.status)}
            {isCarousel && (
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                <Layers className="w-4 h-4" />
                Carousel ({images.length} photos)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Error message if failed */}
      {post.status === 'failed' && post.error_message && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 font-medium">Error:</p>
          <p className="text-red-600 text-sm mt-1">{post.error_message}</p>
        </div>
      )}

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Post Preview */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Post Preview</h2>
              <p className="text-xs text-gray-500 mt-1">How it will appear on social media</p>
            </div>

            {/* Image(s) */}
            <div className="relative">
              {isCarousel ? (
                <div className="grid grid-cols-2 gap-1">
                  {images.slice(0, 4).map((img: string, idx: number) => (
                    <div key={idx} className="relative aspect-square bg-gray-100">
                      <img
                        src={img}
                        alt={`Image ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {idx === 3 && images.length > 4 && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">
                            +{images.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="aspect-square bg-gray-100">
                  <img
                    src={post.image_url}
                    alt="Post image"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Carousel indicator */}
              {isCarousel && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-60 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs">
                  <Layers className="w-3 h-3" />
                  1/{images.length}
                </div>
              )}
            </div>

            {/* Caption */}
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-full flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-gray-900">
                    {company.name || 'Your Business'}
                  </p>
                  <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap break-words">
                    {fullCaption}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Platform indicators */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-900 mb-3">Posting to:</p>
            <div className="flex items-center gap-3">
              {post.instagram_post_id ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  <span className="text-sm font-medium text-gray-900">Instagram</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Instagram className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Instagram</span>
                </div>
              )}

              {post.facebook_post_id ? (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-900">Facebook</span>
                  <Check className="w-4 h-4 text-green-600" />
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
                  <Facebook className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Facebook</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Details & Actions */}
        <div className="space-y-4">
          {/* Project info */}
          {post.project && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Project</h3>
              <Link
                href={`/admin/projects/${post.project.id}`}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {post.project.images && post.project.images[0] && (
                  <img
                    src={post.project.images[0]}
                    alt={post.project.title}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{post.project.title}</p>
                  {post.project.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                      {post.project.description}
                    </p>
                  )}
                </div>
              </Link>
            </div>
          )}

          {/* All carousel images */}
          {isCarousel && (
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">
                All Images ({images.length})
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img
                      src={img}
                      alt={`Image ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Post details */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                <p className="text-sm text-gray-900 mt-1">{post.status}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">
                  {post.status === 'posted' ? 'Posted At' : 'Scheduled For'}
                </p>
                <p className="text-sm text-gray-900 mt-1">
                  {format(
                    new Date(post.status === 'posted' && post.posted_at ? post.posted_at : post.scheduled_for),
                    'EEEE, MMMM d, yyyy \'at\' h:mm a'
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase">Media Type</p>
                <p className="text-sm text-gray-900 mt-1 capitalize">
                  {isCarousel ? `Carousel (${images.length} images)` : post.media_type || 'Image'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <PostDetailActions post={post} />
        </div>
      </div>
    </div>
  )
}
