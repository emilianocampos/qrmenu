'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from './CartContext';
import { UtensilsCrossed, Phone, MapPin, Receipt } from 'lucide-react';
import { toast } from 'sonner';

export function CustomerInfoModal({ orderMode, businessId }: { orderMode: string, businessId: string }) {
  const { customerInfo, setCustomerInfo, isHydrated, isCustomerModalOpen, setIsCustomerModalOpen } = useCart();
  
  const [tableNumber, setTableNumber] = useState('');
  const [tableCode, setTableCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comanda, setComanda] = useState('');

  useEffect(() => {
    // Wait until local storage is loaded
    if (!isHydrated) return;

    // Check if we need to show the modal
    if (orderMode === 'menu_only') return;
    
    // Check if we already have the required info
    let needsInfo = false;
    
    if (orderMode === 'table_number' && !customerInfo.tableNumber) needsInfo = true;
    if (orderMode === 'table_code' && !customerInfo.tableCode) needsInfo = true;
    if (orderMode === 'takeaway' && (!customerInfo.name || !customerInfo.phone)) needsInfo = true;
    if (orderMode === 'comanda' && !customerInfo.comanda) needsInfo = true;
    
    if (needsInfo) {
      setIsCustomerModalOpen(true);
    }
  }, [orderMode, customerInfo, isHydrated, setIsCustomerModalOpen]);

  // Sync internal state with context when modal opens
  useEffect(() => {
    if (isCustomerModalOpen) {
      setTableNumber(customerInfo.tableNumber || '');
      setTableCode(customerInfo.tableCode || '');
      setName(customerInfo.name || '');
      setPhone(customerInfo.phone || '');
      setComanda(customerInfo.comanda || '');
    }
  }, [isCustomerModalOpen, customerInfo]);

  if (!isCustomerModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (orderMode === 'table_number' && !tableNumber) return toast.error('Ingresa tu número de mesa');
    if (orderMode === 'table_code' && !tableCode) return toast.error('Ingresa el código de la mesa');
    if (orderMode === 'takeaway' && (!name || !phone)) return toast.error('Ingresa nombre y teléfono');
    if (orderMode === 'comanda' && !comanda) return toast.error('Ingresa el número de comanda');
    
    setCustomerInfo({
      tableNumber,
      tableCode,
      name,
      phone,
      comanda
    });
    
    setIsCustomerModalOpen(false);
    toast.success('¡Listo! Ya puedes armar tu pedido.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" 
        onClick={() => {
          // Permite cerrar si ya tienen la info completa
          const hasInfo = 
            (orderMode === 'table_number' && customerInfo.tableNumber) ||
            (orderMode === 'table_code' && customerInfo.tableCode) ||
            (orderMode === 'takeaway' && customerInfo.name && customerInfo.phone) ||
            (orderMode === 'comanda' && customerInfo.comanda);
          if (hasInfo) setIsCustomerModalOpen(false);
        }}
      />
      
      <div className="bg-[#111] border border-white/10 rounded-2xl p-6 w-full max-w-md relative z-10 shadow-2xl animate-in zoom-in-95">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
            {orderMode.includes('table') ? <MapPin /> : orderMode === 'takeaway' ? <Phone /> : <Receipt />}
          </div>
          <h2 className="text-xl font-bold text-white">Antes de comenzar...</h2>
          <p className="text-gray-400 text-sm mt-1">Por favor, completa esta información para poder enviar tus pedidos.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {orderMode === 'table_number' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número de Mesa</label>
              <input
                type="number"
                required
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                placeholder="Ej: 14"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          )}

          {orderMode === 'table_code' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Código de Mesa</label>
              <input
                type="text"
                required
                value={tableCode}
                onChange={e => setTableCode(e.target.value)}
                placeholder="Ingresa el código único de tu mesa"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          )}

          {orderMode === 'takeaway' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tu Nombre</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="¿Cómo te llamas?"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Tu WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Para avisarte cuando esté listo"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
              </div>
            </>
          )}

          {orderMode === 'comanda' && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Número de Comanda</label>
              <input
                type="text"
                required
                value={comanda}
                onChange={e => setComanda(e.target.value)}
                placeholder="Revisa el número en tu ticket"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors"
          >
            Continuar al Menú
          </button>
        </form>
      </div>
    </div>
  );
}
