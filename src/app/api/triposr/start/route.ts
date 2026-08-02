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
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
    }

    const { error: dbError } = await supabase
      .from('products')
      .update({
        model_3d_status: 'generating',
        model_3d_task_id: 'triposr_client',
        model_3d_url: null,
      })
      .eq('id', productId);

    if (dbError) {
      return NextResponse.json({ error: 'Error actualizando producto' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error en /api/triposr/start:', error);
    return NextResponse.json(
      { error: error.message || 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}
