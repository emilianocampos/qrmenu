'use client';

import React from 'react';

interface SectionTitleProps {
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
}

export function SectionTitle({
  title,
  subtitle,
  align = 'left',
}: SectionTitleProps) {
  return (
    <div className={`mb-10 space-y-2 ${align === 'center' ? 'text-center' : 'text-left'}`}>
      <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight relative inline-block" style={{ color: 'var(--primary-color, #4f46e5)' }}>
        {title}
        <span 
          className="absolute -bottom-2 left-0 h-1 w-12 rounded-full" 
          style={{ backgroundColor: 'var(--primary-color, #4f46e5)' }}
        />
      </h2>
      {subtitle && (
        <p className="text-sm md:text-base text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed pt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}
