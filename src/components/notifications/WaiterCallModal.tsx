'use client';

import React from 'react';
import { useRealtime } from '@/providers/RealtimeProvider';
import { markAsRead } from '@/actions/notifications';
import { Bell, CheckCircle2, MapPin, X, UtensilsCrossed, CreditCard } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { stopNotificationSound } from '@/lib/soundPlayer';

export function WaiterCallModal({ businessId }: { businessId: string }) {
  const { notifications, markAsReadLocal, isWaiterModalOpen, setIsWaiterModalOpen } = useRealtime();
  const router = useRouter();

  // Filtrar notificaciones de llamado a mozo o pedido de cuenta no leídas
  const unreadAlerts = notifications.filter(
    n => !n.read && (n.type === 'waiter_call' || n.type === 'bill_request')
  );

  if (!isWaiterModalOpen || unreadAlerts.length === 0) {
    return null;
  }

  const hasBillRequests = unreadAlerts.some(n => n.type === 'bill_request');

  const handleAttend = async (id: string) => {
    markAsReadLocal(id);
    await markAsRead(id, businessId);
    if (unreadAlerts.length <= 1) {
      stopNotificationSound();
      setIsWaiterModalOpen(false);
    }
  };

  const handleAttendAll = async () => {
    stopNotificationSound();
    for (const call of unreadAlerts) {
      markAsReadLocal(call.id);
      await markAsRead(call.id, businessId);
    }
    setIsWaiterModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`relative w-full max-w-lg bg-[#121212] border rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${
        hasBillRequests 
          ? 'border-emerald-500/40 shadow-emerald-500/20' 
          : 'border-orange-500/40 shadow-orange-500/20'
      }`}>
        
        {/* Línea superior con gradiente resplandeciente */}
        <div className={`absolute top-0 inset-x-0 h-1.5 animate-pulse ${
          hasBillRequests 
            ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500' 
            : 'bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500'
        }`} />

        {/* Botón para cerrar / minimizar */}
        <button
          onClick={() => {
            stopNotificationSound();
            setIsWaiterModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          title="Minimizar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon & Title */}
        <div className="text-center mb-6">
          <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto mb-4 animate-bounce ${
            hasBillRequests
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              : 'bg-orange-500/20 text-orange-400 border-orange-500/30'
          }`}>
            {hasBillRequests ? (
              <CreditCard className="w-8 h-8 text-emerald-400" />
            ) : (
              <Bell className="w-8 h-8 text-orange-400" />
            )}
          </div>

          <h2 className="text-2xl font-black text-white tracking-wide">
            {unreadAlerts.length === 1
              ? (unreadAlerts[0].type === 'bill_request' ? '¡Mesa pide la Cuenta!' : '¡Llamado de Mozo!')
              : `¡${unreadAlerts.length} Avisos de Mesas!`}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {hasBillRequests 
              ? 'Hay mesas solicitando la cuenta o asistencia presencial' 
              : 'Un cliente solicita asistencia presencial en el local'}
          </p>
        </div>

        {/* Lista de llamados y pedidos de cuenta */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 my-4">
          {unreadAlerts.map((call) => {
            const isBill = call.type === 'bill_request';
            return (
              <div 
                key={call.id}
                className={`p-4 rounded-2xl flex items-center justify-between gap-4 transition-all border ${
                  isBill
                    ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                    : 'bg-white/5 border-white/10 hover:border-orange-500/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    isBill
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                      : 'bg-orange-500/15 text-orange-400 border-orange-500/20'
                  }`}>
                    {isBill ? <CreditCard className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full ${
                        isBill 
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                          : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      }`}>
                        {isBill ? 'Pide Cuenta' : 'Mozo'}
                      </span>
                      <h4 className="font-extrabold text-base text-white truncate">
                        {call.title}
                      </h4>
                    </div>
                    {call.description && (
                      <p className="text-xs text-gray-300 mt-0.5 font-medium">
                        {call.description}
                      </p>
                    )}
                    <p className="text-[11px] text-gray-500 mt-0.5" suppressHydrationWarning>
                      {formatDistanceToNow(new Date(call.created_at), { addSuffix: true, locale: es })}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleAttend(call.id)}
                  className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer ${
                    isBill
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                      : 'bg-orange-600 hover:bg-orange-500 text-white shadow-orange-600/25'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBill ? 'Cobrado' : 'Atendido'}</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Botones de acción inferiores */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
          {unreadAlerts.length > 1 && (
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
