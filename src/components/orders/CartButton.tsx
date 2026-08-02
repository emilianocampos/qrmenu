'use client';

import React from 'react';
import { useCart } from './CartContext';
import { ShoppingBag } from 'lucide-react';

export function CartButton() {
  const { items, setIsOpen, total } = useCart();
  
  if (items.length === 0) return null;

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 z-40 bg-indigo-600 hover:bg-indigo-500 text-white p-4 rounded-full shadow-2xl flex items-center gap-3 transition-transform hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="relative">
        <ShoppingBag className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-indigo-600">
          {totalItems}
        </span>
      </div>
      <span className="font-bold border-l border-white/20 pl-3">
        ${total}
      </span>
    </button>
  );
}
