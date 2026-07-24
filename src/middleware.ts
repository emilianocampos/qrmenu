import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { decrypt } from '@/lib/super-admin-auth'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Manejo de rutas Super Admin
  if (path.startsWith('/super-admin')) {
    const sessionCookie = request.cookies.get('super_admin_session')?.value;
    let isValidSession = false;

    if (sessionCookie) {
      try {
        const payload = await decrypt(sessionCookie);
        if (payload?.role === 'super-admin') {
          isValidSession = true;
        }
      } catch (e) {
        // Token inválido o expirado
      }
    }

    if (path === '/super-admin/login') {
      if (isValidSession) {
        return NextResponse.redirect(new URL('/super-admin/dashboard', request.url));
      }
      return NextResponse.next();
    }

    if (!isValidSession) {
      return NextResponse.redirect(new URL('/super-admin/login', request.url));
    }

    return NextResponse.next();
  }

  // Fallback para las rutas normales del negocio (Supabase Auth)
  return await updateSession(request);
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
