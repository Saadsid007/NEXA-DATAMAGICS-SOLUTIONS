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

  // --- REDIRECTION LOGIC for authenticated users ---

  // 1. User is not approved yet
  if (status !== 'approved') {
    // If they are not on the pending page, redirect them.
    if (pathname !== '/pending-approval') {
      return NextResponse.redirect(new URL('/pending-approval', req.url));
    }
    return NextResponse.next();
  }

  // 2. User is approved but profile is not complete
  if (!profileComplete) {
    // If they are not on the setup page, redirect them.
    if (pathname !== '/profile-setup') {
      return NextResponse.redirect(new URL('/profile-setup', req.url));
    }
    return NextResponse.next();
  }

  // 3. User is fully set up (approved and profile complete)

  // If they are on a public/setup page, redirect to their role-specific dashboard
  const afterLoginRedirectPaths = ['/login', '/register', '/', '/pending-approval', '/profile-setup'];
  // The user is authenticated, approved, and has a complete profile.
  // If they are on any page that should only be seen before being fully set up,
  // redirect them to their correct dashboard.
  if (afterLoginRedirectPaths.includes(pathname) || pathname === '/dashboard' && role !== 'user') {
    return NextResponse.redirect(new URL(roleDashboard, req.url));
  }

  // Role-based path protection
  if (pathname.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL(roleDashboard, req.url));
  }
  if (pathname.startsWith('/manager') && role !== 'manager' && role !== 'admin') {
    return NextResponse.redirect(new URL(roleDashboard, req.url));
  }

  // If no redirection rules matched, allow the request to proceed.
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher runs the middleware on all paths except for API routes and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
