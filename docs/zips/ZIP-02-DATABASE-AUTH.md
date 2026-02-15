# ZIP-02: Database & Auth

> **Time**: ~3 hours  
> **Outcome**: Supabase set up, tables created, magic link auth working  
> **Dependencies**: ZIP-01 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Supabase project created
- ✅ Database tables for companies, projects, posts, etc.
- ✅ Row Level Security (RLS) policies
- ✅ Magic link authentication
- ✅ Supabase client configured in Next.js
- ✅ Ready to store builder data

---

## STEP 1: CREATE SUPABASE PROJECT

1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Name: `bytrade`
4. Database password: Save this somewhere safe
5. Region: London (eu-west-2)
6. Wait for project to spin up (~2 mins)

---

## STEP 2: GET YOUR KEYS

From Supabase dashboard → Settings → API:

- `Project URL` → This is your `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` key → This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` key → This is your `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## STEP 3: UPDATE ENV VARS

**File: `.env.local`** (create this in project root)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Add to `.gitignore`:**
```
.env.local
```

---

## STEP 4: INSTALL SUPABASE

```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## STEP 5: CREATE DATABASE TABLES

Go to Supabase dashboard → SQL Editor → New query

Run this SQL:

```sql
-- =============================================
-- BYTRADE DATABASE SCHEMA
-- =============================================

-- Companies table (one per builder)
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Basic info
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  whatsapp VARCHAR(50),
  
  -- Address
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  city VARCHAR(100),
  postcode VARCHAR(20),
  
  -- Business details
  trade_type VARCHAR(100), -- builder, electrician, plumber, etc.
  description TEXT,
  services TEXT[], -- array of services offered
  areas_covered TEXT[], -- array of areas/postcodes
  
  -- Branding
  logo_url VARCHAR(500),
  hero_image_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#1e3a5f',
  secondary_color VARCHAR(7) DEFAULT '#f97316',
  
  -- Template
  template VARCHAR(50) DEFAULT 'developer',
  
  -- Social links
  instagram_url VARCHAR(255),
  facebook_url VARCHAR(255),
  google_business_url VARCHAR(255),
  
  -- External IDs
  checkatrade_url VARCHAR(255),
  
  -- Subscription
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  tier VARCHAR(20) DEFAULT 'starter', -- starter, pro, full
  tier_updated_at TIMESTAMP WITH TIME ZONE,
  
  -- Posting settings (for £199 tier)
  posting_enabled BOOLEAN DEFAULT FALSE,
  posts_per_week INTEGER DEFAULT 5,
  
  -- Custom domain
  custom_domain VARCHAR(255),
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_published BOOLEAN DEFAULT FALSE
);

-- Projects table (portfolio items)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  location VARCHAR(255),
  
  -- Images (stored in R2)
  images TEXT[], -- array of image URLs
  featured_image_url VARCHAR(500),
  
  -- Metadata
  project_type VARCHAR(100), -- extension, renovation, new build, etc.
  completed_at DATE,
  
  -- For posting
  used_in_post BOOLEAN DEFAULT FALSE,
  last_posted_at TIMESTAMP WITH TIME ZONE,
  
  -- Order
  display_order INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE
);

-- Scheduled posts table
CREATE TABLE scheduled_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  
  -- Content
  image_url VARCHAR(500) NOT NULL,
  caption TEXT,
  hashtags TEXT[],
  
  -- Scheduling
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, posted, failed, skipped
  posted_at TIMESTAMP WITH TIME ZONE,
  
  -- Platform results
  instagram_post_id VARCHAR(255),
  facebook_post_id VARCHAR(255),
  google_post_id VARCHAR(255),
  
  -- Error tracking
  error_message TEXT,
  retry_count INTEGER DEFAULT 0
);

