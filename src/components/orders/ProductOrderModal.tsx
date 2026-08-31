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
  const [detail, setDetail] = useState('');
  const [addition, setAddition] = useState('');

  if (!isOpen) return null;

  const handleAddToCart = () => {
    const parts: string[] = [];
    if (detail.trim()) parts.push(`Detalle: ${detail.trim()}`);
    if (addition.trim()) parts.push(`Adición: ${addition.trim()}`);
    const observations = parts.join(' | ');

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      detail: detail.trim(),
      addition: addition.trim(),
      observations,
      image_url: product.image_url || ''
    });
    
    toast.success('Producto agregado al pedido', {
      icon: '🛒'
    });
    
    setQuantity(1);
    setDetail('');
    setAddition('');
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
        <div className="relative h-44 shrink-0" style={{ backgroundColor: 'var(--bg-page)' }}>
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
        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <h2 className="text-xl font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{product.name}</h2>
            {product.description && (
              <p className="text-xs mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{product.description}</p>
            )}
          </div>

          {/* Form Fields: Detalle & Adición */}
          <div className="space-y-3.5 pt-1">
            {/* Detalle */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span>📝</span>
                  <span>Detalle (Aclaraciones)</span>
                </label>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Opcional</span>
              </div>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                placeholder="Ej: Sin hielo, sin cebolla, punto de cocción..."
                rows={2}
                className="w-full rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none border transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Adición */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                  <span>➕</span>
                  <span>Adicional (Adición)</span>
                </label>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Opcional</span>
              </div>
              <textarea
                value={addition}
                onChange={(e) => setAddition(e.target.value)}
                placeholder="Ej: Con limón, extra queso cheddar, doble salsa..."
                rows={2}
                className="w-full rounded-xl px-3.5 py-2 text-xs focus:ring-2 focus:ring-indigo-500 outline-none resize-none border transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Quantity */}
            <div 
              className="flex items-center justify-between p-3 rounded-xl border"
              style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)' }}
            >
              <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Cantidad</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-base font-bold w-6 text-center" style={{ color: 'var(--text-primary)' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border transition-colors cursor-pointer"
                  style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}
                >
                  <Plus className="w-3.5 h-3.5" />
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
