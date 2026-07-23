'use server';

import { createClient } from '@/lib/supabase/server';

export async function registerBusinessView(businessId: string) {
  if (!businessId) return { error: 'El ID del negocio es requerido' };
  
  const supabase = await createClient();
  const { error } = await supabase
    .from('business_views')
    .insert({ business_id: businessId });

  if (error) {
    console.error('Error registering business view:', error.message);
    return { error: error.message };
  }
  return { success: true };
}

export async function registerProductView(businessId: string, productId: string) {
  if (!businessId || !productId) return { error: 'El ID del negocio y del producto son requeridos' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('product_views')
    .insert({ business_id: businessId, product_id: productId });

  if (error) {
    console.error('Error registering product view:', error.message);
    return { error: error.message };
  }
  return { success: true };
}
