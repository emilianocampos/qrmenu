'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  LoyaltySettings,
  CustomerLoyaltyData,
  updateLoyaltySettings,
  redeemReward,
  manualAddStamp,
  createLoyaltyCustomer,
  updateLoyaltyCustomer,
  deleteLoyaltyCustomer,
} from '@/actions/loyalty';
import {
  DEFAULT_LOYALTY_WA_MESSAGE,
  DEFAULT_BIRTHDAY_BENEFIT,
  DEFAULT_BIRTHDAY_WA_MESSAGE,
  buildWhatsAppUrl,
  buildBirthdayMessage,
  getUpcomingBirthdays,
  getDaysUntilBirthday,
  formatBirthdayNumeric,
  formatBirthdayShort,
} from '@/lib/loyalty-utils';
import { UpcomingBirthdaysCard } from '@/components/dashboard/UpcomingBirthdaysCard';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { QRCodeCanvas } from 'qrcode.react';
import { buildZeroMarginQrCanvas } from '@/lib/table-qr-export';
import {
  Award,
  Gift,
  Plus,
  Search,
  Settings,
  Users,
  Sparkles,
  Mail,
  Phone,
  MessageCircle,
  Copy,
  Check,
  Cake,
  CreditCard,
  QrCode,
  Download,
  Pencil,
  Trash2,
  X,
  Loader2,
  Send,
  UserPlus,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface LoyaltyClientProps {
  businessId: string;
  businessSlug: string;
  businessName?: string;
  publicUrl?: string;
  initialSettings: LoyaltySettings;
  initialSubscribers: CustomerLoyaltyData[];
}

interface CustomerFormState {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_dni: string;
  customer_birthday: string;
  stamps_count: string;
  rewards_redeemed: string;
}

const emptyCustomerForm: CustomerFormState = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  customer_dni: '',
  customer_birthday: '',
  stamps_count: '0',
  rewards_redeemed: '0',
};

