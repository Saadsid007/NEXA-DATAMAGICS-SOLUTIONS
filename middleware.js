import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

// Helper function to determine the correct dashboard URL based on user role
function getRoleDashboard(role) {
  if (role === 'admin') return '/admin';
  if (role === 'manager') return '/manager';
  return '/dashboard';
}

export async function middleware(req) {
  // Get the token from the request
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  // Define public paths that don't require authentication
  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.includes(pathname);

  // --- SCENARIO 1: User is NOT authenticated ---
  if (!token) {
    // If they are trying to access a protected route, redirect them to the login page.
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Otherwise, allow access to public pages.
    return NextResponse.next();
  }

  // --- SCENARIO 2: User IS authenticated ---
  const { role, profileComplete, status } = token;
  const roleDashboard = getRoleDashboard(role);

  // Handle users who are not yet approved
  if (status !== 'approved' && pathname !== '/pending-approval') {
    return NextResponse.redirect(new URL('/pending-approval', req.url));
  }

  // Handle approved users who haven't completed their profile
  if (status === 'approved' && !profileComplete && pathname !== '/profile-setup') {
    return NextResponse.redirect(new URL('/profile-setup', req.url));
  }

  // --- SCENARIO 3: User is fully set up (authenticated, approved, profile complete) ---
  if (status === 'approved' && profileComplete) {
    // If they are on a page that should not be accessible after login,
    // redirect them to their correct dashboard.
    const restrictedAfterLoginPaths = ['/login', '/register', '/', '/pending-approval', '/profile-setup'];
    if (restrictedAfterLoginPaths.includes(pathname)) {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }

    // Role-based path protection to prevent unauthorized access
    if (role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    if (role === 'manager' && (pathname.startsWith('/admin'))) {
      return NextResponse.redirect(new URL('/manager', req.url));
    }
    if (role === 'user' && (pathname.startsWith('/admin') || pathname.startsWith('/manager'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If a non-user (admin/manager) lands on the generic /dashboard,
    // redirect them to their specific dashboard.
    if (pathname === '/dashboard' && role !== 'user') {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }
  }

  // If no redirection rules matched, allow the request to proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher runs the middleware on all paths except for API routes and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};

