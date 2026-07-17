'use client';

import React from 'react';
import { SearchBar } from './SearchBar';

interface FilterOption {
  value: string;
  label: string;
}

interface FiltersBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: {
    value: string;
    onChange: (val: string) => void;
    options: FilterOption[];
    defaultLabel: string;
  }[];
}

export function FiltersBar({ search, onSearchChange, searchPlaceholder = 'Buscar...', filters = [] }: FiltersBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 w-full">
      <SearchBar
        placeholder={searchPlaceholder}
        value={search}
        onChange={onSearchChange}
        className="w-full sm:w-64"
      />
      {filters.map((filter, idx) => (
        <select
          key={idx}
          value={filter.value}
          onChange={e => filter.onChange(e.target.value)}
          className="bg-white/5 border border-white/10 text-gray-300 rounded-xl px-3 py-2.5 text-sm
                     focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all cursor-pointer min-w-[150px]"
        >
          <option value="">{filter.defaultLabel}</option>
          {filter.options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      ))}
    </div>
  );
}
