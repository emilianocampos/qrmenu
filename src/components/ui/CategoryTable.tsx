'use client';

import React from 'react';
import { GripVertical, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
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
import { Category } from '@/types';

interface SortableRowProps {
  category: Category;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (c: Category) => void;
}

function SortableRow({ category, onEdit, onDelete, onToggleVisibility }: SortableRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const productCount = (category as any).products?.[0]?.count ?? 0;

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-white/5 hover:bg-white/[0.02] transition-colors ${
        isDragging ? 'bg-indigo-500/5' : ''
      }`}
    >
      <td className="px-5 py-4 w-10 text-center">
        <button
          {...attributes}
          {...listeners}
          className="text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-lg">
            {category.icon ?? '📋'}
          </div>
          <span className="text-sm font-medium text-white">{category.name}</span>
        </div>
      </td>
      <td className="px-5 py-4 text-sm text-gray-400">{productCount} productos</td>
      <td className="px-5 py-4 text-sm">
        <button
          onClick={() => onToggleVisibility(category)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold
            ${category.is_visible
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-gray-500/10 text-gray-400'
            }`}
        >
          {category.is_visible ? (
            <><Eye className="w-3 h-3" /> Visible</>
          ) : (
            <><EyeOff className="w-3 h-3" /> Oculto</>
          )}
        </button>
      </td>
      <td className="px-5 py-4 text-sm text-gray-400">#{category.item_order ?? 0}</td>
      <td className="px-5 py-4 text-right">
        <div className="flex items-center justify-end gap-1">
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
      </td>
    </tr>
  );
}

interface CategoryTableProps {
  categories: Category[];
  onReorder: (activeId: string, overId: string) => void;
  onEdit: (c: Category) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (c: Category) => void;
}

export function CategoryTable({
  categories,
  onReorder,
  onEdit,
  onDelete,
  onToggleVisibility,
}: CategoryTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/8 bg-white/2">
              <th className="px-5 py-3 w-10" />
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nombre</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Productos</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visible</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Orden</th>
              <th className="px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
              {categories.map(cat => (
                <SortableRow
                  key={cat.id}
                  category={cat}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onToggleVisibility={onToggleVisibility}
                />
              ))}
            </SortableContext>
          </tbody>
        </table>
      </DndContext>
    </div>
  );
}
