# MASTER PLAN: Construction Website Platform Marketing Site

## Database Schema

**No database needed.** This is a marketing site. All content is static/hardcoded.

---

## Page Structure

**Single Page: `/`**

Scroll-based marketing site with sections:

```
Hero
  ↓
Problem Section
  ↓
How It Works (3-step)
  ↓
Interactive Demo
  ↓
Pricing
  ↓
Testimonial
  ↓
FAQ
  ↓
About Us
  ↓
Footer CTA
```

---

## Component Hierarchy

```
Layout (Header minimal, Footer with email)
├── Hero (headline, subheading, CTA button)
├── ProblemSection (before/after visual)
├── HowItWorks (3-card grid)
├── InteractiveDemo (3-tab demo switcher)
│   ├── DemoTab1: Website Preview (iframe)
│   ├── DemoTab2: Admin Panel (screenshot)
│   └── DemoTab3: Instagram Feed (screenshot/embed)
├── PricingSection (3-column pricing cards)
├── TestimonialSection (quote + client details)
├── FAQSection (collapsible items)
├── AboutSection (brief copy)
└── FooterCTA (email contact)
```

---

## Third-Party Integrations

**Email**: 
- Contact form redirects to email address or uses Formspree/EmailJS
- Decision: Simple form that posts to email service

**Calendly**: 
- Optional Calendly embed (not MVP, add later if needed)

**Social Embedding**:
- Instagram feed embed (Instafeed.js or screenshot)

**Analytics**:
- Vercel Analytics (track page views, referrers, conversions)

---

## File Structure

```
/app
├── page.tsx                    (main page, all sections)
├── layout.tsx                  (header, footer, metadata)
├── globals.css                 (Tailwind + custom)
├── /components
│   ├── Hero.tsx
│   ├── ProblemSection.tsx
│   ├── HowItWorks.tsx
│   ├── InteractiveDemo.tsx
│   ├── DemoTab.tsx
│   ├── PricingCard.tsx
│   ├── TestimonialSection.tsx
│   ├── FAQAccordion.tsx
│   ├── AboutSection.tsx
│   └── FooterCTA.tsx
├── /lib
│   ├── constants.ts           (copy, pricing data, FAQ data)
│   └── utils.ts               (helper functions)
└── /public
    ├── /images                (screenshots, client photo, etc)
    └── /icons                 (step icons, etc)
```

---

## Key Technical Decisions

### 1. Styling Approach
- Tailwind CSS + shadcn/ui for components
- Custom CSS for animations (minimal, tasteful)
- Mobile-first responsive design

### 2. Interactive Demo Implementation
- Three tabs using React state (useState)
- Tab 1: Iframe of actual website (live URL)
- Tab 2: Static image (screenshot of admin panel)
- Tab 3: Static image or embedded Instagram (screenshot)
- No database, just client-side tab switching

### 3. Form/Email
- Simple contact form
- Option A: Formspree (free tier available)
- Option B: EmailJS (client-side email sending)
- Option C: Simple "click to email" link
- **Decision**: Start with Option C (simplest), can upgrade later

### 4. SEO/Metadata
- Next.js metadata export for SEO
- Open Graph tags
- Structured data (optional)

### 5. Hosting
- Vercel (automatic deployment from repo)
- Domain: [TBD - to be registered]

---

## Implementation Stages (ZIPs)

### ZIP-00: Foundation & Layout (1-2 hours)
**Purpose**: Set up Next.js 15 project, layout structure, header/footer, global styles

**Includes**:
- Create Next.js 15 project with Tailwind + shadcn/ui
- Base layout (header + footer structure)
- Global Tailwind styling
- Mobile-first responsive framework
- Color scheme finalized
- Typography system

**Exit Criteria**:
- App builds with zero errors
- Mobile layout looks clean
- Can add content sections easily

---

### ZIP-01: Hero + Problem Section (1 hour)
**Purpose**: Build hero section and problem statement with visuals

**Includes**:
- Hero section (headline, subheading, email CTA button)
- Problem section (before/after visual comparison)
- Section transitions/spacing
- Copy refinement

**Exit Criteria**:
- Hero looks compelling on mobile
- Problem section shows clear before/after
- CTAs clickable

---

### ZIP-02: How It Works + Demo Infrastructure (2 hours)
**Purpose**: Build the 3-step section and interactive demo tabs

**Includes**:
- How It Works 3-card grid
- Interactive Demo component (tab switcher)
- Demo Tab 1: Website preview (iframe or screenshot)
- Demo Tab 2: Admin panel screenshot
- Demo Tab 3: Instagram feed screenshot
- Responsive on mobile (tabs stack or scroll)

**Exit Criteria**:
- All three demo tabs display correctly
- Tab switching works smoothly
- Mobile: tabs are usable on small screens
- Images load fast

---

### ZIP-03: Pricing + Testimonial (1 hour)
**Purpose**: Build pricing tiers and social proof

**Includes**:
- 3-column pricing cards (£99, £149, £199)
- Pricing details per tier
- Email CTA on each card
- Testimonial section (quote + client name + photo)
- Styling for emphasis (highlight £199 as recommended)

**Exit Criteria**:
- Pricing tiers display correctly on mobile (stacked)
- Testimonial quote is readable
- All CTAs point to email

---

### ZIP-04: FAQ + About + Footer (1 hour)
**Purpose**: Build remaining sections

**Includes**:
- FAQ section with 5 collapsible questions
- About Us section (brief copy)
- Footer with email, links
- Final footer CTA

**Exit Criteria**:
- FAQ items expand/collapse
- All copy is finalized
- Footer looks professional

---

### ZIP-05: Polish, SEO, Testing & Deploy (1 hour)
**Purpose**: SEO optimization, performance, final polish, deployment

**Includes**:
- Meta tags (title, description, OG tags)
- Keywords naturally in copy
- Image optimization
- Lighthouse audit (90+ score)
- Mobile testing across devices
- Final typo pass
- Deploy to Vercel
- Set up domain

**Exit Criteria**:
- Lighthouse score 90+
- Mobile UX perfect
- All links work
- Live on production domain

---

## Testing Checkpoints

After each ZIP:

**Golden Path (Must Always Work)**:
- ✅ Site loads on mobile
- ✅ Email CTA visible and clickable
- ✅ All sections scroll smoothly
- ✅ Images load
- ✅ Demo tab switching works

**Mobile Testing**:
- iPhone 12/13/14
- Android phone
- iPad
- Tablet

**Desktop Testing**:
- Desktop 1920px
- Desktop 1440px
- Laptop 1366px

---

## Assets Needed ASAP

To start building immediately:

1. **First client website URL** (for demo iframe/screenshot)
2. **First client Instagram handle** (or screenshot of their feed)
3. **Testimonial quote** (from "chuffed" client)
4. **Client name** (for testimonial)
5. **Client photo** (optional but better)
6. **Construction imagery** (if you have branded images, else use stock)

---

## Scalability Notes

**Current Architecture Handles**:
- Up to 100k visitors/month
- Mobile-first rendering
- SEO for organic search
- Simple email conversion tracking

**Future Upgrades** (not MVP):
- Live chat
- Blog section
- Additional case studies/examples
- Email capture form (instead of just email link)
- A/B testing

---

## Security Considerations

**Not Applicable**: This is a marketing site with no user data, database, or auth.

---

## Deployment

**Production**: Vercel (auto-deploy from GitHub)
**Domain**: [TBD - to be purchased and configured]
**SSL**: Automatic via Vercel
**Analytics**: Vercel Analytics enabled

