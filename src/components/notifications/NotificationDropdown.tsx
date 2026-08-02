'use client';

import React from 'react';
import { useRealtime } from '@/providers/RealtimeProvider';
import { markAsRead, markAllAsRead, deleteNotification } from '@/actions/notifications';
import { CheckCheck, Trash2, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import Link from 'next/link';

export function NotificationDropdown({ businessId, onClose }: { businessId: string, onClose: () => void }) {
  const { notifications, markAsReadLocal, markAllAsReadLocal } = useRealtime();

  const handleMarkAsRead = async (id: string) => {
    markAsReadLocal(id);
    await markAsRead(id, businessId);
  };

  const handleMarkAllAsRead = async () => {
    markAllAsReadLocal();
    await markAllAsRead(businessId);
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case 'new_order': return '🍽️';
      case 'order_ready': return '✅';
      case 'order_cancelled': return '❌';
      case 'new_review': return '⭐';
      case 'low_stock': return '⚠️';
      default: return '🔔';
    }
  };

  const getLinkForNotification = (n: any) => {
    if (n.type.startsWith('order')) return `/dashboard/orders`;
    if (n.type === 'new_review') return `/dashboard/reviews`;
    return null;
  };

  return (
    <div className="flex flex-col max-h-[80vh] overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#111]">
        <h3 className="font-semibold text-white">Notificaciones</h3>
        <button 
          onClick={handleMarkAllAsRead}
          className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
        >
          <CheckCheck className="w-3 h-3" />
          Marcar todo como leído
        </button>
      </div>

      <div className="overflow-y-auto flex-1">
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">
            No tienes notificaciones
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {notifications.map((notif) => {
              const link = getLinkForNotification(notif);

              return (
                <div 
                  key={notif.id} 
                  className={`p-4 transition-colors hover:bg-white/5 group ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="text-xl shrink-0 mt-1">
                      {getIconForType(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm ${!notif.read ? 'text-white font-medium' : 'text-gray-300'}`}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-gray-500 shrink-0 whitespace-nowrap">
                          {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true, locale: es })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                        {notif.description}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {link && (
                          <Link 
                            href={link}
                            onClick={() => {
                              if (!notif.read) handleMarkAsRead(notif.id);
                              onClose();
                            }}
                            className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            Ver detalle
                          </Link>
                        )}
                        {!notif.read && (
                          <button
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[11px] text-gray-400 hover:text-white"
                          >
                            Marcar leído
                          </button>
                        )}
                      </div>
                    </div>
                    {!notif.read && (
                      <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
