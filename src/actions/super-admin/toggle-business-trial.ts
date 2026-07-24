'use server';

import { createAdminClient } from '@/lib/supabase/admin';
import { getSuperAdminSession } from '@/lib/super-admin-auth';
import { revalidatePath } from 'next/cache';

export async function toggleBusinessTrial(businessId: string, currentTrialState: boolean) {
  const session = await getSuperAdminSession();
  if (!session || session.role !== 'super-admin') {
    return { error: 'No autorizado' };
  }

  const supabase = createAdminClient();

  const { error } = await supabase
    .from('businesses')
    .update({ trial_enabled: !currentTrialState })
    .eq('id', businessId);

  if (error) {
    console.error('Error toggling trial:', error);
    return { error: 'No se pudo actualizar el estado' };
  }

  // Obtenemos el slug para invalidar la caché de la carta pública si existe
  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', businessId)
    .single();

  if (business) {
    revalidatePath(`/c/${business.slug}`);
  }

  revalidatePath('/super-admin/dashboard');

  return { success: true };
}
