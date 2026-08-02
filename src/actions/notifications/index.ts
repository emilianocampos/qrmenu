'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getUnreadNotifications(businessId: string) {
  try {
    const supabase = await createClient();
    
    // Solo leemos las últimas 50 para no sobrecargar el payload inicial
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Action getUnreadNotifications error:', error);
    return [];
  }
}

export async function markAsRead(id: string, businessId: string) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('business_id', businessId);
      
    // Usamos revalidatePath si es necesario, pero como tenemos Context client-side, 
    // el contexto ya se actualizó localmente.
  } catch (error) {
    console.error('Action markAsRead error:', error);
  }
}

export async function markAllAsRead(businessId: string) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('business_id', businessId)
      .eq('read', false);
      
  } catch (error) {
    console.error('Action markAllAsRead error:', error);
  }
}

export async function deleteNotification(id: string, businessId: string) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('business_id', businessId);
      
  } catch (error) {
    console.error('Action deleteNotification error:', error);
  }
}

// Esta action se llama internamente desde otras acciones (ej: al crear un pedido)
export async function createNotification({
  businessId,
  type,
  title,
  description,
  referenceId,
  referenceType
}: {
  businessId: string;
  type: string;
  title: string;
  description: string;
  referenceId?: string;
  referenceType?: string;
}) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('notifications')
      .insert({
        business_id: businessId,
        type,
        title,
        description,
        reference_id: referenceId,
        reference_type: referenceType
      });
      
  } catch (error) {
    console.error('Action createNotification error:', error);
  }
}
