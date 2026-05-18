import { NextRequest, NextResponse } from "next/server";

// ─── In-memory rate limit store ───────────────────────────────────────────────
// Maps "ip:route-bucket" → { count, resetAt }
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

interface RuleConfig {
  limit: number;   // max requests
  windowMs: number; // window in ms
}

const RATE_RULES: Record<string, RuleConfig> = {
  "/api/auth":              { limit: 8,   windowMs: 15 * 60 * 1000 }, // login: 8/15 min
  "/api/admin":             { limit: 120, windowMs: 60 * 1000 },      // admin APIs: 120/min
  "/api/orders/payment-proof": { limit: 15, windowMs: 5 * 60 * 1000 }, // proof upload: 15/5 min
  "/api/upload":            { limit: 20,  windowMs: 5 * 60 * 1000 },  // uploads: 20/5 min
  "/api":                   { limit: 200, windowMs: 60 * 1000 },      // all other APIs: 200/min
};

function getBucket(pathname: string): RuleConfig {
  for (const [prefix, rule] of Object.entries(RATE_RULES)) {
    if (pathname.startsWith(prefix)) return rule;
  }
  return { limit: 300, windowMs: 60 * 1000 };
}

function getIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, rule: RuleConfig): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + rule.windowMs });
    return { allowed: true, remaining: rule.limit - 1, resetAt: now + rule.windowMs };
  }

  entry.count += 1;
  const allowed = entry.count <= rule.limit;
  return { allowed, remaining: Math.max(0, rule.limit - entry.count), resetAt: entry.resetAt };
}

// Prune stale entries periodically (every 500 requests)
let pruneCounter = 0;
function pruneStore() {
  if (++pruneCounter % 500 !== 0) return;
  const now = Date.now();
  for (const [key, val] of rateLimitStore.entries()) {
    if (now > val.resetAt) rateLimitStore.delete(key);
  }
}

// ─── Suspicious pattern detection ─────────────────────────────────────────────
const SUSPICIOUS_PATTERNS = [
  /(\.\.|%2e%2e)/i,           // path traversal
  /(union.*select|select.*from|insert.*into|drop.*table)/i, // SQL injection
  /(<script|javascript:|onerror=|onload=)/i, // XSS
  /(\beval\(|\bexec\()/i,     // code injection
  /(\/etc\/passwd|\/proc\/self)/i, // LFI
  /(%00|%0d%0a|\r\n)/i,       // null byte / CRLF injection
];

function isSuspicious(request: NextRequest): boolean {
  const url = decodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
  return SUSPICIOUS_PATTERNS.some((p) => p.test(url));
}

// ─── Admin JWT pre-check (lightweight, no crypto in edge) ─────────────────────
function hasAdminToken(request: NextRequest): boolean {
  const auth = request.headers.get("authorization");
  // Just check presence and rough format — full JWT verify happens in each route
  return typeof auth === "string" && auth.startsWith("Bearer ") && auth.length > 30;
}

// ─── Middleware ────────────────────────────────────────────────────────────────
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Block suspicious requests immediately
  if (isSuspicious(request)) {
    return new NextResponse("Bad Request", { status: 400 });
  }

  // 2. Block direct access to sensitive internal paths
  const BLOCKED_PATHS = ["/.env", "/.git", "/prisma", "/node_modules"];
  if (BLOCKED_PATHS.some((p) => pathname.startsWith(p))) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 3. Admin API: require Authorization header (quick gate before full JWT verify in routes)
  if (pathname.startsWith("/api/admin") && !hasAdminToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 4. Rate limiting for API routes
  if (pathname.startsWith("/api")) {
    pruneStore();
    const ip = getIp(request);
    const rule = getBucket(pathname);
    const key = `${ip}:${pathname.split("/").slice(0, 4).join("/")}`;
    const { allowed, remaining, resetAt } = checkRateLimit(key, rule);

    if (!allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(rule.limit),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", String(rule.limit));
    response.headers.set("X-RateLimit-Remaining", String(remaining));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/api/:path*",
    "/.env",
    "/.git/:path*",
    "/prisma/:path*",
  ],
};
