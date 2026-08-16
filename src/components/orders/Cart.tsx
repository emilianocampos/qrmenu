'use client';

import React, { useState } from 'react';
import { useCart } from './CartContext';
import { ShoppingBag, X, Plus, Minus, Check, Trash2, ArrowRight } from 'lucide-react';
import { createOrder } from '@/actions/orders';
import { addDailyStamp } from '@/actions/loyalty';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface CartProps {
  businessId: string;
  orderMode: string;
  businessSlug: string;
}

export function Cart({ businessId, orderMode, businessSlug }: CartProps) {
  const { items, removeItem, updateQuantity, total, isOpen, setIsOpen, clearCart, customerInfo, setLastOrderId } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const orderItems = items.map(i => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.price,
        observations: i.observations
      }));

      // Formatear el identificador de mesa o cliente
      let identifier = '';
      const tableVal = customerInfo?.tableNumber || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('table') || new URLSearchParams(window.location.search).get('mesa')) : null);

      if (tableVal) {
        identifier = tableVal.toString().toLowerCase().startsWith('mesa') ? tableVal : `Mesa ${tableVal}`;
      } else if (orderMode === 'takeaway') {
        identifier = `${customerInfo?.name || ''} - ${customerInfo?.phone || ''}`;
      } else if (orderMode === 'comanda') {
        identifier = `Comanda #${customerInfo?.comanda || ''}`;
      }

      const res = await createOrder({
        businessId,
        items: orderItems,
        total,
        customerFirstName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerIdentifier: identifier,
        tableDisplay: identifier,
        // Si tienes tableId real puedes enviarlo
      });

      if (res.error) throw new Error(res.error);

      // Intentar sumar sello de fidelización automático si hay email guardado en el navegador
      const savedLoyaltyEmail = localStorage.getItem(`loyalty_email_${businessId}`);
      if (savedLoyaltyEmail) {
        addDailyStamp(businessId, savedLoyaltyEmail).catch(() => {});
      }

      toast.success('¡Pedido enviado con éxito!');
      clearCart();
      setIsOpen(false);
      setLastOrderId(res.orderId);
      
      // Redirigir a mis-pedidos
      router.push(`/c/${businessSlug}/mis-pedidos?id=${res.orderId}`);
      
    } catch (error) {
      toast.error('Ocurrió un error al enviar el pedido');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      {/* Cart Panel */}
      <div 
        className="relative w-full max-w-md h-full flex flex-col animate-in slide-in-from-right duration-300"
        style={{
          backgroundColor: 'var(--bg-card)',
          color: 'var(--text-primary)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid var(--border-color)' }}>
          <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <ShoppingBag className="w-5 h-5 text-indigo-500" />
            Tu Pedido
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full transition-colors cursor-pointer"
            style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-muted)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center" style={{ color: 'var(--text-muted)' }}>
              <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div 
                  key={`${item.productId}-${index}`} 
                  className="flex gap-4 p-4 rounded-2xl border"
                  style={{
                    backgroundColor: 'var(--bg-page)',
                    borderColor: 'var(--border-color)',
                    boxShadow: 'var(--shadow-card)'
                  }}
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0" style={{ backgroundColor: 'var(--bg-card)' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.productId, item.observations)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.observations && (
                      <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{item.observations}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-bold text-indigo-500">${item.price}</span>
                      
                      <div 
                        className="flex items-center gap-3 rounded-lg p-1 border"
                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}
                      >
                        <button 
                          onClick={() => updateQuantity(item.productId, item.observations, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center" style={{ color: 'var(--text-primary)' }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.observations, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md transition-colors"
                          style={{ color: 'var(--text-primary)' }}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t" style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-color)' }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ color: 'var(--text-muted)' }}>Total</span>
              <span className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>${total}</span>
            </div>
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20 cursor-pointer"
            >
              {isSubmitting ? (
                'Enviando...'
              ) : (
                <>Enviar Pedido <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
