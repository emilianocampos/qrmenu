'use client';

import React, { useState } from 'react';
import { updateOrderStatus } from '@/actions/orders';
import { Clock, User, Phone, MapPin, Check, ChefHat, PackageCheck, Ban, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

import { WaiterSettings } from '@/actions/waiters';

interface OrderCardProps {
  order: any;
  businessId: string;
  waiterSettings?: WaiterSettings;
}

export function OrderCard({ order, businessId, waiterSettings }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [isWaiterModalOpen, setIsWaiterModalOpen] = useState(false);
  const [selectedWaiter, setSelectedWaiter] = useState<string>(
    waiterSettings?.waiters?.[0] || 'Mozo 1'
  );

  // Parse assigned waiter from comments if already set
  const waiterMatch = order.comments?.match(/\[Mozo:\s*([^\]]+)\]/i);
  const assignedWaiter = waiterMatch ? waiterMatch[1].trim() : null;
  const cleanCustomerComments = order.comments 
    ? order.comments.replace(/\[Mozo:\s*[^\]]+\]/gi, '').trim() 
    : '';

  const normalizedStatus = (order.status || 'pending').toLowerCase();

  const getStatusColor = (status: string) => {
    const s = (status || 'pending').toLowerCase();
    switch (s) {
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'accepted': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'preparing': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'ready': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'delivered': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'paid': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
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
      case 'paid': return 'Pagado';
      case 'cancelled': return 'Cancelado';
      default: return s;
    }
  };

  const handleUpdateStatus = async (newStatus: string, waiterName?: string) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(
        order.id, 
        businessId, 
        newStatus, 
        order.restaurant_tables?.table_number || order.restaurant_tables?.table_code,
        waiterName
      );
      if (res.error) throw new Error(res.error);
      if (waiterName) {
        toast.success(`Pedido aceptado (Mozo: ${waiterName})`);
      } else {
        toast.success('Estado actualizado');
      }
    } catch (error) {
      toast.error('Error al actualizar estado');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAcceptOrder = () => {
    if (waiterSettings?.waiter_assignment_enabled && (waiterSettings.waiters?.length ?? 0) > 0) {
      // Set default selected waiter if not set or valid
      if (!selectedWaiter || !waiterSettings.waiters.includes(selectedWaiter)) {
        setSelectedWaiter(waiterSettings.waiters[0]);
      }
      setIsWaiterModalOpen(true);
    } else {
      handleUpdateStatus('accepted');
    }
  };

  return (
    <div className={`bg-[#111] rounded-2xl border ${getStatusColor(order.status).replace('text-', 'border-').replace('/10', '/30')} p-4 transition-all overflow-hidden flex flex-col`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${getStatusColor(normalizedStatus)}`}>
              {getStatusLabel(normalizedStatus)}
            </span>
            {assignedWaiter && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-violet-500/15 text-violet-300 border border-violet-500/30">
                <User className="w-3 h-3 text-violet-400" />
                Mozo: <strong className="text-white">{assignedWaiter}</strong>
              </span>
            )}
            <span className="text-xs text-gray-500 flex items-center gap-1" suppressHydrationWarning>
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: es })}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-indigo-400" />
              {order.restaurant_tables?.table_number 
                ? `Mesa ${order.restaurant_tables.table_number}`
                : order.customer_identifier 
                  ? (order.customer_identifier.toLowerCase().startsWith('mesa') ? order.customer_identifier : `Mesa ${order.customer_identifier}`)
                  : 'Takeaway / Barra'}
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
            <div className="font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-lg text-xs font-semibold">
              {order.customer_identifier.toLowerCase().includes('mesa')
                ? `MESA: ${order.customer_identifier.replace(/mesa\s*/i, '').toUpperCase()}`
                : `MESA: ${order.customer_identifier.toUpperCase()}`}
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
                  <div className="mt-1 space-y-1">
                    {item.observations.split(' | ').map((obs: string, idx: number) => {
                      const isAddition = obs.toLowerCase().startsWith('adición:') || obs.toLowerCase().startsWith('adicion:');
                      return (
                        <p 
                          key={idx} 
                          className={`text-xs break-words px-2 py-0.5 rounded-md border font-medium ${
                            isAddition 
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20' 
                              : 'bg-orange-500/10 text-orange-300 border-orange-500/20'
                          }`}
                        >
                          {obs}
                        </p>
                      );
                    })}
                  </div>
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

        {cleanCustomerComments && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <p className="text-xs font-semibold text-blue-400 mb-1">Nota del cliente:</p>
            <p className="text-sm text-gray-300">{cleanCustomerComments}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {normalizedStatus === 'pending' && (
          <>
            <button
              disabled={isUpdating}
              onClick={handleAcceptOrder}
              className="col-span-2 sm:col-span-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
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

        {normalizedStatus === 'delivered' && (
          <button
            disabled={isUpdating}
            onClick={() => handleUpdateStatus('paid')}
            className="col-span-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> Marcar como Pagado
          </button>
        )}

        {normalizedStatus === 'paid' && (
          <div className="col-span-full py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Pedido Pagado Correctamente
          </div>
        )}
      </div>

      {/* Waiter Selection Modal (MaxiRest integration) */}
      {isWaiterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#18181b] border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 text-left relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Asignar Mozo al Pedido</h3>
                  <p className="text-xs text-gray-400">
                    {order.restaurant_tables?.table_number 
                      ? `Mesa ${order.restaurant_tables.table_number}` 
                      : (order.customer_identifier || 'Mesa / Barra')} • Total: <span className="text-emerald-400 font-bold">${order.total}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3.5 text-xs text-indigo-200 leading-relaxed">
              💡 <strong>Integración MaxiRest / Sistema:</strong> El mozo seleccionado atenderá esta comanda y quedará registrado para la apertura automática de la mesa.
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                Seleccionar Mozo de atención:
              </label>
              <select
                value={selectedWaiter}
                onChange={(e) => setSelectedWaiter(e.target.value)}
                className="w-full bg-[#111] border border-white/15 text-white rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                {waiterSettings?.waiters?.map((w) => (
                  <option key={w} value={w} className="bg-[#18181b] text-white">
                    👤 {w}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsWaiterModalOpen(false);
                  handleUpdateStatus('accepted', selectedWaiter);
                }}
                disabled={isUpdating}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-lg shadow-indigo-600/20"
              >
                <Check className="w-4 h-4" /> Aceptar con {selectedWaiter}
              </button>
              <button
                type="button"
                onClick={() => setIsWaiterModalOpen(false)}
                className="py-2.5 px-4 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
