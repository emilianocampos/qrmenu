'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getProducts(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select('*, category:categories(id, name)')
    .eq('business_id', businessId)
    .order('item_order', { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const businessId = formData.get('business_id') as string;
  const name = formData.get('name') as string;
  const description = formData.get('description') as string | null;
  const price = parseFloat(formData.get('price') as string) || 0;
  const categoryId = formData.get('category_id') as string | null;
  const imageUrl = formData.get('image_url') as string | null;
  const isAvailable = formData.get('is_available') === 'true';
  const isFeatured = formData.get('is_featured') === 'true';
  const itemOrder = parseInt(formData.get('item_order') as string) || 0;

  const { data, error } = await supabase
    .from('products')
    .insert({
      business_id: businessId,
      name,
      description: description || null,
      price,
      category_id: categoryId || null,
      image_url: imageUrl || null,
      is_available: isAvailable,
      is_featured: isFeatured,
      item_order: itemOrder,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/productos');
  return { data };
}

export async function updateProduct(productId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', productId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/productos');
  return { data };
}

export async function deleteProduct(productId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId);

  if (error) return { error: error.message };

  revalidatePath('/productos');
  return { success: true };
}

export async function duplicateProduct(productId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data: original, error: fetchError } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (fetchError || !original) return { error: 'Producto no encontrado' };

  const { id, created_at, ...rest } = original;
  const { data, error } = await supabase
    .from('products')
    .insert({ ...rest, name: `${original.name} (copia)` })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/productos');
  return { data };
}

export async function uploadProductImage(businessId: string, file: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${businessId}/${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('products')
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('products')
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

export async function deleteAllMenu(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Eliminar primero todos los productos del negocio
  const { error: productsError } = await supabase
    .from('products')
    .delete()
    .eq('business_id', businessId);

  if (productsError) return { error: productsError.message };

  // Eliminar luego todas las categorías del negocio
  const { error: categoriesError } = await supabase
    .from('categories')
    .delete()
    .eq('business_id', businessId);

  if (categoriesError) return { error: categoriesError.message };

  revalidatePath('/productos');
  return { success: true };
}
