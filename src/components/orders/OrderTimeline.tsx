'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCustomerOrder, unsubscribeFromCustomerOrder } from '@/lib/realtime';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Receipt, Ban, CreditCard, Loader2, X, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface OrderTimelineProps {
  initialOrder: any;
  primaryColor: string;
}

const STATUS_STEPS = [
  { id: 'pending', label: 'Enviado', description: 'Esperando confirmación', icon: Clock },
  { id: 'accepted', label: 'Aceptado', description: 'El local recibió tu pedido', icon: Receipt },
  { id: 'preparing', label: 'Preparando', description: 'Tus productos están en marcha', icon: ChefHat },
  { id: 'ready', label: 'Listo', description: 'Tu pedido está listo para entregar', icon: CheckCircle2 },
  { id: 'delivered', label: 'Entregado', description: '¡Que lo disfrutes!', icon: PackageCheck },
  { id: 'paid', label: 'Pagado', description: '¡Pago recibido con éxito!', icon: CreditCard }
];

export function OrderTimeline({ initialOrder, primaryColor }: OrderTimelineProps) {
  const [order, setOrder] = useState<any>(initialOrder);
  const [paying, setPaying] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(
    initialOrder.status === 'delivered' && !(initialOrder.status === 'paid' || initialOrder.payment_status === 'approved')
  );

  const handleShareOrderStatus = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = `Seguimiento de mi pedido en ${order.businesses?.name || 'Local'}`;
    const text = `Mirá el estado de nuestro pedido en tiempo real 🍽️`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(url);
      toast.success('¡Enlace del pedido copiado al portapapeles! 📋');
    } catch {
      toast.error('No se pudo copiar el enlace');
    }
  };

  useEffect(() => {
    // Solo suscribirse a este pedido específico
    subscribeToCustomerOrder(order.id, (payload) => {
      // Actualizamos solo el estado y timestamp para que la UI reaccione rápidamente
      setOrder((prev: any) => ({ ...prev, ...payload }));

      if (payload.status === 'delivered') {
        setIsPayModalOpen(true);
      }
      
      const step = STATUS_STEPS.find(s => s.id === payload.status);
      if (step) {
        toast(step.label, {
          icon: '✅',
          description: step.description,
        });
        
        // Vibration and sound feedback for customer
        try {
          const audio = new Audio('/sounds/universfield-new-notification-036-485897.mp3');
          audio.play().catch(() => {});
          if (navigator.vibrate) navigator.vibrate([200]);
        } catch {}
      }
    });

    return () => {
      unsubscribeFromCustomerOrder();
    };
  }, [order.id]);

  const handlePayMercadoPago = async () => {
    setPaying(true);
    try {
      const res = await fetch('/api/mercadopago/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al iniciar pago');
      }

      // Redirigir a Mercado Pago
      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        toast.error('No se pudo obtener el link de pago');
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar pago con Mercado Pago');
    } finally {
      setPaying(false);
    }
  };

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);
  const isPaid = order.status === 'paid' || order.payment_status === 'approved';

  if (order.status === 'cancelled') {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center mt-8 animate-in zoom-in-95 duration-500" style={{ boxShadow: 'var(--shadow-card)' }}>
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Pedido Cancelado</h2>
        <p style={{ color: 'var(--text-muted)' }}>Lo sentimos, el local ha cancelado este pedido. Acércate a la caja para más información.</p>
      </div>
    );
  }

  return (
    <>
      {/* Modal Emergente de Pago con Mercado Pago al Entregar */}
      {isPayModalOpen && order.status === 'delivered' && !isPaid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-300">
          <div 
            className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 text-center border overflow-hidden animate-in zoom-in-95 duration-300"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)',
            }}
          >
            {/* Línea de resplandor superior */}
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-500 via-blue-400 to-sky-500 animate-pulse" />

            {/* Botón de cerrar */}
            <button
              onClick={() => setIsPayModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors cursor-pointer"
              style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
              title="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full bg-sky-500/20 text-sky-500 border border-sky-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CreditCard className="w-8 h-8 text-sky-500" />
            </div>

            <h2 className="text-2xl font-black tracking-wide" style={{ color: 'var(--text-primary)' }}>
              ¡Tu pedido fue entregado!
            </h2>
            <p className="text-sm mt-2 max-w-xs mx-auto" style={{ color: 'var(--text-muted)' }}>
              Podés realizar el pago de tu consumición de forma rápida y segura a través de Mercado Pago.
            </p>

            <div 
              className="my-6 p-4 border rounded-2xl flex items-center justify-between"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Total a Pagar</span>
              <span className="text-xl font-black" style={{ color: primaryColor }}>${order.total}</span>
            </div>

            <div className="space-y-3">
              <button
                onClick={handlePayMercadoPago}
                disabled={paying}
                className="w-full py-3.5 bg-sky-500 hover:bg-sky-400 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {paying ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Abriendo Mercado Pago...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Pagar con Mercado Pago</>
                )}
              </button>

              <button
                onClick={() => setIsPayModalOpen(false)}
                className="w-full text-center text-xs py-2 transition-colors cursor-pointer"
                style={{ color: 'var(--text-muted)' }}
              >
                Pagaré en efectivo / en el local
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-3xl p-6 sm:p-8 mt-4 border transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}>
        <h2 className="text-lg font-bold mb-8 pb-4 flex items-center justify-between gap-2" style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
          <span>Estado de tu pedido</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShareOrderStatus}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border flex items-center gap-1.5 transition-all cursor-pointer hover:opacity-80"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
              title="Compartir Estado del Pedido"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir</span>
            </button>
            {isPaid && (
              <span className="text-xs bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1 font-semibold shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
              </span>
            )}
          </div>
        </h2>



      {/* Cartel de Confirmación de Pago */}
      {isPaid && (
        <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-500">¡Pedido Pagado Correctamente!</h3>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Hemos registrado tu pago. Gracias por tu visita.
          </p>
        </div>
      )}
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[var(--border-color)] before:to-transparent">
        {STATUS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex || (step.id === 'paid' && isPaid);
          
          return (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className="flex items-center justify-center w-12 h-12 rounded-full border-4 shrink-0 z-10 transition-colors duration-500"
              style={{
                backgroundColor: isActive ? primaryColor : isCompleted ? 'var(--bg-card)' : 'var(--bg-page)',
                color: isActive ? '#fff' : isCompleted ? primaryColor : 'var(--text-faint)',
                borderColor: isActive ? 'var(--bg-card)' : isCompleted ? primaryColor : 'var(--border-color)',
                boxShadow: isActive ? 'var(--shadow-card)' : 'none'
              }}>
                {isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" style={{ color: primaryColor }} />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div 
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl transition-all duration-500 border ${
                  isActive ? 'translate-x-2 md:translate-x-0' : 'opacity-50'
                }`}
                style={{
                  backgroundColor: isActive ? 'var(--bg-card-hover)' : 'transparent',
                  borderColor: isActive ? 'var(--border-color)' : 'transparent',
                  boxShadow: isActive ? 'var(--shadow-card)' : 'none',
                }}
              >
                <h3 className="font-bold" style={{ color: isActive ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {step.label}
                </h3>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{step.description}</p>
              </div>
              
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-6" style={{ borderTop: '1px solid var(--border-color)' }}>
        <h3 className="font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Resumen</h3>
        <div className="space-y-3">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <div className="flex gap-2">
                <span className="font-bold" style={{ color: 'var(--text-muted)' }}>{item.quantity}x</span>
                <span style={{ color: 'var(--text-primary)' }}>{item.products?.name}</span>
              </div>
              <span style={{ color: 'var(--text-muted)' }}>${item.unit_price}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 font-bold text-lg" style={{ borderTop: '1px solid var(--border-color)' }}>
          <span style={{ color: 'var(--text-primary)' }}>Total</span>
          <span style={{ color: primaryColor }}>${order.total}</span>
        </div>
      </div>

      {/* Botón para volver al menú y realizar otro pedido */}
      <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid var(--border-color)' }}>
        <a
          href={`/c/${order.businesses?.slug || ''}${order.customer_identifier ? `?table=${order.customer_identifier.replace(/\D/g, '')}` : ''}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 font-bold rounded-2xl transition-all border text-sm cursor-pointer"
          style={{
            backgroundColor: 'var(--bg-card-hover)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          📖 Volver al Menú / Pedir algo más
        </a>
      </div>
    </div>
    </>
  );
}
