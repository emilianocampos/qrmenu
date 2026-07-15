'use client';

import React, { useState, useTransition } from 'react';
import { Loader2, Save, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { updateBusiness } from '@/actions/business';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/types';

const typographies = ['Inter', 'Roboto', 'Playfair Display', 'Lato', 'Poppins', 'Oswald', 'Montserrat'];
const themes = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Oscuro' },
];

export function CustomizationClient({ business }: { business: Business }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: business.name,
    logo_url: business.logo_url ?? '',
    color_primary: business.color_primary ?? '#4f46e5',
    color_secondary: business.color_secondary ?? '#ffffff',
    typography: business.typography ?? 'Inter',
    theme: business.theme ?? 'light',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo_url);
  const [uploading, setUploading] = useState(false);

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      let logoUrl = form.logo_url;

      if (logoFile) {
        setUploading(true);
        const supabase = createClient();
        const ext = logoFile.name.split('.').pop();
        const path = `${business.id}/logo.${ext}`;
        const { error: uploadErr } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true });
        if (uploadErr) {
          setError('Error al subir logo: ' + uploadErr.message);
          setUploading(false);
          return;
        }
        const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
        logoUrl = publicUrl;
        setUploading(false);
      }

      const result = await updateBusiness(business.id, {
        name: form.name,
        logo_url: logoUrl || null,
        color_primary: form.color_primary,
        color_secondary: form.color_secondary,
        typography: form.typography,
        theme: form.theme,
      });

      if (result.error) {
        setError(result.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    });
  };

  return (
    <div>
      <PageHeader
        title="Personalización"
        description="Ajustá la identidad visual de tu carta pública"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Personalización' }]}
        action={
          <a
            href={`/c/${business.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all"
          >
            <ExternalLink className="w-4 h-4" />
            Ver carta
          </a>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          {/* Logo */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Logo</h3>
            <UploadDropzone
              accept="image/*"
              onFileSelect={handleLogoSelect}
              preview={logoPreview}
              onClear={() => { setLogoPreview(null); setLogoFile(null); setForm(f => ({ ...f, logo_url: '' })); }}
              loading={uploading}
            />
          </div>

          {/* Name */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Nombre del negocio</h3>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Colors */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Colores</h3>
            <ColorPicker label="Color principal" value={form.color_primary} onChange={v => setForm(f => ({ ...f, color_primary: v }))} />
            <ColorPicker label="Color secundario" value={form.color_secondary} onChange={v => setForm(f => ({ ...f, color_secondary: v }))} />
          </div>

          {/* Typography & Theme */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Tipografía y Tema</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipografía</label>
              <select
                value={form.typography}
                onChange={e => setForm(f => ({ ...f, typography: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              >
                {typographies.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Tema</label>
              <div className="flex gap-3">
                {themes.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setForm(f => ({ ...f, theme: t.value }))}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                      ${form.theme === t.value
                        ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                        : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{error}</div>
          )}

          <button
            onClick={handleSave}
            disabled={isPending || uploading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                       disabled:opacity-50"
          >
            {(isPending || uploading) ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : saved ? (
              <>✓ Guardado</>
            ) : (
              <><Save className="w-4 h-4" /> Guardar cambios</>
            )}
          </button>
        </div>

        {/* Live Preview */}
        <div className="xl:sticky xl:top-8 h-fit">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Vista previa</p>
            <div
              className="rounded-xl overflow-hidden border border-white/10 shadow-2xl"
              style={{
                backgroundColor: form.theme === 'dark' ? '#1a1a1a' : '#fff',
                fontFamily: form.typography,
                color: form.theme === 'dark' ? '#fff' : '#111',
              }}
            >
              {/* Preview Header */}
              <div className="p-6 text-center" style={{ backgroundColor: form.color_primary }}>
                {logoPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full mx-auto mb-3 object-cover border-4 border-white/20" />
                ) : (
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 bg-white/20 flex items-center justify-center text-2xl">
                    🍽️
                  </div>
                )}
                <h2 className="text-xl font-bold text-white">{form.name || 'Mi Negocio'}</h2>
              </div>

              {/* Preview categories */}
              <div className="p-4 space-y-3">
                {['Entradas', 'Platos principales', 'Postres'].map((cat, i) => (
                  <div key={i}>
                    <p
                      className="text-xs font-bold uppercase tracking-wider mb-2"
                      style={{ color: form.color_primary }}
                    >
                      {cat}
                    </p>
                    <div className={`flex justify-between py-2 border-b ${form.theme === 'dark' ? 'border-white/10' : 'border-gray-100'}`}>
                      <span className="text-sm">Ejemplo de plato</span>
                      <span className="text-sm font-semibold" style={{ color: form.color_primary }}>$10.00</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
