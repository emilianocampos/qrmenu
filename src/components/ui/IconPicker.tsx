'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
}

const EMOJI_CATEGORIES = [
  {
    name: 'Comidas',
    emojis: ['🍕', '🍔', '🌭', '🍟', '🥪', '🌮', '🌯', '🥙', '🧆', '🥗', '🍲', '🍛', '🍜', '🍝', '🥩', '🍖', '🍗', '🥓', '🍣', '🍱', '🥟', '🍤', '🍳', ' Paella']
  },
  {
    name: 'Bebidas',
    emojis: ['☕', '🍵', '🧃', '🥤', '🧋', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🍾', '🥛', '🧊', '💧']
  },
  {
    name: 'Panadería & Postres',
    emojis: ['🥐', '🍞', '🥖', '🥨', '🥯', '🥞', '🧇', '🍰', '🎂', '🧁', '🥧', '🍨', '🍦', '🍩', '🍪', '🍫', '🍬', '🍭', '🍮', '🍯']
  },
  {
    name: 'General',
    emojis: ['🏷️', '📋', '🌟', '⚡', '🔥', '👑', '🎁', '🎯', '🚀', '💯', '🍽️', '🥢', '🔪', '🧂', '🍒', '🍎', '🍇', '🍋', '🥑', '🌽']
  }
];

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const allEmojis = EMOJI_CATEGORIES.flatMap(c => c.emojis);
  const filteredEmojis = search.trim()
    ? allEmojis.filter(e => e.includes(search.trim()))
    : null;

  return (
    <div className="relative" ref={pickerRef}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl
                     hover:bg-white/10 text-white transition-all cursor-pointer"
        >
          <span className="text-xl w-6 h-6 flex items-center justify-center">
            {value || '📋'}
          </span>
          <span className="text-xs text-gray-400">
            {value ? 'Cambiar icono' : 'Seleccionar icono / emoji'}
          </span>
        </button>

        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            className="p-2 text-gray-400 hover:text-rose-400 bg-white/5 border border-white/10 rounded-xl transition-colors"
            title="Quitar icono"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 md:w-80 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl z-50 p-4 animate-in fade-in duration-200">
          {/* Header & Search */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar o pegar emoji..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Emoji Grid */}
          <div className="max-h-60 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
            {filteredEmojis ? (
              <div className="grid grid-cols-6 gap-2">
                {filteredEmojis.map((emoji, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onChange(emoji);
                      setIsOpen(false);
                    }}
                    className={`h-10 text-2xl rounded-xl hover:bg-white/10 flex items-center justify-center transition-all ${value === emoji ? 'bg-indigo-500/20 border border-indigo-500' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ) : (
              EMOJI_CATEGORIES.map(category => (
                <div key={category.name}>
                  <p className="text-[11px] font-semibold text-gray-400 mb-2 uppercase tracking-wider">
                    {category.name}
                  </p>
                  <div className="grid grid-cols-6 gap-2">
                    {category.emojis.map((emoji, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          onChange(emoji);
                          setIsOpen(false);
                        }}
                        className={`h-10 text-2xl rounded-xl hover:bg-white/10 flex items-center justify-center transition-all ${value === emoji ? 'bg-indigo-500/20 border border-indigo-500' : ''}`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
