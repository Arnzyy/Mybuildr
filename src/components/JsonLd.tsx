interface LocalBusinessProps {
  name: string
  description?: string | null
  address?: {
    city?: string | null
    region?: string | null
    country?: string
  }
  phone?: string | null
  email?: string | null
  url: string
  image?: string | null
  rating?: {
    value: number
    count: number
  }
}

export function LocalBusinessJsonLd({
  name,
  description,
  address,
  phone,
  email,
  url,
  image,
  rating,
}: LocalBusinessProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    ...(description && { description }),
    url,
    ...(image && { image }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        ...(address.city && { addressLocality: address.city }),
        ...(address.region && { addressRegion: address.region }),
        addressCountry: address.country || 'GB',
      },
    }),
    ...(rating && rating.count > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: rating.value,
        reviewCount: rating.count,
      },
    }),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function WebsiteJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'ByTrade',
    url: 'https://bytrade.co.uk',
    description: 'Professional websites for UK tradespeople',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}

export function OrganizationJsonLd() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'ByTrade',
    url: 'https://bytrade.co.uk',
    logo: 'https://bytrade.co.uk/logo.png',
    description: 'Professional websites with automated social media posting for UK builders and tradespeople.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'hello@bytrade.co.uk',
      contactType: 'customer service',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
