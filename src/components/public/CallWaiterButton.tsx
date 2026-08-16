'use client';

import React, { useState } from 'react';
import { Bell, Loader2, Check, X } from 'lucide-react';
import { callWaiterAction } from '@/actions/notifications';
import { useCart } from '@/components/orders/CartContext';
import { toast } from 'sonner';

interface CallWaiterButtonProps {
  businessId: string;
  orderMode: string;
}

export function CallWaiterButton({ businessId, orderMode }: CallWaiterButtonProps) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { customerInfo } = useCart();

  // Disponible únicamente cuando el modo de pedidos es por mesa
  if (orderMode !== 'table_number' && orderMode !== 'table_code') {
    return null;
  }

  const getTableDisplay = () => {
    if (customerInfo.tableNumber) return `Mesa ${customerInfo.tableNumber}`;
    if (customerInfo.tableCode) return `Mesa Código: ${customerInfo.tableCode}`;
    return 'Mesa del Cliente';
  };

  const handleCallWaiter = async () => {
    setLoading(true);
    try {
      const tableDisplay = getTableDisplay();
      const res = await callWaiterAction(businessId, tableDisplay);
      if (res.error) throw new Error(res.error);

      setSent(true);
      toast.success('El mozo ha sido notificado.');
      setTimeout(() => setSent(false), 5000);
    } catch (error) {
      toast.error('Error al llamar al mozo. Intentá nuevamente.');
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setConfirmOpen(true)}
        disabled={sent}
        style={{
          position: 'fixed',
          bottom: 24,
          left: 24,
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 18px',
          borderRadius: 9999,
          backgroundColor: sent ? '#10b981' : '#f97316',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.875rem',
          border: 'none',
          boxShadow: '0 10px 25px -5px rgba(249, 115, 22, 0.4)',
          cursor: sent ? 'default' : 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        {sent ? (
          <>
            <Check style={{ width: 18, height: 18 }} />
            <span>Mozo avisado</span>
          </>
        ) : (
          <>
            <Bell style={{ width: 18, height: 18 }} />
            <span>Llamar al mozo</span>
          </>
        )}
      </button>

      {/* Diálogo de Confirmación */}
      {confirmOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 24,
            padding: 24,
            maxWidth: 380,
            width: '100%',
            textAlign: 'center',
            boxShadow: 'var(--shadow-modal)',
          }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(249, 115, 22, 0.15)',
              color: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Bell style={{ width: 28, height: 28 }} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              ¿Querés llamar al mozo?
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: '0 0 24px' }}>
              Se enviará un aviso inmediato al panel del personal para asistirte en {getTableDisplay()}.
            </p>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  backgroundColor: 'var(--bg-page)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCallWaiter}
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  backgroundColor: '#f97316',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  border: 'none',
                  boxShadow: '0 4px 12px rgba(249, 115, 22, 0.3)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {loading ? <Loader2 style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} /> : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
