'use client';

import React, { useState } from 'react';
import { updateOrderStatus } from '@/actions/orders';
import { Clock, User, Phone, MapPin, Check, ChefHat, PackageCheck, Ban, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderCardProps {
  order: any;
  businessId: string;
}

export function OrderCard({ order, businessId }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const normalizedStatus = (order.status || 'pending').toLowerCase();

  const getStatusColor = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'preparing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ready': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'delivered': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusLabel = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'pending': return 'Pendiente';
      case 'accepted': return 'Aceptado';
      case 'preparing': return 'Preparando';
      case 'ready': return 'Listo para entregar';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return s;
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(order.id, businessId, newStatus, order.restaurant_tables?.table_number || order.restaurant_tables?.table_code);
      if (res.error) throw new Error(res.error);
      toast.success(`Estado actualizado a ${getStatusLabel(newStatus)}`);
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`bg-[#111] rounded-2xl border ${getStatusColor(order.status).replace('text-', 'border-').replace('/10', '/30')} p-4 transition-all overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(normalizedStatus)}`}>
              {getStatusLabel(normalizedStatus)}
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {order.restaurant_tables ? (
                <>
                  <MapPin className="w-5 h-5 text-indigo-400" />
                  Mesa {order.restaurant_tables.table_number || order.restaurant_tables.table_code}
                </>
              ) : (
                <>
                  <User className="w-5 h-5 text-indigo-400" />
                  Takeaway / Barra
                </>
              )}
            </h3>
            <span className="text-xl font-black text-emerald-400">
              ${order.total}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Info (if available) */}
      {(order.customer_first_name || order.customer_identifier) && (
        <div className="flex items-center gap-4 bg-white/5 rounded-xl p-3 mb-4 text-sm text-gray-300">
          {order.customer_first_name && (
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-400" />
              {order.customer_first_name} {order.customer_last_name}
            </div>
          )}
          {order.customer_phone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              {order.customer_phone}
            </div>
          )}
          {order.customer_identifier && (
            <div className="font-mono bg-black/50 px-2 py-0.5 rounded">
              ID: {order.customer_identifier}
            </div>
          )}
        </div>
      )}

      {/* Products List */}
      <div className="flex-1">
        <div className="space-y-3">
          {order.order_items.slice(0, expanded ? undefined : 2).map((item: any) => (
            <div key={item.id} className="flex gap-3">
              <div className="w-6 h-6 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                {item.quantity}x
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.products?.name || 'Producto eliminado'}</p>
                {item.observations && (
                  <p className="text-xs text-orange-300/80 mt-0.5 break-words bg-orange-500/10 p-1.5 rounded-md border border-orange-500/10">
                    "{item.observations}"
                  </p>
                )}
              </div>
              <div className="text-sm text-gray-400 shrink-0">
                ${item.unit_price}
              </div>
            </div>
          ))}
          
          {order.order_items.length > 2 && (
            <button 
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 w-full justify-center py-2 bg-white/5 rounded-lg"
            >
              {expanded ? (
                <><ChevronUp className="w-3 h-3" /> Ver menos</>
              ) : (
                <><ChevronDown className="w-3 h-3" /> Ver {order.order_items.length - 2} más</>
              )}
            </button>
          )}
        </div>

        {order.comments && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-400 mb-1">Nota del cliente:</p>
            <p className="text-sm text-gray-300">{order.comments}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {normalizedStatus === 'pending' && (
          <>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('accepted')}
              className="col-span-2 sm:col-span-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" /> Aceptar Pedido
            </button>
            <button
              disabled={isUpdating}
              onClick={() => handleUpdateStatus('cancelled')}
              className="py-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg text-sm font-medium flex items-center justify-center"
            >
              <Ban className="w-4 h-4" />
            </button>
          </>
        )}
        
        {normalizedStatus === 'accepted' && (
          <button
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('preparing')}
            className="col-span-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <ChefHat className="w-4 h-4" /> Comenzar a preparar
          </button>
        )}

        {normalizedStatus === 'preparing' && (
          <button
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('ready')}
            className="col-span-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Marcar como Listo
          </button>
        )}

        {normalizedStatus === 'ready' && (
          <button
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('delivered')}
            className="col-span-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <PackageCheck className="w-4 h-4" /> Entregado al cliente
          </button>
        )}
      </div>
    </div>
  );
}
