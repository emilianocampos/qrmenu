'use client';

import React from 'react';
import { X, Loader2 } from 'lucide-react';

interface CategoryFormData {
  name: string;
  icon: string;
}

interface CategoryDialogProps {
  open: boolean;
  title: string;
  form: CategoryFormData;
  setForm: React.Dispatch<React.SetStateAction<CategoryFormData>>;
  isPending: boolean;
  formError: string | null;
  onSave: () => void;
  onClose: () => void;
}

export function CategoryDialog({
  open,
  title,
  form,
  setForm,
  isPending,
  formError,
  onSave,
  onClose,
}: CategoryDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl z-10">
        <div className="px-6 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ej: Pizzas, Bebidas, Postres..."
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Emoji / Ícono (opcional)</label>
            <input
              value={form.icon}
              onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
              placeholder="🍕"
              className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                         focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
          </div>
          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {formError}
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white
                       bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isPending}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                       disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
            ) : (
              'Guardar'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
