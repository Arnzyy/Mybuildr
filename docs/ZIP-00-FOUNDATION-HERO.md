# ZIP-00: Foundation + Marketing Hero

> **Time**: ~3 hours  
> **Outcome**: Next.js project + marketing site hero section live  
> **Dependencies**: None

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Next.js 15 project with Tailwind + shadcn/ui
- ✅ Project structure for multi-tenant platform
- ✅ Marketing site hero section (the insane version)
- ✅ Trust bar, header, footer
- ✅ Deployable to Vercel (even if incomplete)

---

## STEP 1: CREATE PROJECT

```bash
npx create-next-app@latest trade-sites --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd trade-sites
```

When prompted:
- Would you like to use TypeScript? **Yes**
- Would you like to use ESLint? **Yes**
- Would you like to use Tailwind CSS? **Yes**
- Would you like to use `src/` directory? **Yes**
- Would you like to use App Router? **Yes**
- Would you like to customize the default import alias? **Yes** → `@/*`

---

## STEP 2: INSTALL DEPENDENCIES

```bash
# shadcn/ui
npx shadcn@latest init

# When prompted:
# - Style: Default
# - Base color: Slate
# - CSS variables: Yes

# Add components we'll need
npx shadcn@latest add button
npx shadcn@latest add card

# Other deps
npm install lucide-react
```

---

## STEP 3: PROJECT STRUCTURE

Create this folder structure:

```
src/
├── app/
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── sites/
│   │   └── [slug]/
│   │       └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── favicon.ico
├── components/
│   ├── marketing/
│   │   ├── Header.tsx
│   │   ├── Hero.tsx
│   │   ├── TrustBar.tsx
│   │   └── Footer.tsx
│   └── ui/
│       └── (shadcn components)
├── lib/
│   ├── constants.ts
│   └── utils.ts
└── middleware.ts
```

```bash
# Create directories
mkdir -p src/app/\(marketing\)
mkdir -p src/app/sites/\[slug\]
mkdir -p src/components/marketing
mkdir -p src/lib
```

---

## STEP 4: MIDDLEWARE (Multi-tenant routing)

**File: `src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Main domain - serve marketing site
  // Handles: trade-sites.co.uk, www.trade-sites.co.uk, localhost:3000
  const isMainDomain = 
    hostname === 'trade-sites.co.uk' ||
    hostname === 'www.trade-sites.co.uk' ||
    hostname === 'localhost:3000' ||
    hostname.includes('vercel.app')

  if (isMainDomain) {
    // Marketing site - no rewrite needed
    return NextResponse.next()
  }

  // Subdomain - e.g., daxa-construction.trade-sites.co.uk
  const subdomain = hostname.split('.')[0]
  
  if (subdomain && subdomain !== 'www') {
    // Rewrite to /sites/[slug]
    return NextResponse.rewrite(new URL(`/sites/${subdomain}${url.pathname}`, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except static files and api
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## STEP 5: CONSTANTS

**File: `src/lib/constants.ts`**

```typescript
export const SITE_CONFIG = {
  name: 'Trade Sites',
  domain: 'trade-sites.co.uk',
  tagline: 'Websites for builders. That actually work.',
  email: 'hello@trade-sites.co.uk',
  phone: '07XXX XXXXXX', // Add real number
  whatsapp: '447XXXXXXXXX', // Add real number (no +)
}

export const PRICING = {
  starter: {
    id: 'starter',
    name: 'Starter',
    price: 99,
    description: 'Professional website to get you online',
    features: [
      'Professional website',
      'Mobile-optimized',
      'Contact form',
      'SEO-ready',
      'SSL secure',
      'Live in 7 days',
    ],
    notIncluded: ['Admin panel', 'Auto-posting'],
    cta: 'Get Started',
    highlighted: false,
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 149,
    description: 'Add admin panel to manage your site',
    features: [
      'Everything in Starter',
      'Admin panel',
      'Upload project photos',
      'Edit your info anytime',
      'Unlimited photos',
      'Custom domain',
    ],
    notIncluded: ['Auto-posting'],
    cta: 'Get Started',
    highlighted: false,
  },
  full: {
    id: 'full',
    name: 'Full Package',
    price: 199,
    description: 'Website + automated social media',
    features: [
      'Everything in Pro',
      'Auto-post to Instagram',
      'Auto-post to Facebook',
      'Auto-post to Google',
      'AI-generated captions',
      '5 posts per week',
      'Review graphics',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Get Started',
    highlighted: true,
  },
}

export const STATS = {
  postsAutomated: '5,000+',
  hoursSaved: '500+',
  buildersOnline: '50+',
}

export const TRUST_SIGNALS = [
  '★★★★★ 4.9 on Checkatrade',
  'Live in 7 days',
  'No contracts',
]
```

---

## STEP 6: ROOT LAYOUT

**File: `src/app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SITE_CONFIG } from '@/lib/constants'

const inter = Inter({ subsets: ['latin'] })

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
      <body className={inter.className}>{children}</body>
    </html>
  )
}
```

---

## STEP 7: GLOBALS CSS

**File: `src/app/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --navy: #1e3a5f;
  --orange: #f97316;
  --green: #22c55e;
  --whatsapp: #25D366;
}

html {
  scroll-behavior: smooth;
}

