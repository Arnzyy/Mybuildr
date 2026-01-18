# ZIP-02: How It Works + Interactive Demo

> **Estimated Time**: 2 hours
> **Dependencies**: ZIP-01 complete
> **Status**: Not Started

---

## RULES FOR THIS ZIP

1. **NO NEW CONCEPTS**: Only implement what's defined
2. **DEMO IS CRITICAL**: This sells the product, make it work smoothly
3. **KEEP TAB SWITCHING SNAPPY**: No lag when clicking tabs
4. **ASK, DON'T ASSUME**: Unclear? Ask first

---

## ENTRY CRITERIA

DO NOT start until:

- ✅ ZIP-01 complete and tested
- ✅ You have URLs/screenshots ready:
  - URL to real construction website (for demo iframe)
  - Screenshot of admin panel (image file)
  - Screenshot of Instagram feed (image file)

---

## PURPOSE

Build the "How It Works" section (3-step cards) and Interactive Demo component with 3 switchable tabs showing the website, admin panel, and Instagram feed.

---

## WHAT THIS ZIP IS NOT

This ZIP does NOT:
- Add pricing section
- Add testimonials
- Create the actual admin panel (just show screenshot)
- Connect to real Instagram API (just show screenshot)

---

## FILES TO CREATE/UPDATE

```
/components
├── HowItWorks.tsx (NEW)
├── InteractiveDemo.tsx (NEW)
└── DemoTab.tsx (NEW)

/lib
└── constants.ts (UPDATED - add how it works copy)

/app
└── page.tsx (UPDATED - add new sections)

/public/images
├── admin-panel-screenshot.png (NEEDED)
└── instagram-feed-screenshot.png (NEEDED)
```

---

## IMPLEMENTATION

### Step 1: Update lib/constants.ts

Add "how it works" and demo copy:

```typescript
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
  howItWorks: {
    headline: "How it works in 3 simple steps",
    steps: [
      {
        number: 1,
        title: "We build it",
        description:
          "Your professional website built and live in under a week. Templates designed specifically for construction.",
      },
      {
        number: 2,
        title: "You upload",
        description:
          "Upload photos of your projects to the admin panel. Drag and drop, no technical skills needed.",
      },
      {
        number: 3,
        title: "We post automatically",
        description:
          "We handle Instagram, Facebook, and Google Business posts automatically. Set it and forget it.",
      },
    ],
  },
  demo: {
    headline: "See it in action",
    description: "Here's exactly what you get:",
    tabs: [
      {
        id: "website",
        label: "Your Website",
        description: "Professional, mobile-first design",
      },
      {
        id: "admin",
        label: "Admin Panel",
        description: "Simple image upload interface",
      },
      {
        id: "instagram",
        label: "Social Feed",
        description: "Automated posts to Instagram",
      },
    ],
  },
};
```

### Step 2: Create components/HowItWorks.tsx

```typescript
"use client";

import { COPY } from "@/lib/constants";

export default function HowItWorks() {
  return (
    <section className="py-16 md:py-24 px-4" id="how-it-works">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.howItWorks.headline}
          </h2>
        </div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {COPY.howItWorks.steps.map((step) => (
            <div key={step.number} className="relative">
              {/* Step card */}
              <div className="bg-white rounded-lg border border-gray-200 p-8 hover:shadow-md transition-shadow">
                {/* Step number circle */}
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 text-white font-bold text-lg mb-6">
                  {step.number}
                </div>

                {/* Step content */}
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </div>

              {/* Connector line (hidden on mobile) */}
              {step.number < COPY.howItWorks.steps.length && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gray-200 transform translate-x-full"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

### Step 3: Create components/DemoTab.tsx

```typescript
"use client";

interface DemoTabProps {
  id: string;
  isActive: boolean;
  content: React.ReactNode;
}

export default function DemoTab({ isActive, content }: DemoTabProps) {
  return (
    <div
      className={`transition-all duration-300 ${
        isActive ? "opacity-100" : "hidden opacity-0"
      }`}
    >
      {content}
    </div>
  );
}
```

### Step 4: Create components/InteractiveDemo.tsx

```typescript
"use client";

import { useState } from "react";
import { COPY } from "@/lib/constants";
import DemoTab from "./DemoTab";

