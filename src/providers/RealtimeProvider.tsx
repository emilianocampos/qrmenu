'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/realtime';
import { toast } from 'sonner';
import { getUnreadNotifications } from '@/actions/notifications';
import { WaiterCallModal } from '@/components/notifications/WaiterCallModal';
import { playNotificationSound, stopNotificationSound, getStoredSoundSettings } from '@/lib/soundPlayer';

interface NotificationItem {
  id: string;
  business_id: string;
  type: string;
  title: string;
  description: string;
  reference_id: string | null;
  reference_type: string | null;
  read: boolean;
  created_at: string;
}

interface RealtimeContextProps {
  notifications: NotificationItem[];
  unreadCount: number;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationItem[]>>;
  markAsReadLocal: (id: string) => void;
  markAllAsReadLocal: () => void;
  isWaiterModalOpen: boolean;
  setIsWaiterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RealtimeContext = createContext<RealtimeContextProps>({
  notifications: [],
  unreadCount: 0,
  setNotifications: () => { },
  markAsReadLocal: () => { },
  markAllAsReadLocal: () => { },
  isWaiterModalOpen: false,
  setIsWaiterModalOpen: () => { },
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children, businessId }: { children: React.ReactNode, businessId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const processedNotifIds = React.useRef(new Set<string>());

  // Detener sonido cuando se cierra el modal de atención
  useEffect(() => {
    if (!isWaiterModalOpen) {
      stopNotificationSound();
    }
  }, [isWaiterModalOpen]);

  // Contador derivado de notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Actualizar el título de la pestaña del navegador estilo YouTube / WhatsApp Web ((N) Título)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const currentTitle = document.title;
    const cleanTitle = currentTitle.replace(/^\(\d+\)\s*(🔔\s*)?/, '').trim() || 'Panel de Administración';

    if (unreadCount > 0) {
      document.title = `(${unreadCount}) 🔔 ${cleanTitle}`;
    } else {
      document.title = cleanTitle;
    }
  }, [unreadCount]);

  const triggerNotificationEffects = (payload: NotificationItem) => {
    // Si la notificación es un llamado de mozo o pedido de cuenta, abrir el modal en vivo inmediatamente
    if (payload.type === 'waiter_call' || payload.type === 'bill_request') {
      setIsWaiterModalOpen(true);
    }

    // Iconos por tipo de notificación
    const getIcon = (type: string) => {
      switch (type) {
        case 'new_order': return '🍽️';
        case 'waiter_call': return '🔔';
        case 'bill_request': return '💳';
        case 'order_paid': return '💰';
        case 'new_review': return '⭐';
        case 'low_stock': return '⚠️';
        case 'trial_expiring': return '⏳';
        default: return '🔔';
      }
    };

    // Reproducir tono y vibración con la duración configurada (1 a 10 segundos)
    try {
      const soundConfig = getStoredSoundSettings();
      playNotificationSound({
        tone: soundConfig.tone,
        durationSeconds: soundConfig.duration,
        vibrate: true,
      });
    } catch { }

    // Notificación nativa de Google Chrome (Funciona en 2do plano / minimizado con sonido nativo de campana)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        const nativeNotif = new Notification(payload.title || '¡Nuevo aviso en el local!', {
          body: payload.description || 'Un cliente solicita atención.',
          icon: '/icon.png',
          badge: '/icon.png',
          tag: payload.id,
          requireInteraction: payload.type === 'bill_request' || payload.type === 'waiter_call',
        });
        nativeNotif.onclick = () => {
          window.focus();
          setIsWaiterModalOpen(true);
          nativeNotif.close();
        };
      } catch (notifErr) {
        console.error('Error al emitir notificación de escritorio:', notifErr);
      }
    }

    // Toast interactivo global
    toast(payload.title || 'Nueva notificación', {
      description: payload.description,
      icon: getIcon(payload.type),
      duration: 6000,
    });
  };

  // Inicializar notificaciones no leídas y polling de respaldo cada 8 segundos
  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async (isFirstLoad = false) => {
      if (!businessId) return;
      const data = await getUnreadNotifications(businessId);
      if (data && isMounted) {
        const items = data as NotificationItem[];
        setNotifications(items);

        if (isFirstLoad) {
          // Marcar los existentes como ya procesados para no disparar alertas retroactivas sonoras
          items.forEach(n => processedNotifIds.current.add(n.id));
          const hasPendingAlerts = items.some(
            n => !n.read && (n.type === 'waiter_call' || n.type === 'bill_request')
          );
          if (hasPendingAlerts) {
            setIsWaiterModalOpen(true);
          }
        } else {
          // Si es polling y llegó un nuevo item no procesado
          items.forEach(item => {
            if (!item.read && !processedNotifIds.current.has(item.id)) {
              processedNotifIds.current.add(item.id);
              triggerNotificationEffects(item);
            }
          });
        }
      }
    };

    fetchNotifications(true);

    // Polling cada 8s para garantizar que siempre aparezca el modal aunque se desconecte el websocket
    const pollInterval = setInterval(() => {
      fetchNotifications(false);
    }, 8000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
    };
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    subscribeToNotifications(businessId, (payload, eventType) => {
      setNotifications(prev => {
        // Evitar duplicados por id
        if (prev.some(n => n.id === payload.id)) {
          return prev.map(n => n.id === payload.id ? { ...n, ...payload } : n);
        }
        return [payload, ...prev];
      });

      // Solo disparar efectos secundarios (toast, sonido, modal) si es un INSERT nuevo y no procesado
      if (eventType === 'INSERT' && !processedNotifIds.current.has(payload.id)) {
        processedNotifIds.current.add(payload.id);
        triggerNotificationEffects(payload);
      }
    });

    return () => {
      unsubscribeFromNotifications();
    };
  }, [businessId]);

  const markAsReadLocal = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllAsReadLocal = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <RealtimeContext.Provider value={{ notifications, unreadCount, setNotifications, markAsReadLocal, markAllAsReadLocal, isWaiterModalOpen, setIsWaiterModalOpen }}>
      {children}
      <WaiterCallModal businessId={businessId} />
    </RealtimeContext.Provider>
  );
}
