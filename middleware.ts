import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || '';
  const url = request.nextUrl.clone();
  const protocol = request.headers.get('x-forwarded-proto') || 'http';

  // Define the canonical domain
  const canonicalDomain = 'www.designagartistry.com';

  // Check if protocol is HTTP (not HTTPS)
  const isHttp = protocol === 'http';
  
  // Check if hostname is non-www
  const isNonWww = hostname === 'designagartistry.com';
  
  // Check if hostname is not the canonical domain
  const isNotCanonical = hostname !== canonicalDomain;

  // Redirect if not using HTTPS or not using www
  if (isHttp || isNotCanonical) {
    // Construct the canonical URL
    const canonicalUrl = `https://${canonicalDomain}${url.pathname}${url.search}`;
    
    // Return 301 permanent redirect
    return NextResponse.redirect(canonicalUrl, 301);
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
