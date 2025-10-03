import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

function getRoleDashboard(role) {
  if (role === 'admin') return '/admin';
  if (role === 'manager') return '/manager';
  return '/dashboard';
}

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  const publicPaths = ['/login', '/register', '/'];
  const isPublicPath = publicPaths.includes(pathname);

  // SCENARIO 1: User is not authenticated
  if (!token) {
    // If they are trying to access a protected route, redirect to login
    if (!isPublicPath) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    // Otherwise, allow them to access public pages
    return NextResponse.next();
  }

  // SCENARIO 2: User is authenticated
  const { role, profileComplete, status } = token;
  const roleDashboard = getRoleDashboard(role);

  // Redirect away from pending page if status is approved
  if (status === 'approved' && pathname === '/pending-approval') {
    return NextResponse.redirect(new URL(roleDashboard, req.url));
  }

  // Redirect to pending page if status is not approved
  if (status !== 'approved' && pathname !== '/pending-approval') {
    return NextResponse.redirect(new URL('/pending-approval', req.url));
  }

  // Redirect away from profile setup if profile is complete
  if (profileComplete && pathname === '/profile-setup') {
    return NextResponse.redirect(new URL(roleDashboard, req.url));
  }

  // Redirect to profile setup if profile is not complete (and they are approved)
  if (status === 'approved' && !profileComplete && pathname !== '/profile-setup') {
    return NextResponse.redirect(new URL('/profile-setup', req.url));
  }

  // SCENARIO 3: User is fully authenticated, approved, and profile is complete
  if (status === 'approved' && profileComplete) {
    // If they are on a public path, redirect to their dashboard
    if (isPublicPath) {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }

    // Role-based path protection
    if (role === 'admin' && !pathname.startsWith('/admin') && pathname !== '/profile') {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
    if (role === 'manager' && (pathname.startsWith('/admin') || pathname.startsWith('/user'))) {
      return NextResponse.redirect(new URL('/manager', req.url));
    }
    if (role === 'user' && (pathname.startsWith('/admin') || pathname.startsWith('/manager'))) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // If user tries to access generic dashboard, redirect to their specific one
    if (pathname === '/dashboard' && role !== 'user') {
      return NextResponse.redirect(new URL(roleDashboard, req.url));
    }

    // If no rules match, allow access
      return NextResponse.next();
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher runs the middleware on all paths except for API routes and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
