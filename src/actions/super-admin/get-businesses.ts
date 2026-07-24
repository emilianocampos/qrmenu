'use server';

import { createClient } from '@/lib/supabase/server';
import { getSuperAdminSession } from '@/lib/super-admin-auth';

export async function getBusinesses() {
  const session = await getSuperAdminSession();
  if (!session || session.role !== 'super-admin') {
    throw new Error('No autorizado');
  }

  const supabase = await createClient();

  const { data, error, count } = await supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching businesses for super admin:', error);
    throw new Error('Fallo al obtener negocios');
  }

  return { businesses: data, count };
}
