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

    const { data: business } = await supabase
      .from('businesses')
      .select('about_description')
      .eq('id', businessId)
      .single();

    const raw = business?.about_description || '';
    const cleanAbout = raw.split(MARKER)[0].trim();

    const newPayload = JSON.stringify({
      waiter_assignment_enabled: settings.waiter_assignment_enabled,
      waiters: settings.waiters.map(w => w.trim()).filter(Boolean),
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
