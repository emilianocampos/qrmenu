'use client';

import React, { useState, useTransition } from 'react';
import { Plus, Printer, Pencil, Trash2, UtensilsCrossed, Loader2, X, Check, Copy } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TablePosterModal } from '@/components/tables/TablePosterModal';
import { createTable, updateTable, deleteTable } from '@/actions/tables';
import { Business } from '@/types';
import { toast } from 'sonner';

interface RestaurantTableItem {
  id: string;
  table_number: number;
  table_name: string | null;
  table_code: string | null;
  active: boolean;
}

interface TablesClientProps {
  initialTables: RestaurantTableItem[];
  business: Business;
  publicUrl: string;
}

export function TablesClient({ initialTables, business, publicUrl }: TablesClientProps) {
  const [tables, setTables] = useState<RestaurantTableItem[]>(initialTables);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTable, setEditTable] = useState<RestaurantTableItem | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [posterTable, setPosterTable] = useState<RestaurantTableItem | null>(null);

  const [form, setForm] = useState({ tableNumber: '', tableName: '' });
  const [formError, setFormError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const openCreate = () => {
    setEditTable(null);
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.table_number)) + 1 : 1;
    setForm({ tableNumber: String(nextNumber), tableName: `Mesa ${nextNumber}` });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (t: RestaurantTableItem) => {
    setEditTable(t);
    setForm({ tableNumber: String(t.table_number), tableName: t.table_name || '' });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = () => {
    const num = parseInt(form.tableNumber, 10);
    if (isNaN(num) || num <= 0) {
      setFormError('El número de mesa debe ser mayor a 0');
      return;
    }

    startTransition(async () => {
      if (editTable) {
        const res = await updateTable(editTable.id, {
          tableNumber: num,
          tableName: form.tableName.trim() || `Mesa ${num}`,
        });
        if (res.error) {
          setFormError(res.error);
          toast.error(res.error);
          return;
        }
        if (res.data) {
          setTables(prev => prev.map(t => t.id === editTable.id ? (res.data as RestaurantTableItem) : t));
          toast.success('Mesa actualizada correctamente.');
        }
      } else {
        const res = await createTable({
          businessId: business.id,
          tableNumber: num,
          tableName: form.tableName.trim() || `Mesa ${num}`,
        });
        if (res.error) {
          setFormError(res.error);
          toast.error(res.error);
          return;
        }
        if (res.data) {
          setTables(prev => [...prev, res.data as RestaurantTableItem].sort((a, b) => a.table_number - b.table_number));
          toast.success('Mesa creada correctamente.');
        }
      }
      setDialogOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      const res = await deleteTable(id);
      if (!res.error) {
        setTables(prev => prev.filter(t => t.id !== id));
        toast.success('Mesa eliminada.');
      } else {
        toast.error('Error al eliminar mesa.');
      }
      setConfirmDelete(null);
    });
  };

  return (
    <div>
      <PageHeader
        title="Mesas del Restaurante"
        description="Administrá las mesas y generá carteles con QR de pedido para tus clientes"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Mesas' }]}
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nueva Mesa
          </button>
        }
      />

      {tables.length === 0 ? (
        <EmptyState
          icon={<UtensilsCrossed className="w-10 h-10 text-gray-500" />}
          title="Sin mesas configuradas"
          description="Creá tus mesas para permitir a tus clientes pedir e identificar desde qué mesa están comprando."
          action={
            <button
              onClick={openCreate}
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all cursor-pointer"
            >
              + Crear Mesa
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map(table => (
            <div
              key={table.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-black text-lg flex items-center justify-center">
                    {table.table_number}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                    Activa
                  </span>
                </div>
                <h3 className="font-bold text-white text-base">
                  {table.table_name || `Mesa ${table.table_number}`}
                </h3>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {table.table_code}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => setPosterTable(table)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                             bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Generar cartel
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEdit(table)}
                    className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(table.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Mesa */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDialogOpen(false)} />
          <div className="relative bg-[#111] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="px-6 pt-6 pb-4 border-b border-white/8 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editTable ? 'Editar Mesa' : 'Nueva Mesa'}
              </h3>
              <button onClick={() => setDialogOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Número de Mesa *</label>
                <input
                  type="number"
                  min="1"
                  value={form.tableNumber}
                  onChange={e => setForm(f => ({ ...f, tableNumber: e.target.value }))}
                  placeholder="Ej: 8"
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Nombre / Etiqueta de la Mesa</label>
                <input
                  type="text"
                  value={form.tableName}
                  onChange={e => setForm(f => ({ ...f, tableName: e.target.value }))}
                  placeholder="Ej: Mesa 8, Terraza 2, VIP..."
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                onClick={() => setDialogOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</> : editTable ? 'Guardar' : 'Crear Mesa'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Poster Imprimible */}
      <TablePosterModal
        open={!!posterTable}
        table={posterTable}
        business={business}
        publicUrl={publicUrl}
        onClose={() => setPosterTable(null)}
      />

      {/* Diálogo Confirmar Eliminación */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Eliminar mesa"
        description="¿Estás seguro de eliminar esta mesa? Los pedidos existentes mantendrán su historial."
        confirmLabel="Eliminar"
        onConfirm={() => confirmDelete && handleDelete(confirmDelete)}
        onCancel={() => setConfirmDelete(null)}
        danger
        loading={isPending}
      />
    </div>
  );
}
