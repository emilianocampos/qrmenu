'use client';

import React from 'react';

interface ThemeSelectorProps {
  value: string;
  onChange: (val: string) => void;
}

const themes = [
  { value: 'moderno', label: '✨ Moderno' },
  { value: 'minimalista', label: '📐 Minimalista' },
  { value: 'clasico', label: '🏛️ Clásico' },
  { value: 'vintage', label: '📻 Vintage' },
  { value: 'dark', label: '🌙 Dark' },
];

export function ThemeSelector({ value, onChange }: ThemeSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">Tema</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {themes.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => onChange(t.value)}
            className={`py-3 px-2 rounded-xl text-xs font-semibold border transition-all duration-200
              ${value === t.value
                ? 'bg-indigo-500 text-white border-indigo-500 shadow-lg shadow-indigo-500/25'
                : 'bg-white/5 text-gray-300 border-white/10 hover:border-white/20'
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
