# ZIP-06: Admin Dashboard Core

> **Time**: ~4 hours  
> **Outcome**: Working admin dashboard with settings, tier-gated features  
> **Dependencies**: ZIP-05 complete

---

## WHAT YOU'LL HAVE AFTER THIS ZIP

- ✅ Admin layout with sidebar navigation
- ✅ Dashboard homepage with stats
- ✅ Company settings page (edit info, branding)
- ✅ Auth protection (magic link login)
- ✅ Tier-based feature gating
- ✅ Billing management link
- ✅ Mobile-responsive admin

---

## ADMIN STRUCTURE

```
/admin
├── /                    → Dashboard (stats overview)
├── /settings            → Company info, branding
├── /projects            → Manage projects (ZIP-07)
├── /posts               → View scheduled posts (ZIP-08, £199 only)
├── /social              → Connect social accounts (ZIP-09, £199 only)
├── /reviews             → Manage reviews (ZIP-10)
└── /billing             → Stripe portal redirect
```

---

## STEP 1: AUTH MIDDLEWARE FOR ADMIN

**File: `src/middleware.ts`** (update)

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Create response to modify
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create Supabase client for auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Check auth for admin routes
  if (url.pathname.startsWith('/admin')) {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      // Redirect to login
      return NextResponse.redirect(new URL('/login?redirect=/admin', request.url))
    }
  }

  // Main domain - serve marketing site
  const isMainDomain = 
    hostname === 'bytrade.co.uk' ||
    hostname === 'www.bytrade.co.uk' ||
    hostname === 'localhost:3000' ||
    hostname.includes('vercel.app')

  if (isMainDomain) {
    return response
  }

  // Check for subdomain (e.g., daxa-construction.bytrade.co.uk)
  if (hostname.endsWith('.bytrade.co.uk')) {
    const subdomain = hostname.split('.')[0]
    if (subdomain && subdomain !== 'www') {
      return NextResponse.rewrite(new URL(`/sites/${subdomain}${url.pathname}`, request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
```

---

## STEP 2: LOGIN PAGE

**File: `src/app/(auth)/login/page.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SITE_CONFIG } from '@/lib/constants'

export default function LoginPage() {
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/admin'
  
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${redirect}`,
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{SITE_CONFIG.name}</h1>
          <p className="text-gray-600 mt-2">Sign in to your admin panel</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500">
                Click the link in your email to sign in. The link expires in 1 hour.
              </p>
              <button
                onClick={() => setSent(false)}
                className="mt-6 text-sm text-orange-600 hover:underline"
              >
                Use a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@company.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <p className="text-xs text-gray-500 text-center">
                No password needed. We'll send you a secure link.
              </p>
            </form>
          )}
        </div>

        {/* Back link */}
        <p className="text-center mt-6">
          <a href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to {SITE_CONFIG.name}
          </a>
        </p>
      </div>
    </div>
  )
}
```

---

## STEP 3: GET USER'S COMPANY

**File: `src/lib/supabase/queries.ts`** (add)

```typescript
// Add to existing queries.ts

// Get company for authenticated user (by email)
export async function getCompanyForUser(email: string): Promise<Company | null> {
  const supabase = createAdminClient()
  
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .single()
  
  if (error || !data) return null
  return data as Company
}

// Update company
export async function updateCompany(
  companyId: string, 
  updates: Partial<Company>
): Promise<{ error: any }> {
  const supabase = createAdminClient()
  
  const { error } = await supabase
    .from('companies')
    .update(updates)
    .eq('id', companyId)
  
  return { error }
}
```

---

## STEP 4: ADMIN LAYOUT

**File: `src/app/admin/layout.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login?redirect=/admin')
  }

  const company = await getCompanyForUser(user.email!)

  if (!company) {
    // User exists but no company - show onboarding or error
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Company Found</h1>
          <p className="text-gray-600 mb-6">
            We couldn't find a company associated with {user.email}.
            If you've just signed up, please complete the onboarding process.
          </p>
          <a
            href="/#pricing"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600"
          >
            Get Started
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile header */}
      <AdminHeader company={company} user={user} />
      
      <div className="flex">
        {/* Sidebar - hidden on mobile */}
        <AdminSidebar company={company} />
        
        {/* Main content */}
        <main className="flex-1 p-4 md:p-8 md:ml-64">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## STEP 5: ADMIN SIDEBAR

**File: `src/components/admin/AdminSidebar.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Company } from '@/lib/supabase/types'
import { hasFeature } from '@/lib/features'
import { 
  LayoutDashboard, 
  Settings, 
  FolderOpen, 
  Calendar, 
  Share2, 
  Star,
  CreditCard,
  ExternalLink,
  Lock
} from 'lucide-react'

interface AdminSidebarProps {
  company: Company
}

export default function AdminSidebar({ company }: AdminSidebarProps) {
  const pathname = usePathname()

  const navItems = [
    {
      href: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
      requiredFeature: null,
    },
    {
      href: '/admin/settings',
      label: 'Settings',
      icon: Settings,
      requiredFeature: null,
    },
    {
      href: '/admin/projects',
      label: 'Projects',
      icon: FolderOpen,
      requiredFeature: 'upload_projects',
    },
    {
      href: '/admin/posts',
      label: 'Scheduled Posts',
      icon: Calendar,
      requiredFeature: 'view_scheduled_posts',
    },
    {
      href: '/admin/social',
      label: 'Social Accounts',
      icon: Share2,
      requiredFeature: 'social_connections',
    },
    {
      href: '/admin/reviews',
      label: 'Reviews',
      icon: Star,
      requiredFeature: null,
    },
    {
      href: '/admin/billing',
      label: 'Billing',
      icon: CreditCard,
      requiredFeature: null,
    },
  ]

  return (
    <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-gray-900 text-white">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <Link href="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-lg">B</span>
          </div>
          <div>
            <p className="font-bold">ByTrade</p>
            <p className="text-xs text-gray-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      {/* Company info */}
      <div className="p-4 border-b border-gray-800">
        <p className="font-medium truncate">{company.name}</p>
        <p className="text-xs text-gray-400 capitalize">{company.tier} Plan</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const hasAccess = !item.requiredFeature || hasFeature(company.tier, item.requiredFeature)

          return (
            <Link
              key={item.href}
              href={hasAccess ? item.href : '#'}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive 
                  ? 'bg-orange-500 text-white' 
                  : hasAccess
                    ? 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    : 'text-gray-600 cursor-not-allowed'
              }`}
              onClick={(e) => !hasAccess && e.preventDefault()}
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {!hasAccess && <Lock className="w-4 h-4" />}
            </Link>
          )
        })}
      </nav>

      {/* View site link */}
      <div className="p-4 border-t border-gray-800">
        <a
          href={`https://${company.slug}.bytrade.co.uk`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          View Live Site
        </a>
      </div>

      {/* Upgrade prompt for non-full tier */}
      {company.tier !== 'full' && (
        <div className="p-4 m-4 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
          <p className="font-medium text-sm mb-2">Unlock all features</p>
          <p className="text-xs text-orange-100 mb-3">
            Upgrade to Full Package for automated posting
          </p>
          <Link
            href="/admin/billing"
            className="block text-center bg-white text-orange-500 px-4 py-2 rounded font-medium text-sm hover:bg-gray-100"
          >
            Upgrade Now
          </Link>
        </div>
      )}
    </aside>
  )
}
```

---

## STEP 6: ADMIN HEADER (MOBILE)

**File: `src/components/admin/AdminHeader.tsx`**

```typescript
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Company } from '@/lib/supabase/types'
import { User } from '@supabase/supabase-js'
import { Menu, X, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  company: Company
  user: User
}

export default function AdminHeader({ company, user }: AdminHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="md:hidden bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <span className="font-bold text-white">B</span>
          </div>
          <span className="font-bold text-gray-900">{company.name}</span>
        </Link>

        <button onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 space-y-2">
          <Link
            href="/admin"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/settings"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/settings' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/admin/projects"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/projects' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Projects
          </Link>
          <Link
            href="/admin/reviews"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/reviews' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Reviews
          </Link>
          <Link
            href="/admin/billing"
            className={`block px-4 py-2 rounded-lg ${pathname === '/admin/billing' ? 'bg-orange-100 text-orange-600' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            Billing
          </Link>
          
          <div className="border-t border-gray-200 pt-2 mt-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-red-600 w-full"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
```

---

## STEP 7: DASHBOARD PAGE

**File: `src/app/admin/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser, getCompanyProjects, getCompanyReviews } from '@/lib/supabase/queries'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { hasFeature } from '@/lib/features'
import Link from 'next/link'
import { 
  FolderOpen, 
  Star, 
  Calendar, 
  Eye,
  ArrowRight,
  TrendingUp
} from 'lucide-react'

export default async function AdminDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const projects = await getCompanyProjects(company.id)
  const reviews = await getCompanyReviews(company.id)

  // Get enquiries count
  const adminClient = createAdminClient()
  const { count: enquiriesCount } = await adminClient
    .from('enquiries')
    .select('*', { count: 'exact', head: true })
    .eq('company_id', company.id)
    .eq('status', 'new')

  // Get scheduled posts count (if tier allows)
  let scheduledPostsCount = 0
  if (hasFeature(company.tier, 'view_scheduled_posts')) {
    const { count } = await adminClient
      .from('scheduled_posts')
      .select('*', { count: 'exact', head: true })
      .eq('company_id', company.id)
      .eq('status', 'pending')
    scheduledPostsCount = count || 0
  }

  const stats = [
    {
      label: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      href: '/admin/projects',
      color: 'blue',
    },
    {
      label: 'Reviews',
      value: reviews.length,
      icon: Star,
      href: '/admin/reviews',
      color: 'yellow',
    },
    {
      label: 'New Enquiries',
      value: enquiriesCount || 0,
      icon: TrendingUp,
      href: '/admin/enquiries',
      color: 'green',
    },
    {
      label: 'Scheduled Posts',
      value: scheduledPostsCount,
      icon: Calendar,
      href: '/admin/posts',
      color: 'orange',
      locked: !hasFeature(company.tier, 'view_scheduled_posts'),
    },
  ]

  return (
    <div>
      {/* Welcome header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="text-gray-600 mt-1">
          Here's what's happening with {company.name}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.locked ? '#' : stat.href}
            className={`bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow ${
              stat.locked ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center bg-${stat.color}-100`}
              >
                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
              </div>
              {stat.locked && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">
                  Pro+
                </span>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* View site */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4">Your Website</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                {company.slug}.bytrade.co.uk
              </p>
              <p className="text-xs text-green-600 flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full" />
                Published
              </p>
            </div>
            <a
              href={`https://${company.slug}.bytrade.co.uk`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800"
            >
              <Eye className="w-4 h-4" />
              View Site
            </a>
          </div>
        </div>

        {/* Plan info */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <h2 className="font-semibold mb-2">Your Plan</h2>
          <p className="text-3xl font-bold capitalize mb-1">{company.tier}</p>
          <p className="text-orange-100 text-sm mb-4">
            £{company.tier === 'starter' ? '99' : company.tier === 'pro' ? '149' : '199'}/month
          </p>
          {company.tier !== 'full' && (
            <Link
              href="/admin/billing"
              className="inline-flex items-center gap-2 bg-white text-orange-500 px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-50"
            >
              Upgrade
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Recent activity / tips */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              projects.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {projects.length > 0 ? '✓' : '1'}
            </div>
            <p className={projects.length > 0 ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Add your first project with photos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              company.description ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {company.description ? '✓' : '2'}
            </div>
            <p className={company.description ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Complete your company profile
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
              reviews.length > 0 ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {reviews.length > 0 ? '✓' : '3'}
            </div>
            <p className={reviews.length > 0 ? 'text-gray-500 line-through' : 'text-gray-700'}>
              Add customer reviews
            </p>
          </div>
          {hasFeature(company.tier, 'social_connections') && (
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-sm bg-gray-100 text-gray-400">
                4
              </div>
              <p className="text-gray-700">
                Connect your social accounts for auto-posting
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## STEP 8: SETTINGS PAGE

**File: `src/app/admin/settings/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import SettingsForm from '@/components/admin/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Update your company information and branding
        </p>
      </div>

      <SettingsForm company={company} />
    </div>
  )
}
```

---

## STEP 9: SETTINGS FORM COMPONENT

**File: `src/components/admin/SettingsForm.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Company } from '@/lib/supabase/types'
import { TEMPLATE_CONFIGS } from '@/lib/templates/types'

interface SettingsFormProps {
  company: Company
}

export default function SettingsForm({ company }: SettingsFormProps) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formData, setFormData] = useState({
    name: company.name,
    email: company.email,
    phone: company.phone || '',
    whatsapp: company.whatsapp || '',
    address_line1: company.address_line1 || '',
    address_line2: company.address_line2 || '',
    city: company.city || '',
    postcode: company.postcode || '',
    trade_type: company.trade_type || '',
    description: company.description || '',
    services: company.services?.join(', ') || '',
    areas_covered: company.areas_covered?.join(', ') || '',
    instagram_url: company.instagram_url || '',
    facebook_url: company.facebook_url || '',
    checkatrade_url: company.checkatrade_url || '',
    template: company.template,
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setSaved(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: company.id,
          updates: {
            ...formData,
            services: formData.services.split(',').map(s => s.trim()).filter(Boolean),
            areas_covered: formData.areas_covered.split(',').map(s => s.trim()).filter(Boolean),
          }
        }),
      })

      if (res.ok) {
        setSaved(true)
      } else {
        alert('Failed to save. Please try again.')
      }
    } catch (error) {
      alert('Failed to save. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Business Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Business Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Trade Type
            </label>
            <input
              type="text"
              name="trade_type"
              value={formData.trade_type}
              onChange={handleChange}
              placeholder="e.g. Builder, Electrician, Plumber"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Tell customers about your business..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Services (comma separated)
            </label>
            <input
              type="text"
              name="services"
              value={formData.services}
              onChange={handleChange}
              placeholder="e.g. Extensions, Renovations, New Builds"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Areas Covered (comma separated)
            </label>
            <input
              type="text"
              name="areas_covered"
              value={formData.areas_covered}
              onChange={handleChange}
              placeholder="e.g. Bristol, Bath, South Gloucestershire"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Contact Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="07123 456789"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp Number
            </label>
            <input
              type="text"
              name="whatsapp"
              value={formData.whatsapp}
              onChange={handleChange}
              placeholder="447123456789 (country code, no +)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">UK format: 447123456789</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postcode
            </label>
            <input
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Social & Reviews</h2>
        
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Instagram URL
            </label>
            <input
              type="url"
              name="instagram_url"
              value={formData.instagram_url}
              onChange={handleChange}
              placeholder="https://instagram.com/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook URL
            </label>
            <input
              type="url"
              name="facebook_url"
              value={formData.facebook_url}
              onChange={handleChange}
              placeholder="https://facebook.com/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Checkatrade URL
            </label>
            <input
              type="url"
              name="checkatrade_url"
              value={formData.checkatrade_url}
              onChange={handleChange}
              placeholder="https://checkatrade.com/trades/yourbusiness"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      </div>

      {/* Branding */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Branding</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Template
            </label>
            <select
              name="template"
              value={formData.template}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {Object.values(TEMPLATE_CONFIGS).map((template) => (
                <option key={template.name} value={template.name}>
                  {template.displayName} - {template.description}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="primary_color"
                  value={formData.primary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primary_color}
                  onChange={handleChange}
                  name="primary_color"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="secondary_color"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  className="w-12 h-12 rounded border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondary_color}
                  onChange={handleChange}
                  name="secondary_color"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        <div>
          {saved && (
            <p className="text-green-600 text-sm flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full" />
              Settings saved successfully
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}
```

---

## STEP 10: SETTINGS API ROUTE

**File: `src/app/api/admin/settings/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { updateCompany, getCompanyForUser } from '@/lib/supabase/queries'

export async function PUT(request: NextRequest) {
  try {
    // Verify auth
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { companyId, updates } = await request.json()

    // Verify user owns this company
    const company = await getCompanyForUser(user.email!)
    if (!company || company.id !== companyId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Update company
    const { error } = await updateCompany(companyId, updates)

    if (error) {
      console.error('Failed to update company:', error)
      return NextResponse.json({ error: 'Update failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Settings update error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
```

---

## STEP 11: BILLING PAGE

**File: `src/app/admin/billing/page.tsx`**

```typescript
import { createClient } from '@/lib/supabase/server'
import { getCompanyForUser } from '@/lib/supabase/queries'
import { redirect } from 'next/navigation'
import BillingPortalButton from '@/components/admin/BillingPortalButton'
import { PRICING } from '@/lib/constants'
import { Check } from 'lucide-react'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')
  
  const company = await getCompanyForUser(user.email!)
  if (!company) redirect('/login')

  const currentPlan = PRICING[company.tier as keyof typeof PRICING]
  const allPlans = [PRICING.starter, PRICING.pro, PRICING.full]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Billing
        </h1>
        <p className="text-gray-600 mt-1">
          Manage your subscription and billing
        </p>
      </div>

      {/* Current plan */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-2xl font-bold text-gray-900">{currentPlan.name}</p>
            <p className="text-gray-600">£{currentPlan.price}/month</p>
          </div>
          
          {company.stripe_customer_id && (
            <BillingPortalButton customerId={company.stripe_customer_id} />
          )}
        </div>
      </div>

      {/* All plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {allPlans.map((plan) => {
          const isCurrent = plan.id === company.tier
          
          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 p-6 ${
                isCurrent ? 'border-orange-500' : 'border-gray-200'
              }`}
            >
              {isCurrent && (
                <span className="inline-block bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded mb-4">
                  CURRENT PLAN
                </span>
              )}
              
              <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
              <p className="text-3xl font-bold text-gray-900 my-4">
                £{plan.price}<span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              {!isCurrent && company.stripe_customer_id && (
                <BillingPortalButton 
                  customerId={company.stripe_customer_id}
                  label={plan.price > currentPlan.price ? 'Upgrade' : 'Change Plan'}
                />
              )}
            </div>
          )
        })}
      </div>

      {/* Help */}
      <div className="mt-8 bg-gray-50 rounded-xl p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
        <p className="text-gray-600 text-sm">
          Contact us at <a href="mailto:hello@bytrade.co.uk" className="text-orange-500">hello@bytrade.co.uk</a> for 
          any billing questions or to request a change to your subscription.
        </p>
      </div>
    </div>
  )
}
```

---

## STEP 12: BILLING PORTAL BUTTON

**File: `src/components/admin/BillingPortalButton.tsx`**

```typescript
'use client'

import { useState } from 'react'

interface BillingPortalButtonProps {
  customerId: string
  label?: string
}

export default function BillingPortalButton({ 
  customerId, 
  label = 'Manage Billing' 
}: BillingPortalButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    try {
      const res = await fetch('/api/billing/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId }),
      })

      const { url, error } = await res.json()
      
      if (error) {
        alert('Failed to open billing portal. Please try again.')
        return
      }

      window.location.href = url
    } catch (error) {
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}
```

---

## STEP 13: UPDATE FEATURES.TS

**File: `src/lib/features.ts`** (update with admin features)

```typescript
import type { Tier } from './supabase/types'

// Which tier unlocks which features
export const FEATURE_TIERS: Record<string, number> = {
  // £99 - Starter (basic website only)
  public_website: 99,
  contact_form: 99,
  basic_seo: 99,
  
  // £149 - Pro (add admin panel)
  admin_panel: 149,
  edit_settings: 149,
  upload_projects: 149,
  custom_domain: 149,
  manage_reviews: 149,
  
  // £199 - Full (add automation)
  auto_posting: 199,
  social_connections: 199,
  review_graphics: 199,
  ai_captions: 199,
  view_scheduled_posts: 199,
  analytics: 199,
}

// Tier prices
export const TIER_PRICES: Record<Tier, number> = {
  starter: 99,
  pro: 149,
  full: 199,
}

// Check if a tier has access to a feature
export function hasFeature(tier: Tier, feature: string): boolean {
  const requiredPrice = FEATURE_TIERS[feature]
  if (!requiredPrice) return true // Unknown feature = allow
  
  const tierPrice = TIER_PRICES[tier]
  return tierPrice >= requiredPrice
}

// Get all features for a tier
export function getTierFeatures(tier: Tier): string[] {
  const tierPrice = TIER_PRICES[tier]
  return Object.entries(FEATURE_TIERS)
    .filter(([_, price]) => tierPrice >= price)
    .map(([feature]) => feature)
}

// Get features user is missing
export function getMissingFeatures(tier: Tier): string[] {
  const tierPrice = TIER_PRICES[tier]
  return Object.entries(FEATURE_TIERS)
    .filter(([_, price]) => tierPrice < price)
    .map(([feature]) => feature)
}

// Get minimum tier needed for a feature
export function getRequiredTier(feature: string): Tier {
  const requiredPrice = FEATURE_TIERS[feature]
  if (!requiredPrice || requiredPrice <= 99) return 'starter'
  if (requiredPrice <= 149) return 'pro'
  return 'full'
}
```

---

## STEP 14: TEST THE ADMIN

1. Add your email to the test company:
```sql
UPDATE companies SET email = 'your-email@example.com' WHERE slug = 'test-builder';
```

2. Run dev server:
```bash
npm run dev
```

3. Go to `http://localhost:3000/admin`
4. Should redirect to login
5. Enter your email, check for magic link
6. Click link, should redirect to admin dashboard
7. Test settings page - update info, save
8. Test billing page
9. Check feature gating (lock icons on sidebar)

---

## EXIT CRITERIA

- ✅ Login page with magic link working
- ✅ Admin layout with sidebar
- ✅ Dashboard showing stats
- ✅ Settings page saving changes
- ✅ Billing page with plan comparison
- ✅ Tier-based feature gating (lock icons)
- ✅ Mobile responsive admin
- ✅ Auth protection on all admin routes
- ✅ Sign out working
- ✅ `npm run build` passes

---

## NEXT: ZIP-07

ZIP-07 will add:
- Projects management (CRUD)
- Image upload to R2
- Drag & drop reordering
- Gallery management

---

**Admin dashboard core complete. Builders can manage their info.**
