import React from 'react';
import { ThemePreview } from './ThemePreview';
import { Business } from '@/types';
import { Check, X } from 'lucide-react';

interface DesignComparisonProps {
  currentDesign: Business;
  newDesign: Partial<Business>;
  onApply: () => void;
  onCancel: () => void;
  isApplying?: boolean;
}

export function DesignComparison({ currentDesign, newDesign, onApply, onCancel, isApplying }: DesignComparisonProps) {
  // Combine current design with new design to see full effect
  const combinedDesign = { ...currentDesign, ...newDesign };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h3 className="text-lg font-bold text-white">Diseño Detectado</h3>
        <p className="text-sm text-gray-400 mt-1">Hemos analizado tu imagen y creado esta paleta de estilos.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <ThemePreview design={currentDesign} title="Diseño Actual" />
        <ThemePreview design={combinedDesign} title="Nuevo Diseño (Sugerido)" />
      </div>

      {/* Properties Extracted (Optional detailed view) */}
      <div className="bg-black/20 p-4 rounded-xl border border-white/5">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Colores Extraídos</h4>
        <div className="flex flex-wrap gap-3">
          {newDesign.color_primary && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: newDesign.color_primary }} />
              <span className="text-xs text-gray-300">Principal</span>
            </div>
          )}
          {newDesign.background_color && (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: newDesign.background_color }} />
              <span className="text-xs text-gray-300">Fondo</span>
            </div>
          )}
          {newDesign.typography && (
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-gray-300 font-medium font-mono bg-white/10 px-2 py-1 rounded">
                Fuente: {newDesign.typography}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isApplying}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex justify-center items-center gap-2"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
        <button
          onClick={onApply}
          disabled={isApplying}
          className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 flex justify-center items-center gap-2"
        >
          {isApplying ? (
            <span className="animate-pulse">Aplicando...</span>
          ) : (
            <><Check className="w-4 h-4" /> Aplicar Diseño</>
          )}
        </button>
      </div>
    </div>
  );
}
