'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { 
  Loader2, Save, Trash2, AlertTriangle, Volume2, VolumeX, Smartphone, 
  UserCheck, Plus, X, User, Utensils, FileText, CheckCircle2, BellRing,
  Music, Clock, Play, Square, Bell, Sparkles, Radio
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { ModeSelector } from '@/components/orders/ModeSelector';
import { updateBusiness, deleteBusiness } from '@/actions/business';
import { updateUserCredentials } from '@/actions/auth';
import { updateWaiterSettings, WaiterSettings } from '@/actions/waiters';
import { Business } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  SOUND_OPTIONS, 
  playNotificationSound, 
  stopNotificationSound, 
  saveStoredSoundSettings, 
  getStoredSoundSettings,
  NotificationToneId
} from '@/lib/soundPlayer';

const FieldInput = ({ label, value, onChange, type = 'text', placeholder }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
    />
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
    <h3 className="text-sm font-semibold text-white mb-5 pb-4 border-b border-white/8">{title}</h3>
    <div className="space-y-5">{children}</div>
  </div>
);

interface SettingsClientProps {
  business: Business;
  productsCount: number;
  categoriesCount: number;
  userEmail: string;
  initialWaiterSettings?: WaiterSettings;
}

export function SettingsClient({ business, productsCount, categoriesCount, userEmail, initialWaiterSettings }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: business.name,
    slug: business.slug,
    table_orders_enabled: (business as any).table_orders_enabled ?? false,
    order_status_enabled: (business as any).order_status_enabled ?? false,
    notification_sound_enabled: (business as any).notification_sound_enabled ?? true,
    notification_vibrate_enabled: (business as any).notification_vibrate_enabled ?? true,
    notification_sound_tone: (business as any).notification_sound_tone ?? 'chime_classic',
    notification_sound_duration: (business as any).notification_sound_duration ?? 5,
    mp_access_token: (business as any).mp_access_token ?? '',
  });

  const [activePreviewTone, setActivePreviewTone] = useState<string | null>(null);
  const [browserNotificationPerm, setBrowserNotificationPerm] = useState<string>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setBrowserNotificationPerm(Notification.permission);
    }
    const stored = getStoredSoundSettings();
    setForm(prev => ({
      ...prev,
      notification_sound_tone: (business as any).notification_sound_tone || stored.tone || 'chime_classic',
      notification_sound_duration: (business as any).notification_sound_duration || stored.duration || 5,
    }));
  }, [business]);

  const requestBrowserPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      toast.error('Tu navegador no soporta notificaciones de escritorio.');
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserNotificationPerm(perm);
      if (perm === 'granted') {
        toast.success('¡Notificaciones en segundo plano activadas en Google Chrome!');
        new Notification('🔔 ¡Notificaciones de MambaQR activadas!', {
          body: 'Escucharás la campana y verás los avisos cuando los clientes llamen o pidan la cuenta.',
          icon: '/icon.png',
        });
      } else if (perm === 'denied') {
        toast.error('Las notificaciones están bloqueadas en los ajustes de tu navegador.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTonePreview = (toneId: NotificationToneId) => {
    if (activePreviewTone === toneId) {
      stopNotificationSound();
      setActivePreviewTone(null);
      return;
    }

    stopNotificationSound();
    setActivePreviewTone(toneId);
    playNotificationSound({
      tone: toneId,
      durationSeconds: form.notification_sound_duration,
      vibrate: form.notification_vibrate_enabled,
    });

    setTimeout(() => {
      setActivePreviewTone(prev => (prev === toneId ? null : prev));
    }, form.notification_sound_duration * 1000);
  };

  const testNotification = () => {
    if (activePreviewTone === 'all') {
      stopNotificationSound();
      setActivePreviewTone(null);
      return;
    }

    stopNotificationSound();
    setActivePreviewTone('all');

    // 1. Sonido y vibración con duración configurada (1 a 10s)
    if (form.notification_sound_enabled) {
      playNotificationSound({
        tone: form.notification_sound_tone,
        durationSeconds: form.notification_sound_duration,
        vibrate: form.notification_vibrate_enabled,
      });
    }

    // 2. Notificación Google Chrome en 2do plano
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('🔔 Prueba de aviso: ¡Mesa 3 pide la cuenta! 💳', {
        body: `Sonando durante ${form.notification_sound_duration}s con tono seleccionado.`,
        icon: '/icon.png',
      });
    }

    toast.success(`Sonando alerta durante ${form.notification_sound_duration} segundos.`);

    setTimeout(() => {
      setActivePreviewTone(prev => (prev === 'all' ? null : prev));
    }, form.notification_sound_duration * 1000);
  };

  const [accountForm, setAccountForm] = useState({
    email: userEmail,
    password: '',
    confirmPassword: '',
  });

  const [waiterEnabled, setWaiterEnabled] = useState(
    initialWaiterSettings?.waiter_assignment_enabled ?? false
  );
  const [waitersList, setWaitersList] = useState<string[]>(
    initialWaiterSettings?.waiters ?? ['Agustina', 'Camila', 'Facundo', 'Juan', 'Lucas', 'Sofía']
  );
  const [newWaiterName, setNewWaiterName] = useState('');

  const handleAddWaiter = () => {
    const trimmed = newWaiterName.trim();
    if (!trimmed) return;
    if (waitersList.some(w => w.toLowerCase() === trimmed.toLowerCase())) {
      toast.error('Ese mozo ya existe en la lista');
      return;
    }
    setWaitersList(prev => [...prev, trimmed]);
    setNewWaiterName('');
  };

  const handleRemoveWaiter = (nameToRemove: string) => {
    if (waitersList.length <= 1) {
      toast.error('Debe haber al menos un mozo configurado');
      return;
    }
    setWaitersList(prev => prev.filter(w => w !== nameToRemove));
  };

  const handleSave = () => {
    setError(null);
    setSaved(false);

    if (accountForm.password) {
      if (accountForm.password !== accountForm.confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    startTransition(async () => {
      const result = await updateBusiness(business.id, {
        name: form.name,
        slug: form.slug,
        table_orders_enabled: form.table_orders_enabled,
        order_status_enabled: form.order_status_enabled,
        notification_sound_enabled: form.notification_sound_enabled,
        notification_vibrate_enabled: form.notification_vibrate_enabled,
        notification_sound_tone: form.notification_sound_tone,
        notification_sound_duration: form.notification_sound_duration,
      } as any);

      saveStoredSoundSettings(form.notification_sound_tone, form.notification_sound_duration);

      // Save waiters config
      const waiterResult = await updateWaiterSettings(business.id, {
        waiter_assignment_enabled: waiterEnabled,
        waiters: waitersList,
      });

      let accountError = null;
      if (accountForm.email !== userEmail || accountForm.password) {
        const accResult = await updateUserCredentials({
          email: accountForm.email !== userEmail ? accountForm.email : undefined,
          password: accountForm.password ? accountForm.password : undefined
        });
        if (accResult.error) accountError = accResult.error;
      }

      if (result.error || accountError || waiterResult.error) {
        setError(result.error || accountError || waiterResult.error || 'Error al guardar');
        toast.error(result.error || accountError || waiterResult.error || 'Error al guardar la configuración');
      } else {
        setSaved(true);
        setAccountForm(f => ({ ...f, password: '', confirmPassword: '' }));
        toast.success('Configuración guardada correctamente.');
        router.refresh();
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBusiness(business.id);
      if (result.error) {
        setError(result.error);
        setConfirmDeleteOpen(false);
      } else {
        toast.success('Negocio eliminado');
        router.push('/dashboard');
      }
    });
  };

  const generateSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const update = (key: string, value: any) => setForm(f => {
    const newForm = { ...f, [key]: value };
    if (key === 'name') {
      newForm.slug = generateSlug(value);
    }
    return newForm;
  });
  const updateAccount = (key: string, value: string) => setAccountForm(f => ({ ...f, [key]: value }));

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Administrá la información de tu negocio y modo de pedidos"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Configuración' }]}
        action={
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                       disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : saved ? '✓ Guardado' : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Productos', value: productsCount },
            { label: 'Categorías', value: categoriesCount },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* General */}
        <Section title="Información básica">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <FieldInput label="Nombre del negocio" value={form.name} onChange={v => update('name', v)} />
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL)</label>
              <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden
                              focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all">
                <span className="px-3 py-3 text-sm text-gray-600 border-r border-white/10 flex-shrink-0">/c/</span>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => update('slug', e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-600 px-3 py-3 text-sm focus:outline-none"
                />
              </div>
            </div>
          </div>
        </Section>

        {/* Pedidos y Atención en Mesa */}
        <Section title="Atención y Pedidos en Mesa">
          <div className="space-y-4">
            {/* Switch Pedidos desde la mesa */}
            <label className="flex items-start justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3 pr-4">
                <div className="w-10 h-10 rounded-xl bg-orange-500/15 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Pedidos desde la mesa</p>
                    {form.table_orders_enabled ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Activado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-gray-400 border border-white/10">
                        Desactivado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Permite a los clientes seleccionar platos y realizar pedidos desde la carta digital. 
                    <span className="text-amber-300/90 font-medium"> Al desactivarlo, se quita el botón &quot;Pedir&quot; de las tarjetas de productos y se oculta el carrito.</span>
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.table_orders_enabled}
                onChange={e => update('table_orders_enabled', e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-orange-500 focus:ring-orange-500 shrink-0 mt-1 cursor-pointer"
              />
            </label>

            {/* Switch Estado del Pedido / Mis Pedidos */}
            <label className="flex items-start justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-start gap-3 pr-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Estado del pedido (Mis Pedidos)</p>
                    {form.order_status_enabled ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Activado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-white/10 text-gray-400 border border-white/10">
                        Desactivado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Muestra el enlace &quot;Mis Pedidos&quot; en la navegación de la carta para consultar el estado del pedido en tiempo real.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.order_status_enabled}
                onChange={e => update('order_status_enabled', e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-500 focus:ring-blue-500 shrink-0 mt-1 cursor-pointer"
              />
            </label>

            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300/90 flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>Atención en mesa activa:</strong> Tus clientes siempre podrán usar las funciones de <strong>Llamar al mozo</strong> y <strong>Pedir la cuenta</strong> directamente desde su mesa, con avisos sonoros instantáneos.
              </span>
            </div>
          </div>
        </Section>

        {/* Modo de Pedidos */}
        <Section title="Modo de pedidos">
          <p className="text-xs text-gray-400 -mt-2 mb-4">
            Seleccioná la modalidad de atención para tus clientes desde la carta digital.
          </p>
          <ModeSelector businessId={business.id} initialMode={business.order_mode || 'menu_only'} />
        </Section>

        {/* Gestión de Mozos / MaxiRest */}
        <Section title="Gestión de Mozos (Integración MaxiRest / Comandas)">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
              <div className="flex items-center gap-3 pr-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">Asignar mozo al aceptar pedidos</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Al aceptar un pedido desde el panel, podrás seleccionar qué mozo atiende la mesa. Esto prepara el pedido para abrir la comanda en MaxiRest.
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={waiterEnabled}
                  onChange={(e) => setWaiterEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {waiterEnabled && (
              <div className="space-y-4 p-4 bg-white/[0.02] border border-white/8 rounded-xl">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                    Lista de Mozos ({waitersList.length})
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {waitersList.map((waiter) => (
                      <span
                        key={waiter}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-medium"
                      >
                        <User className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{waiter}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveWaiter(waiter)}
                          className="text-gray-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer"
                          title="Eliminar mozo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newWaiterName}
                      onChange={(e) => setNewWaiterName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddWaiter();
                        }
                      }}
                      placeholder="Nombre del nuevo mozo..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddWaiter}
                      className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-xs text-indigo-300 leading-relaxed">
                  💡 <strong>Flujo MaxiRest / Sistema Local:</strong> Cada vez que aceptes un pedido con un mozo asignado, la orden registrará la mesa y el mozo. Tu agente de escritorio local (<code>.exe</code> en la PC del restaurante) capturará esta acción en tiempo real y abrirá la comanda en MaxiRest.
                </div>
              </div>
            )}
          </div>
        </Section>

        {/* Notificaciones Prefeferencias */}
        <Section title="Sonido, Vibración y Segundo Plano (Google Chrome)">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  {form.notification_sound_enabled ? (
                    <Volume2 className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-gray-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">Sonido de notificaciones</p>
                    <p className="text-xs text-gray-400">Reproducir alerta al recibir pedidos, llamados o pedidos de cuenta</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.notification_sound_enabled}
                  onChange={e => update('notification_sound_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-violet-400" />
                  <div>
                    <p className="text-sm font-medium text-white">Vibración (Tablets y Celulares)</p>
                    <p className="text-xs text-gray-400">Vibrar dispositivo si el hardware lo soporta</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.notification_vibrate_enabled}
                  onChange={e => update('notification_vibrate_enabled', e.target.checked)}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500 cursor-pointer"
                />
              </label>
            </div>

            {/* Selector de Tono y Barra de Intensidad/Duración (1 a 10s) */}
            {form.notification_sound_enabled && (
              <div className="space-y-6 p-5 bg-white/[0.02] border border-white/10 rounded-2xl animate-in fade-in duration-300">
                {/* 1. Selector de Sonido */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <Music className="w-4 h-4 text-indigo-400" />
                        Elegir Tono de Notificación
                      </h4>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Seleccioná el estilo de campana o alerta sonora que mejor se adapte al ambiente de tu salón.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {SOUND_OPTIONS.map((opt) => {
                      const isSelected = form.notification_sound_tone === opt.id;
                      const isPlaying = activePreviewTone === opt.id;

                      return (
                        <div
                          key={opt.id}
                          onClick={() => {
                            update('notification_sound_tone', opt.id);
                            saveStoredSoundSettings(opt.id, form.notification_sound_duration);
                          }}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md shadow-indigo-500/10'
                              : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/[0.07]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                isSelected
                                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                                  : 'bg-white/5 text-gray-400 border-white/10'
                              }`}>
                                {opt.badge}
                              </span>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                                isSelected ? 'border-indigo-400 bg-indigo-500 text-white' : 'border-white/20'
                              }`}>
                                {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                              </div>
                            </div>

                            <p className="text-xs font-bold text-white line-clamp-1">
                              {opt.name}
                            </p>
                            <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                              {opt.description}
                            </p>
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] text-gray-500 font-medium">
                              {isSelected ? '✓ Seleccionado' : 'Click para elegir'}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTonePreview(opt.id as any);
                              }}
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isPlaying
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/10'
                              }`}
                            >
                              {isPlaying ? (
                                <>
                                  <Square className="w-3 h-3 fill-current" />
                                  <span>Detener</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Escuchar</span>
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Barra Tipo Select del 1 al 10 de Intensidad de Duración en Segundos */}
                <div className="pt-4 border-t border-white/10 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-400" />
                          Duración e Intensidad de la Alerta Sonora
                        </h4>
                        <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {form.notification_sound_duration} {form.notification_sound_duration === 1 ? 'segundo' : 'segundos'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Elegí del 1 al 10 cuántos segundos continuará sonando y vibrando la alerta al recibir un aviso.
                      </p>
                    </div>

                    {/* Badge contextual de intensidad */}
                    <div className="shrink-0">
                      {form.notification_sound_duration <= 3 ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          Corta • Salón tranquilo / Café
                        </span>
                      ) : form.notification_sound_duration <= 6 ? (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/25 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                          Moderada • Recomendada para salón
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[11px] font-bold rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/25 inline-flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                          Intensa • Cocina / Salón con música fuerte
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Slider de rango del 1 al 10 */}
                  <div className="px-1 py-1">
                    <input
                      type="range"
                      min={1}
                      max={10}
                      step={1}
                      value={form.notification_sound_duration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        update('notification_sound_duration', val);
                        saveStoredSoundSettings(form.notification_sound_tone, val);
                      }}
                      className="w-full h-2.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                    />
                  </div>

                  {/* Barra tipo Select: Botones del 1 al 10 */}
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((sec) => {
                      const isSelected = form.notification_sound_duration === sec;
                      return (
                        <button
                          key={sec}
                          type="button"
                          onClick={() => {
                            update('notification_sound_duration', sec);
                            saveStoredSoundSettings(form.notification_sound_tone, sec);
                          }}
                          className={`py-2 px-1 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center border cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30 scale-105'
                              : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          <span className="text-sm font-extrabold">{sec}</span>
                          <span className="text-[9px] font-medium opacity-70">seg</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Avisos en Segundo Plano (Google Chrome) */}
            <div className="p-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border border-indigo-500/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                  <BellRing className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white">Campana y Avisos de Google Chrome en Segundo Plano</p>
                    {browserNotificationPerm === 'granted' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Activo ✓
                      </span>
                    ) : browserNotificationPerm === 'denied' ? (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        Bloqueado
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        No configurado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1 max-w-xl">
                    Permite que Google Chrome haga sonar la campana y muestre la notificación en tu PC o tablet aunque el navegador esté minimizado o estés usando otra aplicación.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {browserNotificationPerm !== 'granted' && (
                  <button
                    type="button"
                    onClick={requestBrowserPermission}
                    className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                  >
                    Permitir en Chrome
                  </button>
                )}
                <button
                  type="button"
                  onClick={testNotification}
                  className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer flex items-center gap-1.5 ${
                    activePreviewTone === 'all'
                      ? 'bg-rose-600 hover:bg-rose-500 text-white border-rose-500'
                      : 'bg-white/10 hover:bg-white/15 text-white border-white/10'
                  }`}
                >
                  {activePreviewTone === 'all' ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Detener prueba</span>
                    </>
                  ) : (
                    <>
                      <span>🔔 Probar alerta ({form.notification_sound_duration}s)</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </Section>

        {/* Mercado Pago */}
        <Section title="Integración con Mercado Pago">
          <div className="space-y-3">
            <p className="text-xs text-gray-400">
              Ingresá tu Access Token de Mercado Pago para permitir a tus clientes pagar el pedido escaneando o tocando el botón de cobro.
            </p>
            <FieldInput
              label="Access Token de Mercado Pago"
              type="password"
              value={form.mp_access_token}
              onChange={v => update('mp_access_token', v)}
              placeholder="APP_USR-..."
            />
          </div>
        </Section>

        {/* Account */}
        <Section title="Cuenta de Acceso">
          <div className="space-y-4">
            <FieldInput label="Email de inicio de sesión" type="email" value={accountForm.email} onChange={v => updateAccount('email', v)} placeholder="tu@email.com" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <PasswordInput
                label="Nueva contraseña (dejar en blanco para mantener)"
                value={accountForm.password}
                onChange={e => updateAccount('password', e.target.value)}
                placeholder="••••••••"
              />
              <PasswordInput
                label="Confirmar contraseña"
                value={accountForm.confirmPassword}
                onChange={e => updateAccount('confirmPassword', e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>
        </Section>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}

        {/* Danger Zone */}
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-xl bg-rose-500/10">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">Zona de peligro</h3>
              <p className="text-sm text-gray-400 mb-4">
                Eliminar tu negocio borrará permanentemente todos los productos, categorías y datos asociados. Esta acción no se puede deshacer.
              </p>
              <button
                onClick={() => setConfirmDeleteOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                           bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar negocio
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDeleteOpen}
        title="¿Eliminar negocio?"
        description={`Esta acción eliminará permanentemente "${business.name}" y todos sus datos. No se puede revertir.`}
        confirmLabel="Sí, eliminar todo"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDeleteOpen(false)}
        danger
        loading={isPending}
      />
    </div>
  );
}
