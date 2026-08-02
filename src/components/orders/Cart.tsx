'use client';

import React, { useState } from 'react';
import { useCart } from './CartContext';
import { ShoppingBag, X, Plus, Minus, Check, Trash2, ArrowRight } from 'lucide-react';
import { createOrder } from '@/actions/orders';
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

      // Set table identifier string based on mode
      let identifier = '';
      if (orderMode === 'table_number') identifier = customerInfo.tableNumber;
      if (orderMode === 'table_code') identifier = customerInfo.tableCode;
      if (orderMode === 'takeaway') identifier = `${customerInfo.name} - ${customerInfo.phone}`;
      if (orderMode === 'comanda') identifier = customerInfo.comanda;

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
      <div className="relative w-full max-w-md bg-[#111] h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-indigo-400" />
            Tu Pedido
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-500">
              <ShoppingBag className="w-12 h-12 mb-4 opacity-30" />
              <p>Tu carrito está vacío</p>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={`${item.productId}-${index}`} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5">
                  <div className="w-20 h-20 bg-[#1a1a1a] rounded-xl overflow-hidden shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.image_url || '/placeholder.png'} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <div className="flex justify-between items-start gap-2">
                      <h3 className="font-semibold text-white leading-tight">{item.name}</h3>
                      <button 
                        onClick={() => removeItem(item.productId, item.observations)}
                        className="text-gray-500 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {item.observations && (
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.observations}</p>
                    )}
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <span className="font-bold text-indigo-400">${item.price}</span>
                      
                      <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-lg p-1 border border-white/5">
                        <button 
                          onClick={() => updateQuantity(item.productId, item.observations, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-sm font-semibold w-4 text-center text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.productId, item.observations, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 text-white"
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
          <div className="p-5 border-t border-white/10 bg-[#151515]">
            <div className="flex items-center justify-between mb-4">
              <span className="text-gray-400">Total</span>
              <span className="text-2xl font-black text-white">${total}</span>
            </div>
            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
