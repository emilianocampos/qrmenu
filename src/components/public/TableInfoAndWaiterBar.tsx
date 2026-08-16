'use client';

import React, { useState } from 'react';
import { useCart } from '@/components/orders/CartContext';
import { MapPin, Edit2, Bell, Check, Loader2 } from 'lucide-react';
import { callWaiterAction } from '@/actions/notifications';
import { toast } from 'sonner';

interface TableInfoAndWaiterBarProps {
  businessId: string;
  orderMode: string;
}

export function TableInfoAndWaiterBar({ businessId, orderMode }: TableInfoAndWaiterBarProps) {
  const { customerInfo, isHydrated, setIsCustomerModalOpen } = useCart();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isHydrated || orderMode === 'menu_only') return null;

  let displayValue = '';
  const currentTable = customerInfo?.tableNumber || (typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('table') || new URLSearchParams(window.location.search).get('mesa')) : null);

  if (currentTable) {
    displayValue = `Mesa ${currentTable}`;
  } else if (orderMode === 'takeaway' && customerInfo?.name) {
    displayValue = `Retira: ${customerInfo.name}`;
  } else if (orderMode === 'comanda' && customerInfo?.comanda) {
    displayValue = `Comanda #${customerInfo.comanda}`;
  }

  const handleCallWaiter = async () => {
    setLoading(true);
    try {
      const tableDisplay = displayValue || 'Mesa del Cliente';
      const res = await callWaiterAction(businessId, tableDisplay);
      if (res.error) throw new Error(res.error);

      setSent(true);
      toast.success('El mozo ha sido notificado.');
      setTimeout(() => setSent(false), 5000);
    } catch {
      toast.error('Error al llamar al mozo. Intentá nuevamente.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  const isTableMode = orderMode === 'table_number' || !!currentTable;

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Table Badge */}
      {displayValue ? (
        <div 
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold border"
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-card)'
          }}
        >
          <MapPin className="w-4 h-4 text-indigo-500" />
          <span>{displayValue}</span>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="ml-1 text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
            style={{ color: 'var(--text-muted)' }}
            title="Cambiar mesa"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer shadow-sm"
        >
          <MapPin className="w-4 h-4" />
          <span>Ingresar Mesa</span>
        </button>
      )}

      {/* Button Llamar al Mozo */}
      {isTableMode && (
        <button
          onClick={() => setConfirmOpen(true)}
          disabled={sent}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
            sent
              ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20'
          }`}
        >
          {sent ? (
            <>
              <Check className="w-4 h-4" />
              <span>Mozo avisado</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4" />
              <span>Llamar al mozo</span>
            </>
          )}
        </button>
      )}

      {/* Diálogo de Confirmación para Llamar al Mozo */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div 
            className="rounded-2xl p-6 max-w-sm w-full text-center space-y-4 border"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            <div className="w-14 h-14 rounded-full bg-orange-500/15 text-orange-500 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              ¿Querés llamar al mozo?
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Se enviará un aviso inmediato al personal de atención para asistirte en {displayValue || 'tu mesa'}.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all border cursor-pointer"
                style={{ backgroundColor: 'var(--bg-page)', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCallWaiter}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
