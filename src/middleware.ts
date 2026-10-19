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

  // Rutas públicas de clientes (menú QR, seguimiento, pedidos, landing) y webhooks:
  // No requieren verificación de sesión de Supabase Auth en middleware
  if (
    path === '/' ||
    path.startsWith('/c/') ||
    path.startsWith('/api/mercadopago')
  ) {
    return NextResponse.next();
  }

  // Fallback para las rutas privadas del panel y autenticación (Supabase Auth)
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static files and assets
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|woff2)$).*)',
  ],
}
