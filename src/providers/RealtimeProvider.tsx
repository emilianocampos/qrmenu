'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/realtime';
import { toast } from 'sonner';
import { getUnreadNotifications } from '@/actions/notifications';

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
}

const RealtimeContext = createContext<RealtimeContextProps>({
  notifications: [],
  unreadCount: 0,
  setNotifications: () => { },
  markAsReadLocal: () => { },
  markAllAsReadLocal: () => { },
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children, businessId }: { children: React.ReactNode, businessId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Contador derivado en lugar de setState dentro de useEffect
  const unreadCount = notifications.filter(n => !n.read).length;

  // Inicializar notificaciones no leídas
  useEffect(() => {
    let isMounted = true;
    const fetchInitial = async () => {
      if (!businessId) return;
      const data = await getUnreadNotifications(businessId);
      if (data && isMounted) {
        setNotifications(data as NotificationItem[]);
      }
    };
    fetchInitial();
    return () => {
      isMounted = false;
    };
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;

    subscribeToNotifications(businessId, (payload) => {
      setNotifications(prev => {
        // Evitar duplicados por id
        if (prev.some(n => n.id === payload.id)) {
          return prev.map(n => n.id === payload.id ? { ...n, ...payload } : n);
        }
        return [payload, ...prev];
      });

      // Iconos por tipo de notificación
      const getIcon = (type: string) => {
        switch (type) {
          case 'new_order': return '🍽️';
          case 'waiter_call': return '🔔';
          case 'order_ready': return '✅';
          case 'order_cancelled': return '❌';
          case 'new_review': return '⭐';
          case 'low_stock': return '⚠️';
          case 'trial_expiring': return '⏳';
          default: return '🔔';
        }
      };

      // Sonido de notificación con manejo silencioso de restricciones de autoplay
      try {
        const audio = new Audio('/sounds/universfield-new-notification-036-485897.mp3');
        audio.play().catch(() => {
          // Captura silenciosa si el navegador bloquea la reproducción automática antes de interacción
        });
      } catch { }

      // Vibración en dispositivos compatibles
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch { }
      }

      // Toast interactivo global
      toast(payload.title || 'Nueva notificación', {
        description: payload.description,
        icon: getIcon(payload.type),
        duration: 5000,
      });
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
    <RealtimeContext.Provider value={{ notifications, unreadCount, setNotifications, markAsReadLocal, markAllAsReadLocal }}>
      {children}
    </RealtimeContext.Provider>
  );
}
