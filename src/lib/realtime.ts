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
    // Si ya existe, nos desuscribimos primero para evitar duplicados
    unsubscribeFromNotifications();
  }

  const supabase = createClient();
  
  notificationsChannel = supabase
    .channel(`notifications:business_id=eq.${businessId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT', // Solo escuchamos nuevos inserts (o Updates si es necesario)
        schema: 'public',
        table: 'notifications',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'notifications',
        filter: `business_id=eq.${businessId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

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
    .channel(`orders:business_id=eq.${businessId}`)
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
    .subscribe();

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
    .channel(`orders:id=eq.${orderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE', // Al cliente solo le importan los cambios de estado
        schema: 'public',
        table: 'orders',
        filter: `id=eq.${orderId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return customerOrderChannel;
}

export function unsubscribeFromCustomerOrder() {
  if (customerOrderChannel) {
    customerOrderChannel.unsubscribe();
    customerOrderChannel = null;
  }
}
