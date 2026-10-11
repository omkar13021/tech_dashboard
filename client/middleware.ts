import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route patterns that require authentication
const protectedRoutes = [
  '/dashboard',
  '/my-day',
  '/important',
  '/planned',
  '/assigned',
  '/meetings',
  '/tasks',
  '/reports',
  '/team',
  '/projects',
  '/users',
];

// Public routes that don't require authentication
const publicRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
  '/unauthorized',
];

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken")?.value;
  const { pathname } = request.nextUrl;

  // Check route types
  const isAuthPage = pathname.startsWith("/auth");
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname === route);
  const isRootPath = pathname === '/';

  // Allow public routes without authentication
  if (isPublicRoute) {
    // If user has refresh token and tries to access login/signup, redirect to root
    // Client-side will handle role-based redirect from root
    if (refreshToken && (pathname === '/auth/login' || pathname === '/auth/signup')) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if trying to access protected routes or root without authentication
  if ((isProtectedRoute || isRootPath) && !refreshToken) {
    const loginUrl = new URL("/auth/login", request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from other auth pages
  if (isAuthPage && refreshToken) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
