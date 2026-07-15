'use client';

import React, { useState, useTransition } from 'react';
import { X, QrCode, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { createBusiness } from '@/actions/business';
import { ColorPicker } from '@/components/ui/ColorPicker';
import { useRouter } from 'next/navigation';

interface CreateBusinessWizardProps {
  onClose: () => void;
  onSuccess: () => void;
}

const steps = ['Información básica', 'Identidad visual', 'Listo'];

export function CreateBusinessWizard({ onClose, onSuccess }: CreateBusinessWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    color_primary: '#4f46e5',
    color_secondary: '#ffffff',
  });

  const updateForm = (key: string, val: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: val };
      // Auto-generate slug from name
      if (key === 'name') {
        next.slug = val
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
      }
      return next;
    });
  };

  const handleSubmit = () => {
    setError(null);
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('color_primary', form.color_primary);
    formData.append('color_secondary', form.color_secondary);

    startTransition(async () => {
      const result = await createBusiness(formData);
      if (result.error) {
        setError(result.error);
      } else {
        setDone(true);
        setTimeout(() => {
          onSuccess();
          router.refresh();
        }, 1500);
      }
    });
  };

  const canNext = step === 0 ? form.name && form.slug : true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <div className="relative bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Crear mi Carta</h2>
                <p className="text-xs text-gray-500">Paso {step + 1} de {steps.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {steps.map((s, i) => (
              <React.Fragment key={i}>
                <div className={`flex items-center gap-1.5 ${i <= step ? 'text-indigo-400' : 'text-gray-600'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
                    ${i < step ? 'bg-indigo-500 text-white' : i === step ? 'border-2 border-indigo-500 text-indigo-400' : 'border border-gray-700 text-gray-600'}`}>
                    {i < step ? '✓' : i + 1}
                  </div>
                  <span className="text-xs hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-indigo-500' : 'bg-gray-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {done ? (
            <div className="py-8 flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¡Carta creada!</h3>
                <p className="text-gray-400 text-sm mt-1">Redirigiendo al dashboard...</p>
              </div>
            </div>
          ) : step === 0 ? (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre del negocio *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => updateForm('name', e.target.value)}
                  placeholder="Ej: La Pizzería de Juan"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Slug (URL pública) *</label>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-xl overflow-hidden
                                focus-within:ring-1 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50 transition-all">
                  <span className="px-3 py-3 text-sm text-gray-600 border-r border-white/10 bg-white/3 flex-shrink-0">
                    /c/
                  </span>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={e => updateForm('slug', e.target.value)}
                    placeholder="la-pizzeria-de-juan"
                    className="flex-1 bg-transparent text-white placeholder-gray-600 px-3 py-3 text-sm focus:outline-none"
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">Solo letras, números y guiones</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Descripción (opcional)</label>
                <textarea
                  value={form.description}
                  onChange={e => updateForm('description', e.target.value)}
                  placeholder="Una breve descripción de tu negocio..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                             focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <ColorPicker
                label="Color principal"
                value={form.color_primary}
                onChange={v => updateForm('color_primary', v)}
              />
              <ColorPicker
                label="Color secundario"
                value={form.color_secondary}
                onChange={v => updateForm('color_secondary', v)}
              />
              <div className="mt-4 p-4 rounded-xl border border-white/8 bg-white/[0.02]">
                <p className="text-xs text-gray-500 mb-3">Vista previa de colores</p>
                <div className="flex gap-2">
                  <div className="flex-1 h-12 rounded-lg shadow-inner" style={{ backgroundColor: form.color_primary }} />
                  <div className="flex-1 h-12 rounded-lg shadow-inner border border-white/10" style={{ backgroundColor: form.color_secondary }} />
                </div>
                <div className="flex gap-2 mt-1">
                  <p className="flex-1 text-center text-xs text-gray-600">Principal</p>
                  <p className="flex-1 text-center text-xs text-gray-600">Secundario</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        {!done && (
          <div className="px-6 pb-6 flex justify-between gap-3">
            <button
              onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400
                         hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {step === 0 ? (
                <>Cancelar</>
              ) : (
                <><ChevronLeft className="w-4 h-4" /> Anterior</>
              )}
            </button>

            {step < steps.length - 2 ? (
              <button
                onClick={() => setStep(s => s + 1)}
                disabled={!canNext}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all
                  ${canNext
                    ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                    : 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                  }`}
              >
                Siguiente <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25
                           transition-all disabled:opacity-50"
              >
                {isPending ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creando...</>
                ) : (
                  <>Crear Carta ✨</>
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
