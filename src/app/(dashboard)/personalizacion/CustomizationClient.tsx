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
    layout_style: business.layout_style ?? 'grid',
    description: business.description ?? '',
    about_title: business.about_title || '',
    about_description: business.about_description || '',
    cover_image: business.cover_image || '',
    banner_image: business.banner_image || '',
    slogan: business.slogan || '',
    address: business.address || '',
    phone: business.phone || business.whatsapp || '',
    email: business.email || '',
    schedule: business.schedule || '',
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

        if (bannerFile && form.banner_image !== 'none') {
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
        layout_style: form.layout_style,
        description: form.description || null,
        about_title: form.about_title || null,
        about_description: form.about_description || null,
        cover_image: coverUrl || null,
        banner_image: bannerUrl || null,
        slogan: form.slogan || null,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        schedule: form.schedule || null,
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

            <div className="pt-4 border-t border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Banner (Cabecera)</h3>
                  <p className="text-xs text-gray-400">Personalizá la cabecera de tu carta</p>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.banner_image !== 'none'}
                      onChange={(e) => {
                        const showBanner = e.target.checked;
                        if (!showBanner) {
                          setForm(f => ({ ...f, banner_image: 'none' }));
                        } else {
                          setForm(f => ({ ...f, banner_image: business.banner_image && business.banner_image !== 'none' ? business.banner_image : '' }));
                        }
                      }}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${form.banner_image !== 'none' ? 'bg-indigo-500' : 'bg-gray-600'}`}></div>
                    <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${form.banner_image !== 'none' ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-gray-300">
                    {form.banner_image !== 'none' ? 'Mostrar Banner' : 'Sin Banner'}
                  </span>
                </label>
              </div>

              {form.banner_image !== 'none' && (
                <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <p className="text-xs text-gray-400 mb-4">Sube una imagen para mostrar de fondo en la cabecera. Si no subes ninguna, se mostrará un fondo sólido.</p>
                  <UploadDropzone
                    accept="image/*"
                    onFileSelect={handleBannerSelect}
                    preview={bannerPreview}
                    onClear={() => { setBannerPreview(null); setBannerFile(null); setForm(f => ({ ...f, banner_image: '' })); }}
                    loading={uploading || isPending}
                  />
                </div>
              )}
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
            <ColorPicker label="Color de texto" value={form.color_secondary} onChange={v => setForm(f => ({ ...f, color_secondary: v }))} />
          </div>

          {/* Typography & Theme */}
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-5">
            <h3 className="text-sm font-semibold text-white">Tipografía y Diseño</h3>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Tipo de Carta</label>
              <div className="flex gap-3">
                <button
                  onClick={() => setForm(f => ({ ...f, layout_style: 'grid' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                    ${form.layout_style === 'grid' || !form.layout_style
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                >
                  Moderna (Grilla)
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, layout_style: 'list' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                    ${form.layout_style === 'list'
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                >
                  Cascada
                </button>
                <button
                  onClick={() => setForm(f => ({ ...f, layout_style: 'vintage' }))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all border
                    ${form.layout_style === 'vintage'
                      ? 'bg-pink-600 text-white border-pink-600 shadow-lg shadow-pink-600/25'
                      : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
                    }`}
                >
                  Vintage Club
                </button>
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
              <label className="block text-sm font-medium text-gray-300 mb-2">Eslogan (Subtítulo)</label>
              <input
                type="text"
                value={form.slogan}
                onChange={e => setForm(f => ({ ...f, slogan: e.target.value }))}
                placeholder="Ej. Los mejores sabores de la ciudad"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Historia (Nuestra Historia)</label>
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

          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Datos de Contacto y Visítanos</h2>
              <p className="text-sm text-gray-400 mt-1">
                Información para que tus clientes puedan contactarte y visitar tu local.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Dirección</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Ej. Calle Falsa 123, CABA"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Teléfono</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="Ej. +54 9 11 1234 5678"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="Ej. hola@minegocio.com"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Horario de Atención</label>
                <textarea
                  value={form.schedule}
                  onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                  placeholder="Ej. Lunes a Viernes: 10:00 - 20:00&#10;Sábados: 10:00 - 14:00"
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                />
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
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-4">Vista previa en tiempo real</p>
            <div
              className="rounded-xl overflow-hidden border border-white/10 shadow-2xl transition-all duration-300"
              style={{
                backgroundColor: '#0a0e1a',
                fontFamily: form.typography,
                color: form.color_secondary || '#f3f4f6',
              }}
            >
              {/* Navigation Preview */}
              <div className="px-6 py-3 border-b text-xs flex justify-between items-center opacity-70 border-white/10" style={{ backgroundColor: '#111827' }}>
                <span className="font-semibold" style={{ color: form.color_primary }}>{form.name || 'Logo'}</span>
                <div className="flex gap-4">
                  <span>Menú</span>
                  <span>Reviews</span>
                </div>
              </div>

              {/* Preview Simple Header */}
              {form.banner_image !== 'none' && (
                <div className="relative flex flex-col items-center text-center gap-2 p-6 bg-transparent border-b border-white/10"
                  style={{ minHeight: (bannerPreview || (form.banner_image && form.banner_image !== 'none')) ? '160px' : 'auto' }}>
                  {(bannerPreview || (form.banner_image && form.banner_image !== 'none')) && (
                    <div className="absolute inset-0 z-0 bg-cover bg-center" style={{ backgroundImage: `url(${bannerPreview || form.banner_image})` }}>
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    </div>
                  )}
                  <div className="relative z-10 flex flex-col items-center">
                    {logoPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoPreview} alt="Logo" className="w-16 h-16 rounded-full object-cover border-2 bg-transparent" style={{ borderColor: form.color_primary }} />
                    ) : (
                      <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2" style={{ borderColor: form.color_primary, backgroundColor: '#111827' }}>
                        🍽️
                      </div>
                    )}
                    <div className="mt-2">
                      <h2 className="text-xl font-bold leading-tight" style={{ color: (bannerPreview || (form.banner_image && form.banner_image !== 'none')) ? '#ffffff' : form.color_primary, textShadow: (bannerPreview || (form.banner_image && form.banner_image !== 'none')) ? '0 2px 10px rgba(0,0,0,0.5)' : 'none' }}>{form.name || 'Mi Negocio'}</h2>
                      <p className="text-[10px] line-clamp-2 max-w-[200px] mt-1" style={{ opacity: 0.8, color: (bannerPreview || (form.banner_image && form.banner_image !== 'none')) ? '#e2e8f0' : 'inherit', textShadow: (bannerPreview || (form.banner_image && form.banner_image !== 'none')) ? '0 1px 5px rgba(0,0,0,0.5)' : 'none' }}>{form.description || 'Descripción corta...'}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Preview Content */}
              <div className="p-6 space-y-6">
                <div>
                  {form.layout_style !== 'vintage' && (
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: form.color_primary }}>NUESTRO MENÚ</p>
                  )}
                  {form.layout_style === 'vintage' ? (
                    <div className="space-y-4">
                      {/* Vintage Category Header */}
                      <div className="flex items-center gap-2 py-1 px-3 rounded-md border" style={{ borderColor: '#ff4500', boxShadow: '0 0 5px #ff450040', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: '#ff4500', boxShadow: '0 0 5px #ff450080' }} />
                        <h2 className="text-[10px] font-black uppercase tracking-wider m-0" style={{ color: '#ff4500' }}>Cafetería</h2>
                      </div>
                      
                      {/* Vintage Product List */}
                      <div className="space-y-2 px-1">
                        <div className="flex flex-col">
                          <div className="flex items-end justify-between gap-1 w-full">
                            <span className="text-white font-bold text-[9px] uppercase tracking-wide shrink-0">Café Especial</span>
                            <div className="flex-grow border-b border-dotted border-gray-600 mb-[4px] opacity-40 shrink mx-1" />
                            <span className="text-white font-bold text-[9px] shrink-0">$3.50</span>
                          </div>
                          <p className="text-gray-400 text-[7px] mt-0.5 leading-snug">Doble shot de espresso con leche cremosa.</p>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-end justify-between gap-1 w-full">
                            <span className="text-white font-bold text-[9px] uppercase tracking-wide shrink-0">Tostado</span>
                            <div className="flex-grow border-b border-dotted border-gray-600 mb-[4px] opacity-40 shrink mx-1" />
                            <span className="text-white font-bold text-[9px] shrink-0">$4.00</span>
                          </div>
                          <p className="text-gray-400 text-[7px] mt-0.5 leading-snug">Pan de masamadre con jamón y queso.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={form.layout_style === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
                    {/* Mini Card 1 */}
                    <div
                      className={`rounded-lg overflow-hidden border flex ${form.layout_style === 'list' ? 'flex-row items-center h-20' : 'flex-col'}`}
                      style={{
                        backgroundColor: '#111827',
                        borderColor: '#1e2d45',
                      }}
                    >
                      {form.layout_style !== 'list' && (
                        <div className="h-16 w-full bg-gray-700 object-cover relative">
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-tr from-black to-transparent" />
                        </div>
                      )}
                      <div className="p-2 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1 gap-1">
                          <p className="text-[10px] font-semibold leading-tight" style={{ color: form.color_primary }}>Café Especial</p>
                          <p className="text-[9px] font-bold">$3.50</p>
                        </div>
                        <p className="text-[8px] mb-2 line-clamp-2 leading-tight" style={{ opacity: 0.7 }}>Doble shot de espresso con leche cremosa.</p>
                        <div className="mt-auto flex justify-start">
                          <span className="text-[7px] px-2 py-0.5 rounded-full" style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: '#cbd5e1'
                          }}>
                            Cafetería
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Mini Card 2 */}
                    <div
                      className={`rounded-lg overflow-hidden border flex ${form.layout_style === 'list' ? 'flex-row items-center h-20' : 'flex-col'}`}
                      style={{
                        backgroundColor: '#111827',
                        borderColor: '#1e2d45',
                      }}
                    >
                      {form.layout_style !== 'list' && (
                        <div className="h-16 w-full bg-gray-700 object-cover relative">
                          <div className="absolute inset-0 opacity-20 bg-gradient-to-tl from-black to-transparent" />
                        </div>
                      )}
                      <div className="p-2 flex flex-col flex-1">
                        <div className="flex justify-between items-start mb-1 gap-1">
                          <p className="text-[10px] font-semibold leading-tight" style={{ color: form.color_primary }}>Tostado</p>
                          <p className="text-[9px] font-bold">$4.00</p>
                        </div>
                        <p className="text-[8px] mb-2 line-clamp-2 leading-tight" style={{ opacity: 0.7 }}>Pan de masamadre con jamón y queso.</p>
                        <div className="mt-auto flex justify-start">
                          <span className="text-[7px] px-2 py-0.5 rounded-full" style={{
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            color: '#cbd5e1'
                          }}>
                            Panadería
                          </span>
                        </div>
                      </div>
                    </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
