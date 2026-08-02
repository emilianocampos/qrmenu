'use client';

import React, { useState, useEffect } from 'react';
import { subscribeToOrders, unsubscribeFromOrders } from '@/lib/realtime';
import { ShoppingBag, Clock, CheckCircle2, ChefHat, PackageCheck, Ban, Trash2 } from 'lucide-react';
import { getOrders, deleteAllOrders } from '@/actions/orders';
import { OrderCard } from '@/components/orders/OrderCard';
import { toast } from 'sonner';

interface OrdersClientProps {
  businessId: string;
  initialOrders: any[];
  orderMode: string;
}

export function OrdersClient({ businessId, initialOrders, orderMode }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders);
  const [filter, setFilter] = useState<string>('all'); // all, pending, active, completed
  const [isDeletingAll, setIsDeletingAll] = useState(false);

  useEffect(() => {
    if (orderMode === 'menu_only') return;

    // Suscripción Exclusiva para esta ruta
    subscribeToOrders(businessId, async (payload) => {
      // Cuando hay un cambio (Insert/Update/Delete), lo ideal es refrescar la lista 
      // o actualizar el estado localmente. Refrescar asegura tener los joins completos.
      const updatedOrders = await getOrders(businessId);
      setOrders(updatedOrders);
      
      // Mostrar toast si es insert
      if (payload.eventType === 'INSERT') {
         toast.success('¡Nuevo pedido recibido!', {
             icon: '🛒',
             description: 'Revisa tu panel de pedidos.'
         });
      }
    });

    return () => {
      unsubscribeFromOrders();
    };
  }, [businessId, orderMode]);

  if (orderMode === 'menu_only') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <ShoppingBag className="w-16 h-16 text-gray-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white">Pedidos Desactivados</h2>
        <p className="text-gray-400 mt-2 max-w-md">
          Tu negocio está configurado en modo &quot;Solo Carta&quot;. Para recibir pedidos, cambia el modo desde la Configuración.
        </p>
      </div>
    );
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    if (filter === 'pending') return order.status === 'pending';
    if (filter === 'active') return ['accepted', 'preparing', 'ready'].includes(order.status);
    if (filter === 'completed') return ['delivered', 'cancelled'].includes(order.status);
    return true;
  });

  const handleDeleteAll = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar TODOS los pedidos? Esta acción no se puede deshacer.')) return;
    
    setIsDeletingAll(true);
    try {
      const res = await deleteAllOrders(businessId);
      if (res.error) throw new Error(res.error);
      
      setOrders([]);
      toast.success('Todos los pedidos han sido eliminados.');
    } catch (error) {
      toast.error('Error al eliminar los pedidos');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-indigo-400" />
            Gestión de Pedidos
          </h1>
          <p className="text-gray-400 text-sm mt-1">Supervisa y actualiza los pedidos en tiempo real.</p>
        </div>

        {/* Filtros */}
        <div className="flex bg-white/5 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'active', label: 'En Curso' },
            { id: 'completed', label: 'Historial' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === f.id ? 'bg-indigo-500 text-white shadow-sm' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {f.label}
            </button>
          ))}
          
          {orders.length > 0 && (
            <div className="w-px h-6 bg-white/10 mx-2 self-center" />
          )}
          
          {orders.length > 0 && (
            <button
              onClick={handleDeleteAll}
              disabled={isDeletingAll}
              className="px-4 py-1.5 rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-500/20 transition-colors flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isDeletingAll ? 'Borrando...' : 'Borrar Todo'}</span>
            </button>
          )}
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-[#111] border border-white/5 rounded-2xl p-12 text-center flex flex-col items-center">
          <Clock className="w-12 h-12 text-gray-500 mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-white">No hay pedidos</h3>
          <p className="text-gray-400 text-sm mt-1">
            {filter === 'all' 
              ? 'Aún no has recibido ningún pedido.' 
              : `No tienes pedidos en estado "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredOrders.map(order => (
            <OrderCard key={order.id} order={order} businessId={businessId} />
          ))}
        </div>
      )}
    </div>
  );
}
