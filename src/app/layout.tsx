import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'
import './globals.css'
import { SITE_CONFIG } from '@/lib/constants'

export const metadata: Metadata = {
  title: `${SITE_CONFIG.name} | Websites for Builders UK`,
  description: 'Professional websites + automated social media for construction companies. From £99/month. Live in 7 days.',
  keywords: 'builder website, tradesman website, construction company website, UK',
  openGraph: {
    title: `${SITE_CONFIG.name} | Websites for Builders`,
    description: 'Professional websites + automated social media for construction companies. From £99/month.',
    type: 'website',
    url: `https://${SITE_CONFIG.domain}`,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
