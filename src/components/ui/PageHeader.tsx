import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1 text-xs text-gray-500 mb-2">
            {breadcrumb.map((item, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span>/</span>}
                <span className={idx === breadcrumb.length - 1 ? 'text-gray-300' : 'text-gray-500'}>
                  {item.label}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
        {description && (
          <p className="text-gray-400 text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
