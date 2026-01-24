import { TEMPLATE_CONFIGS, TemplateName } from '@/lib/templates/types'
import { renderTemplate } from '@/lib/templates/render'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Company, Project, Review } from '@/lib/supabase/types'

// Mock company data for preview
const PREVIEW_COMPANY: Company = {
  id: 'preview',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  slug: 'preview',
  name: 'Example Construction',
  email: 'hello@example.com',
  phone: '07123 456789',
  whatsapp: '447123456789',
  address_line1: '123 High Street',
  address_line2: null,
  city: 'Bristol',
  postcode: 'BS1 1AA',
  trade_type: 'Construction',
  description: 'Professional construction services delivering exceptional quality for residential and commercial projects. With over 10 years of experience, we take pride in every project we complete.',
  services: ['Extensions', 'Renovations', 'New Builds', 'Loft Conversions', 'Kitchens', 'Bathrooms'],
  areas_covered: ['Bristol', 'Bath', 'South Gloucestershire', 'North Somerset'],
  logo_url: null,
  hero_image_url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200',
  primary_color: '#1e3a5f',
  secondary_color: '#f97316',
  template: 'developer',
  instagram_url: null,
  facebook_url: null,
  google_business_url: null,
  checkatrade_url: 'https://checkatrade.com/trades/example',
  stripe_customer_id: null,
  stripe_subscription_id: null,
  tier: 'full',
  tier_updated_at: null,
  posting_enabled: true,
  posts_per_week: 5,
  posting_times: [8, 12, 18],
  custom_domain: null,
  is_active: true,
  is_published: true,
  caption_guidelines: null,
  caption_signoff_enabled: true,
  caption_signoff_instagram: null,
  caption_signoff_facebook: null,
  caption_signoff_google: null,
  hashtag_preferences: null,
  review_posting_enabled: true,
  review_min_rating: 4,
}

const PREVIEW_PROJECTS: Project[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: 'preview',
    title: 'Modern Kitchen Extension',
    description: 'Complete kitchen extension with bi-fold doors and skylight',
    location: 'Bristol',
    images: [
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
      'https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800',
    ],
    featured_image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800',
    project_type: 'Extension',
    completed_at: '2024-01-15',
    used_in_post: false,
    last_posted_at: null,
    display_order: 0,
    is_featured: true,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company_id: 'preview',
    title: 'Loft Conversion',
    description: 'Full loft conversion with en-suite bathroom',
    location: 'Bath',
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    ],
    featured_image_url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
    project_type: 'Loft Conversion',
    completed_at: '2024-02-20',
    used_in_post: false,
    last_posted_at: null,
    display_order: 1,
    is_featured: false,
  },
]

const PREVIEW_REVIEWS: Review[] = [
  {
    id: '1',
    created_at: new Date().toISOString(),
    company_id: 'preview',
    reviewer_name: 'John Smith',
    rating: 5,
    review_text: 'Excellent work on our extension. Professional team, clean site, finished on time and on budget. Would highly recommend to anyone.',
    review_date: '2024-01-20',
    source: 'checkatrade',
    external_id: null,
    used_in_post: false,
    last_posted_at: null,
    graphic_url: null,
  },
  {
    id: '2',
    created_at: new Date().toISOString(),
    company_id: 'preview',
    reviewer_name: 'Sarah Jones',
    rating: 5,
    review_text: 'Very happy with our new kitchen. Great communication throughout the project.',
    review_date: '2024-02-15',
    source: 'google',
    external_id: null,
    used_in_post: false,
    last_posted_at: null,
    graphic_url: null,
  },
]

interface Props {
  params: Promise<{ template: string }>
}

export function generateStaticParams() {
  return Object.keys(TEMPLATE_CONFIGS).map((template) => ({
    template,
  }))
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { template } = await params
  const templateName = template as TemplateName
  const config = TEMPLATE_CONFIGS[templateName]

  if (!config) {
    notFound()
  }

  // Create preview company with this template
  const previewCompany: Company = {
    ...PREVIEW_COMPANY,
    template: templateName,
  }

  return (
    <div>
      {/* Preview banner */}
      <div className="fixed top-0 left-0 right-0 z-[100] bg-orange-500 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="font-bold">Template Preview:</span>
            <span>{config.displayName}</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/templates"
              className="text-sm hover:underline"
            >
              &larr; All Templates
            </Link>
            <Link
              href="/get-started"
              className="bg-white text-orange-500 px-4 py-2 rounded font-semibold text-sm hover:bg-gray-100"
            >
              Get This Template
            </Link>
          </div>
        </div>
      </div>

      {/* Template content with padding for banner */}
      <div className="pt-12">
        {renderTemplate({
          company: previewCompany,
          projects: PREVIEW_PROJECTS,
          reviews: PREVIEW_REVIEWS,
        })}
      </div>
    </div>
  )
}
