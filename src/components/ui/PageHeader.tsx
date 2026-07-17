import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  breadcrumb?: { label: string; href?: string }[];
}

export function PageHeader({ title, description, action, breadcrumb }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center sm:items-center justify-between gap-4 mb-8 text-center sm:text-left">
      <div className="flex flex-col items-center sm:items-start w-full sm:w-auto">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center justify-center sm:justify-start gap-1 text-xs text-gray-500 mb-2 w-full">
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
        <h1 className="text-2xl font-bold text-white tracking-tight text-center sm:text-left">{title}</h1>
        {description && (
          <p className="text-gray-400 text-sm mt-1 text-center sm:text-left">{description}</p>
        )}
      </div>
      {action && <div className="flex-shrink-0 w-full sm:w-auto flex justify-center">{action}</div>}
    </div>
  );
}
