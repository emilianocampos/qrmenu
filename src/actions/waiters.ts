'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface WaiterSettings {
  waiter_assignment_enabled: boolean;
  waiters: string[];
}

const DEFAULT_WAITERS = ['Agustina', 'Camila', 'Facundo', 'Juan', 'Lucas', 'Sofía'];

const MARKER = '\n---WAITERS_CONFIG---\n';

export async function getWaiterSettings(businessId: string): Promise<WaiterSettings> {
  try {
    const supabase = await createClient();

    // 1. Intentar consultar desde la tabla dedicada public.waiters si existe
    try {
      const [{ data: bizData }, { data: dbWaiters, error: waitersError }] = await Promise.all([
        supabase.from('businesses').select('waiter_assignment_enabled, about_description').eq('id', businessId).single(),
        supabase.from('waiters').select('name').eq('business_id', businessId).eq('is_active', true).order('created_at', { ascending: true })
      ]);

      if (!waitersError && Array.isArray(dbWaiters) && dbWaiters.length > 0) {
        return {
          waiter_assignment_enabled: Boolean(bizData?.waiter_assignment_enabled),
          waiters: dbWaiters.map(w => w.name),
        };
      }
    } catch {
      // Si la tabla no fue migrada aún, continúa al fallback
    }

    // 2. Fallback de lectura desde businesses.about_description
    const { data, error } = await supabase
      .from('businesses')
      .select('about_description')
      .eq('id', businessId)
      .single();

    if (error || !data) {
      return {
        waiter_assignment_enabled: false,
        waiters: DEFAULT_WAITERS,
      };
    }

    const raw = data.about_description || '';
    if (raw.includes(MARKER)) {
      const configJson = raw.split(MARKER)[1];
      try {
        const parsed = JSON.parse(configJson);
        return {
          waiter_assignment_enabled: Boolean(parsed.waiter_assignment_enabled),
          waiters: Array.isArray(parsed.waiters) && parsed.waiters.length > 0 ? parsed.waiters : DEFAULT_WAITERS,
        };
      } catch {}
    }

    return {
      waiter_assignment_enabled: false,
      waiters: DEFAULT_WAITERS,
    };
  } catch (err) {
    console.error('Error fetching waiter settings:', err);
    return {
      waiter_assignment_enabled: false,
      waiters: DEFAULT_WAITERS,
    };
  }
}

export async function updateWaiterSettings(businessId: string, settings: WaiterSettings) {
  try {
    const supabase = await createClient();
    const cleanWaiters = settings.waiters.map(w => w.trim()).filter(Boolean);

    // 1. Intentar guardar en la tabla public.waiters y businesses.waiter_assignment_enabled
    try {
      await supabase
        .from('businesses')
        .update({ waiter_assignment_enabled: settings.waiter_assignment_enabled })
        .eq('id', businessId);

      // Desactivar mozos que ya no están en la lista
      await supabase
        .from('waiters')
        .update({ is_active: false })
        .eq('business_id', businessId)
        .not('name', 'in', `(${cleanWaiters.map(w => `"${w}"`).join(',')})`);

      // Upsert de mozos actuales
      for (let i = 0; i < cleanWaiters.length; i++) {
        const wName = cleanWaiters[i];
        const code = String(i + 1).padStart(2, '0');
        await supabase
          .from('waiters')
          .upsert(
            { business_id: businessId, name: wName, maxirest_code: code, is_active: true },
            { onConflict: 'business_id,name' }
          );
      }
    } catch {
      // Si la tabla no existe en la base de datos, continúa al fallback
    }

    // 2. Mantener sincronizado el fallback en about_description
    const { data: business } = await supabase
      .from('businesses')
      .select('about_description')
      .eq('id', businessId)
      .single();

    const raw = business?.about_description || '';
    const cleanAbout = raw.split(MARKER)[0].trim();

    const newPayload = JSON.stringify({
      waiter_assignment_enabled: settings.waiter_assignment_enabled,
      waiters: cleanWaiters,
    });

    const fullAbout = cleanAbout ? `${cleanAbout}${MARKER}${newPayload}` : `${MARKER}${newPayload}`;

    const { error } = await supabase
      .from('businesses')
      .update({ about_description: fullAbout })
      .eq('id', businessId);

    if (error) throw error;

    revalidatePath('/configuracion');
    revalidatePath('/orders');
    return { success: true };
  } catch (err: any) {
    console.error('Error updating waiter settings:', err);
    return { error: err.message || 'Error al guardar la configuración de mozos' };
  }
}

/**
 * Función para precargar mozos automáticamente a un nuevo negocio
 */
export async function seedDefaultWaitersForBusiness(businessId: string) {
  return updateWaiterSettings(businessId, {
    waiter_assignment_enabled: true,
    waiters: DEFAULT_WAITERS,
  });
}
