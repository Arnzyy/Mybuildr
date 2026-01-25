# Implementation Log

## How To Use
Claude Code updates this after completing ANY work.
This is the running record of what exists.

---

## Environment Variables

| Variable | Purpose | Set In |
|----------|---------|--------|
| NEXT_PUBLIC_SUPABASE_URL | Supabase project URL | Vercel + .env.local |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Supabase anon key | Vercel + .env.local |
| SUPABASE_SERVICE_ROLE_KEY | Supabase service role key (server-side only) | Vercel + .env.local |
| NEXT_PUBLIC_SITE_URL | Base URL for the site | Vercel + .env.local |
| R2_ACCOUNT_ID | Cloudflare R2 account ID | Vercel |
| R2_ACCESS_KEY_ID | R2 access key for image uploads | Vercel |
| R2_SECRET_ACCESS_KEY | R2 secret key | Vercel |
| R2_BUCKET_NAME | R2 bucket name | Vercel |
| R2_PUBLIC_URL | R2 public URL for images | Vercel |
| ANTHROPIC_API_KEY | Anthropic AI for caption generation | Vercel |
| INSTAGRAM_CLIENT_ID | Instagram OAuth | Vercel |
| INSTAGRAM_CLIENT_SECRET | Instagram OAuth | Vercel |
| FACEBOOK_APP_ID | Facebook OAuth | Vercel |
| FACEBOOK_APP_SECRET | Facebook OAuth | Vercel |
| GOOGLE_CLIENT_ID | Google Business OAuth | Vercel |
| GOOGLE_CLIENT_SECRET | Google Business OAuth | Vercel |
| CRON_SECRET | Vercel cron job authentication | Vercel |

---

## Database Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| companies | Core company data (multi-tenant) | ✅ User can only see their company |
| projects | Construction projects with images | ✅ Scoped to company_id |
| media_library | Individual images/videos for posting | ✅ Scoped to company_id |
| scheduled_posts | Queue of posts to publish | ✅ Scoped to company_id |
| reviews | Customer reviews (scraped or manual) | ✅ Scoped to company_id |
| social_tokens | OAuth tokens for social platforms | ✅ Scoped to company_id |
| enquiries | Contact form submissions | ✅ Scoped to company_id |
| onboarding_forms | New customer onboarding data | ✅ Scoped to company_id |

---

## RLS Policies

| Policy | Table | Rule |
|--------|-------|------|
| User access own company | companies | user.email = company.email |
| Company access own data | projects, media_library, scheduled_posts, reviews, enquiries | auth.user company_id matches row company_id |
| Service role bypass | All tables | Service role can access all (for admin operations) |

---

## Design System

