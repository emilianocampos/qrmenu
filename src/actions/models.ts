'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
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
  try {
    await supabase.storage
      .from('product-models')
      .remove([`${productId}.glb`]);
  } catch {}

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

export async function uploadCustomGLBModel(productId: string, formData: FormData) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    const file = formData.get('file') as File;
    if (!file) return { error: 'No se ha seleccionado ningún archivo' };

    // Validar extensión del archivo
    if (!file.name.toLowerCase().endsWith('.glb')) {
      return { error: 'El archivo debe tener extensión .glb' };
    }

    const arrayBuffer = await file.arrayBuffer();
    const fileName = `${productId}.glb`;

    // Intentar subir con cliente normal o admin client si hay RLS
    let uploadError: any = null;
    const { error: err1 } = await supabase.storage
      .from('product-models')
      .upload(fileName, arrayBuffer, {
        upsert: true,
        contentType: 'model/gltf-binary',
      });

    uploadError = err1;

    if (uploadError && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const adminSupabase = createAdminClient();
      const { error: err2 } = await adminSupabase.storage
        .from('product-models')
        .upload(fileName, arrayBuffer, {
          upsert: true,
          contentType: 'model/gltf-binary',
        });
      uploadError = err2;
    }

    if (uploadError) {
      return { error: `Error en Storage: ${uploadError.message}` };
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-models')
      .getPublicUrl(fileName);

    const { error: dbError } = await supabase
      .from('products')
      .update({
        model_3d_url: publicUrl,
        model_3d_status: 'ready',
        model_3d_generated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (dbError) return { error: dbError.message };

    revalidatePath('/models');
    return { success: true, url: publicUrl };
  } catch (error: any) {
    console.error('Error uploading custom GLB model:', error);
    return { error: error.message || 'Error al subir modelo 3D' };
  }
}

export async function setCustomGLBUrl(productId: string, modelUrl: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No autenticado' };

    if (!modelUrl || !modelUrl.trim()) {
      return { error: 'Debes ingresar una URL válida' };
    }

    const { error } = await supabase
      .from('products')
      .update({
        model_3d_url: modelUrl.trim(),
        model_3d_status: 'ready',
        model_3d_generated_at: new Date().toISOString(),
      })
      .eq('id', productId);

    if (error) return { error: error.message };

    revalidatePath('/models');
    return { success: true };
  } catch (error: any) {
    console.error('Error setting GLB URL:', error);
    return { error: error.message || 'Error al guardar la URL del modelo' };
  }
}
