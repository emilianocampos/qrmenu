'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function getCategories(businessId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select('*, products(count)')
    .eq('business_id', businessId)
    .order('item_order', { ascending: true });

  if (error) return { error: error.message };
  return { data };
}

export async function createCategory(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const businessId = formData.get('business_id') as string;
  const name = formData.get('name') as string;
  const icon = formData.get('icon') as string | null;
  const isVisible = formData.get('is_visible') !== 'false';

  const { data, error } = await supabase
    .from('categories')
    .insert({
      business_id: businessId,
      name,
      icon: icon || null,
      is_visible: isVisible,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/categorias');
  return { data };
}

export async function updateCategory(categoryId: string, updates: Record<string, unknown>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', categoryId)
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard/categorias');
  return { data };
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', categoryId);

  if (error) return { error: error.message };

  revalidatePath('/dashboard/categorias');
  return { success: true };
}

export async function reorderCategories(categories: { id: string; item_order: number }[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const updates = categories.map(({ id, item_order }) =>
    supabase.from('categories').update({ item_order }).eq('id', id)
  );

  await Promise.all(updates);

  revalidatePath('/dashboard/categorias');
  return { success: true };
}
