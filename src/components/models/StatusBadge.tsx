import React from 'react';
import { Loader2, CheckCircle2, XCircle, Box } from 'lucide-react';

interface StatusBadgeProps {
  status: string | null | undefined;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const currentStatus = status || 'none';

  if (currentStatus === 'generating') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Generando...
      </span>
    );
  }

  if (currentStatus === 'ready') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <CheckCircle2 className="w-3.5 h-3.5" />
        Listo
      </span>
    );
  }

  if (currentStatus === 'failed') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
        <XCircle className="w-3.5 h-3.5" />
        Error
      </span>
    );
  }

  // none o undefined
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-gray-400 border border-white/10">
      <Box className="w-3.5 h-3.5" />
      Sin modelo
    </span>
  );
}