| Element | Value | Notes |
|---------|-------|-------|
| Framework | Next.js 15 (App Router) | React 19, TypeScript |
| Styling | Tailwind CSS 4 | Utility-first |
| Components | Custom + Lucide React icons | No shadcn/ui used |
| Display Font | System defaults | Clean, readable |
| Body Font | System defaults | Optimized for mobile |
| Primary Color | Orange (#EA580C family) | Used for CTAs |
| Accent Color | Varies by template | Each template has own colors |
| Aesthetic | Mobile-first, clean, modern | Not flashy, trustworthy |

---

## Website Templates

8 templates available for construction companies:

| Template | Style | Best For |
|----------|-------|----------|
| Developer | Modern, professional | Property developers |
| Tradesman | Bold, traditional | General builders |
| Showcase | Gallery-focused | Image-heavy portfolios |
| Bold | High-contrast, impactful | Roofing, landscaping |
| Local | Community-focused | Local builders |
| Corporate | Clean, business | Larger firms |
| Craftsman | Premium, detailed | High-end renovations |
| Emergency | Urgent, accessible | Emergency services |
| Daxa | Premium modern | Boutique builders |

---

## ZIP Progress

### ZIP-00: Foundation ✅
- Started: Jan 18, 2026
- Completed: Jan 18, 2026
- Notes: Next.js 15, Tailwind CSS 4, project structure

### ZIP-01: Marketing Complete ✅
- Started: Jan 18, 2026
- Completed: Jan 18, 2026
- Notes: Landing page, hero, problem/solution, pricing, testimonials, FAQ

### ZIP-02: Database & Auth ✅
- Started: Jan 19, 2026
- Completed: Jan 19, 2026
- Notes: Supabase setup, auth flow, RLS policies, database schema

### ZIP-03: Pricing & Testimonial ✅
- Completed: Jan 18, 2026
- Notes: Merged with ZIP-01

### ZIP-04: Builder Templates ✅
- Completed: Jan 19, 2026
- Notes: First set of templates (Developer, Tradesman, Showcase, Bold)

### ZIP-05: Templates Remaining ✅
- Completed: Jan 19, 2026
- Notes: Additional templates (Local, Corporate, Craftsman, Emergency, Daxa)

### ZIP-06: Admin Dashboard ✅
- Completed: Jan 19, 2026
- Notes: Admin layout, dashboard homepage, health check banner

### ZIP-07: Projects & Images ✅
- Completed: Jan 19, 2026
- Notes: Project CRUD, image upload to R2, media library, drag-drop reordering

### ZIP-08: Auto Posting ✅
- Completed: Jan 19, 2026
- Notes: Posting scheduler, cron jobs, AI caption generation with Anthropic

### ZIP-09: Social OAuth ✅
- Completed: Jan 19, 2026
- Notes: Instagram, Facebook, Google Business OAuth connections

### ZIP-10: Reviews & Graphics ✅
- Completed: Jan 19, 2026
- Notes: Review scraping (Checkatrade), review graphics generation, review posting

### ZIP-11: Polish & Deploy ✅
- Completed: Jan 19, 2026
- Notes: SEO optimization, error handling, loading states, deployment

### Recent Improvements (Jan 20-25, 2026)
- Added media_type support (image/video) to media_library and scheduled_posts
- Added customizable posting_times to companies table (default: 8am, 12pm, 6pm)
- Created database trigger to auto-sync project images to media_library
- Fixed carousel posts (only schedule one post per multi-image project)
- Added delete button for failed posts in API
- Limited posting time slots to maximum 3 selections
- Updated admin panel improvements documentation

---

## Third-Party Services

| Service | Purpose | Dashboard |
|---------|---------|-----------|
| Supabase | Database + Auth + RLS | [https://supabase.com/dashboard](https://qzvcawubaoagjitkvlix.supabase.co) |
| Vercel | Hosting + Serverless + Cron | [vercel.com/dashboard](https://vercel.com/dashboard) |
| Cloudflare R2 | Image & video storage | Cloudflare dashboard |
| Anthropic AI | AI caption generation | [console.anthropic.com](https://console.anthropic.com) |
| Stripe | Billing & subscriptions | Stripe dashboard |
| Meta (Facebook) | Instagram + Facebook OAuth & posting | Meta Developer Console |
| Google Cloud | Google Business Profile posting | Google Cloud Console |

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/enquiry` | Handle contact form submissions |
| `/api/admin/settings` | Update company settings |
| `/api/admin/upload` | Upload images to R2 |
| `/api/admin/upload/presign` | Generate presigned R2 upload URLs |
| `/api/admin/projects/*` | Project CRUD operations |
| `/api/admin/projects/reorder` | Reorder projects |
| `/api/admin/media/*` | Media library management |
| `/api/admin/posts/*` | Scheduled posts management |
| `/api/admin/posts/generate` | Generate new posts from media |
| `/api/admin/posts/reorder` | Reorder scheduled posts |
| `/api/admin/reviews/*` | Review management |
| `/api/admin/reviews/scrape` | Scrape reviews from Checkatrade |
| `/api/admin/reviews/[id]/graphic` | Generate review graphic |
| `/api/admin/reviews/[id]/post` | Create scheduled post from review |
| `/api/admin/social/connect` | Initiate OAuth flow |
| `/api/admin/social/disconnect` | Disconnect social account |
| `/api/auth/callback` | Supabase auth callback |
| `/api/auth/callback/instagram` | Instagram OAuth callback |
| `/api/auth/callback/facebook` | Facebook OAuth callback |
| `/api/auth/callback/google` | Google OAuth callback |
| `/api/cron/schedule-posts` | Generate scheduled posts (cron) |
| `/api/cron/execute-posts` | Execute pending posts (cron) |
| `/api/health` | Health check endpoint |

---

## Key Features Implemented

### 1. Multi-Tenant Architecture ✅
- Each company has own data (companies, projects, media, posts)
- RLS policies enforce company_id scoping
- User authentication tied to company email

### 2. Website Builder ✅
- 9 professional templates
- Dynamic routing: `/sites/[slug]`
- Custom domain support (configured via custom_domain field)
- Real-time preview of company sites

### 3. Project Management ✅
- Create, edit, delete projects
- Upload multiple images per project
- Drag-drop reordering
- Featured project toggle
- Images auto-sync to media library via database trigger

### 4. Media Library ✅
- Unified photo/video management
- Images sourced from projects or standalone uploads
- Track posting frequency (times_posted, last_posted_at)
- Availability toggle (is_available)
- Supports both images and videos (media_type field)

### 5. Automated Social Media Posting ✅
- AI-generated captions using Anthropic Claude
- Customizable caption guidelines and sign-offs
- Hashtag preferences
- Post to Instagram, Facebook, Google Business Profile
- Configurable posting frequency (posts_per_week)
- Customizable posting times (posting_times array)
- Cron jobs: schedule-posts (daily) and execute-posts (hourly)
- Retry logic for failed posts
- Manual post management (reorder, delete, skip)

### 6. Review Management ✅
- Scrape reviews from Checkatrade
- Manual review entry
- Generate branded review graphics
- Auto-post reviews to social media
- Min rating filter for auto-posting
- Track which reviews have been used

### 7. OAuth Social Connections ✅
- Instagram Business Account
- Facebook Pages
- Google Business Profile
- Token refresh handling
- Connection status monitoring

### 8. Admin Dashboard ✅
- Health check banner (posting status, media availability)
- Quick stats (projects, photos)
- View live website
- Upload photos CTA
- Social connection status
- Settings management
- Billing portal integration (Stripe)

### 9. Tier System ✅
- **Starter** (£99): Website + Hosting
- **Pro** (£149): + Admin panel (upload images)
- **Full** (£199): + Automated social posting
- Feature flags control access to functionality

### 10. SEO & Performance ✅
- Dynamic sitemap.xml
- robots.txt
- JSON-LD structured data
- Mobile-first responsive design
- Fast loading (Tailwind CSS 4, Next.js 15)

---

## Known Issues

| Issue | Severity | Notes |
|-------|----------|-------|
| Carousel posts | FIXED | Was scheduling multiple posts per multi-image project. Fixed Jan 25. |
| Media library sync | FIXED | Project image changes now auto-sync via database trigger. Fixed Jan 24. |
| None currently | - | System running smoothly |

---

## Recent Changes (Last 7 Days)

### Jan 25, 2026
- Limited posting time slots to max 3 selections
- Fixed carousel posts (only schedule one post per multi-image project)

### Jan 24, 2026
- Added database trigger to auto-sync project images to media_library
- Allowed deleting failed posts via API

### Jan 23, 2026
- Documented admin panel improvements

### Jan 20-21, 2026
- Added media_type support (image/video)
- Added customizable posting_times to companies table
- Implemented social account setup documentation

---

## Deployment

- **Platform**: Vercel
- **Branch**: main (auto-deploy)
- **Build Command**: `npm run build`
- **Environment**: Production + Preview
- **Cron Jobs**:
  - `schedule-posts`: Daily at 2am UTC
  - `execute-posts`: Every hour