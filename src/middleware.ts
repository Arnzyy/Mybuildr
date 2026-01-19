import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

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
