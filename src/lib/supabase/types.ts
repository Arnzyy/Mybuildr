export type Tier = 'starter' | 'pro' | 'full'

export type Template =
  | 'developer'
  | 'tradesman'
  | 'showcase'
  | 'bold'
  | 'local'
  | 'corporate'
  | 'craftsman'
  | 'emergency'
  | 'daxa'

export interface Company {
  id: string
  created_at: string
  updated_at: string
  slug: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  trade_type: string | null
  description: string | null
  services: string[] | null
  areas_covered: string[] | null
  logo_url: string | null
  hero_image_url: string | null
  primary_color: string
  secondary_color: string
  template: Template
  instagram_url: string | null
  facebook_url: string | null
  google_business_url: string | null
  checkatrade_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: Tier
  tier_updated_at: string | null
  posting_enabled: boolean
  posts_per_week: number
  custom_domain: string | null
  is_active: boolean
  is_published: boolean
  // AI Caption Settings
  caption_guidelines: string | null
  caption_signoff_enabled: boolean
  caption_signoff_instagram: string | null
  caption_signoff_facebook: string | null
  caption_signoff_google: string | null
  hashtag_preferences: string[] | null
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  company_id: string
  title: string
  description: string | null
  location: string | null
  images: string[] | null
  featured_image_url: string | null
  project_type: string | null
  completed_at: string | null
  used_in_post: boolean
  last_posted_at: string | null
  display_order: number
  is_featured: boolean
}

export interface ScheduledPost {
  id: string
  created_at: string
  company_id: string
  project_id: string | null
  media_id: string | null
  image_url: string
  caption: string | null
  hashtags: string[] | null
  scheduled_for: string
  status: 'pending' | 'posted' | 'failed' | 'skipped'
  posted_at: string | null
  instagram_post_id: string | null
  facebook_post_id: string | null
  google_post_id: string | null
  error_message: string | null
  retry_count: number
}

export interface MediaItem {
  id: string
  created_at: string
  updated_at: string
  company_id: string
  image_url: string
  title: string | null
  description: string | null
  location: string | null
  work_type: string | null
  times_posted: number
  last_posted_at: string | null
  is_available: boolean
  source_project_id: string | null
}

export interface Review {
  id: string
  created_at: string
  company_id: string
  reviewer_name: string | null
  rating: number
  review_text: string | null
  review_date: string | null
  source: 'checkatrade' | 'google' | 'manual'
  external_id: string | null
  used_in_post: boolean
  last_posted_at: string | null
  graphic_url: string | null
}

export interface SocialToken {
  id: string
  created_at: string
  updated_at: string
  company_id: string
  platform: 'instagram' | 'facebook' | 'google_business'
  access_token: string | null
  refresh_token: string | null
  token_expires_at: string | null
  account_id: string | null
  account_name: string | null
  is_connected: boolean
  last_error: string | null
}

export interface Enquiry {
  id: string
  created_at: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  source: 'website' | 'whatsapp'
  status: 'new' | 'contacted' | 'converted' | 'closed'
  notes: string | null
}

export interface OnboardingForm {
  id: string
  created_at: string
  updated_at: string
  company_id: string | null
  stripe_session_id: string | null
  tier: Tier | null
  form_data: Record<string, unknown> | null
  status: 'pending' | 'submitted' | 'processed'
  processed_at: string | null
}
