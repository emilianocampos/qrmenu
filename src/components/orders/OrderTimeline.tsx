'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCustomerOrder, unsubscribeFromCustomerOrder } from '@/lib/realtime';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Receipt, Ban, CreditCard, Loader2 } from 'lucide-react';
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

  useEffect(() => {
    // Solo suscribirse a este pedido específico
    subscribeToCustomerOrder(order.id, (payload) => {
      // Actualizamos solo el estado y timestamp para que la UI reaccione rápidamente
      setOrder((prev: any) => ({ ...prev, ...payload }));
      
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
      <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-8 text-center mt-8 animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <Ban className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Pedido Cancelado</h2>
        <p className="text-red-400/80">Lo sentimos, el local ha cancelado este pedido. Acércate a la caja para más información.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 sm:p-8 mt-4 shadow-xl">
      <h2 className="text-lg font-bold text-white mb-8 border-b border-white/10 pb-4 flex items-center justify-between">
        <span>Estado de tu pedido</span>
        {isPaid && (
          <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
          </span>
        )}
      </h2>

      {/* Botón destacado de Pago con Mercado Pago si ya está Entregado */}
      {order.status === 'delivered' && !isPaid && (
        <div className="mb-8 p-5 bg-gradient-to-r from-blue-900/40 via-sky-900/40 to-indigo-900/40 border border-sky-500/30 rounded-2xl text-center space-y-3 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-12 h-12 bg-sky-500/20 text-sky-400 rounded-full flex items-center justify-center mx-auto">
            <CreditCard className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">¡Tu pedido fue entregado!</h3>
          <p className="text-xs text-gray-300 max-w-sm mx-auto">
            Podés realizar el pago de tu consumición de forma rápida y segura a través de Mercado Pago.
          </p>
          <button
            onClick={handlePayMercadoPago}
            disabled={paying}
            className="w-full sm:w-auto px-6 py-3 bg-sky-500 hover:bg-sky-400 text-white font-black text-sm rounded-xl transition-all shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 mx-auto cursor-pointer"
          >
            {paying ? <><Loader2 className="w-4 h-4 animate-spin" /> Abriendo Mercado Pago...</> : <><CreditCard className="w-4 h-4" /> Pagar con Mercado Pago</>}
          </button>
        </div>
      )}

      {/* Cartel de Confirmación de Pago */}
      {isPaid && (
        <div className="mb-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-center space-y-2 animate-in fade-in duration-300">
          <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-emerald-400">¡Pedido Pagado Correctamente!</h3>
          <p className="text-xs text-gray-400">
            Hemos registrado tu pago. Gracias por tu visita.
          </p>
        </div>
      )}
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {STATUS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex || (step.id === 'paid' && isPaid);
          
          return (
            <div key={step.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              
              <div className={`flex items-center justify-center w-12 h-12 rounded-full border-4 shrink-0 z-10 transition-colors duration-500 ${
                isActive ? 'border-[#111] shadow-xl' :
                isCompleted ? 'border-[#111] bg-white/20' :
                'border-[#111] bg-[#1a1a1a] text-gray-600'
              }`}
              style={{
                backgroundColor: isActive ? primaryColor : undefined,
                color: isActive ? '#fff' : undefined,
                borderColor: isCompleted ? primaryColor : undefined,
              }}>
                {isCompleted ? (
                  <CheckCircle2 className={`w-5 h-5`} style={{ color: primaryColor }} />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className={`w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-4 rounded-xl transition-all duration-500 ${
                isActive ? 'bg-white/5 border border-white/10 translate-x-2 md:translate-x-0' : 'opacity-50'
              }`}>
                <h3 className={`font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {step.label}
                </h3>
                <p className="text-sm text-gray-500 mt-1">{step.description}</p>
              </div>
              
            </div>
          );
        })}
      </div>

      <div className="mt-12 pt-6 border-t border-white/5">
        <h3 className="font-bold text-white mb-4">Resumen</h3>
        <div className="space-y-3">
          {order.order_items?.map((item: any) => (
            <div key={item.id} className="flex justify-between items-start text-sm">
              <div className="flex gap-2">
                <span className="font-bold text-gray-400">{item.quantity}x</span>
                <span className="text-gray-300">{item.products?.name}</span>
              </div>
              <span className="text-gray-400">${item.unit_price}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/5 font-bold text-lg">
          <span className="text-white">Total</span>
          <span style={{ color: primaryColor }}>${order.total}</span>
        </div>
      </div>

      {/* Botón para volver al menú y realizar otro pedido */}
      <div className="mt-8 pt-6 border-t border-white/5 text-center">
        <a
          href={`/c/${order.businesses?.slug || ''}${order.customer_identifier ? `?table=${order.customer_identifier.replace(/\D/g, '')}` : ''}`}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10 shadow-lg text-sm cursor-pointer"
        >
          📖 Volver al Menú / Pedir algo más
        </a>
      </div>
    </div>
  );
}
