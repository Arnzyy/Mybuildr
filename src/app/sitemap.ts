import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'
import { SITE_CONFIG } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = `https://${SITE_CONFIG.domain}`

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/get-started`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic builder sites
  try {
    const supabase = createAdminClient()
    const { data: companies } = await supabase
      .from('companies')
      .select('slug, updated_at')
      .eq('is_active', true)
      .eq('is_published', true)

    const companyPages: MetadataRoute.Sitemap = companies?.map((company) => ({
      url: `${baseUrl}/sites/${company.slug}`,
      lastModified: new Date(company.updated_at),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })) || []

    return [...staticPages, ...companyPages]
  } catch {
    // Return just static pages if database query fails
    return staticPages
  }
}
