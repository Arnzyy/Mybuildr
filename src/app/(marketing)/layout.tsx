import type { Metadata } from 'next'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'
import { WebsiteJsonLd, OrganizationJsonLd } from '@/components/JsonLd'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: {
    default: 'ByTrade - Professional Websites for UK Tradespeople | From £99/month',
    template: '%s | ByTrade',
  },
  description: 'Professional websites with automated social media posting for UK builders, electricians, plumbers and tradespeople. Get online in under a week. From £99/month.',
  keywords: [
    'tradesman website',
    'builder website uk',
    'construction website',
    'electrician website',
    'plumber website',
    'tradesperson website',
    'automated social media',
    'instagram for builders',
    'construction marketing',
  ],
  authors: [{ name: 'ByTrade' }],
  creator: 'ByTrade',
  publisher: 'ByTrade',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: `https://${SITE_CONFIG.domain}`,
    siteName: 'ByTrade',
    title: 'Professional Websites for UK Tradespeople',
    description: 'Get a professional website + automated social media posting. From £99/month.',
    images: [
      {
        url: `https://${SITE_CONFIG.domain}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'ByTrade - Websites for Tradespeople',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ByTrade - Professional Websites for UK Tradespeople',
    description: 'Get a professional website + automated social media posting. From £99/month.',
    images: [`https://${SITE_CONFIG.domain}/og-image.png`],
  },
  alternates: {
    canonical: `https://${SITE_CONFIG.domain}`,
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <WebsiteJsonLd />
      <OrganizationJsonLd />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