-- Reviews table (scraped from Checkatrade, Google, etc.)
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Review content
  reviewer_name VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_date DATE,
  
  -- Source
  source VARCHAR(50), -- checkatrade, google, manual
  external_id VARCHAR(255), -- ID from source for deduplication
  
  -- For posting
  used_in_post BOOLEAN DEFAULT FALSE,
  last_posted_at TIMESTAMP WITH TIME ZONE,
  
  -- Generated image (review graphic)
  graphic_url VARCHAR(500)
);

-- Social tokens table (OAuth tokens for posting)
CREATE TABLE social_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  platform VARCHAR(50) NOT NULL, -- instagram, facebook, google_business
  
  -- Tokens (encrypted in production)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Account info
  account_id VARCHAR(255),
  account_name VARCHAR(255),
  
  -- Status
  is_connected BOOLEAN DEFAULT TRUE,
  last_error TEXT,
  
  UNIQUE(company_id, platform)
);

-- Enquiries table (contact form submissions)
CREATE TABLE enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Contact info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  
  -- Message
  message TEXT,
  
  -- Source
  source VARCHAR(50) DEFAULT 'website', -- website, whatsapp
  
  -- Status
  status VARCHAR(20) DEFAULT 'new', -- new, contacted, converted, closed
  notes TEXT
);

-- Onboarding forms table (intake data before site build)
CREATE TABLE onboarding_forms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Link to company (null until company created)
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  
  -- Stripe
  stripe_session_id VARCHAR(255),
  tier VARCHAR(20),
  
  -- Form data (JSON blob)
  form_data JSONB,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, submitted, processed
  processed_at TIMESTAMP WITH TIME ZONE
);

-- =============================================
-- INDEXES
-- =============================================

CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_tier ON companies(tier);
CREATE INDEX idx_companies_custom_domain ON companies(custom_domain);
CREATE INDEX idx_projects_company_id ON projects(company_id);
CREATE INDEX idx_scheduled_posts_company_id ON scheduled_posts(company_id);
CREATE INDEX idx_scheduled_posts_status ON scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON scheduled_posts(scheduled_for);
CREATE INDEX idx_reviews_company_id ON reviews(company_id);
CREATE INDEX idx_enquiries_company_id ON enquiries(company_id);

-- =============================================
-- ROW LEVEL SECURITY
-- =============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_forms ENABLE ROW LEVEL SECURITY;

-- Public read for published companies (for builder sites)
CREATE POLICY "Public can view published companies" ON companies
  FOR SELECT USING (is_published = true AND is_active = true);

-- Public read for projects of published companies
CREATE POLICY "Public can view projects of published companies" ON projects
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = projects.company_id 
      AND companies.is_published = true 
      AND companies.is_active = true
    )
  );

-- Public read for reviews of published companies
CREATE POLICY "Public can view reviews of published companies" ON reviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM companies 
      WHERE companies.id = reviews.company_id 
      AND companies.is_published = true 
      AND companies.is_active = true
    )
  );

-- Public can submit enquiries
CREATE POLICY "Public can insert enquiries" ON enquiries
  FOR INSERT WITH CHECK (true);

-- Service role has full access (for API routes)
-- This is handled automatically by using service role key

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_tokens_updated_at BEFORE UPDATE ON social_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_onboarding_forms_updated_at BEFORE UPDATE ON onboarding_forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Click **Run** to execute.

---

## STEP 6: SUPABASE CLIENT SETUP

**File: `src/lib/supabase/client.ts`**

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/lib/supabase/server.ts`**

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}
```

**File: `src/lib/supabase/admin.ts`**

```typescript
import { createClient } from '@supabase/supabase-js'

// Admin client with service role - use only in API routes
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}
```

---

## STEP 7: DATABASE TYPES

**File: `src/lib/supabase/types.ts`**

