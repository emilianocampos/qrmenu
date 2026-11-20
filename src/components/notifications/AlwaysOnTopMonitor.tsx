'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRealtime } from '@/providers/RealtimeProvider';
import { markAsRead } from '@/actions/notifications';
import { approveStampRequest, rejectStampRequest } from '@/actions/loyalty';
import { stopNotificationSound } from '@/lib/soundPlayer';
import { Pin, CheckCircle2, XCircle, Bell, CreditCard, Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AlwaysOnTopMonitor({ businessId }: { businessId: string }) {
  const { notifications, markAsReadLocal, setIsWaiterModalOpen } = useRealtime();
  const [pipWindow, setPipWindow] = useState<Window | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const activeAlerts = notifications.filter(
    n =>
      !n.read &&
      (n.type === 'waiter_call' ||
        n.type === 'bill_request' ||
        n.type === 'stamp_request' ||
        n.type === 'loyalty_reward_reached' ||
        n.type === 'new_order')
  );

  // Cerrar PiP si se desmonta el componente
  useEffect(() => {
    return () => {
      if (pipWindow && !pipWindow.closed) {
        pipWindow.close();
      }
    };
  }, [pipWindow]);

  const toggleFloatingMonitor = async () => {
    if (pipWindow && !pipWindow.closed) {
      pipWindow.close();
      setPipWindow(null);
      return;
    }

    const win = window as any;
    if (!win.documentPictureInPicture?.requestWindow) {
      toast.info(
        'Tu navegador no soporta ventana flotante Siempre Visible. Usá Google Chrome o Microsoft Edge actualizados.',
        { duration: 5000 }
      );
      return;
    }

    try {
      const pip: Window = await win.documentPictureInPicture.requestWindow({
        width: 340,
        height: 300,
      });

      // Estilos base limpios dentro de la ventana PiP
      const style = pip.document.createElement('style');
      style.textContent = `
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, sans-serif; }
        body { background: #0c0c0e; color: #ffffff; padding: 12px; overflow-y: auto; }
        .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .dot { width: 8px; height: 8px; border-radius: 999px; background: #10b981; display: inline-block; margin-right: 6px; }
        .dot-alert { background: #f97316; animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
        .title { font-size: 13px; font-weight: 800; display: flex; align-items: center; }
        .badge { font-size: 11px; font-weight: 800; padding: 2px 8px; border-radius: 999px; background: rgba(249,115,22,0.2); color: #fb923c; }
        .empty { text-align: center; padding: 28px 10px; color: #9ca3af; font-size: 12px; line-height: 1.5; }
        .card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; padding: 10px; margin-bottom: 8px; }
        .card-bill { border-color: rgba(16,185,129,0.45); background: rgba(16,185,129,0.1); }
        .card-stamp { border-color: rgba(245,158,11,0.45); background: rgba(245,158,11,0.1); }
        .card-waiter { border-color: rgba(249,115,22,0.45); background: rgba(249,115,22,0.1); }
        .card-title { font-size: 13px; font-weight: 800; margin-bottom: 3px; }
        .card-desc { font-size: 11px; color: #d1d5db; margin-bottom: 8px; line-height: 1.35; }
        .actions { display: flex; gap: 6px; }
        .btn { flex: 1; border: none; border-radius: 8px; padding: 7px 10px; font-size: 11px; font-weight: 700; cursor: pointer; color: #fff; }
        .btn-ok { background: #10b981; }
        .btn-ok:hover { background: #059669; }
        .btn-warn { background: #ea580c; }
        .btn-warn:hover { background: #c2410c; }
        .btn-no { background: rgba(244,63,94,0.2); color: #fda4af; border: 1px solid rgba(244,63,94,0.4); }
        .btn-no:hover { background: #e11d48; color: #fff; }
        .btn:disabled { opacity: 0.5; cursor: not-allowed; }
      `;
      pip.document.head.appendChild(style);
      pip.document.title = 'MambaQR · Monitor en Vivo';

      pip.addEventListener('pagehide', () => {
        setPipWindow(null);
      });

      setPipWindow(pip);
      toast.success('Ventana de notificaciones activada: quedará siempre visible sobre tus otras aplicaciones.', { duration: 4000 });
    } catch (err) {
      console.error('Error abriendo monitor flotante:', err);
      toast.error('No se pudo abrir la ventana flotante.');
    }
  };

  const handleAttend = async (id: string) => {
    markAsReadLocal(id);
    await markAsRead(id, businessId);
    if (activeAlerts.length <= 1) {
      stopNotificationSound();
      setIsWaiterModalOpen(false);
    }
  };

  const handleApproveStamp = async (notifId: string, requestId: string | null) => {
    if (!requestId) return handleAttend(notifId);
    setProcessingId(notifId);
    try {
      const res = await approveStampRequest(requestId, businessId, notifId);
      if (!res.error) {
        markAsReadLocal(notifId);
        if (activeAlerts.length <= 1) {
          stopNotificationSound();
          setIsWaiterModalOpen(false);
        }
      }
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectStamp = async (notifId: string, requestId: string | null) => {
    if (!requestId) return handleAttend(notifId);
    setProcessingId(notifId);
    try {
      const res = await rejectStampRequest(requestId, businessId, notifId);
      if (!res.error) {
        markAsReadLocal(notifId);
        if (activeAlerts.length <= 1) {
          stopNotificationSound();
          setIsWaiterModalOpen(false);
        }
      }
    } finally {
      setProcessingId(null);
    }
  };

  const isPipOpen = Boolean(pipWindow && !pipWindow.closed);

  return (
    <>
      <button
        type="button"
        onClick={toggleFloatingMonitor}
        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-md ${
          isPipOpen
            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            : 'bg-[#141414]/90 hover:bg-[#1f1f1f] text-gray-200 border-white/10'
        }`}
        title="Abrir ventana de notificaciones siempre visible sobre tus otras aplicaciones"
      >
        <Pin className={`w-3.5 h-3.5 ${isPipOpen ? 'text-emerald-400' : 'text-amber-400'}`} />
        <span className="hidden sm:inline">{isPipOpen ? 'Ventana activa' : 'Ventana Notificación'}</span>
      </button>

      {isPipOpen && pipWindow && createPortal(
        <div>
          <div className="header">
            <div className="title">
              <span className={`dot ${activeAlerts.length > 0 ? 'dot-alert' : ''}`} />
              MambaQR · En Vivo
            </div>
            {activeAlerts.length > 0 && (
              <span className="badge">{activeAlerts.length} pendiente{activeAlerts.length !== 1 ? 's' : ''}</span>
            )}
          </div>

          {activeAlerts.length === 0 ? (
            <div className="empty">
              <div style={{ fontSize: '22px', marginBottom: '6px' }}>✅</div>
              <strong>Sin alertas pendientes</strong>
              <div>Esta ventana queda siempre visible en primer plano. Los llamados de mozo, cuentas y sellos aparecerán acá al instante.</div>
            </div>
          ) : (
            activeAlerts.map(alert => {
              const isBill = alert.type === 'bill_request';
              const isStamp = alert.type === 'stamp_request';
              const isReward = alert.type === 'loyalty_reward_reached';
              const isBusy = processingId === alert.id;
              const cardClass = isReward || isStamp ? 'card card-stamp' : isBill ? 'card card-bill' : 'card card-waiter';

              return (
                <div key={alert.id} className={cardClass}>
                  <div className="card-title">{alert.title}</div>
                  {alert.description && <div className="card-desc">{alert.description}</div>}

                  {isStamp ? (
                    <div className="actions">
                      <button
                        type="button"
                        className="btn btn-no"
                        disabled={isBusy}
                        onClick={() => handleRejectStamp(alert.id, alert.reference_id)}
                      >
                        ✕ Rechazar
                      </button>
                      <button
                        type="button"
                        className="btn btn-ok"
                        disabled={isBusy}
                        onClick={() => handleApproveStamp(alert.id, alert.reference_id)}
                      >
                        {isBusy ? 'Procesando...' : '✓ Aprobar Sello'}
                      </button>
                    </div>
                  ) : (
                    <div className="actions">
                      <button
                        type="button"
                        className={`btn ${isBill || isReward ? 'btn-ok' : 'btn-warn'}`}
                        onClick={() => handleAttend(alert.id)}
                      >
                        {isReward ? '✓ Entendido' : isBill ? '✓ Cobrado' : '✓ Atendido'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>,
        pipWindow.document.body
      )}
    </>
  );
}
