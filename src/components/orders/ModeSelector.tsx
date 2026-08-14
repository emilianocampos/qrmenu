'use client';

import React, { useState } from 'react';
import { updateOrderMode } from '@/actions/settings';
import { toast } from 'sonner';
import { BookOpen, UtensilsCrossed, KeySquare, ShoppingBag, Receipt, Lock } from 'lucide-react';

interface ModeSelectorProps {
  businessId: string;
  initialMode: string;
}

const MODES = [
  {
    id: 'menu_only',
    name: 'Solo Carta',
    icon: BookOpen,
    description: 'Los clientes solo podrán ver el menú. Sin carrito ni pedidos.',
    disabled: false
  },
  {
    id: 'table_number',
    name: 'Número de Mesa',
    icon: UtensilsCrossed,
    description: 'Se solicitará un número de mesa al cliente antes de pedir.',
    disabled: false
  },
  {
    id: 'table_code',
    name: 'Código de Mesa',
    icon: KeySquare,
    description: 'Se solicitará ingresar o escanear el código único de la mesa.',
    disabled: false
  },
  {
    id: 'takeaway',
    name: 'Take Away',
    icon: ShoppingBag,
    description: 'Para retirar en el local. Solicita nombre y teléfono.',
    disabled: true
  },
  {
    id: 'comanda',
    name: 'Comanda',
    icon: Receipt,
    description: 'Solicita un número de comanda impreso.',
    disabled: true
  }
];

export function ModeSelector({ businessId, initialMode }: ModeSelectorProps) {
  const [currentMode, setCurrentMode] = useState(initialMode || 'menu_only');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSelect = async (mode: typeof MODES[0]) => {
    if (mode.disabled) {
      toast.info('Esta opción estará disponible próximamente.');
      return;
    }
    if (mode.id === currentMode) return;

    setLoading(mode.id);
    try {
      const res = await updateOrderMode(businessId, mode.id);
      if (res.error) throw new Error(res.error);

      setCurrentMode(mode.id);
      toast.success('Modo de pedidos actualizado correctamente.');
    } catch (error) {
      toast.error('Error al actualizar el modo de pedidos.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MODES.map(mode => {
        const Icon = mode.icon;
        const isActive = currentMode === mode.id;
        const isLoading = loading === mode.id;
        const isDisabled = mode.disabled;

        return (
          <div
            key={mode.id}
            onClick={() => handleSelect(mode)}
            className={`relative p-5 rounded-xl border transition-all overflow-hidden select-none
              ${isDisabled
                ? 'bg-white/[0.02] border-white/5 opacity-50 cursor-not-allowed'
                : isActive
                  ? 'bg-indigo-500/10 border-indigo-500 shadow-lg shadow-indigo-500/5 cursor-pointer'
                  : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 cursor-pointer'
              }
              ${isLoading ? 'opacity-70 pointer-events-none' : ''}
            `}
          >
            {isDisabled && (
              <div className="absolute top-2 right-2 flex items-center gap-1 text-[10px] font-semibold bg-amber-500/10 border border-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                <Lock className="w-3 h-3" />
                Próximamente
              </div>
            )}

            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${isActive ? 'bg-indigo-500 text-white' : isDisabled ? 'bg-white/5 text-gray-500' : 'bg-white/10 text-gray-300'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 pr-6">
                <h3 className={`font-semibold text-sm ${isActive ? 'text-indigo-400' : isDisabled ? 'text-gray-500' : 'text-white'}`}>
                  {mode.name}
                </h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {mode.description}
                </p>
              </div>
            </div>

            {isActive && !isDisabled && (
              <div className="absolute top-2 right-2 flex items-center justify-center w-5 h-5 bg-indigo-500 rounded-full">
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
