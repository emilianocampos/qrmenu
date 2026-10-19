'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from '@/components/orders/CartContext';
import { 
  MapPin, 
  Bell, 
  Check, 
  Loader2, 
  CreditCard, 
  Banknote, 
  QrCode, 
  X, 
  Edit2, 
  Receipt,
  Smartphone,
  Lock
} from 'lucide-react';
import { callWaiterAction, requestBillAction } from '@/actions/notifications';
import { toast } from 'sonner';

interface TableInfoAndWaiterBarProps {
  businessId: string;
  orderMode?: string;
  primaryColor?: string;
}

const PAYMENT_METHODS = [
  { 
    id: 'efectivo', 
    label: 'Efectivo', 
    icon: Banknote, 
    badge: '💵 Efectivo',
    description: 'Abonás en efectivo al mozo' 
  },
  { 
    id: 'tarjeta', 
    label: 'Tarjeta / Posnet', 
    icon: CreditCard, 
    badge: '💳 Terminal Posnet',
    description: 'Acercamos la terminal a tu mesa' 
  },
  { 
    id: 'transferencia', 
    label: 'Mercado Pago / Transferencia', 
    icon: QrCode, 
    badge: '📱 QR o Alias',
    description: 'Transferencia bancaria o MP en vivo' 
  },
];

const QUICK_AMOUNTS = ['Monto exacto', '5.000', '10.000', '20.000', '50.000'];
const QUICK_NOTES = ['Factura A con CUIT', 'Dividir cuenta', 'Pago justo'];

