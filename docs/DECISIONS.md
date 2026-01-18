# Architectural Decisions

## [DATE] – Single Page vs Multi-Page

**Decision**: Single-page scrolling website

**Reason**:
- Better narrative control for conversion funnel
- MyDealerTools proven this model works
- Simpler to build and maintain
- Better mobile experience
- Users don't need navigation complexity

**Alternatives considered**:
- Multi-page (About, Features, Pricing, etc.) - adds friction
- Separate demo site - splits attention

**Impact**:
- All content must be compelling in one scroll
- Demo is embedded/in-page, not separate

---

## [DATE] – Interactive Demo Approach

**Decision**: Three switchable screens showing: Website → Admin Panel → Social Feed

**Reason**:
- Shows actual product in action (trust)
- Mirrors MyDealerTools approach
- Demonstrates the entire workflow in 30 seconds
- Low friction to understand value

**Alternatives considered**:
- Video walkthrough - passive, less engaging
- Static screenshots - doesn't show automation
- Separate demo environment - adds complexity

**Impact**:
- Needs iframe or embedded views of real websites
- Requires mock-up screenshots for admin panel and social feeds
- Must be responsive on mobile

---

## [DATE] – Tech Stack

**Decision**: Next.js 15 + Tailwind + shadcn/ui + Vercel

**Reason**:
- Consistent with MyDealerTools (Billy's familiar)
- shadcn/ui for quality components
- Fast deployment on Vercel
- Good Lighthouse scores for SEO

**Alternatives considered**:
- Static site generator - overkill
- Webflow - less control

**Impact**:
- Familiar tech for Billy
- Can reuse component patterns

---

## [DATE] – Data/Backend Needed?

**Decision**: No database. Calendly integration for bookings.

**Reason**:
- This is a marketing site, not an app
- Calendly handles all booking logic
- No user data to store
- Simpler = fewer things to break

**Alternatives considered**:
- Custom booking system - unnecessary complexity

**Impact**:
- Simple deployment
- No auth needed
- Calendly embed on CTA

---

## [DATE] – Payment/Pricing Display

**Decision**: Display pricing tiers, link to email/calendar for sales conversation

**Reason**:
- This is a marketing site, not the actual app
- Pricing shown for transparency
- Actual signup/payment happens during onboarding call
- No reason to over-complicate

**Alternatives considered**:
- Direct Stripe payment on site - unnecessary
- Sign up flow - premature

**Impact**:
- CTA is "Book a demo" not "Sign up"
- Simplifies the site

