# ZIP-01: Marketing Site Complete

> **Time**: ~4 hours  
> **Outcome**: Full marketing site ready to convert  
> **Dependencies**: ZIP-00 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Problem section (before/after comparison)
- ✅ Solution section (3 steps)
- ✅ "Who We Help" segments
- ✅ Live Demo with tabs
- ✅ Stats bar
- ✅ Pricing cards (3 tiers)
- ✅ Testimonials
- ✅ FAQ accordion
- ✅ Final CTA
- ✅ Complete marketing site ready to show

---

## STEP 1: PROBLEM SECTION

**File: `src/components/marketing/ProblemSection.tsx`**

```typescript
export default function ProblemSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Here's what's happening while you're on site
          </h2>
        </div>

        {/* Before/After Comparison */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Competitor */}
          <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
            <div className="bg-green-50 px-6 py-4 border-b border-green-200">
              <h3 className="font-bold text-gray-900">Your Competitor</h3>
              <p className="text-sm text-gray-600">@smithbuilders</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">Posted today</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">312 followers</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">8 enquiries this week</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-gray-700">First on Google</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-green-700 font-medium">Getting the calls ✓</p>
              </div>
            </div>
          </div>

          {/* You */}
          <div className="bg-white rounded-xl border-2 border-red-200 overflow-hidden">
            <div className="bg-red-50 px-6 py-4 border-b border-red-200">
              <h3 className="font-bold text-gray-900">You</h3>
              <p className="text-sm text-gray-600">No online presence</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Last post: 3 months ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">No website</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Word of mouth only</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <span className="text-gray-700">Invisible on Google</span>
              </div>
              <div className="pt-4 border-t">
                <p className="text-red-600 font-medium">Wondering why it's quiet ✗</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stat */}
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <p className="text-lg text-gray-600">
            <span className="font-bold text-gray-900">78% of customers</span> look you up online before calling.
            <br />No website? No Instagram? <span className="font-bold">No job.</span>
          </p>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 2: SOLUTION SECTION

**File: `src/components/marketing/SolutionSection.tsx`**

```typescript
import { Globe, Upload, Zap } from 'lucide-react'

const steps = [
  {
    icon: Globe,
    number: '01',
    title: 'We build it',
    description: 'Professional website live in 7 days. Mobile-optimized, SEO-ready. You don\'t touch a thing.',
  },
  {
    icon: Upload,
    number: '02',
    title: 'You upload',
    description: 'Snap photos of your work. Upload to your admin panel. Takes 2 minutes.',
  },
  {
    icon: Zap,
    number: '03',
    title: 'We post automatically',
    description: 'We turn your photos into Instagram, Facebook, and Google posts. 5x per week. While you sleep.',
  },
]

export default function SolutionSection() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            We build your website.<br />
            Then we run your social media.<br />
            <span className="text-orange-500">Automatically.</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="relative">
              <div className="bg-white rounded-xl border border-gray-200 p-8 h-full hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <span className="text-4xl font-bold text-gray-200">{step.number}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Time saved */}
        <div className="max-w-2xl mx-auto mt-12 bg-gray-900 rounded-xl p-8 text-center text-white">
          <p className="text-lg mb-2">
            <span className="text-3xl font-bold">5 posts/week × 52 weeks = 260 posts/year</span>
          </p>
          <p className="text-gray-400">
            Time to create manually: <span className="line-through">100+ hours</span>
            <br />
            Time with Trade Sites: <span className="text-green-400 font-bold">0 hours</span>
          </p>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 3: WHO WE HELP SECTION

**File: `src/components/marketing/WhoWeHelp.tsx`**

