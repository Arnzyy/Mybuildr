# ZIP-11: Polish & Deploy

> **Time**: ~3 hours  
> **Outcome**: Production-ready, deployed, live  
> **Dependencies**: ZIP-10 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ SEO optimization complete
- ✅ Performance tuned (Lighthouse 90+)
- ✅ Error handling & loading states
- ✅ Production environment variables
- ✅ Deployed to Vercel
- ✅ Custom domain configured
- ✅ SSL enabled
- ✅ Analytics tracking
- ✅ **LIVE AT bytrade.co.uk**

---

## STEP 1: SEO OPTIMIZATION

### Marketing Site Metadata

**File: `src/app/(marketing)/layout.tsx`** (update)

```typescript
import type { Metadata } from 'next'

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
    url: 'https://bytrade.co.uk',
    siteName: 'ByTrade',
    title: 'Professional Websites for UK Tradespeople',
    description: 'Get a professional website + automated social media posting. From £99/month.',
    images: [
      {
        url: 'https://bytrade.co.uk/og-image.png',
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
    images: ['https://bytrade.co.uk/og-image.png'],
  },
  verification: {
    google: 'your-google-verification-code',
  },
  alternates: {
    canonical: 'https://bytrade.co.uk',
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
```

### Builder Site Dynamic Metadata

**File: `src/app/site/[slug]/page.tsx`** (update generateMetadata)

```typescript
import type { Metadata } from 'next'
import { getCompanyBySlug } from '@/lib/supabase/queries'

export async function generateMetadata({ 
  params 
}: { 
  params: { slug: string } 
}): Promise<Metadata> {
  const company = await getCompanyBySlug(params.slug)
  
  if (!company) {
    return {
      title: 'Not Found',
    }
  }

  const title = `${company.name} - ${company.trade_type || 'Construction'} in ${company.city || 'UK'}`
  const description = company.description || `Professional ${company.trade_type?.toLowerCase() || 'construction'} services in ${company.city || 'your area'}. Contact us for a free quote.`

  return {
    title,
    description,
    keywords: [
      company.trade_type?.toLowerCase(),
      `${company.trade_type?.toLowerCase()} ${company.city?.toLowerCase()}`,
      'local builder',
      'tradesman near me',
      ...(company.services || []),
    ].filter(Boolean),
    openGraph: {
      title,
      description,
      type: 'website',
      locale: 'en_GB',
      images: company.logo_url ? [{ url: company.logo_url }] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}
```

### Sitemap

