import { NextRequest, NextResponse } from 'next/server';

// Types for JWT payload
interface JWTPayload {
  sub?: string;
  exp?: number;
  role?: string;
  [key: string]: unknown;
}

// ==================== ROUTE CONFIGURATION ====================

// Routes that require authentication
const protectedRoutes = [
  '/cart',
  '/order',
  '/payment',
  '/my-page',
  '/profile',
];

// Routes that should redirect authenticated users away
const authOnlyRoutes = [
  '/login',
  '/register',
];

// Admin-only routes
const adminRoutes = [
  '/admin',
];

// API routes that require authentication
const protectedApiRoutes = [
  '/api/orders',
  '/api/payment',
  '/api/profile',
];

// Public routes are any routes not explicitly protected

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if a path matches any of the given route patterns
 */
const matchesRoute = (pathname: string, routes: string[]): boolean => {
  return routes.some(route => {
    // Exact match
    if (pathname === route) return true;
    
    // Path starts with route (for nested routes)
    if (pathname.startsWith(route + '/')) return true;
    
    return false;
  });
};

/**
 * Decode JWT token payload (simple implementation)
 */
const decodeToken = (token: string): JWTPayload | null => {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload)) as JWTPayload;
  } catch {
    return null;
  }
};

/**
 * Check if JWT token is expired
 */
const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    const now = Date.now() / 1000;
    // Add 30 second buffer
    return payload.exp < (now + 30);
  } catch {
    return true;
  }
};

/**
 * Extract tokens from request cookies
 */
const getTokensFromRequest = (request: NextRequest) => {
  // Try to get tokens from different possible cookie names
  const authCookie = request.cookies.get('auth_tokens')?.value ||
                    request.cookies.get('shopping-cart')?.value; // Fallback to cart cookie format

  if (authCookie) {
    try {
      const parsed = JSON.parse(authCookie);
      
      // Handle different storage formats
      return {
        accessToken: parsed.access_token || parsed.accessToken || parsed.state?.accessToken,
        refreshToken: parsed.refresh_token || parsed.refreshToken || parsed.state?.refreshToken,
      };
    } catch (error) {
      console.error('Error parsing auth cookie:', error);
    }
  }

  // Fallback: try Authorization header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return {
      accessToken: authHeader.substring(7),
      refreshToken: null,
    };
  }

  return {
    accessToken: null,
    refreshToken: null,
  };
};

/**
 * Get user role from token
 */
const getUserRole = (accessToken: string): string | null => {
  const payload = decodeToken(accessToken);
  return payload?.role || 'user';
};

// ==================== MIDDLEWARE FUNCTION ====================

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and API routes (except protected ones)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/') && !matchesRoute(pathname, protectedApiRoutes)
  ) {
    return NextResponse.next();
  }

  // Get authentication tokens
  const { accessToken } = getTokensFromRequest(request);
  
  // Check if user is authenticated
  const isAuthenticated = accessToken && !isTokenExpired(accessToken);
  const userRole = accessToken ? getUserRole(accessToken) : null;

  // ==================== ROUTE PROTECTION LOGIC ====================

  // 1. Protect admin routes
  if (matchesRoute(pathname, adminRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    if (userRole !== 'admin') {
      const unauthorizedUrl = new URL('/', request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // 2. Protect authenticated routes
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protect authenticated API routes
  if (matchesRoute(pathname, protectedApiRoutes)) {
    if (!isAuthenticated) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Add user info to headers for API routes
    const response = NextResponse.next();
    response.headers.set('x-user-id', decodeToken(accessToken)?.sub || '');
    response.headers.set('x-user-role', userRole || 'user');
    return response;
  }

  // 4. Redirect authenticated users away from auth-only routes
  if (matchesRoute(pathname, authOnlyRoutes)) {
    if (isAuthenticated) {
      // Check if there's a redirect parameter
      const redirectTo = request.nextUrl.searchParams.get('redirect') || '/';
      return NextResponse.redirect(new URL(redirectTo, request.url));
    }
  }

  // 5. Handle Kakao OAuth callback
  if (pathname === '/auth/kakao/callback') {
    // Let the page handle the callback
    return NextResponse.next();
  }

  // ==================== RESPONSE HEADERS ====================

  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add authentication status to response headers (for client-side use)
  response.headers.set('x-authenticated', isAuthenticated ? 'true' : 'false');
  
  if (isAuthenticated && userRole) {
    response.headers.set('x-user-role', userRole);
  }

  // Add CORS headers for API routes
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

// ==================== MIDDLEWARE CONFIGURATION ====================

export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   * - public folder files
   */
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled selectively above)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (manifest.json, robots.txt, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|manifest.json|robots.txt).*)',
  ],
};