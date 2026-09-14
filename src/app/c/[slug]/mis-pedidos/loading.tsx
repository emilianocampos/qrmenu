import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
      style={{ backgroundColor: 'var(--bg-page, #0a0e1a)', color: 'var(--text-primary, #ffffff)' }}
    >
      <Loader2 
        className="w-10 h-10 animate-spin mb-3" 
        style={{ color: 'var(--text-primary, #ffffff)' }}
      />
      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary, #ffffff)' }}>
        Cargando pedido...
      </p>
    </div>
  );
}
