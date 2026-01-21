import { createAdminClient } from './admin'
import type { Company, Project, Review, MediaItem } from './types'

// Get company by slug (for builder sites)
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Company
}

// Get company by custom domain
export async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Company
}

// Get projects for a company
export async function getCompanyProjects(companyId: string): Promise<Project[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId)
    .order('display_order', { ascending: true })

  if (error || !data) return []
  return data as Project[]
}

// Get reviews for a company
export async function getCompanyReviews(companyId: string): Promise<Review[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .order('review_date', { ascending: false })

  if (error || !data) return []
  return data as Review[]
}

// Submit enquiry
export async function submitEnquiry(
  companyId: string,
  data: {
    name: string
    email?: string
    phone?: string
    message?: string
    source?: 'website' | 'whatsapp'
  }
) {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('enquiries')
    .insert({
      company_id: companyId,
      ...data
    })

  return { error }
}

// Get company for authenticated user (by email)
export async function getCompanyForUser(email: string): Promise<Company | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()

  if (error || !data) return null
  return data as Company
}

// Update company
export async function updateCompany(
  companyId: string,
  updates: Partial<Company>
): Promise<{ error: unknown }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)

  return { error }
}

// Get media library items for a company
export async function getCompanyMedia(companyId: string): Promise<MediaItem[]> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('media_library')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error || !data) return []
  return data as MediaItem[]
}
