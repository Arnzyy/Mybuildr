# ZIP-00: Foundation & Layout

> **Estimated Time**: 1-2 hours
> **Dependencies**: None
> **Status**: Not Started

---

## RULES FOR THIS ZIP

1. **NO NEW CONCEPTS**: Only implement what's defined here
2. **NO SCOPE CREEP**: Don't add features, just foundation
3. **NO PREMATURE ABSTRACTION**: Keep it simple
4. **ASK, DON'T ASSUME**: Anything unclear? Ask first

---

## ENTRY CRITERIA

DO NOT start until:

- ✅ You have Node.js 18+ installed
- ✅ You have a GitHub repo created
- ✅ You have Vercel account ready

---

## PURPOSE

Set up Next.js 15 project with Tailwind + shadcn/ui, create base layout structure (header, footer), establish mobile-first responsive framework, and define global styles and color scheme.

---

## WHAT THIS ZIP IS NOT

This ZIP does NOT:
- Add any page content (Hero, Problem, etc)
- Create specific components yet (only layout shell)
- Include images or assets
- Set up deployment

---

## DATABASE

No database for this project.

---

## FILES TO CREATE

```
/app
├── layout.tsx                (base layout with header/footer)
├── page.tsx                  (main page shell)
├── globals.css               (Tailwind + custom colors)
├── /components
│   └── Footer.tsx            (footer component)
└── /public
    └── /images               (folder for later)

/docs
└── /zips
    └── ZIP-00-FOUNDATION.md  (this file)
```

---

## IMPLEMENTATION

### Step 1: Initialize Next.js 15 Project

```bash
npx create-next-app@latest construction-website-marketing --typescript --tailwind --use-npm
# Choose defaults, yes to App Router, yes to Tailwind
cd construction-website-marketing
```

### Step 2: Install shadcn/ui

```bash
npm install -D shadcn-ui
npx shadcn-ui@latest init
# Press Enter through defaults
```

### Step 3: Create app/layout.tsx

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Professional Websites + Automated Social Media for Construction",
  description:
    "Website design and automated social media posting for construction companies. £99-199/month.",
  openGraph: {
    title: "Professional Websites for Construction Companies",
    description:
      "Professional websites + automated social media posting for construction companies. £99-199/month.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white text-gray-900`}>
        {/* Header - Minimal */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="text-2xl font-bold text-gray-900">
              [Site Name]
            </div>
            <nav className="hidden md:flex gap-8 text-sm font-medium">
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
            </nav>
          </div>
        </header>

        {/* Main Content */}
        <main>{children}</main>

        {/* Footer */}
        <Footer />
      </body>
    </html>
  );
}
```

### Step 4: Create app/page.tsx (Shell)

```typescript
export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Placeholder sections - will be filled in later ZIPs */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Hero Section - ZIP-01</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Problem Section - ZIP-01</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">How It Works - ZIP-02</p>
          </div>
        </div>
      </section>

      <section id="demo" className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Interactive Demo - ZIP-02</p>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Pricing - ZIP-03</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">Testimonial - ZIP-03</p>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">FAQ - ZIP-04</p>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">About - ZIP-04</p>
          </div>
        </div>
      </section>
    </div>
  );
}
```

### Step 5: Create components/Footer.tsx

```typescript
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg mb-4">[Site Name]</h3>
            <p className="text-gray-400 text-sm">
              Professional websites + automated social media for construction
              companies.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white">
                  Pricing
                </a>
              </li>
              <li>
                <a href="#demo" className="hover:text-white">
                  Demo
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <a href="#faq" className="hover:text-white">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  About
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Get Started</h4>
            <a
              href="mailto:info@example.com"
              className="inline-block bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium"
            >
              Email Us
            </a>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2024 [Site Name]. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
```

### Step 6: Update app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Custom color variables */
:root {
  --color-mint: #10b981;
  --color-blue-primary: #3b82f6;
  --color-gray-light: #f9fafb;
}

/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Button base styles */
@layer components {
  .btn-primary {
    @apply px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors;
  }

  .btn-secondary {
    @apply px-6 py-3 bg-gray-100 text-gray-900 rounded-lg font-semibold hover:bg-gray-200 transition-colors;
  }

  .section-container {
    @apply max-w-6xl mx-auto px-4;
  }

  .section-padding {
    @apply py-16 md:py-24;
  }

  .gradient-text {
    @apply bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent;
  }
}

/* Responsive spacing */
@media (max-width: 768px) {
  html {
    font-size: 16px;
  }
}
```

### Step 7: Update next.config.js (If needed)

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

module.exports = nextConfig;
```

### Step 8: Create public/images folder

```bash
mkdir public/images
```

---

## EXIT CRITERIA

Complete when:

- ✅ `npm run dev` runs without errors
- ✅ http://localhost:3000 loads and shows placeholder sections
- ✅ Header/footer visible on all pages
- ✅ Mobile view (use DevTools) looks clean
- ✅ Sections stack properly on mobile
- ✅ Smooth scrolling works
- ✅ No TypeScript errors (`npm run build` succeeds)

---

## TESTING CHECKLIST

- ✅ Run `npm run dev` and load http://localhost:3000
- ✅ Check mobile view in Chrome DevTools (iPhone 12)
- ✅ Check tablet view (iPad)
- ✅ Check desktop view (1920px)
- ✅ Scroll through all sections
- ✅ Header/footer stick appropriately
- ✅ Click header navigation links (they scroll to sections)
- ✅ Run `npm run build` - zero errors
- ✅ All placeholder sections visible

---

## GOLDEN PATH TEST

After completing this ZIP, verify:

- ✅ Page loads on mobile
- ✅ Can scroll smoothly
- ✅ Header is readable on mobile
- ✅ Footer visible at bottom
- ✅ All placeholder sections stack properly

If any fails → Fix before moving to ZIP-01.

---

## CLAUDE CODE PROMPT

Ready to use with Claude Code:

```
Create a Next.js 15 project with the following:

1. Initialize with Tailwind CSS and shadcn/ui
2. Create app/layout.tsx with:
   - Sticky header with navigation
   - Meta tags for SEO
   - Footer component import
3. Create app/page.tsx with placeholder sections for:
   - Hero
   - Problem
   - How It Works
   - Demo
   - Pricing
   - Testimonial
   - FAQ
   - About
4. Create components/Footer.tsx with:
   - 4-column footer layout
   - Links to all sections
   - Email CTA button
5. Update globals.css with:
   - Color variables (mint, blue, gray)
   - Custom button styles
   - Responsive spacing
   - Smooth scroll
6. Create public/images folder

Test:
- npm run dev works
- Page loads at localhost:3000
- Mobile view is readable
- npm run build succeeds with zero errors
```

