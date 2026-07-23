import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingAnalysis() {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/5 border border-white/10 rounded-xl space-y-4">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <div className="text-center">
        <h4 className="text-sm font-semibold text-white">Analizando Diseño...</h4>
        <p className="text-xs text-gray-400 mt-1">La IA está extrayendo colores, tipografías y estilos.</p>
      </div>
    </div>
  );
}
