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
  setNotifications: () => {},
  markAsReadLocal: () => {},
  markAllAsReadLocal: () => {},
});

export const useRealtime = () => useContext(RealtimeContext);

export function RealtimeProvider({ children, businessId }: { children: React.ReactNode, businessId: string }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Inicializar notificaciones no leídas
  useEffect(() => {
    const fetchInitial = async () => {
      const data = await getUnreadNotifications(businessId);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    };
    fetchInitial();
  }, [businessId]);

  // Recalcular contador cuando cambian las notificaciones
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  useEffect(() => {
    if (!businessId) return;

    subscribeToNotifications(businessId, (payload) => {
      setNotifications(prev => [payload, ...prev]);

      // Reproducir sonido si está activado (esto requiere que el usuario haya interactuado con la página antes)
      try {
        // Obtenemos si está habilitado del local storage o asumiendo true por ahora
        // Idealmente lo validamos desde la base de datos de settings
        const audio = new Audio('/sounds/notification.mp3'); 
        audio.play().catch(e => console.log('El navegador bloqueó el autoplay del sonido', e));
        
        if (navigator.vibrate) {
          navigator.vibrate([150, 100, 150]);
        }
      } catch (error) {}

      // Mostrar Toast interactivo
      toast(payload.title, {
        description: payload.description,
        icon: '🔔',
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
