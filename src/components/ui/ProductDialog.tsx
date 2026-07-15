'use client';

import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { UploadDropzone } from './UploadDropzone';
import { Category } from '@/types';

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  category_id: string;
  image_url: string;
  is_available: boolean;
  is_featured: boolean;
  item_order: string;
}

interface ProductDialogProps {
  open: boolean;
  title: string;
  form: ProductFormData;
  setForm: React.Dispatch<React.SetStateAction<ProductFormData>>;
  categories: Category[];
  imagePreview: string | null;
  onImageSelect: (file: File) => void;
  onClearImage: () => void;
  uploading: boolean;
  isPending: boolean;
  formError: string | null;
  onSave: () => void;
  onClose: () => void;
}

export function ProductDialog({
  open,
  title,
  form,
  setForm,
  categories,
  imagePreview,
  onImageSelect,
  onClearImage,
  uploading,
  isPending,
  formError,
  onSave,
  onClose,
}: ProductDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[#111] px-6 pt-6 pb-4 border-b border-white/8 flex items-center justify-between z-10">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Imagen</label>
            <UploadDropzone
              accept="image/*"
              onFileSelect={onImageSelect}
              preview={imagePreview}
              onClear={onClearImage}
              loading={uploading}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Nombre *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Pizza Margherita"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Precio</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Orden</label>
              <input
                type="number"
                value={form.item_order}
                onChange={e => setForm(f => ({ ...f, item_order: e.target.value }))}
                placeholder="0"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Descripción</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Descripción del producto..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Categoría</label>
              <select
                value={form.category_id}
                onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 text-gray-300 rounded-xl px-4 py-3 text-sm
                           focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              >
                <option value="">Sin categoría</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_available}
                  onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-300">Disponible</span>
              </label>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-amber-500 focus:ring-amber-500"
                />
                <span className="text-sm text-gray-300">Destacado</span>
              </label>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
              {formError}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-[#111] px-6 py-4 border-t border-white/8 flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white
                       bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            disabled={isPending || uploading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(isPending || uploading) ? (
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