export default function InteractiveDemo() {
  const [activeTab, setActiveTab] = useState("website");

  return (
    <section className="py-16 md:py-24 px-4 bg-gray-50" id="demo">
      <div className="section-container">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {COPY.demo.headline}
          </h2>
          <p className="text-lg text-gray-600">
            {COPY.demo.description}
          </p>
        </div>

        {/* Demo container */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Tab buttons */}
          <div className="flex gap-0 border-b border-gray-200 bg-gray-50 overflow-x-auto">
            {COPY.demo.tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-max md:min-w-0 px-4 md:px-6 py-4 font-medium text-center border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-white"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="text-sm md:text-base">{tab.label}</div>
                <div className="text-xs text-gray-500 mt-1 hidden md:block">
                  {tab.description}
                </div>
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="aspect-video md:aspect-auto md:h-96 bg-gray-100 relative overflow-hidden">
            {/* Tab 1: Website Preview */}
            <DemoTab
              id="website"
              isActive={activeTab === "website"}
              content={
                <iframe
                  src="https://[YOUR-CONSTRUCTION-WEBSITE-URL]"
                  className="w-full h-full border-none"
                  title="Website Preview"
                />
              }
            />

            {/* Tab 2: Admin Panel */}
            <DemoTab
              id="admin"
              isActive={activeTab === "admin"}
              content={
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                  {/* Replace with actual screenshot */}
                  <img
                    src="/images/admin-panel-screenshot.png"
                    alt="Admin Panel"
                    className="max-w-full max-h-full object-contain"
                  />
                  {/* Placeholder if image not available yet */}
                  {!document.querySelector('img[alt="Admin Panel"]') && (
                    <div className="text-center">
                      <p className="text-gray-500 font-medium">Admin Panel</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Drag and drop images, schedule posts, set frequency
                      </p>
                    </div>
                  )}
                </div>
              }
            />

            {/* Tab 3: Instagram Feed */}
            <DemoTab
              id="instagram"
              isActive={activeTab === "instagram"}
              content={
                <div className="w-full h-full flex items-center justify-center p-4 md:p-8">
                  {/* Replace with actual screenshot */}
                  <img
                    src="/images/instagram-feed-screenshot.png"
                    alt="Instagram Feed"
                    className="max-w-full max-h-full object-contain"
                  />
                  {/* Placeholder if image not available yet */}
                  {!document.querySelector('img[alt="Instagram Feed"]') && (
                    <div className="text-center">
                      <p className="text-gray-500 font-medium">Instagram Feed</p>
                      <p className="text-gray-400 text-sm mt-2">
                        Your projects posted automatically, 5x per week
                      </p>
                    </div>
                  )}
                </div>
              }
            />
          </div>

          {/* Demo footer info */}
          <div className="px-4 md:px-6 py-4 bg-blue-50 border-t border-blue-100">
            <p className="text-sm text-blue-900">
              💡 <strong>Pro tip:</strong> Click the tabs above to see the full
              workflow. Website → Upload images → Automatic posts to social.
            </p>
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

export default function Home() {
  return (
    <div>
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <InteractiveDemo />

      {/* Remaining placeholders */}
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

### Step 6: Add Placeholder Screenshots (For Now)

Create temporary placeholder images:

```bash
# Create placeholder images (you'll replace with real ones)
# For now, just note where images should go:
# /public/images/admin-panel-screenshot.png
# /public/images/instagram-feed-screenshot.png
```

---

## ASSETS NEEDED

Before this ZIP is complete, you need:

1. **Real construction website URL** — For the iframe in Tab 1
   - Example: `https://[client-website].vercel.app`
   - Must be live/accessible

2. **Admin panel screenshot** — For Tab 2
   - PNG or JPG showing image upload interface
   - Recommended: 1200x800px

3. **Instagram feed screenshot** — For Tab 3
   - PNG or JPG showing Instagram posts
   - Can be a screenshot from their actual Instagram
   - Recommended: 1200x800px

---

## EXIT CRITERIA

Complete when:

- ✅ How It Works section shows 3 cards with numbers
- ✅ Cards display step-by-step process clearly
- ✅ Demo has 3 functional tabs (Website, Admin, Instagram)
- ✅ Clicking tabs switches content (no lag)
- ✅ Tab 1: Website loads in iframe or shows placeholder
- ✅ Tab 2: Admin panel screenshot displays
- ✅ Tab 3: Instagram screenshot displays
- ✅ Mobile: Tabs are clickable and content responsive
- ✅ No TypeScript errors
- ✅ `npm run build` succeeds

---

## TESTING CHECKLIST

- ✅ `npm run dev` loads without errors
- ✅ How It Works cards display all 3 steps
- ✅ Demo tabs are clickable
- ✅ Clicking Website tab → shows iframe/preview
- ✅ Clicking Admin tab → shows admin screenshot
- ✅ Clicking Instagram tab → shows Instagram screenshot
- ✅ Tab switching is smooth (no lag)
- ✅ Mobile: Tabs stack horizontally and are all clickable
- ✅ Desktop: Tabs display side-by-side
- ✅ Demo footer tip is visible

---

## GOLDEN PATH TEST

After completing this ZIP:

- ✅ Scroll to How It Works → See 3 steps clearly
- ✅ Scroll to Demo → See 3 tabs
- ✅ Click each tab → Content changes
- ✅ Mobile: All tabs clickable, no overflow issues
- ✅ Understand the workflow in 30 seconds

If any fails → Fix before moving to ZIP-03.

---

## CLAUDE CODE PROMPT

Ready to use:

```
Create How It Works and Interactive Demo components:

1. Update lib/constants.ts:
   - Add COPY.howItWorks with 3 steps
   - Add COPY.demo with 3 tabs

2. Create components/HowItWorks.tsx:
   - Headline: "How it works in 3 simple steps"
   - 3 cards: "We build it", "You upload", "We post automatically"
   - Step numbers in circles
   - Connector lines between cards (hidden on mobile)

3. Create components/DemoTab.tsx:
   - Simple component for tab content switching
   - Handles isActive state
   - Smooth transitions

4. Create components/InteractiveDemo.tsx:
   - Headline: "See it in action"
   - 3 tabs: Website | Admin | Instagram
   - Tab 1: Iframe of [YOUR-URL] (replace with real URL)
   - Tab 2: Image placeholder for admin panel
   - Tab 3: Image placeholder for Instagram
   - Tab footer with pro tip
   - Smooth tab switching with React state

5. Update app/page.tsx:
   - Import HowItWorks and InteractiveDemo
   - Place after ProblemSection
   - Keep remaining placeholders

Testing:
- npm run dev works
- All 3 steps visible in How It Works
- Demo tabs are clickable and switch content smoothly
- Mobile: Tabs accessible
- npm run build succeeds

Assets needed: Real website URL, admin screenshot, Instagram screenshot
```

