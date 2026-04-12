import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { env } from '@/lib/env';

const protectedPrefixes = ['/dashboard', '/documents', '/site', '/billing', '/admin'];
const protectedApiPrefixes = ['/api/documents', '/api/site-reports', '/api/modules', '/api/me', '/api/projects'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const path = request.nextUrl.pathname;
  const needsAuth = protectedPrefixes.some((prefix) => path.startsWith(prefix)) || protectedApiPrefixes.some((prefix) => path.startsWith(prefix));

  if (!needsAuth) return response;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (path.startsWith('/api/')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/documents/:path*', '/site/:path*', '/billing/:path*', '/admin/:path*', '/api/documents/:path*', '/api/site-reports/:path*', '/api/modules/:path*', '/api/me/:path*', '/api/projects/:path*'],
};
