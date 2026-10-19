'use client';

import React from 'react';
import { useCart } from './CartContext';
import { MapPin, Phone, Receipt, Edit2, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerInfoBadge({ orderMode }: { orderMode: string }) {
  const { customerInfo, isHydrated, setIsCustomerModalOpen, isTableFromUrl } = useCart();

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

  const isLockedTable = orderMode === 'table_number' && Boolean(isTableFromUrl || customerInfo?.isTableFromUrl);

  return (
    <button
      onClick={() => {
        if (isLockedTable) {
          toast.info(`Mesa ${customerInfo.tableNumber} asignada automáticamente por código QR.`);
          return;
        }
        setIsCustomerModalOpen(true);
      }}
      className={`fixed bottom-6 left-6 z-40 px-4 py-3 rounded-2xl flex items-center gap-3 transition-all animate-in fade-in slide-in-from-bottom-5 group border ${
        isLockedTable ? 'cursor-default' : 'cursor-pointer'
      }`}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isLockedTable ? 'rgba(16, 185, 129, 0.35)' : 'var(--border-color)',
        color: 'var(--text-primary)',
        boxShadow: 'var(--shadow-card)'
      }}
      title={isLockedTable ? 'Mesa asignada por código QR' : 'Cambiar información'}
    >
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: isLockedTable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.2)',
          color: isLockedTable ? '#10b981' : '#6366f1'
        }}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex flex-col items-start text-left">
        <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{displayLabel}</span>
        <span className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>{displayValue}</span>
      </div>
      {!isLockedTable ? (
        <div 
          className="ml-2 pl-2 border-l transition-colors flex items-center gap-1"
          style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
        >
          <Edit2 className="w-4 h-4" />
          <span className="text-xs">Cambiar</span>
        </div>
      ) : (
        <div 
          className="ml-2 pl-2 border-l transition-colors flex items-center gap-1 text-emerald-500"
          style={{ borderColor: 'rgba(16, 185, 129, 0.25)' }}
        >
          <Lock className="w-3.5 h-3.5" />
          <span className="text-xs font-semibold">QR Fija</span>
        </div>
      )}
    </button>
  );
}
