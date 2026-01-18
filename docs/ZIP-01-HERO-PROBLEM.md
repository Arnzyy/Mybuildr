# ZIP-01: Hero + Problem Section

> **Estimated Time**: 1 hour
> **Dependencies**: ZIP-00 complete
> **Status**: Not Started

---

## RULES FOR THIS ZIP

1. **NO NEW CONCEPTS**: Only implement what's here
2. **NO SCOPE CREEP**: No extra sections or features
3. **KEEP IT SIMPLE**: Don't over-design
4. **ASK, DON'T ASSUME**: Unclear? Ask first

---

## ENTRY CRITERIA

DO NOT start until:

- ✅ ZIP-00 complete and tested
- ✅ `npm run dev` works
- ✅ No TypeScript errors

---

## PURPOSE

Build the Hero section (headline, subheading, CTA) and Problem section (before/after comparison visual). These are the top two sections users see first on the page.

---

## WHAT THIS ZIP IS NOT

This ZIP does NOT:
- Add interactive demo
- Add pricing
- Add testimonials
- Add any components beyond Hero and Problem
- Embed real images yet (use placeholders)

---

## DATABASE

No database for this project.

---

## FILES TO CREATE/UPDATE

```
/components
├── Hero.tsx (NEW)
└── ProblemSection.tsx (NEW)

/app
└── page.tsx (UPDATED - replace placeholder sections)

/lib
└── constants.ts (NEW - store copy/messaging)
```

---

## IMPLEMENTATION

### Step 1: Create lib/constants.ts

Store all copy in one place for easy editing:

```typescript
export const SITE_CONFIG = {
  name: "[Site Name TBD]",
  email: "info@example.com",
};

export const COPY = {
  hero: {
    headline: "Professional websites + automated social media. £99-199/month.",
    subheading:
      "Stop losing customers because you're not online.",
    cta: "Email us for a demo",
  },
  problem: {
    headline: "Your competitor posts 5x a week. You're not online at all.",
    description:
      "Builders without a strong online presence lose customers to those who have one. We solve that.",
  },
};
```

### Step 2: Create components/Hero.tsx

```typescript
"use client";

import { COPY, SITE_CONFIG } from "@/lib/constants";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-24 md:pt-24 md:pb-32 px-4">
      {/* Background gradient accent */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-100 rounded-full blur-3xl opacity-20"></div>
      </div>

      <div className="section-container">
        {/* Hero Content */}
        <div className="max-w-3xl mx-auto text-center">
          {/* Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {COPY.hero.headline}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            {COPY.hero.subheading}
          </p>

          {/* CTA Button */}
          <a
            href={`mailto:${SITE_CONFIG.email}`}
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg"
          >
            {COPY.hero.cta}
          </a>

          {/* Trust signal (optional) */}
          <p className="mt-8 text-sm text-gray-500">
            ✓ 30-day money-back guarantee • Setup in less than a week • Cancel anytime
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Create components/ProblemSection.tsx

```typescript
"use client";

import { COPY } from "@/lib/constants";

export default function ProblemSection() {
  return (
    <section className="bg-gray-50 py-16 md:py-24 px-4">
      <div className="section-container">
        {/* Section headline */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.problem.headline}
          </h2>
          <p className="text-lg text-gray-600">
            {COPY.problem.description}
          </p>
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-5xl mx-auto">
          {/* Mobile: Stacked layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
              <div className="bg-red-50 px-6 py-4 border-b border-red-200">
                <h3 className="font-semibold text-gray-900">Without Us</h3>
                <p className="text-sm text-gray-600">No online presence</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">No website</p>
                      <p className="text-sm text-gray-500">Customers can't find you</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">No Instagram</p>
                      <p className="text-sm text-gray-500">No proof of your work</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">Lost leads</p>
                      <p className="text-sm text-gray-500">Competitor gets the job</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* After */}
            <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-green-200">
              <div className="bg-green-50 px-6 py-4 border-b border-green-200">
                <h3 className="font-semibold text-gray-900">With Us</h3>
                <p className="text-sm text-gray-600">Professional & automated</p>
              </div>
              <div className="p-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">Professional website</p>
                      <p className="text-sm text-gray-500">Customers find you online</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">Active Instagram</p>
                      <p className="text-sm text-gray-500">Posts 5x per week automatically</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-200"></div>
                    <div>
                      <p className="font-medium text-gray-900">Win more jobs</p>
                      <p className="text-sm text-gray-500">You're the professional choice</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stat section below comparison */}
          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-4">
              Builders with active social media close 3x more jobs than those who don't.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">5x</p>
                <p className="text-sm text-gray-600">Weekly posts</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">0 min</p>
                <p className="text-sm text-gray-600">Your time (automated)</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">£99</p>
                <p className="text-sm text-gray-600">Starting price</p>
              </div>
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="text-2xl font-bold text-blue-600">1 week</p>
                <p className="text-sm text-gray-600">Live & posting</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: Update app/page.tsx

Replace the placeholder sections with actual Hero and Problem components:

```typescript
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemSection />

      {/* Remaining placeholders for other ZIPs */}
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

---

## EXIT CRITERIA

Complete when:

- ✅ Hero section displays headline, subheading, CTA button
- ✅ Problem section shows before/after comparison
- ✅ Stats cards display below comparison
- ✅ Sections stack properly on mobile (responsive)
- ✅ Email link works (clicking CTA opens email client)
- ✅ No TypeScript errors
- ✅ `npm run build` succeeds

---

## TESTING CHECKLIST

- ✅ `npm run dev` loads without errors
- ✅ Hero headline is readable (all screen sizes)
- ✅ CTA button visible and clickable
- ✅ Hero background gradients are subtle (not overdone)
- ✅ Problem section shows both "before" and "after" cards
- ✅ Stats cards visible below comparison
- ✅ Mobile: Cards stack vertically (1 column)
- ✅ Desktop: Cards side-by-side (2 columns)
- ✅ Email link works (mailto: opens)
- ✅ No layout shifts on scroll

---

## GOLDEN PATH TEST

After completing this ZIP, verify:

- ✅ Land on page → Hero is first thing visible
- ✅ Read headline and understand value prop
- ✅ Click CTA → Email opens
- ✅ Scroll down → Problem section appears naturally
- ✅ See before/after comparison
- ✅ Mobile: All readable, proper spacing

If any fails → Fix before moving to ZIP-02.

---

## CLAUDE CODE PROMPT

Ready to use with Claude Code:

```
Create Hero and Problem Section components:

1. Create lib/constants.ts with:
   - SITE_CONFIG (name, email)
   - COPY object with hero and problem messaging

2. Create components/Hero.tsx:
   - Headline: "Professional websites + automated social media. £99-199/month."
   - Subheading: "Stop losing customers because you're not online."
   - CTA button linking to email
   - Subtle background gradients (blue and cyan)
   - Trust signal text below button

3. Create components/ProblemSection.tsx:
   - Headline: "Your competitor posts 5x a week. You're not online at all."
   - Two-column comparison (Before/After)
   - Before: Red background, "No website", "No Instagram", "Lost leads"
   - After: Green background, "Professional website", "Active Instagram", "Win more jobs"
   - 4-stat section below (5x, 0 min, £99, 1 week)
   - Mobile: Stack to 1 column

4. Update app/page.tsx:
   - Import and use Hero component
   - Import and use ProblemSection component
   - Keep placeholder sections for remaining features

Testing:
- npm run dev works
- Hero is readable on mobile and desktop
- Problem section cards stack on mobile
- Email link works
- npm run build succeeds
```

