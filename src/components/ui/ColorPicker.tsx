'use client';

import React, { useState, useRef } from 'react';
import { Pipette } from 'lucide-react';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-300">{label}</label>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-10 h-10 rounded-xl border-2 border-white/20 hover:border-white/40
                     transition-all cursor-pointer shadow-inner flex-shrink-0"
          style={{ backgroundColor: value }}
        />
        <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
          <Pipette className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <span className="text-sm text-gray-300 font-mono">{value}</span>
        </div>
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
      </div>
    </div>
  );
}
