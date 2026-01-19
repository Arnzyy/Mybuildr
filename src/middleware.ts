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

  // Check auth for admin routes only
  if (url.pathname.startsWith('/admin')) {
    // Ensure env vars exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.redirect(new URL('/login?error=config', request.url))
    }

    // Create Supabase client for auth check
    const supabase = createServerClient(
      supabaseUrl,
      supabaseKey,
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