export function TableInfoAndWaiterBar({ businessId, primaryColor }: TableInfoAndWaiterBarProps) {
  const { customerInfo, setCustomerInfo, isTableFromUrl: isTableFromUrlCart } = useCart();
  const [waiterModalOpen, setWaiterModalOpen] = useState(false);
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [billSuccessModalOpen, setBillSuccessModalOpen] = useState(false);
  
  const [loadingWaiter, setLoadingWaiter] = useState(false);
  const [loadingBill, setLoadingBill] = useState(false);
  
  const [waiterSent, setWaiterSent] = useState(false);
  const [billSent, setBillSent] = useState(false);

  // Estado del modal de cuenta
  const [selectedPayment, setSelectedPayment] = useState<string>('efectivo');
  const [cashAmount, setCashAmount] = useState<string>('');
  const [billNotes, setBillNotes] = useState<string>('');
  const [lastBillData, setLastBillData] = useState<{
    table: string;
    method: string;
    badge: string;
    details?: string;
  } | null>(null);

  // Número de mesa
  const [customTableNum, setCustomTableNum] = useState<string>('');
  const [inputTableNum, setInputTableNum] = useState<string>('');
  const [isEditingTableInBill, setIsEditingTableInBill] = useState(false);
  const [isTableFromUrl, setIsTableFromUrl] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const urlTable = searchParams.get('table') || searchParams.get('mesa');
      const savedTable = localStorage.getItem(`customer_table_${businessId}`);

      if (urlTable) {
        setIsTableFromUrl(true);
        setCustomTableNum(prev => prev !== urlTable ? urlTable : prev);
        setInputTableNum(prev => prev !== urlTable ? urlTable : prev);
        if (setCustomerInfo && customerInfo?.tableNumber !== urlTable) {
          setCustomerInfo((prev: any) => ({ ...prev, tableNumber: urlTable, isTableFromUrl: true }));
        }
      } else if (isTableFromUrlCart) {
        setIsTableFromUrl(true);
        if (customerInfo?.tableNumber) {
          const cartTable = String(customerInfo.tableNumber);
          setCustomTableNum(prev => prev !== cartTable ? cartTable : prev);
          setInputTableNum(prev => prev !== cartTable ? cartTable : prev);
        }
      } else {
        setIsTableFromUrl(false);
        if (savedTable) {
          setCustomTableNum(prev => prev || savedTable);
          setInputTableNum(prev => prev || savedTable);
        } else if (customerInfo?.tableNumber) {
          const cartTable = String(customerInfo.tableNumber);
          setCustomTableNum(prev => prev !== cartTable ? cartTable : prev);
          setInputTableNum(prev => prev !== cartTable ? cartTable : prev);
        }
      }
    }
  }, [businessId, isTableFromUrlCart, customerInfo?.tableNumber, setCustomerInfo]);

  const isAssignedByUrl = isTableFromUrl || Boolean(isTableFromUrlCart) || Boolean(customerInfo?.isTableFromUrl);
  const activeTable = customTableNum || customerInfo?.tableNumber || null;
  const tableDisplay = activeTable ? `Mesa ${activeTable}` : 'Mesa sin asignar';

  const handleSaveTableDirect = (num: string) => {
    if (isAssignedByUrl) {
      toast.info('La mesa fue asignada automáticamente por código QR y no se puede modificar.');
      return;
    }
    const trimmed = num.trim();
    if (!trimmed) return;
    setCustomTableNum(trimmed);
    setInputTableNum(trimmed);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`customer_table_${businessId}`, trimmed);
    }
    if (setCustomerInfo) {
      setCustomerInfo((prev: any) => ({ ...prev, tableNumber: trimmed }));
    }
  };

  const handleSaveTable = () => {
    if (isAssignedByUrl) {
      toast.info('La mesa fue asignada automáticamente por código QR y no se puede modificar.');
      setTableModalOpen(false);
      return;
    }
    const trimmed = inputTableNum.trim();
    if (!trimmed) {
      toast.error('Por favor ingresá el número o nombre de tu mesa.');
      return;
    }
    handleSaveTableDirect(trimmed);
    setTableModalOpen(false);
    toast.success(`Mesa configurada: Mesa ${trimmed}`);
  };

  // 1. Llamar al Mozo
  const handleCallWaiter = async () => {
    if (!activeTable) {
      setWaiterModalOpen(false);
      setTableModalOpen(true);
      toast.info('Por favor indica tu número de mesa primero.');
      return;
    }

    setLoadingWaiter(true);
    try {
      const res = await callWaiterAction(businessId, tableDisplay);
      if (res.error) throw new Error(res.error);

      setWaiterSent(true);
      toast.success('El mozo ha sido notificado y se acerca a tu mesa.');
      setTimeout(() => setWaiterSent(false), 8000);
    } catch {
      toast.error('Error al llamar al mozo. Intentá nuevamente.');
    } finally {
      setLoadingWaiter(false);
      setWaiterModalOpen(false);
    }
  };

  // 2. Pedir la Cuenta
  const handleRequestBill = async () => {
    let effectiveTable = activeTable;
    if (!effectiveTable) {
      const trimmed = inputTableNum.trim();
      if (!trimmed) {
        toast.error('Por favor ingresá tu número de mesa para llevar la cuenta.');
        setIsEditingTableInBill(true);
        return;
      }
      handleSaveTableDirect(trimmed);
      effectiveTable = trimmed;
      setIsEditingTableInBill(false);
    }

    const currentTableDisplay = `Mesa ${effectiveTable}`;
    setLoadingBill(true);
    try {
      const methodObj = PAYMENT_METHODS.find(m => m.id === selectedPayment);
      const methodLabel = methodObj?.label || 'Efectivo';
      const methodBadge = methodObj?.badge || methodLabel;
      
      let details = '';
      if (selectedPayment === 'efectivo' && cashAmount.trim()) {
        details = `Abona con: $${cashAmount.trim()}`;
      }
      if (billNotes.trim()) {
        details = details ? `${details} | Nota: ${billNotes.trim()}` : `Nota: ${billNotes.trim()}`;
      }

      const res = await requestBillAction(businessId, currentTableDisplay, methodLabel, details);
      if (res.error) throw new Error(res.error);

      setBillSent(true);
      setLastBillData({
        table: currentTableDisplay,
        method: methodLabel,
        badge: methodBadge,
        details: details || undefined,
      });

      // Cerrar modal de solicitud y ABRIR MODAL DE ÉXITO
      setBillModalOpen(false);
      setBillSuccessModalOpen(true);

      toast.success(`¡Cuenta solicitada para ${currentTableDisplay}! El mozo ya fue avisado.`, {
        icon: '💳',
        duration: 5000,
      });

      setTimeout(() => setBillSent(false), 15000);
      setCashAmount('');
      setBillNotes('');
    } catch {
      toast.error('Error al pedir la cuenta. Intentá nuevamente.');
    } finally {
      setLoadingBill(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      {/* Badge de Mesa */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => {
            if (isAssignedByUrl) {
              toast.info(`Mesa ${activeTable} asignada automáticamente por código QR. No se puede modificar.`);
              return;
            }
            setTableModalOpen(true);
          }}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all shadow-sm ${
            isAssignedByUrl ? 'cursor-default' : 'cursor-pointer hover:opacity-90 active:scale-95'
          }`}
          style={{
            backgroundColor: 'var(--bg-card)',
            borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)',
            color: 'var(--text-primary)',
            boxShadow: 'var(--shadow-card)'
          }}
          title={isAssignedByUrl ? 'Mesa asignada por código QR (fija)' : 'Cambiar o configurar número de mesa'}
        >
          <MapPin 
            className="w-4 h-4" 
            style={{ color: 'var(--primary-color)' }}
          />
          <span>{activeTable ? `Mesa ${activeTable}` : 'Seleccionar Mesa'}</span>
          {isAssignedByUrl ? (
            <span 
              className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md ml-1 border"
              style={{
                backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.12)',
                color: 'var(--primary-color)',
                borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.25)'
              }}
            >
              <Lock className="w-2.5 h-2.5" />
              Fija
            </span>
          ) : (
            <Edit2 className="w-3 h-3 ml-0.5 opacity-60" style={{ color: 'var(--primary-color)' }} />
          )}
        </button>
      </div>

      {/* Botones de Acción (en mobile uno al lado del otro abajo de la mesa) */}
      <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Botón Llamar al Mozo */}
        <button
          type="button"
          onClick={() => {
            if (!activeTable) {
              setTableModalOpen(true);
            } else {
              setWaiterModalOpen(true);
            }
          }}
          disabled={waiterSent}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md active:scale-95"
          style={{
            backgroundColor: waiterSent ? 'rgba(16, 185, 129, 0.2)' : 'var(--primary-color)',
            borderColor: waiterSent ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
            color: waiterSent ? '#10b981' : '#ffffff',
            boxShadow: waiterSent ? 'none' : '0 4px 14px rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)'
          }}
        >
          {waiterSent ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Mozo avisado</span>
            </>
          ) : (
            <>
              <Bell className="w-4 h-4 text-white" />
              <span>Llamar al mozo</span>
            </>
          )}
        </button>

        {/* Botón Pedir la Cuenta - Con Color Primario del Negocio */}
        <button
          type="button"
          onClick={() => {
            if (!activeTable && !isAssignedByUrl) {
              setIsEditingTableInBill(true);
            } else {
              setIsEditingTableInBill(false);
            }
            setBillModalOpen(true);
          }}
          disabled={billSent}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-md active:scale-95"
          style={{
            backgroundColor: billSent ? 'rgba(16, 185, 129, 0.2)' : 'var(--primary-color)',
            borderColor: billSent ? 'rgba(16, 185, 129, 0.4)' : 'transparent',
            color: billSent ? '#10b981' : '#ffffff',
            boxShadow: billSent ? 'none' : '0 4px 14px rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)'
          }}
        >
          {billSent ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span>Cuenta pedida</span>
            </>
          ) : (
            <>
              <Receipt className="w-4 h-4 text-white" />
              <span>Pedir la cuenta</span>
            </>
          )}
        </button>
      </div>

      {/* Modal 1: Configurar Mesa */}
      {tableModalOpen && !isAssignedByUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-4 border shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.3)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            {/* Barra superior de acento con color del admin */}
            <div 
              className="absolute top-0 inset-x-0 h-1.5"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)'
              }}
            />

            <button
              onClick={() => setTableModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border"
              style={{
                backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.15)',
                borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.3)',
                color: 'var(--primary-color)'
              }}
            >
              <MapPin className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              ¿En qué mesa te encontrás?
            </h3>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Ingresá el número o nombre de mesa para que el personal sepa a dónde llevar la atención o la cuenta.
            </p>

            <div className="pt-2">
              <input
                type="text"
                autoFocus
                value={inputTableNum}
                onChange={(e) => setInputTableNum(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveTable();
                  }
                }}
                placeholder="Ej: 4, 12, Barra..."
                className="w-full text-center text-xl font-black py-3 px-4 rounded-xl border focus:outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm border cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-muted)' 
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveTable}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg cursor-pointer transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  boxShadow: '0 4px 14px rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)'
                }}
              >
                Guardar Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Confirmar Llamado de Mozo */}
      {waiterModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="rounded-3xl p-6 max-w-sm w-full text-center space-y-4 border shadow-2xl relative overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.3)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            <div 
              className="absolute top-0 inset-x-0 h-1.5"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)'
              }}
            />

            <button
              onClick={() => setWaiterModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div 
              className="w-14 h-14 rounded-full flex items-center justify-center mx-auto border"
              style={{
                backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.15)',
                borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.3)',
                color: 'var(--primary-color)'
              }}
            >
              <Bell className="w-7 h-7" />
            </div>

            <h3 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              ¿Querés llamar al mozo?
            </h3>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Se enviará una alerta inmediata al personal para asistirte en{' '}
              <strong style={{ color: 'var(--primary-color)' }}>{tableDisplay}</strong>.
            </p>

            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setWaiterModalOpen(false)}
                disabled={loadingWaiter}
                className="flex-1 py-3 px-4 rounded-xl font-semibold text-sm border cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-muted)' 
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleCallWaiter}
                disabled={loadingWaiter}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  boxShadow: '0 4px 14px rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)'
                }}
              >
                {loadingWaiter ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Llamado'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Pedir la Cuenta - Rediseñado 100% con los Colores del Admin */}
      {billModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
          <div 
            className="rounded-3xl p-5 sm:p-7 max-w-md w-full space-y-5 border shadow-2xl relative overflow-hidden my-auto"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            {/* Barra superior de acento con el color del negocio */}
            <div 
              className="absolute top-0 inset-x-0 h-1.5"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)'
              }}
            />

            <button
              onClick={() => setBillModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header del Modal */}
            <div className="text-center pt-1">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 border shadow-sm"
                style={{
                  backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.14)',
                  borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.28)',
                  color: 'var(--primary-color)'
                }}
              >
                <Receipt className="w-7 h-7" />
              </div>

              <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Pedir la Cuenta
              </h3>

              {/* Selector o Indicador de Mesa */}
              <div className="mt-2.5">
                {(!activeTable || (isEditingTableInBill && !isAssignedByUrl)) ? (
                  <div 
                    className="p-3 rounded-2xl border text-left space-y-2 animate-in fade-in duration-200"
                    style={{
                      backgroundColor: 'var(--bg-page)',
                      borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-extrabold uppercase tracking-wider" style={{ color: 'var(--primary-color)' }}>
                        ¿En qué mesa te encontrás? *
                      </label>
                      {activeTable && (
                        <button
                          type="button"
                          onClick={() => setIsEditingTableInBill(false)}
                          className="text-[11px] font-medium underline"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        autoFocus
                        value={inputTableNum}
                        onChange={(e) => setInputTableNum(e.target.value)}
                        placeholder="Ej: 4, 12, Barra..."
                        className="flex-1 text-sm font-bold py-2 px-3 rounded-xl border focus:outline-none transition-all"
                        style={{
                          backgroundColor: 'var(--bg-card)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            const trimmed = inputTableNum.trim();
                            if (trimmed) {
                              handleSaveTableDirect(trimmed);
                              setIsEditingTableInBill(false);
                              toast.success(`Mesa ${trimmed} guardada`);
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const trimmed = inputTableNum.trim();
                          if (trimmed) {
                            handleSaveTableDirect(trimmed);
                            setIsEditingTableInBill(false);
                            toast.success(`Mesa ${trimmed} guardada`);
                          } else {
                            toast.error('Por favor ingresá el número de mesa');
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-sm transition-all active:scale-95 cursor-pointer"
                        style={{ backgroundColor: 'var(--primary-color)' }}
                      >
                        Confirmar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span 
                      className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold border"
                      style={{
                        backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.1)',
                        borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.25)',
                        color: 'var(--primary-color)'
                      }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{tableDisplay}</span>
                    </span>
                    {!isAssignedByUrl ? (
                      <button
                        type="button"
                        onClick={() => setIsEditingTableInBill(true)}
                        className="text-[11px] underline font-semibold hover:opacity-80 transition-opacity cursor-pointer"
                        style={{ color: 'var(--text-muted)' }}
                      >
                        Cambiar mesa
                      </button>
                    ) : (
                      <span 
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20"
                        title="Asignada por código QR"
                      >
                        <Lock className="w-2.5 h-2.5" />
                        Asignada por QR
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Selector de Medios de Pago */}
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Medio de pago preferido
              </label>

              <div className="grid grid-cols-1 gap-2.5">
                {PAYMENT_METHODS.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedPayment === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setSelectedPayment(pm.id)}
                      className="p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
                      style={{
                        backgroundColor: isSelected 
                          ? 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.08)' 
                          : 'var(--bg-page)',
                        borderColor: isSelected 
                          ? 'var(--primary-color)' 
                          : 'var(--border-color)',
                        boxShadow: isSelected 
                          ? '0 4px 16px -2px rgba(var(--primary-color-rgb, 249, 115, 22), 0.25)' 
                          : 'none'
                      }}
                    >
                      <div className="flex items-center gap-3.5">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                          style={{
                            backgroundColor: isSelected ? 'var(--primary-color)' : 'var(--bg-card)',
                            borderColor: isSelected ? 'transparent' : 'var(--border-color)',
                            color: isSelected ? '#ffffff' : 'var(--text-muted)',
                            borderWidth: 1,
                            borderStyle: 'solid'
                          }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                            {pm.label}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            {pm.description}
                          </p>
                        </div>
                      </div>

                      <div 
                        className="w-5 h-5 rounded-full border flex items-center justify-center transition-all shrink-0 ml-2"
                        style={{
                          backgroundColor: isSelected ? 'var(--primary-color)' : 'transparent',
                          borderColor: isSelected ? 'var(--primary-color)' : 'var(--border-color)',
                          color: '#ffffff'
                        }}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Opciones interactivas si abona en Efectivo */}
            {selectedPayment === 'efectivo' && (
              <div 
                className="p-4 rounded-2xl border space-y-2.5 animate-in fade-in duration-200"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)'
                }}
              >
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                    ¿Con cuánto abonás?
                  </label>
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                    Para llevarte el vuelto
                  </span>
                </div>

                {/* Chips rápidos de monto */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {QUICK_AMOUNTS.map((amt) => {
                    const isExact = amt === 'Monto exacto';
                    const isCurrent = isExact ? cashAmount === 'Exacto' : cashAmount === amt.replace('.', '');
                    return (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setCashAmount(isExact ? 'Exacto' : amt.replace('.', ''));
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                        style={{
                          backgroundColor: isCurrent 
                            ? 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.15)' 
                            : 'var(--bg-card)',
                          borderColor: isCurrent 
                            ? 'var(--primary-color)' 
                            : 'var(--border-color)',
                          color: isCurrent 
                            ? 'var(--primary-color)' 
                            : 'var(--text-muted)'
                        }}
                      >
                        {isExact ? amt : `$${amt}`}
                      </button>
                    );
                  })}
                </div>

                {/* Input manual */}
                <div className="relative pt-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
                    $
                  </span>
                  <input
                    type="text"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    placeholder="Otro monto... Ej: 15000"
                    className="w-full rounded-xl pl-8 pr-4 py-2 text-sm font-semibold border outline-none transition-all"
                    style={{
                      backgroundColor: 'var(--bg-card)',
                      borderColor: 'var(--border-color)',
                      color: 'var(--text-primary)'
                    }}
                  />
                </div>
              </div>
            )}

            {/* Aviso si paga por Tarjeta / Posnet */}
            {selectedPayment === 'tarjeta' && (
              <div 
                className="p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                style={{
                  backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.08)',
                  borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.2)',
                  color: 'var(--text-primary)'
                }}
              >
                <CreditCard className="w-5 h-5 shrink-0" style={{ color: 'var(--primary-color)' }} />
                <span>
                  El mozo llevará la <strong>terminal inalámbrica</strong> a tu mesa. Acepta Débito, Crédito y Contactless.
                </span>
              </div>
            )}

            {/* Aviso si paga por Mercado Pago / Transferencia */}
            {selectedPayment === 'transferencia' && (
              <div 
                className="p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-in fade-in duration-200"
                style={{
                  backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.08)',
                  borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.2)',
                  color: 'var(--text-primary)'
                }}
              >
                <Smartphone className="w-5 h-5 shrink-0" style={{ color: 'var(--primary-color)' }} />
                <span>
                  El mozo te mostrará el <strong>código QR o Alias bancario</strong> para abonar en el instante.
                </span>
              </div>
            )}

            {/* Observaciones y Chips de Aclaración */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Aclaración adicional
                </label>
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Opcional
                </span>
              </div>

              {/* Chips de notas rápidas */}
              <div className="flex flex-wrap gap-1.5 pb-1">
                {QUICK_NOTES.map((note) => {
                  const isChecked = billNotes.includes(note);
                  return (
                    <button
                      key={note}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setBillNotes(prev => prev.replace(note, '').replace(/\|\s*$/, '').trim());
                        } else {
                          setBillNotes(prev => prev ? `${prev} | ${note}` : note);
                        }
                      }}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer"
                      style={{
                        backgroundColor: isChecked 
                          ? 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.15)' 
                          : 'var(--bg-page)',
                        borderColor: isChecked 
                          ? 'var(--primary-color)' 
                          : 'var(--border-color)',
                        color: isChecked 
                          ? 'var(--primary-color)' 
                          : 'var(--text-muted)'
                      }}
                    >
                      {note} {isChecked && '✓'}
                    </button>
                  );
                })}
              </div>

              <input
                type="text"
                value={billNotes}
                onChange={(e) => setBillNotes(e.target.value)}
                placeholder="Ej: CUIT para factura, dividir pago en dos tarjetas..."
                className="w-full rounded-xl px-3.5 py-2.5 text-xs border outline-none transition-all"
                style={{
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>

            {/* Botones de Acción */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setBillModalOpen(false)}
                disabled={loadingBill}
                className="flex-1 py-3.5 px-4 rounded-xl font-bold text-xs border cursor-pointer transition-colors"
                style={{ 
                  backgroundColor: 'var(--bg-page)',
                  borderColor: 'var(--border-color)', 
                  color: 'var(--text-muted)' 
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRequestBill}
                disabled={loadingBill}
                className="flex-[2] py-3.5 px-4 rounded-xl font-black text-xs text-white shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
                style={{
                  backgroundColor: 'var(--primary-color)',
                  boxShadow: '0 8px 24px -4px rgba(var(--primary-color-rgb, 249, 115, 22), 0.45)'
                }}
              >
                {loadingBill ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Avisando al personal...</span>
                  </>
                ) : (
                  <>
                    <Receipt className="w-4 h-4" />
                    <span>Confirmar Pedido de Cuenta</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal 4: Éxito / Confirmación de Pedido de Cuenta para el Cliente */}
      {billSuccessModalOpen && lastBillData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="rounded-3xl p-6 sm:p-7 max-w-sm w-full text-center space-y-5 border shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200"
            style={{
              backgroundColor: 'var(--bg-card)',
              borderColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.35)',
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-modal)'
            }}
          >
            {/* Barra superior con gradiente de la marca */}
            <div 
              className="absolute top-0 inset-x-0 h-1.5"
              style={{
                background: 'linear-gradient(90deg, transparent, var(--primary-color), transparent)'
              }}
            />

            <button
              onClick={() => setBillSuccessModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-white bg-white/5 cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Ícono animado de éxito */}
            <div className="relative mx-auto w-16 h-16 flex items-center justify-center pt-1">
              <div 
                className="absolute inset-0 rounded-full animate-ping opacity-25"
                style={{ backgroundColor: 'var(--primary-color)' }}
              />
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center border shadow-lg relative z-10"
                style={{
                  backgroundColor: 'rgba(var(--primary-color-rgb, 249, 115, 22), 0.18)',
                  borderColor: 'var(--primary-color)',
                  color: 'var(--primary-color)'
                }}
              >
                <Receipt className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <div 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider mb-1 border"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.12)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  color: '#10b981'
                }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Aviso recibido por el personal
              </div>
              <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                ¡Cuenta Solicitada!
              </h3>
              <p className="text-xs sm:text-sm" style={{ color: 'var(--text-muted)' }}>
                El mozo ya fue notificado y se acerca a tu mesa con la cuenta.
              </p>
            </div>

            {/* Resumen de la Solicitud */}
            <div 
              className="p-4 rounded-2xl border space-y-2.5 text-left text-xs"
              style={{
                backgroundColor: 'var(--bg-page)',
                borderColor: 'var(--border-color)'
              }}
            >
              <div className="flex items-center justify-between">
                <span style={{ color: 'var(--text-muted)' }}>Mesa:</span>
                <span className="font-extrabold flex items-center gap-1" style={{ color: 'var(--primary-color)' }}>
                  <MapPin className="w-3.5 h-3.5" />
                  {lastBillData.table}
                </span>
              </div>

              <div className="flex items-center justify-between border-t pt-2" style={{ borderColor: 'var(--border-color)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Medio de pago:</span>
                <span className="font-bold" style={{ color: 'var(--text-primary)' }}>
                  {lastBillData.badge}
                </span>
              </div>

              {lastBillData.details && (
                <div className="border-t pt-2 text-[11px]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}>
                  <span className="font-medium">Detalle: </span>
                  <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {lastBillData.details}
                  </span>
                </div>
              )}
            </div>

            <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>
              ¡Muchas gracias por acompañarnos! Aguardá un momento.
            </p>

            <button
              type="button"
              onClick={() => setBillSuccessModalOpen(false)}
              className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-white shadow-lg cursor-pointer transition-all active:scale-[0.98]"
              style={{
                backgroundColor: 'var(--primary-color)',
                boxShadow: '0 8px 24px -4px rgba(var(--primary-color-rgb, 249, 115, 22), 0.45)'
              }}
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
