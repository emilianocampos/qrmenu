'use client';

import React from 'react';
import { Package, Star, Copy, Pencil, Trash2, ToggleRight, ToggleLeft } from 'lucide-react';
import { Product, Category } from '@/types';

interface ProductTableProps {
  products: Product[];
  categories: Category[];
  onToggleAvailable: (p: Product) => void;
  onToggleFeatured: (p: Product) => void;
  onDuplicate: (id: string) => void;
  onEdit: (p: Product) => void;
  onDelete: (id: string) => void;
}

export function ProductTable({
  products,
  categories,
  onToggleAvailable,
  onToggleFeatured,
  onDuplicate,
  onEdit,
  onDelete,
}: ProductTableProps) {
  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      {/* Table header */}
      <div className="hidden md:grid grid-cols-[auto_1fr_140px_130px_100px_130px] gap-4 px-5 py-3 border-b border-white/8 bg-white/2">
        <div className="w-12" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoría</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</p>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</p>
      </div>

      <ul className="divide-y divide-white/5">
        {products.map(p => {
          const catName = categories.find(c => c.id === p.category_id)?.name ?? '—';
          const isUnpriced = Number(p.price) <= 0;
          return (
            <li
              key={p.id}
              className="grid grid-cols-1 md:grid-cols-[auto_1fr_140px_130px_100px_130px] gap-4 px-5 py-4 items-center hover:bg-white/[0.02] transition-colors"
            >
              {/* Image */}
              <div className="hidden md:block w-12 h-12 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
                {p.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                )}
              </div>

              {/* Name + description */}
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white truncate">{p.name}</p>
                  {p.is_featured && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 flex-shrink-0">
                      <Star className="w-2.5 h-2.5 fill-amber-400" /> Destacado
                    </span>
                  )}
                </div>
                {p.description && (
                  <p className="text-xs text-gray-500 mt-0.5 truncate max-w-xs">{p.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="min-w-0">
                <p className={`text-sm font-medium ${isUnpriced ? 'text-amber-400' : 'text-white'}`}>
                  ${Number(p.price).toFixed(2)}
                </p>
                {isUnpriced && (
                  <span
                    className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25 whitespace-nowrap"
                    title="Plato sin precio: se mantiene oculto automáticamente en la carta pública de los clientes."
                  >
                    ⚠️ Sin precio (Oculto)
                  </span>
                )}
              </div>

              {/* Category & Subcategory */}
              <div className="min-w-0">
                <p className="text-sm text-gray-400 truncate">{catName}</p>
                {p.subcategory && (
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 truncate max-w-full">
                    {p.subcategory}
                  </span>
                )}
              </div>

              {/* Available toggle */}
              <div>
                <button
                  onClick={() => onToggleAvailable(p)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all
                    ${p.is_available
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
                    }`}
                >
                  {p.is_available ? (
                    <><ToggleRight className="w-3.5 h-3.5" /> Activo</>
                  ) : (
                    <><ToggleLeft className="w-3.5 h-3.5" /> Inactivo</>
                  )}
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => onToggleFeatured(p)}
                  title="Destacar"
                  className={`p-2 rounded-lg transition-all ${
                    p.is_featured
                      ? 'text-amber-400 bg-amber-500/10 hover:bg-amber-500/20'
                      : 'text-gray-500 hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDuplicate(p.id)}
                  title="Duplicar"
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onEdit(p)}
                  title="Editar"
                  className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  title="Eliminar"
                  className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