export function LoyaltyClient({
  businessId,
  businessSlug,
  businessName,
  publicUrl,
  initialSettings,
  initialSubscribers,
}: LoyaltyClientProps) {
  const [settings, setSettings] = useState<LoyaltySettings>(initialSettings);
  const [subscribers, setSubscribers] = useState<CustomerLoyaltyData[]>(initialSubscribers);
  const [searchQuery, setSearchQuery] = useState('');
  const [savingSettings, setSavingSettings] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copiedEmails, setCopiedEmails] = useState(false);
  const [copiedQrLink, setCopiedQrLink] = useState(false);
  const stampQrContainerRef = useRef<HTMLDivElement>(null);

  // CRUD Modal de Clientes
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<CustomerLoyaltyData | null>(null);
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(emptyCustomerForm);
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CustomerLoyaltyData | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState(false);

  // Modal Selector de Mensaje WhatsApp (Fidelidad vs Cumpleaños)
  const [waModalTarget, setWaModalTarget] = useState<CustomerLoyaltyData | null>(null);
  const [waMessageType, setWaMessageType] = useState<'loyalty' | 'birthday'>('loyalty');
  const [waCustomText, setWaCustomText] = useState('');

  const [stampQrUrl, setStampQrUrl] = useState<string>(
    `${(publicUrl || `https://mambaqr.vercel.app/c/${businessSlug}`).replace(/\/$/, '')}?stamp_qr=${encodeURIComponent(businessId)}`
  );

  useEffect(() => {
    let base = (publicUrl || '').replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      const host = window.location.hostname;
      if (host !== 'localhost' && host !== '127.0.0.1') {
        base = `${window.location.protocol}//${window.location.host}/c/${businessSlug}`;
      } else if (!base || base.includes('localhost') || base.includes('127.0.0.1')) {
        base = `http://192.168.1.9:3000/c/${businessSlug}`;
      }
    }
    setStampQrUrl(`${base}?stamp_qr=${encodeURIComponent(businessId)}`);
  }, [publicUrl, businessSlug, businessId]);

  const generateLoyaltyMessage = (sub: CustomerLoyaltyData) => {
    const template = settings.loyalty_whatsapp_message || DEFAULT_LOYALTY_WA_MESSAGE;
    const clientName = sub.customer_name?.trim() || 'Cliente';
    const bizName = businessName || businessSlug;
    const rewardTitle = settings.loyalty_reward_title || '¡Beneficio exclusivo!';
    const stampsInfo = `${sub.stamps_count}/${settings.loyalty_stamps_required}`;

    return template
      .replace(/{cliente}/gi, clientName)
      .replace(/{negocio}/gi, bizName)
      .replace(/{beneficio}/gi, rewardTitle)
      .replace(/{premio}/gi, rewardTitle)
      .replace(/{sellos}/gi, stampsInfo);
  };

  const generateBirthdayMessage = (sub: CustomerLoyaltyData) => {
    return buildBirthdayMessage(settings.loyalty_birthday_message, {
      clientName: sub.customer_name?.trim() || 'Cliente',
      businessName: businessName || businessSlug,
      benefit: settings.loyalty_birthday_benefit || DEFAULT_BIRTHDAY_BENEFIT,
      birthdayDate: formatBirthdayShort(sub.customer_birthday) || 'pronto',
    });
  };

  // Abre el modal selector antes de ir a WhatsApp API
  const openWhatsAppSelector = (sub: CustomerLoyaltyData, defaultType: 'loyalty' | 'birthday' = 'loyalty') => {
    if (!sub.customer_phone) {
      toast.warning('Este cliente no registró un número de teléfono / WhatsApp.');
      return;
    }
    setWaModalTarget(sub);
    setWaMessageType(defaultType);
    setWaCustomText(defaultType === 'birthday' ? generateBirthdayMessage(sub) : generateLoyaltyMessage(sub));
  };

  const handleSelectWaType = (type: 'loyalty' | 'birthday') => {
    if (!waModalTarget) return;
    setWaMessageType(type);
    setWaCustomText(
      type === 'birthday' ? generateBirthdayMessage(waModalTarget) : generateLoyaltyMessage(waModalTarget)
    );
  };

  const handleConfirmSendWhatsApp = () => {
    if (!waModalTarget || !waModalTarget.customer_phone) return;
    const textToSend = waCustomText.trim();
    if (!textToSend) {
      toast.error('Escribí un mensaje antes de enviar.');
      return;
    }
    const url = buildWhatsAppUrl(waModalTarget.customer_phone, textToSend);
    window.open(url, '_blank');
    setWaModalTarget(null);
  };

  const handleOpenEmail = (sub: CustomerLoyaltyData) => {
    const finalMsg = generateLoyaltyMessage(sub);
    const subject = encodeURIComponent(`Tu beneficio en ${businessName || businessSlug}: ${settings.loyalty_reward_title}`);
    const body = encodeURIComponent(finalMsg);
    window.open(`mailto:${sub.customer_email}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleCopyAllEmails = () => {
    if (subscribers.length === 0) {
      toast.info('No hay suscriptores para copiar');
      return;
    }
    const emailsList = Array.from(new Set(subscribers.map(s => s.customer_email).filter(Boolean))).join(', ');
    navigator.clipboard.writeText(emailsList);
    setCopiedEmails(true);
    toast.success(`Se copiaron ${subscribers.length} emails al portapapeles.`);
    setTimeout(() => setCopiedEmails(false), 2500);
  };

  const handleDownloadStampQr = () => {
    const canvas = stampQrContainerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
    if (!canvas) return;
    const qrCanvas = buildZeroMarginQrCanvas(canvas, 512);
    const link = document.createElement('a');
    link.download = `QR-Sellos-${businessSlug}.png`;
    link.href = qrCanvas.toDataURL('image/png');
    link.click();
    toast.success('QR de caja descargado correctamente.');
  };

  const handleCopyStampQrLink = () => {
    navigator.clipboard.writeText(stampQrUrl);
    setCopiedQrLink(true);
    toast.success('Enlace del QR de sellos copiado.');
    setTimeout(() => setCopiedQrLink(false), 2000);
  };

  // CRUD Handlers
  const openCreateCustomer = () => {
    setEditingCustomer(null);
    setCustomerForm(emptyCustomerForm);
    setCustomerModalOpen(true);
  };

  const openEditCustomer = (sub: CustomerLoyaltyData) => {
    setEditingCustomer(sub);
    setCustomerForm({
      customer_name: sub.customer_name || '',
      customer_email: sub.customer_email || '',
      customer_phone: sub.customer_phone || '',
      customer_dni: sub.customer_dni || '',
      customer_birthday: sub.customer_birthday ? String(sub.customer_birthday).split('T')[0] : '',
      stamps_count: String(sub.stamps_count ?? 0),
      rewards_redeemed: String(sub.rewards_redeemed ?? 0),
    });
    setCustomerModalOpen(true);
  };

  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.customer_email.trim()) {
      toast.error('El email es obligatorio.');
      return;
    }

    setSavingCustomer(true);
    try {
      if (editingCustomer) {
        const res = await updateLoyaltyCustomer(editingCustomer.id, businessId, {
          customer_name: customerForm.customer_name,
          customer_email: customerForm.customer_email,
          customer_phone: customerForm.customer_phone,
          customer_dni: customerForm.customer_dni,
          customer_birthday: customerForm.customer_birthday || null,
          stamps_count: parseInt(customerForm.stamps_count, 10) || 0,
          rewards_redeemed: parseInt(customerForm.rewards_redeemed, 10) || 0,
        });
        if (res.error) throw new Error(res.error);
        if (res.card) {
          setSubscribers(prev => prev.map(item => (item.id === editingCustomer.id ? res.card! : item)));
        }
        toast.success('Cliente actualizado correctamente.');
      } else {
        const res = await createLoyaltyCustomer(businessId, {
          customer_name: customerForm.customer_name,
          customer_email: customerForm.customer_email,
          customer_phone: customerForm.customer_phone,
          customer_dni: customerForm.customer_dni,
          customer_birthday: customerForm.customer_birthday || null,
          stamps_count: parseInt(customerForm.stamps_count, 10) || 0,
        });
        if (res.error) throw new Error(res.error);
        if (res.card) {
          setSubscribers(prev => [res.card!, ...prev]);
        }
        toast.success('Cliente creado en el programa de fidelización.');
      }
      setCustomerModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el cliente');
    } finally {
      setSavingCustomer(false);
    }
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!deleteTarget) return;
    setDeletingCustomer(true);
    try {
      const res = await deleteLoyaltyCustomer(deleteTarget.id, businessId);
      if (res.error) throw new Error(res.error);
      setSubscribers(prev => prev.filter(item => item.id !== deleteTarget.id));
      toast.success('Cliente eliminado del programa.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err.message || 'Error al eliminar el cliente');
    } finally {
      setDeletingCustomer(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      const res = await updateLoyaltySettings(businessId, settings);
      if (res.error) throw new Error(res.error);

      toast.success('¡Configuración de fidelización guardada con éxito!');
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar la configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleManualAddStamp = async (sub: CustomerLoyaltyData) => {
    setActionLoadingId(sub.id);
    try {
      const res = await manualAddStamp(sub.id, businessId);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setSubscribers(prev =>
          prev.map(item => (item.id === sub.id ? (res.card as CustomerLoyaltyData) : item))
        );
      } else {
        setSubscribers(prev =>
          prev.map(item =>
            item.id === sub.id
              ? {
                  ...item,
                  stamps_count: item.stamps_count + 1,
                  total_stamps_earned: item.total_stamps_earned + 1,
                }
              : item
          )
        );
      }

      if (res.rewardReached) {
        toast.success(
          `🎁 ¡${sub.customer_name || sub.customer_email} llegó al límite y ganó "${res.rewardTitle}"! Sellos reiniciados a 0.`,
          { duration: 6000 }
        );
      } else {
        toast.success(`Sello otorgado a ${sub.customer_name || sub.customer_email}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Error al agregar sello');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRedeemReward = async (sub: CustomerLoyaltyData) => {
    if (!confirm(`¿Confirmas el canje del premio para ${sub.customer_name || sub.customer_email}?`)) return;

    setActionLoadingId(sub.id);
    try {
      const res = await redeemReward(sub.id, businessId);
      if (res.error) throw new Error(res.error);

      if (res.card) {
        setSubscribers(prev =>
          prev.map(item => (item.id === sub.id ? (res.card as CustomerLoyaltyData) : item))
        );
      }

      toast.success(res.message || '¡Premio canjeado con éxito!', { icon: '🎁' });
    } catch (err: any) {
      toast.error(err.message || 'Error al canjear el premio');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSubscribers = subscribers.filter(sub => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      sub.customer_email.toLowerCase().includes(query) ||
      (sub.customer_name && sub.customer_name.toLowerCase().includes(query)) ||
      (sub.customer_phone && sub.customer_phone.includes(query)) ||
      (sub.customer_dni && sub.customer_dni.includes(query))
    );
  });

  const upcomingBirthdays = getUpcomingBirthdays(subscribers, 7);

  const totalRewardsUnlocked = subscribers.filter(
    s => s.stamps_count >= settings.loyalty_stamps_required
  ).length;

  const totalRewardsRedeemedCount = subscribers.reduce(
    (acc, s) => acc + (s.rewards_redeemed || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-amber-400" />
            Fidelización & Tarjeta de Sellos
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Administrá tus clientes frecuentes, sumá sellos digitales y enviá beneficios por WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateCustomer}
          className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black transition-all shadow-lg shadow-amber-500/20 cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Cliente</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Clientes Suscritos</p>
            <h3 className="text-2xl font-black text-white">{subscribers.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-[#121212] border border-pink-500/20 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0">
            <Cake className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Cumpleaños esta semana</p>
            <h3 className="text-2xl font-black text-pink-400">{upcomingBirthdays.length}</h3>
          </div>
        </div>

        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Premios Listos para Canjear</p>
            <h3 className="text-2xl font-black text-emerald-400">{totalRewardsUnlocked}</h3>
          </div>
        </div>

        <div className="p-5 bg-[#121212] border border-white/10 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400">Total Premios Canjeados</p>
            <h3 className="text-2xl font-black text-white">{totalRewardsRedeemedCount}</h3>
          </div>
        </div>
      </div>

      {/* 1. CLIENTES SUSCRITOS (CRUD COMPLETO - ARRIBA DE TODO PARA ACCESO RÁPIDO) */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              Clientes Suscritos ({filteredSubscribers.length})
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Creá, editá o eliminá clientes, sumá sellos y elegí qué mensaje enviar por WhatsApp (Fidelidad o Cumpleaños).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {subscribers.length > 0 && (
              <button
                type="button"
                onClick={handleCopyAllEmails}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 transition-all cursor-pointer"
                title="Copiar lista de todos los correos para envío masivo"
              >
                {copiedEmails ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedEmails ? '¡Copiados!' : 'Copiar Emails'}</span>
              </button>
            )}

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por email, nombre, DNI o cel..."
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {filteredSubscribers.length === 0 ? (
          <div className="p-12 text-center text-gray-500 space-y-3">
            <Users className="w-12 h-12 mx-auto text-gray-600" />
            <p className="font-semibold text-gray-400">No se encontraron suscriptores</p>
            <p className="text-xs">Los clientes se registrarán al usar la tarjeta de sellos o podés agregarlos manualmente.</p>
            <button
              type="button"
              onClick={openCreateCustomer}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-black cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              Agregar primer cliente
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-400 border-b border-white/10 bg-white/5">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Cliente y Contacto</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Sellos Activos</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Histórico</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Canjeados</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Estado Premio</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredSubscribers.map(sub => {
                  const isReadyToRedeem = sub.stamps_count >= settings.loyalty_stamps_required;
                  const isLoading = actionLoadingId === sub.id;
                  const daysUntilBday = getDaysUntilBirthday(sub.customer_birthday);
                  const isBdaySoon = daysUntilBday !== null && daysUntilBday >= 0 && daysUntilBday <= 7;

                  return (
                    <tr key={sub.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-medium text-white flex items-center gap-2">
                          <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                          <span>{sub.customer_email}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {sub.customer_name && (
                            <span className="text-xs text-gray-300 font-medium">{sub.customer_name}</span>
                          )}
                          {sub.customer_dni && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                              <CreditCard className="w-3 h-3" />
                              DNI {sub.customer_dni}
                            </span>
                          )}
                          {sub.customer_birthday && (
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                                isBdaySoon
                                  ? 'text-pink-300 bg-pink-500/15 border-pink-500/30 font-bold'
                                  : 'text-gray-300 bg-white/5 border-white/10'
                              }`}
                            >
                              <Cake className="w-3 h-3 text-pink-400" />
                              {formatBirthdayNumeric(sub.customer_birthday)}
                              {daysUntilBday === 0
                                ? ' (¡Hoy!)'
                                : isBdaySoon
                                ? ` (en ${daysUntilBday}d)`
                                : ''}
                            </span>
                          )}
                          {sub.customer_phone ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md">
                              <Phone className="w-3 h-3" />
                              {sub.customer_phone}
                            </span>
                          ) : (
                            <span className="text-[10px] text-gray-500">Sin teléfono</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                          {sub.stamps_count} / {settings.loyalty_stamps_required}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-gray-300">
                        {sub.total_stamps_earned}
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-gray-300">
                        {sub.rewards_redeemed || 0}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {isReadyToRedeem ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 animate-pulse">
                            <Gift className="w-3.5 h-3.5" /> ¡Listo!
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 font-medium">
                            En progreso ({sub.stamps_count}/{settings.loyalty_stamps_required})
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón WhatsApp -> Abre modal selector (Fidelidad o Cumpleaños) */}
                          {sub.customer_phone && (
                            <button
                              type="button"
                              onClick={() => openWhatsAppSelector(sub, isBdaySoon ? 'birthday' : 'loyalty')}
                              className="px-2.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white border border-emerald-500/30 font-medium text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                              title="Elegir mensaje (Fidelidad o Cumpleaños) y enviar por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span className="hidden xl:inline">WhatsApp</span>
                            </button>
                          )}

                          {/* Botón Email */}
                          <button
                            type="button"
                            onClick={() => handleOpenEmail(sub)}
                            className="p-1.5 bg-blue-500/10 hover:bg-blue-500/25 text-blue-300 border border-blue-500/20 rounded-xl transition-all cursor-pointer"
                            title="Enviar correo con el beneficio"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón +1 Sello */}
                          <button
                            type="button"
                            onClick={() => handleManualAddStamp(sub)}
                            disabled={isLoading}
                            className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer border border-amber-500/40 shadow-sm disabled:opacity-50"
                            title="Agregar 1 sello a este cliente"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Sello</span>
                          </button>

                          {/* Botón Canjear */}
                          {isReadyToRedeem && (
                            <button
                              type="button"
                              onClick={() => handleRedeemReward(sub)}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1 cursor-pointer shadow-lg shadow-amber-600/20"
                            >
                              <Gift className="w-3.5 h-3.5" />
                              <span>Canjear</span>
                            </button>
                          )}

                          {/* Botón Editar (CRUD) */}
                          <button
                            type="button"
                            onClick={() => openEditCustomer(sub)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                            title="Editar cliente y sellos"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          {/* Botón Eliminar (CRUD) */}
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(sub)}
                            className="p-1.5 rounded-xl text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Eliminar cliente"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 2. Recordatorio de Cumpleaños de la Semana */}
      <UpcomingBirthdaysCard
        birthdays={upcomingBirthdays}
        businessName={businessName || businessSlug}
        businessSlug={businessSlug}
        birthdayBenefit={settings.loyalty_birthday_benefit}
        birthdayMessageTemplate={settings.loyalty_birthday_message}
      />

      {/* 3. QR Fijo de Caja para Sumar Sellos (con aprobación en vivo) */}
      <div className="bg-[#121212] border border-amber-500/25 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6">
        <div
          ref={stampQrContainerRef}
          className="bg-white p-3 rounded-2xl shadow-xl shrink-0 flex items-center justify-center"
        >
          <QRCodeCanvas
            value={stampQrUrl}
            size={200}
            level="M"
            marginSize={2}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        </div>

        <div className="flex-1 space-y-3 text-center md:text-left min-w-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30">
            <QrCode className="w-3.5 h-3.5" />
            QR Fijo de Caja · Antifraude
          </div>
          <h2 className="text-xl font-bold text-white">
            QR único para sumar sellos en el mostrador
          </h2>
          <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-xl">
            Imprimí este código QR y pegalo en la caja. Cuando un cliente lo escanee desde su tarjeta de sellos (o con la cámara del celular), te sonará una alerta en vivo en el panel para <strong className="text-white">Aprobar</strong> o <strong className="text-white">Rechazar</strong> el sello en 1 clic.
          </p>

          <div className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 max-w-xl mx-auto md:mx-0">
            <span className="text-[11px] font-mono text-amber-300 truncate flex-1 select-all">{stampQrUrl}</span>
            <a
              href={stampQrUrl}
              target="_blank"
              rel="noreferrer"
              className="text-gray-400 hover:text-white transition-colors shrink-0"
              title="Probar enlace del QR en nueva pestaña"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleDownloadStampQr}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20"
            >
              <Download className="w-4 h-4" />
              <span>Descargar QR (PNG)</span>
            </button>

            <button
              type="button"
              onClick={handleCopyStampQrLink}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-gray-200 border border-white/10 font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {copiedQrLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedQrLink ? '¡Enlace copiado!' : 'Copiar enlace'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. Settings Form (Configuración del Programa y Plantillas) */}
      <div className="bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Configuración del Programa</h2>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.loyalty_enabled}
              onChange={e => setSettings({ ...settings, loyalty_enabled: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
            <span className="ml-3 text-sm font-semibold text-white">
              {settings.loyalty_enabled ? 'Programa Activo' : 'Programa Desactivado'}
            </span>
          </label>
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Sellos Requeridos para el Premio
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={settings.loyalty_stamps_required}
                onChange={e => setSettings({ ...settings, loyalty_stamps_required: parseInt(e.target.value) || 5 })}
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Cantidad de días/sellos que el cliente debe acumular para ganar la recompensa.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Título del Premio / Beneficio
              </label>
              <input
                type="text"
                value={settings.loyalty_reward_title}
                onChange={e => setSettings({ ...settings, loyalty_reward_title: e.target.value })}
                placeholder="ej. ¡Café + Medialuna Gratis!"
                className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nombre del beneficio que se le muestra al cliente en su tarjeta.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Descripción y Condiciones del Premio
            </label>
            <textarea
              rows={2}
              value={settings.loyalty_reward_description}
              onChange={e => setSettings({ ...settings, loyalty_reward_description: e.target.value })}
              placeholder="ej. Válido consumiendo en el local. Muestra esta tarjeta al mozo."
              className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Editor de Mensaje Predeterminado de WhatsApp (Fidelización) */}
          <div className="pt-4 border-t border-white/10 space-y-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                Mensaje de WhatsApp — Fidelización / Sellos
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Plantilla utilizada cuando elegís enviar el mensaje de fidelización por WhatsApp.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-gray-500 font-semibold">Variables dinámicas:</span>
              {[
                { tag: '{cliente}', label: 'Nombre del cliente' },
                { tag: '{negocio}', label: 'Nombre del local' },
                { tag: '{beneficio}', label: 'Beneficio asignado' },
                { tag: '{sellos}', label: 'Progreso de sellos' },
              ].map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => {
                    const current = settings.loyalty_whatsapp_message || DEFAULT_LOYALTY_WA_MESSAGE;
                    setSettings({ ...settings, loyalty_whatsapp_message: `${current} ${v.tag}` });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 transition-all cursor-pointer font-mono"
                  title={`Insertar ${v.tag}`}
                >
                  +{v.tag}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={settings.loyalty_whatsapp_message ?? DEFAULT_LOYALTY_WA_MESSAGE}
              onChange={e => setSettings({ ...settings, loyalty_whatsapp_message: e.target.value })}
              placeholder={DEFAULT_LOYALTY_WA_MESSAGE}
              className="w-full bg-[#1a1a1a] border border-emerald-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
            />

            <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Vista previa en WhatsApp Web:
              </span>
              <div className="bg-[#005c4b] text-white text-xs p-3 rounded-xl rounded-tl-none max-w-md shadow-md leading-relaxed whitespace-pre-wrap">
                {(settings.loyalty_whatsapp_message || DEFAULT_LOYALTY_WA_MESSAGE)
                  .replace(/{cliente}/gi, 'Juan Pérez')
                  .replace(/{negocio}/gi, businessName || businessSlug)
                  .replace(/{beneficio}/gi, settings.loyalty_reward_title || '¡Beneficio!')
                  .replace(/{premio}/gi, settings.loyalty_reward_title || '¡Beneficio!')
                  .replace(/{sellos}/gi, `5/${settings.loyalty_stamps_required}`)}
                <div className="text-[9px] text-emerald-200/60 text-right mt-1">12:30 ✓✓</div>
              </div>
            </div>
          </div>

          {/* Configuración de Cumpleaños y Mensaje de WhatsApp */}
          <div id="cumpleanos" className="pt-5 border-t border-white/10 space-y-4 scroll-mt-24">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                <Cake className="w-4 h-4 text-pink-400" />
                Beneficio y Mensaje de WhatsApp — Cumpleaños
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Definí el regalo o descuento para cumpleañeros y la plantilla que se carga al elegir &ldquo;Cumpleaños&rdquo; en WhatsApp.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                Beneficio de Cumpleaños
              </label>
              <input
                type="text"
                value={settings.loyalty_birthday_benefit ?? DEFAULT_BIRTHDAY_BENEFIT}
                onChange={e => setSettings({ ...settings, loyalty_birthday_benefit: e.target.value })}
                placeholder={DEFAULT_BIRTHDAY_BENEFIT}
                className="w-full bg-[#1a1a1a] border border-pink-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] text-gray-500 font-semibold">Variables dinámicas:</span>
              {[
                { tag: '{cliente}', label: 'Nombre del cliente' },
                { tag: '{negocio}', label: 'Nombre del local' },
                { tag: '{beneficio}', label: 'Beneficio de cumpleaños' },
                { tag: '{fecha_cumple}', label: 'Fecha de cumpleaños' },
              ].map(v => (
                <button
                  key={v.tag}
                  type="button"
                  onClick={() => {
                    const current = settings.loyalty_birthday_message || DEFAULT_BIRTHDAY_WA_MESSAGE;
                    setSettings({ ...settings, loyalty_birthday_message: `${current} ${v.tag}` });
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-pink-500/10 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 transition-all cursor-pointer font-mono"
                  title={`Insertar ${v.tag}`}
                >
                  +{v.tag}
                </button>
              ))}
            </div>

            <textarea
              rows={3}
              value={settings.loyalty_birthday_message ?? DEFAULT_BIRTHDAY_WA_MESSAGE}
              onChange={e => setSettings({ ...settings, loyalty_birthday_message: e.target.value })}
              placeholder={DEFAULT_BIRTHDAY_WA_MESSAGE}
              className="w-full bg-[#1a1a1a] border border-pink-500/20 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-pink-500 font-sans leading-relaxed"
            />

            <div className="bg-[#0b141a] p-3.5 rounded-2xl border border-white/5 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block">
                Vista previa de saludo de cumpleaños en WhatsApp:
              </span>
              <div className="bg-[#005c4b] text-white text-xs p-3 rounded-xl rounded-tl-none max-w-md shadow-md leading-relaxed whitespace-pre-wrap">
                {buildBirthdayMessage(settings.loyalty_birthday_message, {
                  clientName: 'Juan Pérez',
                  businessName: businessName || businessSlug,
                  benefit: settings.loyalty_birthday_benefit || DEFAULT_BIRTHDAY_BENEFIT,
                  birthdayDate: '24 de noviembre',
                })}
                <div className="text-[9px] text-emerald-200/60 text-right mt-1">12:30 ✓✓</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded-xl text-sm transition-all shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Guardando...' : 'Guardar Configuración'}
            </button>
          </div>
        </form>
      </div>

      {/* MODAL 1: SELECTOR DE MENSAJE WHATSAPP (Fidelidad vs Cumpleaños) */}
      {waModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setWaModalTarget(null)} />
          <div className="relative bg-[#121212] border border-white/15 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Enviar mensaje por WhatsApp</h3>
                  <p className="text-xs text-gray-400">
                    Para: <strong className="text-white">{waModalTarget.customer_name || waModalTarget.customer_email}</strong> ({waModalTarget.customer_phone})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWaModalTarget(null)}
                className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5">
                  ¿Qué mensaje querés enviar?
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectWaType('loyalty')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      waMessageType === 'loyalty'
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white shadow-md shadow-emerald-500/10'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <Gift className={`w-5 h-5 shrink-0 mt-0.5 ${waMessageType === 'loyalty' ? 'text-emerald-400' : 'text-gray-500'}`} />
                    <div>
                      <div className="text-sm font-bold text-white">Fidelización</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        Sellos ({waModalTarget.stamps_count}/{settings.loyalty_stamps_required}) y premio
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectWaType('birthday')}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-2.5 ${
                      waMessageType === 'birthday'
                        ? 'bg-pink-500/15 border-pink-500/50 text-white shadow-md shadow-pink-500/10'
                        : 'bg-white/[0.03] border-white/10 text-gray-400 hover:bg-white/[0.06]'
                    }`}
                  >
                    <Cake className={`w-5 h-5 shrink-0 mt-0.5 ${waMessageType === 'birthday' ? 'text-pink-400' : 'text-gray-500'}`} />
                    <div>
                      <div className="text-sm font-bold text-white">Cumpleaños</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {waModalTarget.customer_birthday
                          ? formatBirthdayShort(waModalTarget.customer_birthday)
                          : 'Saludo y beneficio'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Mensaje a enviar (podés editarlo antes de abrir WhatsApp)
                </label>
                <textarea
                  rows={4}
                  value={waCustomText}
                  onChange={e => setWaCustomText(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/15 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setWaModalTarget(null)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSendWhatsApp}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-500 hover:bg-emerald-400 text-white shadow-lg shadow-emerald-500/25 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Abrir en WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CRUD CREAR / EDITAR CLIENTE */}
      {customerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setCustomerModalOpen(false)} />
          <div className="relative bg-[#121212] border border-white/15 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161616]">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {editingCustomer ? <Pencil className="w-4 h-4 text-amber-400" /> : <UserPlus className="w-4 h-4 text-amber-400" />}
                {editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente de Fidelización'}
              </h3>
              <button
                type="button"
                onClick={() => setCustomerModalOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={customerForm.customer_name}
                  onChange={e => setCustomerForm(f => ({ ...f, customer_name: e.target.value }))}
                  placeholder="Ej: Juan Pérez"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerForm.customer_email}
                  onChange={e => setCustomerForm(f => ({ ...f, customer_email: e.target.value }))}
                  placeholder="ejemplo@correo.com"
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    WhatsApp / Teléfono
                  </label>
                  <input
                    type="tel"
                    value={customerForm.customer_phone}
                    onChange={e => setCustomerForm(f => ({ ...f, customer_phone: e.target.value }))}
                    placeholder="11 2345-6789"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    DNI (Contraseña)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={customerForm.customer_dni}
                    onChange={e => setCustomerForm(f => ({ ...f, customer_dni: e.target.value.replace(/[^\d.]/g, '') }))}
                    placeholder="38456789"
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={customerForm.customer_birthday}
                    onChange={e => setCustomerForm(f => ({ ...f, customer_birthday: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Sellos Activos
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={customerForm.stamps_count}
                    onChange={e => setCustomerForm(f => ({ ...f, stamps_count: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {editingCustomer && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Premios Canjeados
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={customerForm.rewards_redeemed}
                    onChange={e => setCustomerForm(f => ({ ...f, rewards_redeemed: e.target.value }))}
                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setCustomerModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingCustomer}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {savingCustomer ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <span>{editingCustomer ? 'Guardar Cambios' : 'Crear Cliente'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Diálogo Confirmar Eliminación */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Eliminar cliente"
        description={`¿Estás seguro de eliminar a ${deleteTarget?.customer_name || deleteTarget?.customer_email || 'este cliente'} del programa de fidelización? Se perderán sus sellos acumulados.`}
        confirmLabel="Eliminar"
        onConfirm={handleConfirmDeleteCustomer}
        onCancel={() => setDeleteTarget(null)}
        danger
        loading={deletingCustomer}
      />
    </div>
  );
}
