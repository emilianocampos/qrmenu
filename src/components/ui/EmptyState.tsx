import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  features?: string[];
}

export function EmptyState({ icon, title, description, action, features }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {icon && (
        <div className="text-6xl mb-6">{icon}</div>
      )}
      <h2 className="text-2xl font-bold text-white mb-3">{title}</h2>
      {description && (
        <p className="text-gray-400 max-w-md mb-6 leading-relaxed">{description}</p>
      )}
      {features && features.length > 0 && (
        <ul className="mb-8 space-y-2 text-left">
          {features.map((f, i) => (
            <li key={i} className="flex items-center gap-3 text-gray-300 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">✓</span>
              {f}
            </li>
          ))}
        </ul>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}
