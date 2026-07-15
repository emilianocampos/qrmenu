'use client';

import React, { useState, useTransition } from 'react';
import { Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { updateBusiness, deleteBusiness } from '@/actions/business';
import { Business } from '@/types';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  business: Business;
  productsCount: number;
  categoriesCount: number;
}

const LANGUAGES = ['Español', 'English', 'Português', 'Français'];
const CURRENCIES = ['ARS', 'USD', 'EUR', 'BRL', 'CLP', 'MXN', 'COP'];
const PLANS = ['Demo', 'Básico', 'Pro', 'Enterprise'];

export function SettingsClient({ business, productsCount, categoriesCount }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: business.name,
    slug: business.slug,
    email: business.email ?? '',
    whatsapp: business.whatsapp ?? '',
    instagram: business.instagram ?? '',
    facebook: business.facebook ?? '',
    address: business.address ?? '',
    schedule: business.schedule ?? '',
    language: business.language ?? 'Español',
    currency: business.currency ?? 'ARS',
    plan: business.plan ?? 'Demo',
  });

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateBusiness(business.id, form);
      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
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
        router.push('/dashboard');
      }
    });
  };

  const update = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  const FieldInput = ({ label, id, value, type = 'text', placeholder }: { label: string; id: string; value: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => update(id, e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                   focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
      />
    </div>
  );

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
      <h3 className="text-sm font-semibold text-white mb-5 pb-4 border-b border-white/8">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Configuración"
        description="Administrá la información de tu negocio"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Configuración' }]}
        action={
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                       disabled:opacity-50"
          >
            {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : saved ? '✓ Guardado' : <><Save className="w-4 h-4" /> Guardar</>}
          </button>
        }
      />

      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Productos', value: productsCount },
            { label: 'Categorías', value: categoriesCount },
            { label: 'Plan actual', value: form.plan },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-center">
              <p className="text-2xl font-bold text-white">{value}</p>
              <p className="text-xs text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* General */}
        <Section title="Información básica">
          <FieldInput label="Nombre del negocio" id="name" value={form.name} />
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
          <FieldInput label="Email" id="email" value={form.email} type="email" placeholder="contacto@ejemplo.com" />
          <FieldInput label="WhatsApp" id="whatsapp" value={form.whatsapp} placeholder="+54 9 11 1234-5678" />
        </Section>

        {/* Social */}
        <Section title="Redes sociales">
          <FieldInput label="Instagram" id="instagram" value={form.instagram} placeholder="@minegocio" />
          <FieldInput label="Facebook" id="facebook" value={form.facebook} placeholder="facebook.com/minegocio" />
          <div className="md:col-span-2">
            <FieldInput label="Dirección" id="address" value={form.address} placeholder="Calle 123, Ciudad" />
          </div>
          <div className="md:col-span-2">
            <FieldInput label="Horario" id="schedule" value={form.schedule} placeholder="Lun-Vie 9-18h / Sáb 10-15h" />
          </div>
        </Section>

        {/* Preferences */}
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
          <h3 className="text-sm font-semibold text-white mb-5 pb-4 border-b border-white/8">Preferencias</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Idioma</label>
              <select
                value={form.language}
                onChange={e => update('language', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
              <select
                value={form.currency}
                onChange={e => update('currency', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              >
                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
              <select
                value={form.plan}
                onChange={e => update('plan', e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              >
                {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
        </div>

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
                           bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
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
