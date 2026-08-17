'use server';

import { createClient } from '@/lib/supabase/server';
import { format, subDays, startOfDay, startOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

export async function getSalesStatistics(businessId: string) {
  try {
    const supabase = await createClient();

    const today = startOfDay(new Date());
    const firstDayOfMonth = startOfMonth(new Date());
    const sevenDaysAgo = subDays(today, 6);

    // 1. Pedidos entregados o pagados para calcular ganancias
    const { data: deliveredOrders, error: deliveredErr } = await supabase
      .from('orders')
      .select('id, total, created_at, status')
      .eq('business_id', businessId)
      .in('status', ['delivered', 'paid']);

    if (deliveredErr) {
      console.error('Error in deliveredOrders query:', deliveredErr);
      throw deliveredErr;
    }

    let todayEarnings = 0;
    let monthEarnings = 0;

    const salesByDayMap = new Map<string, number>();

    // Inicializar mapa de últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const dateKey = format(subDays(today, i), 'yyyy-MM-dd');
      salesByDayMap.set(dateKey, 0);
    }

    if (deliveredOrders) {
      deliveredOrders.forEach((order) => {
        const orderDate = new Date(order.created_at);
        const orderTotal = Number(order.total) || 0;

        if (orderDate >= today) {
          todayEarnings += orderTotal;
        }
        if (orderDate >= firstDayOfMonth) {
          monthEarnings += orderTotal;
        }

        const dateKey = format(orderDate, 'yyyy-MM-dd');
        if (salesByDayMap.has(dateKey)) {
          salesByDayMap.set(dateKey, (salesByDayMap.get(dateKey) || 0) + orderTotal);
        }
      });
    }

    const earningsChartData = Array.from(salesByDayMap.entries()).map(([dateStr, total]) => {
      const [year, month, day] = dateStr.split('-');
      const formattedDate = format(new Date(Number(year), Number(month) - 1, Number(day)), 'dd MMM', { locale: es });
      return {
        name: formattedDate,
        total: Math.round(total),
      };
    });

    // 2. Top productos más pedidos (excluyendo pedidos cancelados)
    const { data: validOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('business_id', businessId)
      .neq('status', 'cancelled');

    const validOrderIds = validOrders?.map(o => o.id) || [];

    let topProducts: { id: string; name: string; image_url: string | null; count: number }[] = [];

    if (validOrderIds.length > 0) {
      const { data: items } = await supabase
        .from('order_items')
        .select('product_id, quantity, products(id, name, image_url)')
        .in('order_id', validOrderIds);

      if (items) {
        const productMap = new Map<string, { id: string; name: string; image_url: string | null; count: number }>();

        items.forEach(item => {
          if (!item.products) return;
          const prod = item.products as any;
          const existing = productMap.get(prod.id) || { id: prod.id, name: prod.name, image_url: prod.image_url, count: 0 };
          existing.count += item.quantity || 1;
          productMap.set(prod.id, existing);
        });

        topProducts = Array.from(productMap.values())
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
      }
    }

    return {
      todayEarnings,
      monthEarnings,
      earningsChartData,
      topProducts,
    };
  } catch (error) {
    console.error('Error fetching sales statistics:', error);
    return {
      todayEarnings: 0,
      monthEarnings: 0,
      earningsChartData: [],
      topProducts: [],
    };
  }
}
