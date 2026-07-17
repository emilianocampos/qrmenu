'use client';

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search menu items...' }: SearchBarProps) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Search
        className="w-4 h-4"
        style={{
          position: 'absolute',
          left: 14,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          pointerEvents: 'none',
        }}
      />
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          boxSizing: 'border-box',
          paddingLeft: 42,
          paddingRight: value ? 40 : 16,
          paddingTop: 12,
          paddingBottom: 12,
          borderRadius: 8,
          backgroundColor: '#151c2c',
          border: '1px solid #1e2d45',
          color: '#f1f5f9',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = 'var(--primary-color)'; }}
        onBlur={e => { e.target.style.borderColor = '#1e2d45'; }}
      />
      {value && (
        <button
          onClick={() => onChange('')}
          type="button"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#64748b',
            padding: 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
