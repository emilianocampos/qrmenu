'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateOrderMode(businessId: string, orderMode: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('businesses')
      .update({ order_mode: orderMode })
      .eq('id', businessId);

    if (error) throw error;
    
    revalidatePath('/dashboard/settings/order-mode');
    return { success: true };
  } catch (error: any) {
    console.error('Error updating order mode:', error);
    return { error: error.message };
  }
}

export async function markTourAsSeen(businessId: string) {
  try {
    const supabase = await createClient();
    
    await supabase
      .from('businesses')
      .update({ order_mode_tour_seen: true })
      .eq('id', businessId);
      
    return { success: true };
  } catch (error) {
    return { error: 'Error' };
  }
}
