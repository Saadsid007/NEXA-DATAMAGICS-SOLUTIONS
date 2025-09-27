import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  // getToken will get the session on the server
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/register');

  // If the user is not authenticated
  if (!token) {
    // Allow access to auth pages and the home page
    if (isAuthPage || pathname === '/') {
      return NextResponse.next();
    }
    // Redirect any other unauthenticated access to the login page
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // If the user is authenticated
  const { role, profileComplete, status, sub: userId } = token;

  // If user is not approved by admin, redirect to a pending page
  if (status !== 'approved' && pathname !== '/pending-approval') {
    return NextResponse.redirect(new URL('/pending-approval', req.url));
  }

  // If a user is already on the pending page, let them stay there and do nothing else.
  if (pathname === '/pending-approval') {
    return NextResponse.next();
  }

  // If user is approved, handle redirects for logged-in users
  if (status === 'approved') {
    // If trying to access a public page (login, register, home) while logged in, redirect to the correct dashboard
    if (isAuthPage || pathname === '/') {
      const destination = role === 'admin' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(destination, req.url));
    }

    // If an admin tries to access a non-admin page, redirect them to the admin dashboard
    if (role === 'admin' && !pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }
  
  if (role === 'user') {
    // Redirect to profile setup if the token indicates the profile is incomplete.
    // The database check is removed as middleware should not connect to the DB.
    if (!profileComplete && pathname !== '/profile-setup') {
      return NextResponse.redirect(new URL('/profile-setup', req.url));
    }

    if (profileComplete && pathname.startsWith('/profile-setup')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  // This matcher runs the middleware on all paths except for API routes and static files.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
