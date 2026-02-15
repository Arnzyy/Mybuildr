# ZIP-03: Pricing + Testimonial

> **Estimated Time**: 1.5 hours
> **Dependencies**: ZIP-02 complete
> **Status**: Not Started

---

## RULES FOR THIS ZIP

1. **PRICING DRIVES CONVERSION**: Make it crystal clear what's included
2. **HIGHLIGHT THE WIN**: Position £199 as "recommended" without being pushy
3. **SOCIAL PROOF MATTERS**: Testimonial must be real and prominent
4. **ASK, DON'T ASSUME**: Anything unclear? Ask first

---

## ENTRY CRITERIA

DO NOT start until:

- ✅ ZIP-02 complete and tested
- ✅ You have testimonial ready:
  - Client name
  - Client business name
  - Quote (1-2 sentences)
  - Photo (optional but better)

---

## PURPOSE

Build pricing tiers (£99, £149, £199) clearly showing what's included at each level, and add a social proof section with the client testimonial.

---

## WHAT THIS ZIP IS NOT

This ZIP does NOT:
- Add payment processing (just email CTA on cards)
- Build comparison table (keep it simple)
- Add pricing calculator
- Add FAQ about pricing (that's ZIP-04)

---

## FILES TO CREATE/UPDATE

```
/components
├── PricingSection.tsx (NEW)
├── PricingCard.tsx (NEW)
└── TestimonialSection.tsx (NEW)

/lib
├── constants.ts (UPDATED - add pricing and testimonial copy)
└── utils.ts (NEW - helper for formatting)

/app
└── page.tsx (UPDATED - add new sections)

/public/images
└── [client-photo].jpg (NEEDED - optional but recommended)
```

---

## IMPLEMENTATION

### Step 1: Update lib/constants.ts

Add pricing and testimonial data:

```typescript
export const PRICING = [
  {
    id: "basic",
    name: "Starter",
    price: 99,
    description: "Perfect for getting online",
    features: [
      "Professional website",
      "Mobile-optimized design",
      "Hosting included",
      "Domain setup help",
      "Basic contact form",
      "Live in under 1 week",
    ],
    notIncluded: [
      "Admin panel (images)",
      "Automated social posting",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 149,
    description: "Add admin panel for image uploads",
    features: [
      "Everything in Starter, plus:",
      "Admin panel (upload your projects)",
      "Drag-and-drop image management",
      "Unlimited projects",
      "Google Business integration",
      "Email support",
    ],
    notIncluded: [
      "Automated social posting",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Full Package",
    price: 199,
    description: "Complete solution - website + automation",
    features: [
      "Everything in Pro, plus:",
      "Automated Instagram posts",
      "Automated Facebook posts",
      "Automated Google Business posts",
      "AI captions generated automatically",
      "Post scheduling (5x per week)",
      "Priority support",
    ],
    notIncluded: [],
    cta: "Get Started",
    highlighted: true,
  },
];

export const TESTIMONIAL = {
  quote: "These guys understood exactly what we needed. Website looks professional and the automatic social posting has been a game-changer for showing off our work.",
  author: "[Client Name]",
  business: "[Client Business Name]",
  role: "Founder",
  image: "/images/client-photo.jpg",
};

export const COPY = {
  // ... existing copy ...
  pricing: {
    headline: "Simple pricing. No hidden fees.",
    subheading: "All plans include hosting and support. Cancel anytime.",
    perMonth: "per month",
    notIncluded: "Not included",
  },
  testimonial: {
    headline: "Loved by builders",
    description: "See what our clients are saying",
  },
};
```

### Step 2: Create components/PricingCard.tsx

```typescript
"use client";

import { SITE_CONFIG } from "@/lib/constants";

interface PricingCardProps {
  name: string;
  price: number;
  description: string;
  features: string[];
  notIncluded?: string[];
  highlighted?: boolean;
}

export default function PricingCard({
  name,
  price,
  description,
  features,
  notIncluded,
  highlighted,
}: PricingCardProps) {
  return (
    <div
      className={`relative rounded-lg border transition-all ${
        highlighted
          ? "border-blue-400 bg-gradient-to-br from-blue-50 to-white shadow-lg scale-105 md:scale-100"
          : "border-gray-200 bg-white"
      }`}
    >
      {/* Highlighted badge */}
      {highlighted && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
          Most Popular
        </div>
      )}

      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="mb-6">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
            {name}
          </h3>
          <p className="text-sm text-gray-600">{description}</p>
        </div>

        {/* Price */}
        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl md:text-5xl font-bold text-gray-900">
              £{price}
            </span>
            <span className="text-gray-600">/month</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Billed monthly. Cancel anytime.
          </p>
        </div>

        {/* CTA Button */}
        <a
          href={`mailto:${SITE_CONFIG.email}?subject=Interest in ${name} Plan`}
          className={`w-full block text-center py-3 rounded-lg font-semibold mb-6 transition-colors ${
            highlighted
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          Email us to get started
        </a>

        {/* Features list */}
        <div className="space-y-3 mb-6">
          {features.map((feature, index) => (
            <div key={index} className="flex gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="w-5 h-5 text-green-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <p className="text-sm text-gray-700">{feature}</p>
            </div>
          ))}
        </div>

        {/* Not included */}
        {notIncluded && notIncluded.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-3">
              Not included
            </p>
            <div className="space-y-2">
              {notIncluded.map((item, index) => (
                <div key={index} className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

### Step 3: Create components/PricingSection.tsx

```typescript
"use client";

import { PRICING, COPY } from "@/lib/constants";
import PricingCard from "./PricingCard";

export default function PricingSection() {
  return (
    <section className="py-16 md:py-24 px-4" id="pricing">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.pricing.headline}
          </h2>
          <p className="text-lg text-gray-600">
            {COPY.pricing.subheading}
          </p>
        </div>

        {/* Pricing cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING.map((tier) => (
            <PricingCard key={tier.id} {...tier} />
          ))}
        </div>

        {/* FAQ note */}
        <div className="text-center mt-12">
          <p className="text-gray-600">
            Have questions?{" "}
            <a href="#faq" className="text-blue-600 font-semibold hover:underline">
              Check our FAQ
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
```

### Step 4: Create components/TestimonialSection.tsx

```typescript
"use client";

import { TESTIMONIAL, COPY } from "@/lib/constants";

export default function TestimonialSection() {
  return (
    <section className="bg-blue-50 py-16 md:py-24 px-4">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.testimonial.headline}
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Image */}
            <div className="md:flex-shrink-0 md:w-32">
              <img
                src={TESTIMONIAL.image}
                alt={TESTIMONIAL.author}
                className="w-32 h-32 rounded-full object-cover mx-auto shadow-md"
              />
            </div>

            {/* Quote */}
            <div className="flex-1">
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <svg
                    key={star}
                    className="w-5 h-5 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              {/* Quote text */}
              <p className="text-lg md:text-xl text-gray-900 font-medium mb-6 leading-relaxed">
                "{TESTIMONIAL.quote}"
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-gray-900">
                  {TESTIMONIAL.author}
                </p>
                <p className="text-gray-600 text-sm">
                  {TESTIMONIAL.business} • {TESTIMONIAL.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
```

### Step 5: Update app/page.tsx

```typescript
import Hero from "@/components/Hero";
import ProblemSection from "@/components/ProblemSection";
import HowItWorks from "@/components/HowItWorks";
import InteractiveDemo from "@/components/InteractiveDemo";
import PricingSection from "@/components/PricingSection";
import TestimonialSection from "@/components/TestimonialSection";

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <InteractiveDemo />
      <PricingSection />
      <TestimonialSection />

      {/* Remaining placeholders */}
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

- ✅ 3 pricing cards display (£99, £149, £199)
- ✅ "Full Package" is highlighted as recommended
- ✅ Features clearly listed with checkmarks
- ✅ Non-included items shown with X marks
- ✅ Email CTAs work on all pricing cards
- ✅ Testimonial section displays quote + client photo
- ✅ Testimonial has 5 stars and author info
- ✅ Mobile: Cards stack vertically (1 per row)
- ✅ Desktop: Cards side-by-side with middle one scaled
- ✅ No TypeScript errors
- ✅ `npm run build` succeeds

---

## TESTING CHECKLIST

- ✅ `npm run dev` loads without errors
- ✅ All 3 pricing tiers visible
- ✅ £199 tier is visually highlighted
- ✅ Pricing cards readable on mobile
- ✅ Email links work on all pricing CTAs
- ✅ Testimonial displays with photo
- ✅ Testimonial quote is visible and readable
- ✅ Stars and author info visible
- ✅ Mobile: Testimonial image stacks above text
- ✅ Desktop: Testimonial image on left, text on right

---

## GOLDEN PATH TEST

After completing:

- ✅ Scroll to Pricing → See 3 tiers clearly
- ✅ Understand what's included at each level
- ✅ £199 is obviously recommended
- ✅ Scroll to Testimonial → See real client quote
- ✅ Trust factor increases
- ✅ Mobile: All readable

---

## CLAUDE CODE PROMPT

Ready to use:

```
Create Pricing and Testimonial components:

1. Update lib/constants.ts:
   - Add PRICING array with 3 tiers (£99, £149, £199)
   - Add TESTIMONIAL with quote, author, business, photo
   - Add COPY.pricing and COPY.testimonial

2. Create components/PricingCard.tsx:
   - Price display (large)
   - Features list with checkmarks
   - Not included list with X marks
   - Email CTA button
   - Highlight style for £199 tier
   - Responsive on mobile

3. Create components/PricingSection.tsx:
   - Headline: "Simple pricing. No hidden fees."
   - 3-column grid of PricingCard
   - Mobile: Stack to 1 column
   - Desktop: £199 slightly scaled up (most popular)
   - Link to FAQ below

4. Create components/TestimonialSection.tsx:
   - Background color (light blue)
   - Client photo on left (rounded)
   - Quote in center/right
   - 5-star rating
   - Author name and business
   - Mobile: Stack photo above text
   - Desktop: Photo left, text right

5. Update app/page.tsx:
   - Import PricingSection and TestimonialSection
   - Place after InteractiveDemo
   - Keep remaining placeholders

Testing:
- All pricing tiers visible
- £199 highlighted as recommended
- Testimonial displays properly
- Mobile layout correct
- Email links work
- npm run build succeeds
```

