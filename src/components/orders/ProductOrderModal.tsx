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
      <div 
        className="relative w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-0 sm:zoom-in-95 border"
        style={{
          backgroundColor: 'var(--bg-card)',
          borderColor: 'var(--border-color)',
          color: 'var(--text-primary)',
          boxShadow: 'var(--shadow-modal)'
        }}
      >
        
        {/* Header / Image */}
        <div className="relative h-48 shrink-0" style={{ backgroundColor: 'var(--bg-page)' }}>
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-gray-400 opacity-30" />
            </div>
          )}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="flex justify-between items-start gap-4 mb-2">
            <h2 className="text-2xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>
          </div>
          
          {product.description && (
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
          )}

          <div className="space-y-6">
            {/* Aclaraciones */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-muted)' }}>
                Aclaraciones o instrucciones especiales
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Ej: Sin cebolla, extra de salsa..."
                className="w-full rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24 border"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Quantity */}
            <div 
              className="flex items-center justify-between p-4 rounded-2xl border"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              <span className="font-medium" style={{ color: 'var(--text-muted)' }}>Cantidad</span>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-xl font-bold w-8 text-center" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl border transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t shrink-0" style={{ backgroundColor: 'var(--bg-card-hover)', borderColor: 'var(--border-color)' }}>
          <button
            onClick={handleAddToCart}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-between px-6 transition-colors shadow-lg shadow-indigo-500/20 cursor-pointer"
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
