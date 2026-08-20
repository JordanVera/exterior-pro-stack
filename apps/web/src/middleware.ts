import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@repo/api/edge';

const TOKEN_COOKIE = 'auth-token';

// Define protected routes by role
const CUSTOMER_ROUTES = ['/customer'];
const PROVIDER_ROUTES = ['/provider'];
const ADMIN_ROUTES = ['/admin'];
const FIELD_ROUTES: string[] = []; // Field users should use mobile app

// Public routes that don't require auth
const PUBLIC_ROUTES = ['/', '/login', '/terms', '/privacy', '/contractor-agreement', '/onboarding'];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  ) || pathname.startsWith('/api') || pathname.startsWith('/_next');
}

function getRequiredRole(pathname: string): 'CUSTOMER' | 'PROVIDER' | 'ADMIN' | 'FIELD' | null {
  if (CUSTOMER_ROUTES.some(route => pathname.startsWith(route))) {
    return 'CUSTOMER';
  }
  if (PROVIDER_ROUTES.some(route => pathname.startsWith(route))) {
    return 'PROVIDER';
  }
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return 'ADMIN';
  }
  if (FIELD_ROUTES.some(route => pathname.startsWith(route))) {
    return 'FIELD';
  }
  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  
  if (!token) {
    // No token - redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Verify token and get user
  try {
    const payload = await verifyToken(token);
    const userRole = payload.role;

    // Check if route requires specific role
    const requiredRole = getRequiredRole(pathname);
    
    if (requiredRole && userRole !== requiredRole) {
      // User doesn't have required role - redirect to their home
      const url = request.nextUrl.clone();
      
      switch (userRole) {
        case 'CUSTOMER':
          url.pathname = '/customer';
          break;
        case 'PROVIDER':
          url.pathname = '/provider';
          break;
        case 'ADMIN':
          url.pathname = '/admin';
          break;
        case 'CREW':
          // Crew users should use mobile app
          url.pathname = '/';
          url.searchParams.set('error', 'Please use the mobile app');
          break;
        default:
          url.pathname = '/';
      }
      
      return NextResponse.redirect(url);
    }

    // User is authenticated and has correct role
    return NextResponse.next();
  } catch (error) {
    // Invalid token - clear cookies and redirect to login
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    
    const response = NextResponse.redirect(url);
    response.cookies.delete(TOKEN_COOKIE);
    response.cookies.delete('auth-present');
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
