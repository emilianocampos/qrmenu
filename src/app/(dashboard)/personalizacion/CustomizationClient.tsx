'use client';

import React, { useState, useTransition } from 'react';
import { Loader2, Save, ExternalLink, Image as ImageIcon } from 'lucide-react';
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
    description: business.description ?? '',
    about_title: business.about_title ?? '',
    about_description: business.about_description ?? '',
    cover_image: business.cover_image ?? '',
    banner_image: business.banner_image ?? '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(business.logo_url);

  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(business.cover_image);

  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(business.banner_image);

  const [uploading, setUploading] = useState(false);

  const handleLogoSelect = (file: File) => {
    setLogoFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleCoverSelect = (file: File) => {
    setCoverFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setCoverPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleBannerSelect = (file: File) => {
    setBannerFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setBannerPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    setError(null);
    setSaved(false);

    startTransition(async () => {
      let logoUrl = form.logo_url;
      let coverUrl = form.cover_image;
      let bannerUrl = form.banner_image;

      setUploading(true);
      const supabase = createClient();

      try {
        if (logoFile) {
          const ext = logoFile.name.split('.').pop();
          const path = `${business.id}/logo_${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('logos').upload(path, logoFile, { upsert: true });
          if (uploadErr) throw new Error('Error al subir logo: ' + uploadErr.message);
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
          logoUrl = publicUrl;
        }

        if (coverFile) {
          const ext = coverFile.name.split('.').pop();
          const path = `${business.id}/cover_${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('logos').upload(path, coverFile, { upsert: true });
          if (uploadErr) throw new Error('Error al subir portada: ' + uploadErr.message);
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
          coverUrl = publicUrl;
        }

        if (bannerFile) {
          const ext = bannerFile.name.split('.').pop();
          const path = `${business.id}/banner_${Date.now()}.${ext}`;
          const { error: uploadErr } = await supabase.storage.from('logos').upload(path, bannerFile, { upsert: true });
          if (uploadErr) throw new Error('Error al subir banner: ' + uploadErr.message);
          const { data: { publicUrl } } = supabase.storage.from('logos').getPublicUrl(path);
          bannerUrl = publicUrl;
        }
      } catch (err: any) {
        setError(err.message || 'Error al subir archivos');
        setUploading(false);
        return;
      }

      setUploading(false);

      const result = await updateBusiness(business.id, {
        name: form.name,
        logo_url: logoUrl || null,
        color_primary: form.color_primary,
        color_secondary: form.color_secondary,
        typography: form.typography,
        theme: form.theme,
        description: form.description || null,
        about_title: form.about_title || null,
        about_description: form.about_description || null,
        cover_image: coverUrl || null,
        banner_image: bannerUrl || null,
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
            Ver carta pública
          </a>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Editor */}
        <div className="space-y-6">
          {/* Logo & Banner */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Logo del negocio</h3>
              <p className="text-xs text-gray-400 mb-4">Se mostrará en la barra de navegación y cabecera de la carta</p>
              <UploadDropzone
                accept="image/*"
                onFileSelect={handleLogoSelect}
                preview={logoPreview}
                onClear={() => { setLogoPreview(null); setLogoFile(null); setForm(f => ({ ...f, logo_url: '' })); }}
                loading={uploading || isPending}
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Imagen de banner</h3>
              <p className="text-xs text-gray-400 mb-4">Fondo que se mostrará en la cabecera principal</p>
              <UploadDropzone
                accept="image/*"
                onFileSelect={handleBannerSelect}
                preview={bannerPreview}
                onClear={() => { setBannerPreview(null); setBannerFile(null); setForm(f => ({ ...f, banner_image: '' })); }}
                loading={uploading || isPending}
              />
            </div>
          </div>

          {/* Name & General Description */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Nombre del negocio</h3>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-2">Descripción corta</h3>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Ej: Cafetería de especialidad y pastelería artesanal."
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Tema predeterminado de la carta</label>
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

          {/* About Us Section */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Sección "Sobre Nosotros"</h3>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Título de la sección</label>
              <input
                value={form.about_title}
                onChange={e => setForm(f => ({ ...f, about_title: e.target.value }))}
                placeholder="Ej: Nuestra Historia"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={form.about_description}
                onChange={e => setForm(f => ({ ...f, about_description: e.target.value }))}
                placeholder="Contá un poco sobre la historia de tu negocio, tu filosofía o lo que te hace especial..."
                rows={5}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Imagen de Sobre Nosotros</label>
              <UploadDropzone
                accept="image/*"
                onFileSelect={handleCoverSelect}
                preview={coverPreview}
                onClear={() => { setCoverPreview(null); setCoverFile(null); setForm(f => ({ ...f, cover_image: '' })); }}
                loading={uploading || isPending}
              />
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
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Vista previa en tiempo real</p>
            <div
              className="rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: form.theme === 'dark' ? '#0f0f0f' : '#f9f9f9',
                fontFamily: form.typography,
                color: form.theme === 'dark' ? '#f3f4f6' : '#1f2937',
              }}
            >
              {/* Preview Banner */}
              <div className="relative h-32 bg-indigo-900 flex items-center justify-center overflow-hidden">
                {bannerPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover opacity-60" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-800 to-neutral-700 opacity-60" />
                )}
                <div className="absolute bottom-4 left-6 flex items-center gap-3">
                  {logoPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md bg-white" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl border border-white/20">
                      🍽️
                    </div>
                  )}
                  <div>
                    <h2 className="text-sm font-bold text-white leading-tight drop-shadow-md">{form.name || 'Mi Negocio'}</h2>
                    <p className="text-[10px] text-gray-200 line-clamp-1 max-w-[200px] drop-shadow-sm">{form.description || 'Descripción corta...'}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Preview */}
              <div className="px-6 py-2 border-b text-xs flex justify-between items-center opacity-70 border-white/10">
                <span className="font-semibold" style={{ color: form.color_primary }}>{form.name || 'Logo'}</span>
                <div className="flex gap-4">
                  <span>Menú</span>
                  <span>Sobre Nosotros</span>
                  <span>Reviews</span>
                </div>
              </div>

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: form.color_primary }}>NUESTRO MENÚ</p>
                  <div className="space-y-2">
                    <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] flex justify-between items-center">
                      <div>
                        <p className="text-xs font-semibold">Café con Leche Especial</p>
                        <p className="text-[9px] opacity-60">Doble shot de espresso con leche cremosa.</p>
                      </div>
                      <span className="text-xs font-bold" style={{ color: form.color_primary }}>$3.50</span>
                    </div>
                  </div>
                </div>

                {/* About Preview */}
                {(form.about_title || form.about_description || coverPreview) && (
                  <div className="border-t border-white/10 pt-4 space-y-2">
                    <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: form.color_primary }}>SOBRE NOSOTROS</p>
                    <div className="flex gap-3 items-center">
                      <div className="flex-1 space-y-1">
                        <h4 className="text-xs font-bold">{form.about_title || 'Nuestra Historia'}</h4>
                        <p className="text-[9px] opacity-70 line-clamp-3">{form.about_description || 'Detalle de la historia del negocio...'}</p>
                      </div>
                      {coverPreview && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={coverPreview} alt="Cover Preview" className="w-16 h-16 rounded-lg object-cover border border-white/10" />
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
