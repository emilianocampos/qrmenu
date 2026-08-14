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
  if (orderMode === 'table_number' && customerInfo.tableNumber) {
    displayValue = `Mesa ${customerInfo.tableNumber}`;
  } else if (orderMode === 'table_code' && customerInfo.tableCode) {
    displayValue = `Mesa ${customerInfo.tableCode}`;
  } else if (orderMode === 'takeaway' && customerInfo.name) {
    displayValue = `Retira: ${customerInfo.name}`;
  } else if (orderMode === 'comanda' && customerInfo.comanda) {
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

  const isTableMode = orderMode === 'table_number' || orderMode === 'table_code';

  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
      {/* Table Badge */}
      {displayValue ? (
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-white">
          <MapPin className="w-4 h-4 text-indigo-400" />
          <span>{displayValue}</span>
          <button
            onClick={() => setIsCustomerModalOpen(true)}
            className="ml-1 text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
            title="Cambiar mesa"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cambiar</span>
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsCustomerModalOpen(true)}
          className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold hover:bg-indigo-500/20 transition-all cursor-pointer"
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
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
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
          <div className="bg-[#161616] border border-white/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-full bg-orange-500/15 text-orange-500 flex items-center justify-center mx-auto">
              <Bell className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold text-white">
              ¿Querés llamar al mozo?
            </h3>
            <p className="text-sm text-gray-400">
              Se enviará un aviso inmediato al personal de atención para asistirte en {displayValue || 'tu mesa'}.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-white font-semibold text-sm transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleCallWaiter}
                disabled={loading}
                className="flex-1 py-2.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2"
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