```typescript
import { Rocket, TrendingUp, Zap } from 'lucide-react'

const segments = [
  {
    icon: Rocket,
    title: 'Just Starting',
    description: 'New to the trade, need credibility. Get a professional site that makes you look established.',
    tier: '→ Starter £99',
    color: 'blue',
  },
  {
    icon: TrendingUp,
    title: 'Going Online',
    description: 'Got plenty of work but no website. Losing jobs to competitors who show up on Google.',
    tier: '→ Pro £149',
    color: 'green',
  },
  {
    icon: Zap,
    title: 'Growing Fast',
    description: 'Too busy to post on social media. Need automation so your online presence runs itself.',
    tier: '→ Full Package £199',
    color: 'orange',
  },
]

export default function WhoWeHelp() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Where are you right now?
          </h2>
          <p className="text-lg text-gray-600">
            We help builders at every stage
          </p>
        </div>

        {/* Segments */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {segments.map((segment) => (
            <div 
              key={segment.title}
              className="bg-white rounded-xl border border-gray-200 p-8 hover:shadow-lg transition-shadow"
            >
              <div className={`w-12 h-12 rounded-full bg-${segment.color}-100 flex items-center justify-center mb-4`}>
                <segment.icon className={`w-6 h-6 text-${segment.color}-500`} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{segment.title}</h3>
              <p className="text-gray-600 mb-4">{segment.description}</p>
              <p className="text-sm font-semibold text-orange-500">{segment.tier}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 4: DEMO SECTION

**File: `src/components/marketing/DemoSection.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Globe, Settings, Instagram } from 'lucide-react'

const tabs = [
  {
    id: 'website',
    label: 'Your Website',
    icon: Globe,
    description: 'Professional, mobile-first',
  },
  {
    id: 'admin',
    label: 'Admin Panel',
    icon: Settings,
    description: 'Upload in 2 minutes',
  },
  {
    id: 'instagram',
    label: 'Your Instagram',
    icon: Instagram,
    description: 'Posted automatically',
  },
]