```typescript
export type Tier = 'starter' | 'pro' | 'full'

export type Template = 
  | 'developer' 
  | 'tradesman' 
  | 'showcase' 
  | 'bold' 
  | 'local' 
  | 'corporate' 
  | 'craftsman' 
  | 'emergency'

export interface Company {
  id: string
  created_at: string
  updated_at: string
  slug: string
  name: string
  email: string
  phone: string | null
  whatsapp: string | null
  address_line1: string | null
  address_line2: string | null
  city: string | null
  postcode: string | null
  trade_type: string | null
  description: string | null
  services: string[] | null
  areas_covered: string[] | null
  logo_url: string | null
  hero_image_url: string | null
  primary_color: string
  secondary_color: string
  template: Template
  instagram_url: string | null
  facebook_url: string | null
  google_business_url: string | null
  checkatrade_url: string | null
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  tier: Tier
  tier_updated_at: string | null
  posting_enabled: boolean
  posts_per_week: number
  custom_domain: string | null
  is_active: boolean
  is_published: boolean
}

export interface Project {
  id: string
  created_at: string
  updated_at: string
  company_id: string
  title: string
  description: string | null
  location: string | null
  images: string[] | null
  featured_image_url: string | null
  project_type: string | null
  completed_at: string | null
  used_in_post: boolean
  last_posted_at: string | null
  display_order: number
  is_featured: boolean
}

export interface ScheduledPost {
  id: string
  created_at: string
  company_id: string
  project_id: string | null
  image_url: string
  caption: string | null
  hashtags: string[] | null
  scheduled_for: string
  status: 'pending' | 'posted' | 'failed' | 'skipped'
  posted_at: string | null
  instagram_post_id: string | null
  facebook_post_id: string | null
  google_post_id: string | null
  error_message: string | null
  retry_count: number
}

export interface Review {
  id: string
  created_at: string
  company_id: string
  reviewer_name: string | null
  rating: number
  review_text: string | null
  review_date: string | null
  source: 'checkatrade' | 'google' | 'manual'
  external_id: string | null
  used_in_post: boolean
  last_posted_at: string | null
  graphic_url: string | null
}

export interface Enquiry {
  id: string
  created_at: string
  company_id: string
  name: string
  email: string | null
  phone: string | null
  message: string | null
  source: 'website' | 'whatsapp'
  status: 'new' | 'contacted' | 'converted' | 'closed'
  notes: string | null
}
```

---

## STEP 8: HELPER FUNCTIONS

**File: `src/lib/supabase/queries.ts`**

```typescript
import { createAdminClient } from './admin'
import type { Company, Project, Review } from './types'

// Get company by slug (for builder sites)
export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  return data as Company
}

// Get company by custom domain
export async function getCompanyByDomain(domain: string): Promise<Company | null> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('custom_domain', domain)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  return data as Company
}

// Get projects for a company
export async function getCompanyProjects(companyId: string): Promise<Project[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('company_id', companyId)
    .order('display_order', { ascending: true })
  
  if (error || !data) return []
  return data as Project[]
}

// Get reviews for a company
export async function getCompanyReviews(companyId: string): Promise<Review[]> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .order('review_date', { ascending: false })
  
  if (error || !data) return []
  return data as Review[]
}

// Submit enquiry
export async function submitEnquiry(
  companyId: string,
  data: {
    name: string
    email?: string
    phone?: string
    message?: string
    source?: 'website' | 'whatsapp'
  }
) {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('enquiries')
    .insert({
      company_id: companyId,
      ...data
    })
  
  return { error }
}
```

---

## STEP 9: UPDATE MIDDLEWARE FOR CUSTOM DOMAINS

**File: `src/middleware.ts`** (update)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createAdminClient } from './lib/supabase/admin'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Main domain - serve marketing site
  const isMainDomain = 
    hostname === 'bytrade.co.uk' ||
    hostname === 'www.bytrade.co.uk' ||
    hostname === 'localhost:3000' ||
    hostname.includes('vercel.app')

  if (isMainDomain) {
    return NextResponse.next()
  }

  // Check for subdomain (e.g., daxa-construction.bytrade.co.uk)
  if (hostname.endsWith('.bytrade.co.uk')) {
    const subdomain = hostname.split('.')[0]
    if (subdomain && subdomain !== 'www') {
      return NextResponse.rewrite(new URL(`/sites/${subdomain}${url.pathname}`, request.url))
    }
  }

  // Custom domain - look up in database
  // Note: This requires edge-compatible Supabase setup
  // For now, we'll handle this in the page itself
  // and just pass through
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## STEP 10: MAGIC LINK AUTH SETUP

