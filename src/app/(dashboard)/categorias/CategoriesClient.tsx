'use client';

import React, { useState, useTransition } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Pencil, Trash2, Eye, EyeOff, X, Loader2, Tags } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { createCategory, updateCategory, deleteCategory, reorderCategories } from '@/actions/categories';
import { Category, Business } from '@/types';

interface CategoriesClientProps {
  initialCategories: Category[];
  business: Business;
}

interface SortableItemProps {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (c: Category) => void;
}

function SortableItem({ category, onEdit, onDelete, onToggleVisibility }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const productCount = (category as any).products?.[0]?.count ?? 0;

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors
        ${isDragging ? 'bg-indigo-500/5 border-indigo-500/20' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing flex-shrink-0 touch-none"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-xl flex-shrink-0">
        {category.icon ?? '📋'}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{category.name}</p>
        <p className="text-xs text-gray-500 mt-0.5">{productCount} productos</p>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onToggleVisibility(category)}
          title={category.is_visible ? 'Ocultar' : 'Mostrar'}
          className={`p-2 rounded-lg transition-all ${
            category.is_visible
              ? 'text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
              : 'text-gray-500 hover:text-white hover:bg-white/10'
          }`}
        >
          {category.is_visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(category.id)}
          className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </li>
  );
}

export function CategoriesClient({ initialCategories, business }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', icon: '' });
  const [isPending, startTransition] = useTransition();
  const [formError, setFormError] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const openCreate = () => {
    setEditCat(null);
    setForm({ name: '', icon: '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditCat(c);
    setForm({ name: c.name, icon: c.icon ?? '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { setFormError('El nombre es requerido'); return; }
    setFormError(null);

    startTransition(async () => {
      if (editCat) {
        const result = await updateCategory(editCat.id, { name: form.name, icon: form.icon || null });
        if (result.error) { setFormError(result.error); return; }
        setCategories(prev => prev.map(c => c.id === editCat.id ? { ...c, name: form.name, icon: form.icon || null } : c));
      } else {
        const fd = new FormData();
        fd.append('business_id', business.id);
        fd.append('name', form.name);
        fd.append('icon', form.icon);
        const result = await createCategory(fd);
        if (result.error) { setFormError(result.error); return; }
        if (result.data) setCategories(prev => [...prev, result.data as Category]);
      }
      setDialogOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const result = await deleteCategory(id);
      if (!result.error) setCategories(prev => prev.filter(c => c.id !== id));
      setConfirmDelete(null);
    });
  };

  const handleToggleVisibility = (cat: Category) => {
    startTransition(async () => {
      const result = await updateCategory(cat.id, { is_visible: !cat.is_visible });
      if (!result.error) {
        setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_visible: !c.is_visible } : c));
      }
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories(prev => {
      const oldIdx = prev.findIndex(c => c.id === active.id);
      const newIdx = prev.findIndex(c => c.id === over.id);
      const reordered = arrayMove(prev, oldIdx, newIdx).map((c, i) => ({ ...c, item_order: i }));

      // Persist to DB
      startTransition(async () => {
        await reorderCategories(reordered.map(c => ({ id: c.id, item_order: c.item_order ?? 0 })));
      });

      return reordered;
    });
  };

  return (
    <div>
      <PageHeader
        title="Categorías"
        description="Organizá y ordená las secciones de tu carta"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Categorías' }]}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25"
          >
            <Plus className="w-4 h-4" />
            Nueva Categoría
          </button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon="🏷️"
          title="Sin categorías"
          description="Las categorías te permiten organizar tu menú en secciones"
          action={
            <button
              onClick={openCreate}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
            >
              + Crear Categoría
            </button>
          }
        />
      ) : (
        <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
          <div className="hidden md:flex items-center gap-4 px-5 py-3 border-b border-white/8">
            <div className="w-5" />
            <div className="w-10" />
            <p className="flex-1 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</p>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</p>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              <ul className="divide-y divide-white/5">
                {categories.map(cat => (
                  <SortableItem
                    key={cat.id}
                    category={cat}
                    onEdit={openEdit}
                    onDelete={(id) => setConfirmDelete(id)}
                    onToggleVisibility={handleToggleVisibility}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editCat ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-white transition-colors">
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
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{formError}</div>
              )}
            </div>

            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white
                           bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25
                           disabled:opacity-50"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : (editCat ? 'Guardar' : 'Crear')}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar categoría"
        description="¿Estás seguro? Los productos asociados quedarán sin categoría."
        confirmLabel="Eliminar"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        danger
        loading={isPending}
      />
    </div>
  );
}
