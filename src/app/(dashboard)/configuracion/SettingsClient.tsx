'use client';

import React, { useState, useTransition } from 'react';
import { Loader2, Save, Trash2, AlertTriangle, Volume2, VolumeX, Smartphone, UserCheck, Plus, X, User } from 'lucide-react';
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
    notification_sound_enabled: (business as any).notification_sound_enabled ?? true,
    notification_vibrate_enabled: (business as any).notification_vibrate_enabled ?? true,
    mp_access_token: (business as any).mp_access_token ?? '',
  });

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
        notification_sound_enabled: form.notification_sound_enabled,
        notification_vibrate_enabled: form.notification_vibrate_enabled,
      } as any);

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
        <Section title="Sonido y Notificaciones">
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
                  <p className="text-xs text-gray-400">Reproducir tono en nuevos pedidos y llamados al mozo</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.notification_sound_enabled}
                onChange={e => update('notification_sound_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10 transition-all">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-violet-400" />
                <div>
                  <p className="text-sm font-medium text-white">Vibración</p>
                  <p className="text-xs text-gray-400">Vibrar dispositivo si el navegador lo soporta</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={form.notification_vibrate_enabled}
                onChange={e => update('notification_vibrate_enabled', e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-white/5 text-violet-500 focus:ring-violet-500"
              />
            </label>
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
