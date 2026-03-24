import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;
  const userRole = token?.role as string | undefined;

  // Define public routes that don't require authentication
  const publicRoutes = [
    '/',
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/reset-password',
    '/auth/verify-email',
    '/auth/error',
  ];

  // Define public API routes
  const publicApiRoutes = [
    '/api/auth',
    '/api/public',
    '/api/payment/paytr/callback',
  ];

  // Define menu routes (these are public for customers)
  const menuRoutes = pathname.startsWith('/menu/');

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some((route) => pathname === route);
  const isPublicApiRoute = publicApiRoutes.some((route) => pathname.startsWith(route));
  const isMenuRoute = menuRoutes;

  // Allow public routes and API routes
  if (isPublicRoute || isPublicApiRoute || isMenuRoute) {
    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (isAuthenticated && pathname.startsWith('/auth/')) {
      return addSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }
    return addSecurityHeaders(NextResponse.next());
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/auth/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl));
    }

    // Check if user has ADMIN role
    if (userRole !== 'ADMIN') {
      return addSecurityHeaders(NextResponse.redirect(new URL('/dashboard', request.url)));
    }

    return addSecurityHeaders(NextResponse.next());
  }

  // Default: allow the request
  return addSecurityHeaders(NextResponse.next());
}

// Configure the matcher to specify which routes this middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
