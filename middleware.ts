import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For API routes, set headers to bypass Vercel authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add headers to bypass Vercel's authentication
    response.headers.set('x-middleware-bypass', '1')
    response.headers.set('x-middleware-rewrite', request.nextUrl.toString())
    
    return response
  }

  // For all other routes, let Vercel handle authentication normally
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/api/:path*'],
} 