@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors;
  }
  
  .btn-secondary {
    @apply px-6 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors;
  }
  
  .section-container {
    @apply max-w-6xl mx-auto px-4;
  }
}
```

---

## STEP 8: MARKETING LAYOUT

**File: `src/app/(marketing)/layout.tsx`**

```typescript
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
```

---

## STEP 9: HEADER

**File: `src/components/marketing/Header.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/constants'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-gray-900">
            {SITE_CONFIG.name}
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900">
              How It Works
            </a>
            <a href="#demo" className="text-sm text-gray-600 hover:text-gray-900">
              Demo
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <a href="#faq" className="text-sm text-gray-600 hover:text-gray-900">
              FAQ
            </a>
            <a 
              href="#pricing" 
              className="btn-primary text-sm"
            >
              Get Your Site
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            <div className="flex flex-col gap-4">
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900">
                How It Works
              </a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900">
                Demo
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 hover:text-gray-900">
                FAQ
              </a>
              <a href="#pricing" className="btn-primary text-center">
                Get Your Site
              </a>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
```

---

## STEP 10: TRUST BAR

**File: `src/components/marketing/TrustBar.tsx`**

```typescript
import { TRUST_SIGNALS } from '@/lib/constants'

export default function TrustBar() {
  return (
    <div className="bg-gray-50 border-b border-gray-100">
      <div className="section-container">
        <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-3 text-sm text-gray-600">
          {TRUST_SIGNALS.map((signal, index) => (
            <span key={index} className="flex items-center gap-2">
              {signal}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
```

---

## STEP 11: HERO (THE INSANE VERSION)

**File: `src/components/marketing/Hero.tsx`**

```typescript
import Link from 'next/link'
import { SITE_CONFIG } from '@/lib/constants'

export default function Hero() {
  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-orange-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="section-container">
        <div className="max-w-4xl mx-auto text-center">
          {/* Pain Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Your competitor posted on Instagram this morning.
            <br />
            <span className="text-gray-500">You didn't.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Guess who's getting the call.
          </p>

          {/* Value prop */}
          <p className="text-lg text-gray-600 mb-8">
            Professional website + automated social media.{' '}
            <span className="font-semibold text-gray-900">From £99/month.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="#pricing" className="btn-primary text-lg px-8 py-4">
              Get Your Site →
            </Link>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi, I'm interested in a website for my trade business`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg px-8 py-4 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>

          {/* Trust signals inline */}
          <p className="text-sm text-gray-500">
            ✓ Live in 7 days · ✓ We post for you · ✓ Cancel anytime
          </p>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 12: FOOTER

**File: `src/components/marketing/Footer.tsx`**

```typescript
import { SITE_CONFIG } from '@/lib/constants'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-bold text-lg mb-4">{SITE_CONFIG.name}</h3>
            <p className="text-gray-400 text-sm">
              {SITE_CONFIG.tagline}
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#how-it-works" className="hover:text-white">How It Works</a></li>
              <li><a href="#demo" className="hover:text-white">Demo</a></li>
              <li><a href="#pricing" className="hover:text-white">Pricing</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#faq" className="hover:text-white">FAQ</a></li>
              <li><a href={`mailto:${SITE_CONFIG.email}`} className="hover:text-white">Contact</a></li>
            </ul>
          </div>

          {/* CTA */}
          <div>
            <h4 className="font-semibold mb-4">Get Started</h4>
            <a
              href="#pricing"
              className="inline-block bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded text-sm font-medium"
            >
              Get Your Site →
            </a>
            <div className="mt-4">
              <a
                href={`https://wa.me/${SITE_CONFIG.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} {SITE_CONFIG.name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
```

---

## STEP 13: MARKETING PAGE

**File: `src/app/(marketing)/page.tsx`**

```typescript
import Hero from '@/components/marketing/Hero'
import TrustBar from '@/components/marketing/TrustBar'

export default function HomePage() {
  return (
    <>
      <TrustBar />
      <Hero />
      
      {/* Placeholder sections - ZIP-01 will fill these */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Problem + Solution Section - ZIP-01</p>
          </div>
        </div>
      </section>

      <section id="demo" className="py-20">
        <div className="section-container">
          <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Live Demo Section - ZIP-01</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Pricing Section - ZIP-01</p>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20">
        <div className="section-container">
          <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">FAQ Section - ZIP-01</p>
          </div>
        </div>
      </section>
    </>
  )
}
```

---

## STEP 14: PLACEHOLDER BUILDER SITE

**File: `src/app/sites/[slug]/page.tsx`**

```typescript
export default function BuilderSitePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">Builder Site: {params.slug}</h1>
        <p className="text-gray-600">This will be a builder's website</p>
        <p className="text-sm text-gray-400 mt-4">Coming in ZIP-04</p>
      </div>
    </div>
  )
}
```

---

## STEP 15: TEST IT

```bash
npm run dev
```

Open http://localhost:3000 and verify:

- ✅ Header shows with nav links
- ✅ Trust bar displays
- ✅ Hero section with pain headline
- ✅ "Get Your Site" button visible
- ✅ WhatsApp button works (opens WhatsApp)
- ✅ Footer displays
- ✅ Mobile responsive (check in DevTools)
- ✅ Placeholder sections show for future ZIPs

---

## STEP 16: DEPLOY TO VERCEL

```bash
# If not already linked
npx vercel link

# Deploy
npx vercel --prod
```

Or push to GitHub and connect to Vercel dashboard.

---

## EXIT CRITERIA

- ✅ `npm run dev` runs without errors
- ✅ Hero section displays the "insane" copy
- ✅ WhatsApp button links correctly
- ✅ Mobile menu works
- ✅ Deployed to Vercel (even with placeholders)
- ✅ `npm run build` passes

---

## NEXT: ZIP-01

ZIP-01 will complete the marketing site:
- Problem/Solution section
- "Who We Help" segments
- Live Demo (tabs with iframe)
- Stats bar
- Pricing cards
- Testimonials
- FAQ accordion
- Final CTA

---

**Go build it.**
