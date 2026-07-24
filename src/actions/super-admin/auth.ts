'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { encrypt } from '@/lib/super-admin-auth';

export async function loginSuperAdmin(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const validEmail = process.env.SUPER_ADMIN_EMAIL;
  const validPassword = process.env.SUPER_ADMIN_PASSWORD;

  if (!validEmail || !validPassword) {
    return { error: 'Las credenciales de Super Admin no están configuradas en el servidor.' };
  }

  if (email === validEmail && password === validPassword) {
    // Generate JWT
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day
    const session = await encrypt({ role: 'super-admin', email });

    const cookieStore = await cookies();
    cookieStore.set('super_admin_session', session, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true };
  } else {
    return { error: 'Credenciales inválidas.' };
  }
}

export async function logoutSuperAdmin(formData?: FormData) {
  const cookieStore = await cookies();
  cookieStore.delete('super_admin_session');
  redirect('/super-admin/login');
}
