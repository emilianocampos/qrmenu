import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, glbUrl } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    // Si hubo un error en la generacion (Gradio reportó error)
    if (!glbUrl) {
      await supabase
        .from('products')
        .update({ model_3d_status: 'failed' })
        .eq('id', productId);
      return NextResponse.json({ error: 'Error en generación' }, { status: 400 });
    }

    // 1. Descargar GLB desde la URL temporal de Hugging Face
    const glbResponse = await fetch(glbUrl);
    if (!glbResponse.ok) {
        throw new Error('Error al descargar el modelo GLB de TripoSR');
    }
    
    const glbBuffer = await glbResponse.arrayBuffer();
    
    // 2. Subir a Supabase Storage
    const fileName = `${productId}.glb`;
    const { error: uploadError } = await supabase.storage
      .from('product-models')
      .upload(fileName, glbBuffer, { 
        upsert: true, 
        contentType: 'model/gltf-binary' 
      });

    if (uploadError) {
      throw new Error(`Error subiendo a Storage: ${uploadError.message}`);
    }

    // 3. Obtener URL Pública de Supabase
    const { data: { publicUrl } } = supabase.storage
      .from('product-models')
      .getPublicUrl(fileName);

    // 4. Actualizar Base de Datos a ready
    const { error: dbError } = await supabase
      .from('products')
      .update({
        model_3d_status: 'ready',
        model_3d_url: publicUrl,
        model_3d_generated_at: new Date().toISOString()
      })
      .eq('id', productId);

    if (dbError) throw new Error(`Error DB: ${dbError.message}`);

    return NextResponse.json({ status: 'SUCCEEDED', url: publicUrl });
  } catch (error: any) {
    console.error('Error en /api/triposr/save:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
