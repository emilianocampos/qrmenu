import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // Mercado Pago envía notificaciones por body o por query string
    const topic = url.searchParams.get('topic') || url.searchParams.get('type') || body.topic || body.type;
    const paymentId = url.searchParams.get('id') || url.searchParams.get('data.id') || body.data?.id || body.id;

    if (topic !== 'payment' || !paymentId) {
      return NextResponse.json({ status: 'ignored' }, { status: 200 });
    }

    const supabase = await createClient();

    // 1. Obtener todas las órdenes que podrían requerir este pago o consultar la API de Mercado Pago
    // Buscamos primero en el pedido si existe referencia externa previa o consultamos con la BD
    const { data: businesses } = await supabase
      .from('businesses')
      .select('id, owner_id, mp_access_token')
      .not('mp_access_token', 'is', null);

    if (!businesses || businesses.length === 0) {
      return NextResponse.json({ status: 'no_businesses_with_token' }, { status: 200 });
    }

    // Buscar el detalle del pago probando tokens
    let paymentData: any = null;
    let businessId: string | null = null;

    for (const bus of businesses) {
      if (!bus.mp_access_token) continue;
      try {
        const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
          headers: {
            Authorization: `Bearer ${bus.mp_access_token}`,
          },
        });
        if (mpRes.ok) {
          paymentData = await mpRes.json();
          businessId = bus.id;
          break;
        }
      } catch {}
    }

    if (!paymentData || !paymentData.external_reference) {
      return NextResponse.json({ status: 'payment_not_found_or_no_ref' }, { status: 200 });
    }

    const orderId = paymentData.external_reference;
    const paymentStatus = paymentData.status;

    if (paymentStatus === 'approved') {
      // 2. Actualizar el pedido a estado 'paid'
      const { data: updatedOrder, error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'paid',
          payment_status: 'approved',
          payment_id: String(paymentId),
        })
        .eq('id', orderId)
        .select('*')
        .single();

      if (!updateError && updatedOrder) {
        const tableInfo = updatedOrder.customer_identifier || 'Mesa del cliente';
        
        // 3. Crear notificación global para el panel de administración
        await supabase
          .from('notifications')
          .insert({
            business_id: updatedOrder.business_id,
            type: 'order_paid',
            title: '¡Pedido Pagado con Mercado Pago! 💳',
            description: `${tableInfo} - Pago por $${updatedOrder.total} aprobado.`,
            reference_id: updatedOrder.id,
            reference_type: 'order',
          });
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error: any) {
    console.error('Error Webhook Mercado Pago:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// También permitir peticiones GET para validaciones IPN de Mercado Pago
export async function GET(req: NextRequest) {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
