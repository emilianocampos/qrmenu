'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToCustomerOrder, unsubscribeFromCustomerOrder } from '@/lib/realtime';
import { CheckCircle2, Clock, ChefHat, PackageCheck, Receipt, Ban } from 'lucide-react';
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
  { id: 'delivered', label: 'Entregado', description: '¡Que lo disfrutes!', icon: PackageCheck }
];

export function OrderTimeline({ initialOrder, primaryColor }: OrderTimelineProps) {
  const [order, setOrder] = useState<any>(initialOrder);

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
          const audio = new Audio('/sounds/notification.mp3');
          audio.play().catch(() => {});
          if (navigator.vibrate) navigator.vibrate([200]);
        } catch (e) {}
      }
    });

    return () => {
      unsubscribeFromCustomerOrder();
    };
  }, [order.id]);

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.id === order.status);

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
      <h2 className="text-lg font-bold text-white mb-8 border-b border-white/10 pb-4">
        Estado de tu pedido
      </h2>
      
      <div className="space-y-8 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        {STATUS_STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
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
    </div>
  );
}