In Supabase dashboard → Authentication → URL Configuration:

- Site URL: `http://localhost:3000` (change to `https://bytrade.co.uk` in production)
- Redirect URLs: Add `http://localhost:3000/**` and `https://bytrade.co.uk/**`

In Supabase dashboard → Authentication → Email Templates:

Update the Magic Link template if you want custom branding.

---

## STEP 11: AUTH HELPER

**File: `src/lib/supabase/auth.ts`**

```typescript
import { createClient } from './client'

// Send magic link
export async function sendMagicLink(email: string, redirectTo?: string) {
  const supabase = createClient()
  
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo || `${window.location.origin}/auth/callback`,
    },
  })
  
  return { error }
}

// Sign out
export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()
  return { error }
}

// Get current user
export async function getCurrentUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  return { user, error }
}
```

---

## STEP 12: AUTH CALLBACK ROUTE

**File: `src/app/auth/callback/route.ts`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Return to home with error
  return NextResponse.redirect(`${origin}/?error=auth`)
}
```

---

## STEP 13: TEST DATABASE

Create a test company to verify everything works:

Go to Supabase → SQL Editor → Run:

```sql
INSERT INTO companies (
  slug,
  name,
  email,
  phone,
  whatsapp,
  trade_type,
  description,
  services,
  areas_covered,
  template,
  tier,
  is_active,
  is_published
) VALUES (
  'test-builder',
  'Test Builder Ltd',
  'test@example.com',
  '07123456789',
  '447123456789',
  'builder',
  'A test construction company for development.',
  ARRAY['Extensions', 'Renovations', 'New Builds'],
  ARRAY['Bristol', 'Bath', 'South Gloucestershire'],
  'developer',
  'full',
  true,
  true
);
```

---

## STEP 14: TEST QUERY

**File: `src/app/sites/[slug]/page.tsx`** (update)

```typescript
import { getCompanyBySlug, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { notFound } from 'next/navigation'

export default async function BuilderSitePage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const company = await getCompanyBySlug(params.slug)
  
  if (!company) {
    notFound()
  }

  const projects = await getCompanyProjects(company.id)
  const reviews = await getCompanyReviews(company.id)

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-8">
        <h1 className="text-3xl font-bold mb-4">{company.name}</h1>
        <p className="text-gray-600 mb-4">{company.description}</p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Trade:</strong> {company.trade_type}
          </div>
          <div>
            <strong>Template:</strong> {company.template}
          </div>
          <div>
            <strong>Tier:</strong> {company.tier}
          </div>
          <div>
            <strong>Phone:</strong> {company.phone}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Projects ({projects.length})</h2>
          {projects.length === 0 && <p className="text-gray-500">No projects yet</p>}
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-2">Reviews ({reviews.length})</h2>
          {reviews.length === 0 && <p className="text-gray-500">No reviews yet</p>}
        </div>

        <p className="text-sm text-gray-400 mt-8">
          Builder site template coming in ZIP-04
        </p>
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

1. Go to `http://localhost:3000/sites/test-builder`
2. Should see the test company data
3. Check Supabase dashboard → Table Editor to verify data

---

## EXIT CRITERIA

- ✅ Supabase project created
- ✅ All 7 tables created (companies, projects, scheduled_posts, reviews, social_tokens, enquiries, onboarding_forms)
- ✅ RLS policies in place
- ✅ Supabase client configured (browser, server, admin)
- ✅ Types defined
- ✅ Helper queries working
- ✅ Auth callback route created
- ✅ Test company displays at /sites/test-builder
- ✅ `npm run build` passes

---

## NEXT: ZIP-03

ZIP-03 will add:
- Stripe checkout
- Payment webhooks
- Onboarding form
- Tier-based feature gating

---

**Database ready. Go build it.**
