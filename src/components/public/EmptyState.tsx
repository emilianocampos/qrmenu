'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({
  title = 'No se encontraron resultados',
  description = 'Intentá con otras palabras clave o restablecé la búsqueda.',
  icon = <HelpCircle className="w-12 h-12 text-neutral-400" />,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 rounded-3xl bg-neutral-100/50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/50 my-8">
      <div className="mb-4 p-4 rounded-2xl bg-neutral-200/50 dark:bg-neutral-800/40">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
}
