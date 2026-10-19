import { SupabaseClient } from '@supabase/supabase-js';
import { MaxiRestSpooler } from './spooler';
import { logger } from './logger';

export class OrderListener {
  private supabase: SupabaseClient;
  private businessId: string;
  private spooler: MaxiRestSpooler;
  private channel: any = null;

  constructor(supabase: SupabaseClient, businessId: string, spooler: MaxiRestSpooler) {
    this.supabase = supabase;
    this.businessId = businessId;
    this.spooler = spooler;
  }

  public start() {
    logger.realtime(`Conectando a Supabase Realtime para el negocio ${this.businessId}...`);

    this.channel = this.supabase
      .channel(`maxirest-orders-${this.businessId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `business_id=eq.${this.businessId}`,
        },
        async (payload: any) => {
          await this.handleOrderUpdate(payload.new, payload.old);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          logger.success(`Conexión Realtime activa. Esperando comandas de mesas...`);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          logger.warn(`Canal Realtime cerrado o con error (${status}). Reconectando automáticamente...`);
        }
      });
  }

  public stop() {
    if (this.channel) {
      this.supabase.removeChannel(this.channel);
      this.channel = null;
    }
  }

  private async handleOrderUpdate(newOrder: any, oldOrder?: any) {
    const status = (newOrder.status || '').toLowerCase();
    const oldStatus = (oldOrder?.status || '').toLowerCase();

    // Solo procesar si el estado cambió
    if (status === oldStatus && oldOrder) return;

    const orderId = newOrder.id;
    const tableDisplay = this.extractTable(newOrder);
    const waiter = this.extractWaiter(newOrder.comments);

    logger.info(`Evento en comanda #${orderId.slice(0, 8)} (${tableDisplay}): Estado '${oldStatus || 'previo'}' ➔ '${status}'`);

    // 1. Estado ACEPTADO: Mozo aceptó pedido -> Abre mesa en adición de MaxiRest
    if (status === 'accepted') {
      await this.processOpenTable(newOrder, tableDisplay, waiter);
    }

    // 2. Estado PREPARANDO: Cocina/Mozo presiona "Comenzar a preparar" -> Marcha comanda e imprime
    else if (status === 'preparing') {
      this.spooler.writeMarchar(orderId, tableDisplay, 'COCINA_BARRA');
    }

    // 3. Estado PAGADO: Mozo cobró o cliente pagó con Mercado Pago -> Asienta pago en MaxiRest
    else if (status === 'paid') {
      const paymentMethod = newOrder.payment_id || newOrder.payment_method || 'EFECTIVO/DIGITAL';
      this.spooler.writePaid(orderId, tableDisplay, newOrder.total, paymentMethod);
    }
  }

  private async processOpenTable(order: any, tableDisplay: string, waiter: { name: string; code: string }) {
    try {
      // Obtener los ítems del pedido con sus observaciones
      const { data: items, error } = await this.supabase
        .from('order_items')
        .select(`
          id,
          product_id,
          quantity,
          unit_price,
          observations,
          products (name)
        `)
        .eq('order_id', order.id);

      if (error) {
        logger.error(`No se pudieron obtener los ítems del pedido ${order.id}: ${error.message}`);
        return;
      }

      const spoolerItems = (items || []).map((it: any) => ({
        id_articulo: it.product_id,
        nombre: it.products?.name || 'Artículo',
        cantidad: it.quantity,
        precio_unitario: it.unit_price,
        observaciones: it.observations || '',
      }));

      this.spooler.writeOpenTable({
        orderId: order.id,
        tableNumber: tableDisplay,
        waiterName: waiter.name,
        waiterCode: waiter.code,
        items: spoolerItems,
        total: order.total,
        customerName: order.customer_first_name || '',
        comments: order.comments || '',
      });
    } catch (err: any) {
      logger.error(`Error al procesar apertura de mesa para ${order.id}: ${err.message}`, err);
    }
  }

  private extractTable(order: any): string {
    if (order.customer_identifier) {
      return order.customer_identifier.replace(/^mesa\s*/i, '').trim() || '1';
    }
    return '1';
  }

  private extractWaiter(comments?: string): { name: string; code: string } {
    if (!comments) return { name: 'General', code: '1' };
    const match = comments.match(/\[Mozo:\s*([^\]]+)\]/i);
    if (match && match[1]) {
      const name = match[1].trim();
      return { name, code: '1' };
    }
    return { name: 'General', code: '1' };
  }
}
