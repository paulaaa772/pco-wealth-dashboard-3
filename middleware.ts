import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Allow all API routes to be accessed without authentication
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // For all other routes, let Vercel handle authentication normally
  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: ['/api/:path*'],
} 