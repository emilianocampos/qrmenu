'use server';

import { createClient } from '@/lib/supabase/server';
import { createNotification } from '../notifications';

export async function getOrders(businessId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, image_url)
        ),
        restaurant_tables (table_number, table_code)
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function deleteAllOrders(businessId: string) {
  try {
    const supabase = await createClient();
    
    // We only need to delete from orders, order_items cascades if FK has ON DELETE CASCADE.
    // If not, we still just delete from orders, Supabase/Postgres might reject if no cascade,
    // but in add_orders_module.sql: REFERENCES orders(id) ON DELETE CASCADE
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('business_id', businessId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting all orders:', error);
    return { error: error.message };
  }
}

export async function updateOrderStatus(orderId: string, businessId: string, status: string, tableName?: string) {
  try {
    const supabase = await createClient();
    
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .eq('business_id', businessId);

    if (error) throw error;

    // Crear notificación correspondiente (excepto para pending que se hace al crear)
    const statusMap: Record<string, string> = {
      accepted: 'Pedido aceptado',
      preparing: 'Pedido en preparación',
      ready: 'Pedido listo',
      delivered: 'Pedido entregado',
      cancelled: 'Pedido cancelado'
    };

    if (statusMap[status]) {
      await createNotification({
        businessId,
        type: `order_${status}`,
        title: statusMap[status],
        description: tableName ? `Mesa ${tableName} - Estado: ${statusMap[status]}` : `Estado actualizado a ${statusMap[status]}`,
        referenceId: orderId,
        referenceType: 'order'
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error updating order:', error);
    return { error: error.message };
  }
}

interface CreateOrderParams {
  businessId: string;
  tableId?: string | null;
  customerFirstName?: string;
  customerLastName?: string;
  customerPhone?: string;
  customerIdentifier?: string; // para codigo de mesa o comanda
  comments?: string;
  total: number;
  items: { productId: string; quantity: number; unitPrice: number; observations: string }[];
  tableDisplay?: string; // Para la notificacion
}

export async function createOrder(params: CreateOrderParams) {
  try {
    const supabase = await createClient();
    
    // 1. Crear Order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        business_id: params.businessId,
        table_id: params.tableId,
        customer_first_name: params.customerFirstName,
        customer_last_name: params.customerLastName,
        customer_phone: params.customerPhone,
        customer_identifier: params.customerIdentifier,
        comments: params.comments,
        total: params.total,
        status: 'pending'
      })
      .select('id')
      .single();

    if (orderError) throw orderError;

    // 2. Crear Order Items
    const itemsToInsert = params.items.map(item => ({
      order_id: order.id,
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      observations: item.observations
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    // 3. Crear Notificación
    await createNotification({
      businessId: params.businessId,
      type: 'new_order',
      title: 'Nuevo Pedido',
      description: params.tableDisplay 
        ? `${params.tableDisplay} realizó un pedido por $${params.total}`
        : `Nuevo pedido por $${params.total}`,
      referenceId: order.id,
      referenceType: 'order'
    });

    return { success: true, orderId: order.id };
  } catch (error: any) {
    console.error('Error creating order:', error);
    return { error: error.message };
  }
}

export async function getOrderById(orderId: string) {
  try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          *,
          products (name, image_url)
        ),
        restaurant_tables (table_number, table_code),
        businesses (name, slug, color_primary, logo_url)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}
