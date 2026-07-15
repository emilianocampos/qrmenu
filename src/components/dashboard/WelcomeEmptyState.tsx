'use client';

import React, { useState } from 'react';
import { QrCode, Package, Tags, Palette, BarChart3, Sparkles } from 'lucide-react';
import { CreateBusinessWizard } from './CreateBusinessWizard';
import { useRouter } from 'next/navigation';

export function WelcomeEmptyState() {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  const features = [
    { icon: Package, label: 'Administrar productos y precios' },
    { icon: Tags, label: 'Crear y organizar categorías' },
    { icon: QrCode, label: 'Generar un código QR personalizado' },
    { icon: Palette, label: 'Personalizar la identidad visual' },
    { icon: BarChart3, label: 'Ver estadísticas de visitas' },
    { icon: Sparkles, label: 'Importar tu menú con IA' },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="max-w-lg w-full text-center">
          {/* Icon */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20
                          flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/10">
            <span className="text-4xl">🍽️</span>
          </div>

          <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
            Bienvenido a Carta QR
          </h1>
          <p className="text-gray-400 mb-8 leading-relaxed">
            Todavía no creaste tu primera carta digital. Una vez creada podrás acceder a todo el potencial de la plataforma.
          </p>

          {/* Features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10 text-left">
            {features.map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03] border border-white/8 text-sm text-gray-300"
              >
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4 text-indigo-400" />
                </div>
                {label}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button
            onClick={() => setWizardOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-base
                       bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700
                       shadow-2xl shadow-indigo-500/30 transition-all duration-300
                       hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <QrCode className="w-5 h-5" />
            Crear mi Carta
          </button>
        </div>
      </div>

      {wizardOpen && (
        <CreateBusinessWizard
          onClose={() => setWizardOpen(false)}
          onSuccess={() => {
            setWizardOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}
