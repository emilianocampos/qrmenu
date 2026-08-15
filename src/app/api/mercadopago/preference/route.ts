import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID es requerido' }, { status: 400 });
    }

    const supabase = await createClient();

    // Obtener pedido con negocio y productos
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        businesses (
          id,
          name,
          slug,
          mp_access_token
        ),
        order_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const business = order.businesses;
    const accessToken = business?.mp_access_token;

    if (!accessToken) {
      return NextResponse.json({ error: 'El negocio no tiene configurado Mercado Pago' }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    // Formatear items para Mercado Pago
    const items = order.order_items?.map((item: any) => ({
      title: item.products?.name || 'Producto',
      quantity: item.quantity,
      unit_price: Number(item.unit_price),
      currency_id: 'ARS',
    })) || [
      {
        title: `Pedido en ${business.name}`,
        quantity: 1,
        unit_price: Number(order.total),
        currency_id: 'ARS',
      }
    ];

    const body = {
      items,
      external_reference: order.id,
      notification_url: `${origin}/api/mercadopago/webhook`,
      back_urls: {
        success: `${origin}/c/${business.slug}/mis-pedidos?id=${order.id}&payment=success`,
        failure: `${origin}/c/${business.slug}/mis-pedidos?id=${order.id}&payment=failure`,
        pending: `${origin}/c/${business.slug}/mis-pedidos?id=${order.id}&payment=pending`,
      },
      auto_return: 'approved',
    };

    const mpResponse = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    const mpData = await mpResponse.json();

    if (!mpResponse.ok) {
      console.error('Error Mercado Pago API:', mpData);
      return NextResponse.json({ error: mpData.message || 'Error al comunicarse con Mercado Pago' }, { status: mpResponse.status });
    }

    return NextResponse.json({ init_point: mpData.init_point, sandbox_init_point: mpData.sandbox_init_point });
  } catch (error: any) {
    console.error('Error POST /api/mercadopago/preference:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
