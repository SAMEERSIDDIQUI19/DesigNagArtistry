import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// ─── Rate limiting ────────────────────────────────────────────────────────────
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RuleConfig { limit: number; windowMs: number; }

const RATE_RULES: Record<string, RuleConfig> = {
  '/api/auth':                 { limit: 8,   windowMs: 15 * 60 * 1000 },
  '/api/admin':                { limit: 120, windowMs: 60 * 1000 },
  '/api/orders/payment-proof': { limit: 15,  windowMs: 5 * 60 * 1000 },
  '/api/upload':               { limit: 20,  windowMs: 5 * 60 * 1000 },
  '/api':                      { limit: 200, windowMs: 60 * 1000 },
};

function getBucket(pathname: string): RuleConfig {
  for (const [prefix, rule] of Object.entries(RATE_RULES)) {
    if (pathname.startsWith(prefix)) return rule;
  }
  return { limit: 300, windowMs: 60 * 1000 };
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(key: string, rule: RuleConfig) {
  const now = Date.now();
  const entry = rateLimitStore.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, remaining: rule.limit - 1, resetAt: now + rule.windowMs };
  }
  entry.count += 1;
  return { allowed: entry.count <= rule.limit, remaining: Math.max(0, rule.limit - entry.count), resetAt: entry.resetAt };
}

let pruneCounter = 0;
function pruneStore() {
  if (++pruneCounter % 500 !== 0) return;
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}

// ─── Suspicious pattern detection ────────────────────────────────────────────
const SUSPICIOUS_PATTERNS = [
  /(\.\.|%2e%2e)/i,
  /(union.*select|select.*from|insert.*into|drop.*table)/i,
  /(<script|javascript:|onerror=|onload=)/i,
  /(\beval\(|\bexec\()/i,
  /(\/etc\/passwd|\/proc\/self)/i,
  /(%00|%0d%0a|\r\n)/i,
];

function isSuspicious(request: NextRequest): boolean {
  try {
    const url = decodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
    return SUSPICIOUS_PATTERNS.some((p) => p.test(url));
  } catch {
    return false;
  }
}

function hasAdminToken(request: NextRequest): boolean {
  const auth = request.headers.get('authorization');
  return typeof auth === 'string' && auth.startsWith('Bearer ') && auth.length > 30;
}

// ─── Proxy function (Next.js 16 equivalent of middleware) ────────────────────
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 0. Canonical URL redirects (HTTP→HTTPS, non-www→www)
  const hostname = request.headers.get('host') || '';
  const protocol = request.headers.get('x-forwarded-proto') || 'http';
  const canonicalDomain = 'www.designagartistry.com';
  const isHttp = protocol === 'http';
  const isNonWww = hostname === 'designagartistry.com';
  const isNotCanonical = hostname !== canonicalDomain;

  if (isHttp || isNotCanonical) {
    const canonicalUrl = `https://${canonicalDomain}${pathname}${request.nextUrl.search}`;
    return NextResponse.redirect(canonicalUrl, 301);
  }

  // 1. Block suspicious requests
  if (isSuspicious(request)) {
    return new NextResponse('Bad Request', { status: 400 });
  }

  // 2. Block sensitive internal paths
  const BLOCKED = ['/.env', '/.git', '/prisma', '/node_modules'];
  if (BLOCKED.some((p) => pathname.startsWith(p))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 3. Dashboard: require admin_token cookie
  if (pathname.startsWith('/dashboard')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // 4. Admin API: require Authorization header
  // Some admin GET endpoints serve public data (e.g. home-content for the homepage)
  // Login endpoint must be public to allow authentication
  const PUBLIC_ADMIN_ROUTES = ['/api/admin/home-content', '/api/admin/login', '/api/admin/test-db'];
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.some((r) => pathname.startsWith(r));

  if (pathname.startsWith('/api/admin') && !isPublicAdminRoute && !hasAdminToken(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 5. Rate limiting for all API routes
  if (pathname.startsWith('/api')) {
    pruneStore();
    const ip = getIp(request);
    const rule = getBucket(pathname);
    const key = `${ip}:${pathname.split('/').slice(0, 4).join('/')}`;
    const { allowed, remaining, resetAt } = checkRateLimit(key, rule);

    if (!allowed) {
      return NextResponse.json(
        { error: 'Too many requests. Please slow down.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(Math.ceil((resetAt - Date.now()) / 1000)),
            'X-RateLimit-Limit': String(rule.limit),
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', String(rule.limit));
    res.headers.set('X-RateLimit-Remaining', String(remaining));
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