export default function DemoSection() {
  const [activeTab, setActiveTab] = useState('website')

  return (
    <section id="demo" className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            See it in action
          </h2>
          <p className="text-lg text-gray-600">
            Don't take our word for it. See a real site.
          </p>
        </div>

        {/* Demo Container */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-4 text-center transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white border-b-2 border-orange-500 text-gray-900'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium hidden sm:inline">{tab.label}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 hidden md:block">{tab.description}</p>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="aspect-video bg-gray-100 relative">
              {activeTab === 'website' && (
                <div className="absolute inset-0">
                  {/* Replace with real client site iframe */}
                  <iframe
                    src="https://daxaconstruction.co.uk"
                    className="w-full h-full border-none"
                    title="Demo Website"
                  />
                  {/* Fallback if iframe blocked */}
                  {/* <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900 text-white">
                    <div className="text-center">
                      <Globe className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-xl font-medium">Live Client Website</p>
                      <p className="text-gray-400">daxaconstruction.co.uk</p>
                    </div>
                  </div> */}
                </div>
              )}

              {activeTab === 'admin' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-white p-8">
                  <div className="text-center max-w-md">
                    <Settings className="w-16 h-16 mx-auto mb-4 text-orange-500" />
                    <h3 className="text-xl font-bold mb-2">Dead Simple Admin Panel</h3>
                    <p className="text-gray-400 mb-4">
                      Drag & drop your photos. Add a title. Done.
                      <br />We handle the rest.
                    </p>
                    <div className="bg-gray-800 rounded-lg p-4 text-left text-sm">
                      <p className="text-green-400">✓ Upload photos</p>
                      <p className="text-green-400">✓ Edit your info</p>
                      <p className="text-green-400">✓ See scheduled posts</p>
                      <p className="text-gray-500">No tech skills needed</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'instagram' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 text-white p-8">
                  <div className="text-center max-w-md">
                    <Instagram className="w-16 h-16 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Posted Automatically</h3>
                    <p className="text-white/80 mb-4">
                      5 posts per week to Instagram, Facebook, and Google.
                      <br />You don't log in. Ever.
                    </p>
                    <div className="bg-white/10 rounded-lg p-4 text-left text-sm">
                      <p>📸 Posted 2 days ago</p>
                      <p>📸 Posted 4 days ago</p>
                      <p>📸 Posted 6 days ago</p>
                      <p className="text-white/60 mt-2">All while you were on site...</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-orange-50 border-t border-orange-100">
              <p className="text-sm text-orange-900">
                💡 <strong>This is a real client.</strong> Dave from DAXA Construction hasn't logged into Instagram in months. His feed is still active.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 5: STATS BAR

**File: `src/components/marketing/StatsBar.tsx`**

```typescript
import { STATS } from '@/lib/constants'

const stats = [
  { value: STATS.postsAutomated, label: 'Posts automated' },
  { value: STATS.hoursSaved, label: 'Hours saved' },
  { value: STATS.buildersOnline, label: 'Builders online' },
]

export default function StatsBar() {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="section-container">
        <div className="grid grid-cols-3 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl md:text-4xl font-bold text-orange-500">{stat.value}</p>
              <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 6: PRICING SECTION

**File: `src/components/marketing/PricingSection.tsx`**

```typescript
import { Check, X } from 'lucide-react'
import { PRICING } from '@/lib/constants'

export default function PricingSection() {
  const tiers = [PRICING.starter, PRICING.pro, PRICING.full]

  return (
    <section id="pricing" className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Simple pricing. Pick what you need.
          </h2>
          <p className="text-lg text-gray-600">
            All plans include hosting, SSL, and support. Cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`relative bg-white rounded-xl overflow-hidden ${
                tier.highlighted
                  ? 'border-2 border-orange-500 shadow-xl'
                  : 'border border-gray-200'
              }`}
            >
              {/* Popular badge */}
              {tier.highlighted && (
                <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  MOST POPULAR
                </div>
              )}

              <div className="p-8">
                {/* Header */}
                <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{tier.description}</p>

                {/* Price */}
                <div className="mt-6 mb-6">
                  <span className="text-4xl font-bold text-gray-900">£{tier.price}</span>
                  <span className="text-gray-600">/month</span>
                </div>

                {/* CTA */}
                <a
                  href={`mailto:hello@trade-sites.co.uk?subject=Interested in ${tier.name} plan`}
                  className={`block w-full text-center py-3 rounded-lg font-semibold transition-colors ${
                    tier.highlighted
                      ? 'bg-orange-500 text-white hover:bg-orange-600'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Get Started →
                </a>

                {/* Features */}
                <ul className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                  {tier.notIncluded.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-400">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-500 mt-8">
          Questions? <a href="#faq" className="text-orange-500 font-medium hover:underline">Check our FAQ</a> or{' '}
          <a href="mailto:hello@trade-sites.co.uk" className="text-orange-500 font-medium hover:underline">email us</a>
        </p>
      </div>
    </section>
  )
}
```

---

## STEP 7: TESTIMONIALS

**File: `src/components/marketing/Testimonials.tsx`**

```typescript
import { Star } from 'lucide-react'

const testimonials = [
  {
    quote: "I used to stress about Instagram. Now I just take photos and forget about it. Three months in and I've had to put my prices up because I've got too much work.",
    name: 'Dave',
    company: 'DAXA Construction',
    location: 'Bristol',
  },
  {
    quote: "Website looks proper professional. Customers actually comment on it when they call. The social media stuff is a bonus - I don't do anything and my Instagram's always active.",
    name: 'Mike',
    company: 'M&S Electrical',
    location: 'Manchester',
  },
  {
    quote: "Best money I spend each month. Used to pay a marketing girl £400 to post twice a week. This does 5 posts for £199 and I don't have to brief anyone.",
    name: 'Steve',
    company: 'Premier Plastering',
    location: 'London',
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 md:py-24">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Builders who stopped worrying about marketing
          </h2>
        </div>

        {/* Testimonial Cards */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.name}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-gray-700 mb-6">"{testimonial.quote}"</p>

              {/* Author */}
              <div>
                <p className="font-semibold text-gray-900">{testimonial.name}</p>
                <p className="text-sm text-gray-600">
                  {testimonial.company} · {testimonial.location}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 8: FAQ SECTION

**File: `src/components/marketing/FAQSection.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How long until my site is live?',
    answer: '7 days or less. Usually 5. We\'ll send you a link to review before it goes live.',
  },
  {
    question: 'What if I\'m not on Instagram or Facebook?',
    answer: 'No problem. We\'ll help you set them up - takes 5 minutes. Or just start with a website and add socials later.',
  },
  {
    question: 'Do I need to write captions and hashtags?',
    answer: 'Nope. Our AI writes them for you based on your trade and location. You literally just upload a photo.',
  },
  {
    question: 'What if I want to change something on my site?',
    answer: 'On Pro and Full Package, you can edit anytime in the admin panel. Or just email us and we\'ll do it - usually same day.',
  },
  {
    question: 'Can I use my own domain name?',
    answer: 'Yes. We\'ll set it up for you at no extra cost. Or you can use a free subdomain like yourname.trade-sites.co.uk.',
  },
  {
    question: 'What if I already have a website?',
    answer: 'We can migrate it or rebuild it. Same price. Your old site stays live until the new one\'s ready.',
  },
  {
    question: 'Is there a contract?',
    answer: 'No. Month to month. Cancel anytime with one email. No cancellation fees, no hassle.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <section id="faq" className="py-16 md:py-24 bg-gray-50">
      <div className="section-container">
        {/* Headline */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Questions builders ask
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="max-w-2xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between"
              >
                <span className="font-medium text-gray-900">{faq.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 9: FINAL CTA

**File: `src/components/marketing/FinalCTA.tsx`**

```typescript
import { SITE_CONFIG } from '@/lib/constants'

export default function FinalCTA() {
  return (
    <section className="py-16 md:py-24 bg-gray-900 text-white">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Your competitors are posting right now.
          </h2>
          <p className="text-xl text-gray-400 mb-8">
            Your website could be live in 7 days.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#pricing"
              className="btn-primary text-lg px-8 py-4"
            >
              Get Your Site →
            </a>
            <a
              href={`https://wa.me/${SITE_CONFIG.whatsapp}?text=Hi, I'm interested in a website for my trade business`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 border border-white/30 rounded-lg font-semibold hover:bg-white/10 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>

          <p className="text-sm text-gray-500 mt-8">
            Or email {SITE_CONFIG.email}
          </p>
        </div>
      </div>
    </section>
  )
}
```

---

## STEP 10: UPDATE MARKETING PAGE

**File: `src/app/(marketing)/page.tsx`**

```typescript
import Hero from '@/components/marketing/Hero'
import TrustBar from '@/components/marketing/TrustBar'
import ProblemSection from '@/components/marketing/ProblemSection'
import SolutionSection from '@/components/marketing/SolutionSection'
import WhoWeHelp from '@/components/marketing/WhoWeHelp'
import DemoSection from '@/components/marketing/DemoSection'
import StatsBar from '@/components/marketing/StatsBar'
import Testimonials from '@/components/marketing/Testimonials'
import PricingSection from '@/components/marketing/PricingSection'
import FAQSection from '@/components/marketing/FAQSection'
import FinalCTA from '@/components/marketing/FinalCTA'

export default function HomePage() {
  return (
    <>
      <TrustBar />
      <Hero />
      <ProblemSection />
      <SolutionSection />
      <WhoWeHelp />
      <DemoSection />
      <StatsBar />
      <PricingSection />
      <Testimonials />
      <FAQSection />
      <FinalCTA />
    </>
  )
}
```

---

## STEP 11: TEST IT

```bash
npm run dev
```

Verify:
- ✅ All sections render
- ✅ Demo tabs switch smoothly
- ✅ FAQ accordion works
- ✅ Pricing cards display correctly
- ✅ All WhatsApp links work
- ✅ Mobile responsive
- ✅ `npm run build` passes

---

## STEP 12: DEPLOY

```bash
npx vercel --prod
```

---

## EXIT CRITERIA

- ✅ Full marketing site complete
- ✅ All sections from spec implemented
- ✅ Mobile responsive
- ✅ WhatsApp buttons everywhere
- ✅ Demo tabs working
- ✅ FAQ accordion working
- ✅ Deployed to Vercel
- ✅ Ready to show people

---

## NEXT: ZIP-02

ZIP-02 will add:
- Supabase database
- Magic link auth
- Companies table
- Ready for builder sites

---

**Marketing site done. Go show it to people.**
