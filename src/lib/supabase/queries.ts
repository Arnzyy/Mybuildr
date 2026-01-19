import { createAdminClient } from './admin'
import type { Company, Project, Review } from './types'

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
