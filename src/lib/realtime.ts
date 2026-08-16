import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback<T> = (payload: T) => void;

let notificationsChannel: RealtimeChannel | null = null;
let ordersChannel: RealtimeChannel | null = null;
let customerOrderChannel: RealtimeChannel | null = null;

/**
 * Suscribe a las notificaciones globales del negocio (Dashboard).
 * Solo se abre UNA conexión por negocio en todo el dashboard.
 */
export function subscribeToNotifications(businessId: string, callback: SubscriptionCallback<any>) {
  if (notificationsChannel) {
    unsubscribeFromNotifications();
  }

  const supabase = createClient();
  
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
          callback(payload.new);
        }
      }
    )
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Error en canal Realtime de notificaciones:', err);
      }
    });

  return notificationsChannel;
}

export function unsubscribeFromNotifications() {
  if (notificationsChannel) {
    notificationsChannel.unsubscribe();
    notificationsChannel = null;
  }
}

/**
 * Suscribe a los pedidos globales del negocio.
 * Se debe usar ÚNICAMENTE en la página /dashboard/orders.
 */
export function subscribeToOrders(businessId: string, callback: SubscriptionCallback<any>) {
  if (ordersChannel) {
    unsubscribeFromOrders();
  }

  const supabase = createClient();
  
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
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Error en canal Realtime de pedidos:', err);
      }
    });

  return ordersChannel;
}

export function unsubscribeFromOrders() {
  if (ordersChannel) {
    ordersChannel.unsubscribe();
    ordersChannel = null;
  }
}

/**
 * Suscribe a un pedido específico para la vista del cliente.
 * Se usa ÚNICAMENTE en la vista de seguimiento del cliente.
 */
export function subscribeToCustomerOrder(orderId: string, callback: SubscriptionCallback<any>) {
  if (customerOrderChannel) {
    unsubscribeFromCustomerOrder();
  }

  const supabase = createClient();
  
  customerOrderChannel = supabase
    .channel(`customer-order-channel-${orderId}`)
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
    .subscribe((status, err) => {
      if (status === 'CHANNEL_ERROR') {
        console.error('Error en canal Realtime de pedido del cliente:', err);
      }
    });

  return customerOrderChannel;
}

export function unsubscribeFromCustomerOrder() {
  if (customerOrderChannel) {
    customerOrderChannel.unsubscribe();
    customerOrderChannel = null;
  }
}
