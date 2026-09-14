import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback<T> = (payload: T) => void;

let supabaseInstance: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!supabaseInstance) {
    supabaseInstance = createClient();
  }
  return supabaseInstance;
}

let notificationsChannel: RealtimeChannel | null = null;
let ordersChannel: RealtimeChannel | null = null;
let customerOrderChannel: RealtimeChannel | null = null;

/**
 * Suscribe a las notificaciones globales del negocio (Dashboard).
 * Solo se abre UNA conexión por negocio en todo el dashboard.
 */
export function subscribeToNotifications(businessId: string, callback: (payload: any, eventType: string) => void) {
  const supabase = getSupabaseClient();

  if (notificationsChannel) {
    unsubscribeFromNotifications();
  }

  notificationsChannel = supabase
    .channel(`notifications-channel-${businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'notifications',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          callback(payload.new, payload.eventType);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime (Notificaciones): Reconectando canal...');
      }
    });

  return notificationsChannel;
}

export function unsubscribeFromNotifications() {
  if (notificationsChannel) {
    const supabase = getSupabaseClient();
    supabase.removeChannel(notificationsChannel);
    notificationsChannel = null;
  }
}

/**
 * Suscribe a los pedidos globales del negocio.
 * Se debe usar ÚNICAMENTE en la página /dashboard/orders.
 */
export function subscribeToOrders(businessId: string, callback: SubscriptionCallback<any>) {
  const supabase = getSupabaseClient();

  if (ordersChannel) {
    unsubscribeFromOrders();
  }

  ordersChannel = supabase
    .channel(`orders-channel-${businessId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Insert, Update, Delete
        schema: 'public',
        table: 'orders',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime (Pedidos): Reconectando canal...');
      }
    });

  return ordersChannel;
}

export function unsubscribeFromOrders() {
  if (ordersChannel) {
    const supabase = getSupabaseClient();
    supabase.removeChannel(ordersChannel);
    ordersChannel = null;
  }
}

/**
 * Suscribe a un pedido específico para la vista del cliente.
 * Se usa ÚNICAMENTE en la vista de seguimiento del cliente.
 */
export function subscribeToCustomerOrder(orderId: string, callback: SubscriptionCallback<any>) {
  const supabase = getSupabaseClient();

  if (customerOrderChannel) {
    unsubscribeFromCustomerOrder();
  }

  customerOrderChannel = supabase
    .channel(`customer-order-${orderId}-${Date.now()}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Escuchar cambios de estado
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        if (payload.new) {
          callback(payload.new);
        }
      }
    )
    .subscribe((status) => {
      if (status === 'CHANNEL_ERROR') {
        console.warn('Realtime (Pedido Cliente): Reconectando canal...');
      }
    });

  return customerOrderChannel;
}

export function unsubscribeFromCustomerOrder() {
  if (customerOrderChannel) {
    const supabase = getSupabaseClient();
    supabase.removeChannel(customerOrderChannel);
    customerOrderChannel = null;
  }
}

