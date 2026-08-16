'use client';

import React from 'react';
import { useRealtime } from '@/providers/RealtimeProvider';
import { markAsRead } from '@/actions/notifications';
import { Bell, CheckCircle2, MapPin, X, UtensilsCrossed } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';

export function WaiterCallModal({ businessId }: { businessId: string }) {
  const { notifications, markAsReadLocal, isWaiterModalOpen, setIsWaiterModalOpen } = useRealtime();
  const router = useRouter();

  // Filtrar solo las notificaciones de llamado a mozo no leídas
  const unreadWaiterCalls = notifications.filter(n => !n.read && n.type === 'waiter_call');

  if (!isWaiterModalOpen || unreadWaiterCalls.length === 0) {
    return null;
  }

  const handleAttend = async (id: string) => {
    markAsReadLocal(id);
    await markAsRead(id, businessId);
    if (unreadWaiterCalls.length <= 1) {
      setIsWaiterModalOpen(false);
    }
  };

  const handleAttendAll = async () => {
    for (const call of unreadWaiterCalls) {
      markAsReadLocal(call.id);
      await markAsRead(call.id, businessId);
    }
    setIsWaiterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#121212] border border-orange-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-orange-500/20 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Línea superior con gradiente resplandeciente */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 animate-pulse" />

        {/* Botón para cerrar / minimizar */}
        <button
          onClick={() => setIsWaiterModalOpen(false)}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Minimizar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Bell className="w-8 h-8 text-orange-400" />
          </div>

          <h2 className="text-2xl font-black text-white tracking-wide">
            {unreadWaiterCalls.length === 1 ? '¡Llamado de Mozo!' : `¡${unreadWaiterCalls.length} Llamados de Mozo!`}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            Un cliente solicita atención presencial en el local
          </p>
        </div>

        {/* Lista de llamados de mozo */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 my-4">
          {unreadWaiterCalls.map((call) => (
            <div 
              key={call.id}
              className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4 hover:border-orange-500/30 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-base text-white truncate">
                    {call.description || call.title}
                  </h4>
                  <p className="text-xs text-gray-400" suppressHydrationWarning>
                    {formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: es })}
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleAttend(call.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-emerald-600/20 shrink-0 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Atendido</span>
              </button>
            </div>
          ))}
        </div>

        {/* Botones de acción inferiores */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          {unreadWaiterCalls.length > 1 && (
            <button
              onClick={handleAttendAll}
              className="w-full sm:flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Todos Atendidos</span>
            </button>
          )}

          <button
            onClick={() => {
              setIsWaiterModalOpen(false);
              router.push('/mesas');
            }}
            className="w-full sm:flex-1 py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-white/10 cursor-pointer"
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Ir a Mesas</span>
          </button>
        </div>

      </div>
    </div>
  );
}