**File: `src/app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://bytrade.co.uk'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/templates`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]

  // Dynamic builder sites
  const supabase = createAdminClient()
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, updated_at')
    .eq('is_active', true)

  const companyPages = companies?.map((company) => ({
    url: `${baseUrl}/site/${company.slug}`,
    lastModified: new Date(company.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  })) || []

  return [...staticPages, ...companyPages]
}
```

### Robots.txt

**File: `src/app/robots.ts`**

```typescript
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/auth/'],
      },
    ],
    sitemap: 'https://bytrade.co.uk/sitemap.xml',
  }
}
```

---

## STEP 2: STRUCTURED DATA (JSON-LD)

**File: `src/components/JsonLd.tsx`**

```typescript
interface LocalBusinessProps {
  name: string
  description?: string
  address?: {
    city?: string
    region?: string
    country?: string
  }
  phone?: string
  email?: string
  url: string
  image?: string
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
    description,
    url,
    ...(image && { image }),
    ...(phone && { telephone: phone }),
    ...(email && { email }),
    ...(address && {
      address: {
        '@type': 'PostalAddress',
        addressLocality: address.city,
        addressRegion: address.region,
        addressCountry: address.country || 'GB',
      },
    }),
    ...(rating && {
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
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bytrade.co.uk/search?q={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  )
}
```

Add to builder site template:
```typescript
<LocalBusinessJsonLd
  name={company.name}
  description={company.description}
  address={{ city: company.city }}
  phone={company.phone}
  email={company.email}
  url={`https://bytrade.co.uk/site/${company.slug}`}
  image={company.logo_url}
  rating={avgRating ? { value: avgRating, count: reviews.length } : undefined}
/>
```

---

## STEP 3: PERFORMANCE OPTIMIZATION

### Image Optimization

**File: `next.config.js`** (update)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'pub-*.r2.dev',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizeCss: true,
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
```

### Loading States

**File: `src/app/loading.tsx`**

```typescript
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500">Loading...</p>
      </div>
    </div>
  )
}
```

**File: `src/app/admin/loading.tsx`**

```typescript
export default function AdminLoading() {
  return (
    <div className="p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
```

### Error Boundaries

**File: `src/app/error.tsx`**

```typescript
'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Something went wrong
        </h1>
        <p className="text-gray-600 mb-6">
          We're sorry, but something unexpected happened. Please try again.
        </p>
        <button
          onClick={reset}
          className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Try Again
        </button>
      </div>
    </div>
  )
}
```

**File: `src/app/not-found.tsx`**

```typescript
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <Link
          href="/"
          className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
```

---

## STEP 4: ANALYTICS

### Vercel Analytics

```bash
npm install @vercel/analytics @vercel/speed-insights
```

**File: `src/app/layout.tsx`** (update)

```typescript
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

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
```

### Google Analytics (Optional)

**File: `src/components/GoogleAnalytics.tsx`**

```typescript
import Script from 'next/script'

const GA_ID = process.env.NEXT_PUBLIC_GA_ID

export default function GoogleAnalytics() {
  if (!GA_ID) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
    </>
  )
}
```

---

## STEP 5: ENVIRONMENT VARIABLES

### Production Environment

Create `.env.production` or set in Vercel dashboard:

```env
# App
NEXT_PUBLIC_BASE_URL=https://bytrade.co.uk
NEXT_PUBLIC_APP_NAME=ByTrade

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhxx...
SUPABASE_SERVICE_ROLE_KEY=eyJhxx...

# Stripe
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# Stripe Price IDs (Production)
STRIPE_PRICE_STARTER=price_xxx
STRIPE_PRICE_PRO=price_xxx
STRIPE_PRICE_FULL=price_xxx

# Cloudflare R2
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=bytrade-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Meta (Instagram/Facebook)
META_APP_ID=xxx
META_APP_SECRET=xxx

# Google
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx

# Claude (Anthropic)
ANTHROPIC_API_KEY=sk-ant-xxx

# Cron
CRON_SECRET=your-secure-random-string

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

---

## STEP 6: VERCEL DEPLOYMENT

### 1. Connect Repository

```bash
# Push to GitHub
git add .
git commit -m "Ready for production"
git push origin main
```

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Configure project settings

### 2. Environment Variables

In Vercel dashboard → Settings → Environment Variables:
- Add all variables from `.env.production`
- Set for Production environment

### 3. Domain Configuration

In Vercel dashboard → Settings → Domains:

1. Add `bytrade.co.uk`
2. Add `www.bytrade.co.uk`
3. Set up redirects (www → non-www)

### 4. DNS Configuration

At your domain registrar (e.g., Cloudflare):

```
Type    Name    Value
A       @       76.76.21.21
CNAME   www     cname.vercel-dns.com
```

### 5. Deploy

```bash
# Deploy to production
vercel --prod
```

Or push to main branch for auto-deploy.

---

## STEP 7: POST-DEPLOYMENT CHECKLIST

### Functionality Tests

- [ ] Marketing site loads
- [ ] Pricing page shows correctly
- [ ] Stripe checkout works
- [ ] Onboarding flow completes
- [ ] Magic link login works
- [ ] Admin dashboard loads
- [ ] Can add/edit projects
- [ ] Image upload works
- [ ] Settings save correctly
- [ ] Builder site renders
- [ ] All 8 templates work
- [ ] WhatsApp button works
- [ ] Contact form submits
- [ ] Reviews display
- [ ] Social OAuth works (if configured)
- [ ] Scheduled posts appear

### SEO Tests

- [ ] robots.txt accessible at /robots.txt
- [ ] sitemap.xml accessible at /sitemap.xml
- [ ] Meta tags present on all pages
- [ ] Open Graph images work
- [ ] Canonical URLs correct
- [ ] Mobile-friendly test passes

### Performance Tests

- [ ] Lighthouse score 90+ (Performance)
- [ ] Lighthouse score 90+ (Accessibility)
- [ ] Lighthouse score 90+ (Best Practices)
- [ ] Lighthouse score 90+ (SEO)
- [ ] Core Web Vitals pass

### Security Tests

- [ ] HTTPS enabled
- [ ] No exposed API keys
- [ ] Auth redirects work
- [ ] Admin routes protected
- [ ] CORS configured
- [ ] Rate limiting on APIs

---

## STEP 8: STRIPE PRODUCTION SETUP

### 1. Create Live Products

In Stripe Dashboard (Live mode):

**Product: ByTrade Starter**
- Price: £99/month
- Metadata: `tier=starter`

**Product: ByTrade Pro**
- Price: £149/month
- Metadata: `tier=pro`

**Product: ByTrade Full Package**
- Price: £199/month
- Metadata: `tier=full`

### 2. Update Price IDs

Update environment variables with live price IDs.

### 3. Configure Webhook

1. Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://bytrade.co.uk/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook secret to env vars

---

## STEP 9: MONITORING & ALERTS

### Vercel Alerts

In Vercel dashboard:
1. Enable deployment notifications
2. Set up error alerts
3. Configure usage alerts

### Uptime Monitoring

Options:
- Vercel's built-in monitoring
- UptimeRobot (free tier)
- Better Uptime

Set up checks for:
- `https://bytrade.co.uk` (marketing)
- `https://bytrade.co.uk/api/health` (API health check)

### Health Check Endpoint

**File: `src/app/api/health/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const supabase = createAdminClient()
    
    // Check database connection
    const { error } = await supabase
      .from('companies')
      .select('id')
      .limit(1)

    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.substring(0, 7) || 'dev',
    })
  } catch (error) {
    return NextResponse.json(
      { status: 'error', message: 'Health check failed' },
      { status: 500 }
    )
  }
}
```

---

## STEP 10: LAUNCH DAY

### Pre-Launch

- [ ] All tests passing
- [ ] Stripe in live mode
- [ ] DNS propagated
- [ ] SSL working
- [ ] Analytics configured
- [ ] Error tracking ready

### Launch

1. Final deploy to production
2. Test key flows one more time
3. Announce on socials (if applicable)
4. Start Check a Trade outreach

### Post-Launch

- [ ] Monitor error logs (first 24 hours)
- [ ] Check analytics data flowing
- [ ] Monitor Stripe for first payments
- [ ] Respond quickly to any issues
- [ ] Gather early feedback

---

## FINAL FILE STRUCTURE

```
bytrade/
├── src/
│   ├── app/
│   │   ├── (marketing)/          # Marketing pages
│   │   │   ├── page.tsx          # Home
│   │   │   ├── pricing/
│   │   │   └── templates/
│   │   ├── (auth)/               # Auth pages
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── admin/                # Admin dashboard
│   │   │   ├── page.tsx
│   │   │   ├── settings/
│   │   │   ├── projects/
│   │   │   ├── posts/
│   │   │   ├── reviews/
│   │   │   ├── social/
│   │   │   └── billing/
│   │   ├── site/[slug]/          # Builder sites
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── cron/
│   │   │   ├── webhooks/
│   │   │   └── health/
│   │   ├── sitemap.ts
│   │   ├── robots.ts
│   │   ├── loading.tsx
│   │   ├── error.tsx
│   │   └── not-found.tsx
│   ├── components/
│   │   ├── marketing/
│   │   ├── admin/
│   │   ├── templates/
│   │   └── shared/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── stripe/
│   │   ├── r2/
│   │   ├── ai/
│   │   ├── oauth/
│   │   ├── posting/
│   │   ├── reviews/
│   │   └── features.ts
│   └── middleware.ts
├── public/
│   ├── images/
│   └── og-image.png
├── vercel.json
├── next.config.js
├── tailwind.config.js
├── package.json
└── .env.local
```

---

## EXIT CRITERIA

- ✅ SEO meta tags on all pages
- ✅ Sitemap and robots.txt working
- ✅ Structured data (JSON-LD) added
- ✅ Lighthouse scores 90+
- ✅ Loading states implemented
- ✅ Error pages working
- ✅ Analytics tracking
- ✅ Health check endpoint
- ✅ Production environment variables set
- ✅ Stripe live mode configured
- ✅ Deployed to Vercel
- ✅ Custom domain configured
- ✅ SSL enabled
- ✅ All tests passing
- ✅ **LIVE AT bytrade.co.uk**

---

## 🎉 CONGRATULATIONS!

**ByTrade is now live.**

You've built:
- A conversion-optimized marketing site
- Multi-tenant SaaS platform
- 8 professional builder templates
- Automated social media posting
- AI-powered caption generation
- Review management with graphics
- Complete admin dashboard
- Stripe billing integration

**Total implementation: ~48 hours across 11 ZIPs**

---

## NEXT STEPS (Post-Launch)

### Week 1-2: Validate
- Monitor first sign-ups
- Gather feedback
- Fix any bugs
- Optimize conversion

### Week 3-4: Iterate
- Add requested features
- Improve templates
- Expand marketing

### Month 2+: Scale
- Add more templates
- White-label options
- Team features
- API access tier

---

**Ship it. Get paid. Repeat.**
