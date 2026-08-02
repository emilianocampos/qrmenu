'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProductsWithModels(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name)')
    .eq('business_id', businessId)
    .order('item_order', { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function delete3DModel(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Eliminar el archivo del Storage
  await supabase.storage
    .from('product-models')
    .remove([`${productId}.glb`]);

  // Actualizar la base de datos
  const { error } = await supabase
    .from('products')
    .update({ 
      model_3d_url: null, 
      model_3d_status: 'none',
      model_3d_generated_at: null
    })
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/models');
  return { success: true };
}
