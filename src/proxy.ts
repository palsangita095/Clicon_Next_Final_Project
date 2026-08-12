import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { User } from '@supabase/supabase-js'
import { getDashboardPath } from '@/lib/auth-routing'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const isAccountRoute = request.nextUrl.pathname.startsWith('/account')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute =
    request.nextUrl.pathname === '/signin' ||
    request.nextUrl.pathname === '/signup' ||
    request.nextUrl.pathname === '/signup/admin'
  const hasAuthCookie = request.cookies
    .getAll()
    .some((cookie) =>
      cookie.name === 'sb-access-token' ||
      cookie.name === 'sb-refresh-token' ||
      cookie.name === 'sb-user' ||
      cookie.name === 'sb-auth-token' ||
      cookie.name.startsWith('sb-')
    )

  let user: User | null = null

  if (!hasAuthCookie) {
    if (isAccountRoute || isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // IMPORTANT: Avoid writing custom logic before getUser. If Supabase is
  // temporarily unreachable, keep public pages alive and protect private pages.
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    if (isAccountRoute || isAdminRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/signin'
      url.searchParams.set('redirectTo', request.nextUrl.pathname)
      url.searchParams.set('error', 'auth-unavailable')
      return NextResponse.redirect(url)
    }

    return supabaseResponse
  }

  // Protect /account and /admin routes
  if (
    !user &&
    (isAccountRoute || isAdminRoute)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    url.searchParams.set('redirectTo', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  if (!user) return supabaseResponse

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError) {
    console.error('Supabase profile check failed in proxy:', profileError)
  }

  const role = profile?.role ?? 'customer'

  if (isAdminRoute && role !== 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/account'
    return NextResponse.redirect(url)
  }

  if (isAccountRoute && role === 'admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/dashboard'
    return NextResponse.redirect(url)
  }

  // If user is logged in, but tries to access signin/signup, redirect by role.
  if (isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = getDashboardPath(role)
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
