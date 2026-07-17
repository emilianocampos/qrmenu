'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function createBusiness(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;
  const colorPrimary = formData.get('color_primary') as string || '#4f46e5';
  const colorSecondary = formData.get('color_secondary') as string || '#ffffff';
  const description = formData.get('description') as string | null;
  const logoUrl = formData.get('logo_url') as string | null;

  if (!name || !slug) return { error: 'Nombre y slug son requeridos' };

  // Validate slug uniqueness
  const { data: existing } = await supabase
    .from('businesses')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) return { error: 'El slug ya está en uso' };

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      owner_id: user.id,
      name,
      slug,
      color_primary: colorPrimary,
      color_secondary: colorSecondary,
      logo_url: logoUrl,
    })
    .select()
    .single();

  if (error) return { error: error.message };

  revalidatePath('/dashboard', 'layout');
  return { data };
}

export async function updateBusiness(businessId: string, updates: Record<string, any>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  // Separate updates into businesses columns and settings columns
  const businessKeys = [
    'name', 'slug', 'logo_url', 'color_primary', 'color_secondary', 'typography', 'theme',
    'description', 'about_title', 'about_description', 'cover_image', 'banner_image'
  ];
  const settingsKeys = ['email', 'whatsapp', 'instagram', 'facebook', 'address', 'schedule', 'language', 'currency', 'plan'];

  const businessUpdates: Record<string, any> = {};
  const settingsUpdates: Record<string, any> = {};

  for (const [key, val] of Object.entries(updates)) {
    if (businessKeys.includes(key)) {
      businessUpdates[key] = val;
    } else if (settingsKeys.includes(key)) {
      settingsUpdates[key] = val;
    }
  }

  // Update business if there are updates
  if (Object.keys(businessUpdates).length > 0) {
    const { error: busError } = await supabase
      .from('businesses')
      .update(businessUpdates)
      .eq('id', businessId)
      .eq('owner_id', user.id);

    if (busError) return { error: busError.message };
  }

  // Update or insert settings if there are updates
  if (Object.keys(settingsUpdates).length > 0) {
    const { error: setErr } = await supabase
      .from('settings')
      .upsert({
        business_id: businessId,
        ...settingsUpdates
      }, { onConflict: 'business_id' });

    if (setErr) return { error: setErr.message };
  }

  revalidatePath('/dashboard', 'layout');
  revalidatePath('/dashboard/configuracion');
  revalidatePath('/dashboard/personalizacion');
  
  return { success: true };
}

export async function deleteBusiness(businessId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const { error } = await supabase
    .from('businesses')
    .delete()
    .eq('id', businessId)
    .eq('owner_id', user.id);

  if (error) return { error: error.message };

  revalidatePath('/', 'layout');
  return { success: true };
}

export async function uploadLogo(businessId: string, file: File) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${businessId}/logo.${fileExt}`;

  // Make sure logos bucket exists or try to upload
  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

// Keep alias for compatibility
export async function uploadBusinessLogo(businessId: string, file: File) {
  return uploadLogo(businessId, file);
}

export async function uploadBusinessImage(businessId: string, file: File, type: 'logo' | 'cover' | 'banner') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No autenticado' };

  const fileExt = file.name.split('.').pop();
  const fileName = `${businessId}/${type}_${Date.now()}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('logos')
    .upload(fileName, file, { upsert: true });

  if (uploadError) return { error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage
    .from('logos')
    .getPublicUrl(fileName);

  return { url: publicUrl };
}

