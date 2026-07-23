'use client';

import React, { useState, useTransition } from 'react';
import { Loader2, Save, Trash2, AlertTriangle } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { updateBusiness, deleteBusiness } from '@/actions/business';
import { updateUserCredentials } from '@/actions/auth';
import { Business } from '@/types';
import { useRouter } from 'next/navigation';

interface SettingsClientProps {
  business: Business;
  productsCount: number;
  categoriesCount: number;
  userEmail: string;
}

export function SettingsClient({ business, productsCount, categoriesCount, userEmail }: SettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: business.name,
    slug: business.slug,
  });

  const [accountForm, setAccountForm] = useState({
    email: userEmail,
    password: '',
  });

  const handleSave = () => {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const result = await updateBusiness(business.id, form);
      
      let accountError = null;
      if (accountForm.email !== userEmail || accountForm.password) {
        const accResult = await updateUserCredentials({
          email: accountForm.email !== userEmail ? accountForm.email : undefined,
          password: accountForm.password ? accountForm.password : undefined
        });
        if (accResult.error) accountError = accResult.error;
      }

      if (result.error || accountError) {
        setError(result.error || accountError || 'Error al guardar');
      } else {
        setSaved(true);
        setAccountForm(f => ({ ...f, password: '' }));
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
  const updateAccount = (key: string, value: string) => setAccountForm(f => ({ ...f, [key]: value }));

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
        </Section>

        {/* Account */}
        <Section title="Cuenta de Acceso">
          <FieldInput label="Email de inicio de sesión" type="email" value={accountForm.email} onChange={v => updateAccount('email', v)} placeholder="tu@email.com" />
          <FieldInput label="Nueva contraseña (dejar en blanco para mantener)" type="password" value={accountForm.password} onChange={v => updateAccount('password', v)} placeholder="••••••••" />
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
