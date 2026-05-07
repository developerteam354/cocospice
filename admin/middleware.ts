import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const LOGIN_PAGE     = '/admin/login';
const DASHBOARD_PAGE = '/admin/dashboard';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Use refreshToken (HttpOnly, 7-day) as the session indicator.
  // accessToken is short-lived (15min) and would cause false redirects on refresh.
  const hasSession =
    request.cookies.has('refreshToken') ||
    request.cookies.has('accessToken');

  const isLoginPage = pathname === LOGIN_PAGE;

  // Authenticated user trying to access login → send to dashboard
  if (isLoginPage && hasSession) {
    return NextResponse.redirect(new URL(DASHBOARD_PAGE, request.url));
  }

  // Unauthenticated user trying to access any protected admin page → send to login
  if (!isLoginPage && !hasSession) {
    return NextResponse.redirect(new URL(LOGIN_PAGE, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
