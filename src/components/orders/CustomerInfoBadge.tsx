'use client';

import React from 'react';
import { useCart } from './CartContext';
import { MapPin, Phone, Receipt, Edit2 } from 'lucide-react';

export function CustomerInfoBadge({ orderMode }: { orderMode: string }) {
  const { customerInfo, isHydrated, setIsCustomerModalOpen } = useCart();

  if (!isHydrated || orderMode === 'menu_only') return null;

  let displayLabel = '';
  let displayValue = '';
  let Icon = MapPin;

  if (orderMode === 'table_number' && customerInfo.tableNumber) {
    displayLabel = 'Mesa';
    displayValue = customerInfo.tableNumber;
    Icon = MapPin;
  } else if (orderMode === 'table_code' && customerInfo.tableCode) {
    displayLabel = 'Código';
    displayValue = customerInfo.tableCode;
    Icon = MapPin;
  } else if (orderMode === 'takeaway' && customerInfo.name) {
    displayLabel = 'Retira';
    displayValue = customerInfo.name;
    Icon = Phone;
  } else if (orderMode === 'comanda' && customerInfo.comanda) {
    displayLabel = 'Comanda';
    displayValue = customerInfo.comanda;
    Icon = Receipt;
  } else {
    return null;
  }

  return (
    <button
      onClick={() => setIsCustomerModalOpen(true)}
      className="fixed bottom-6 left-6 z-40 px-4 py-3 rounded-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 group cursor-pointer border"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-card)'
      }}
    >
      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-500 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{displayLabel}</span>
        <span className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{displayValue}</span>
      </div>
      <div 
        className="ml-2 pl-2 border-l transition-colors flex items-center gap-1"
        style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
      >
        <Edit2 className="w-4 h-4" />
        <span className="text-xs">Cambiar</span>
      </div>
    </button>
  );
}
