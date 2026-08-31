import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { orderId } = await req.json();

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID es requerido' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // 1. Obtener pedido con items de forma segura
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          quantity,
          unit_price,
          products (name)
        )
      `)
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      console.error('Error finding order for MP preference:', orderError?.message || orderError);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    // 2. Obtener datos del negocio
    let business: any = null;
    if (order.business_id) {
      const { data: busData, error: busError } = await supabase
        .from('businesses')
        .select('id, name, slug, mp_access_token')
        .eq('id', order.business_id)
        .maybeSingle();
      
      if (!busError && busData) {
        business = busData;
      }
    }

    const businessSlug = business?.slug || '';
    const accessToken = business?.mp_access_token || process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
      return NextResponse.json({ 
        error: 'No se encontró el Token de Mercado Pago configurado.' 
      }, { status: 400 });
    }

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const isHttps = origin.startsWith('https://');

    // Formatear items para Mercado Pago
    const mappedItems = order.order_items
      ?.filter((item: any) => Number(item.unit_price) > 0)
      ?.map((item: any) => ({
        title: item.products?.name || 'Producto',
        quantity: Math.max(1, Number(item.quantity) || 1),
        unit_price: Number(Number(item.unit_price).toFixed(2)),
        currency_id: 'ARS',
      })) || [];

    const items = mappedItems.length > 0 ? mappedItems : [
      {
        title: `Pedido en ${business?.name || 'Local'}`,
        quantity: 1,
        unit_price: Math.max(1, Number(Number(order.total || 1).toFixed(2))),
        currency_id: 'ARS',
      }
    ];

    const successUrl = businessSlug 
      ? `${origin}/c/${businessSlug}/mis-pedidos?id=${order.id}&payment=success` 
      : `${origin}/?payment=success`;
    const failureUrl = businessSlug 
      ? `${origin}/c/${businessSlug}/mis-pedidos?id=${order.id}&payment=failure` 
      : `${origin}/?payment=failure`;
    const pendingUrl = businessSlug 
      ? `${origin}/c/${businessSlug}/mis-pedidos?id=${order.id}&payment=pending` 
      : `${origin}/?payment=pending`;

    const body: any = {
      items,
      external_reference: String(order.id),
      back_urls: {
        success: successUrl,
        failure: failureUrl,
        pending: pendingUrl,
      },
    };

    // auto_return y webhook solo son permitidos por Mercado Pago en dominios públicos HTTPS
    if (isHttps) {
      body.auto_return = 'approved';
      body.notification_url = `${origin}/api/mercadopago/webhook`;
    }

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
      return NextResponse.json({ 
        error: mpData.message || mpData.cause?.[0]?.description || 'Error al comunicarse con Mercado Pago' 
      }, { status: mpResponse.status });
    }

    const checkoutUrl = mpData.init_point || mpData.sandbox_init_point;
    return NextResponse.json({ init_point: checkoutUrl });
  } catch (error: any) {
    console.error('Error POST /api/mercadopago/preference:', error);
    return NextResponse.json({ error: error.message || 'Error del servidor' }, { status: 500 });
  }
}
