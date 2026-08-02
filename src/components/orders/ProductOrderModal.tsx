'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useCart } from './CartContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';

interface ProductOrderModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  currencySymbol: string;
}

export function ProductOrderModal({ product, isOpen, onClose, currencySymbol }: ProductOrderModalProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [observations, setObservations] = useState('');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      observations: observations.trim(),
      image_url: product.image_url || ''
    });
    
    toast.success('Producto agregado al pedido', {
      icon: '🛒'
    });
    
    setQuantity(1);
    setObservations('');
    onClose();
  };

  const formattedPrice = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price * quantity);

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md bg-[#111] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95">
        
        {/* Header / Image */}
        <div className="relative h-48 bg-[#1a1a1a] shrink-0">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-500 opacity-20" />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h2 className="text-2xl font-bold text-white leading-tight">{product.name}</h2>
          </div>
          
          {product.description && (
            <p className="text-gray-400 text-sm mb-6">{product.description}</p>
          )}

          <div className="space-y-6">
            {/* Aclaraciones */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aclaraciones o instrucciones especiales
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ej: Sin cebolla, extra de salsa..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
              />
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-gray-300 font-medium">Cantidad</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-[#1a1a1a] border border-white/10 text-white hover:bg-white/10 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 bg-[#151515] shrink-0">
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-between px-6 transition-colors shadow-lg shadow-indigo-500/20"
          >
            <span>Agregar al Pedido</span>
            <span className="bg-black/20 px-3 py-1 rounded-lg">
              {currencySymbol}{formattedPrice}
            </span>
          </button>
        </div>

      </div>
    </div>
  );
}
