'use client';

import React, { useState, useTransition, useRef } from 'react';
import { Plus, Printer, Pencil, Trash2, UtensilsCrossed, Loader2, X, FolderDown, QrCode, Image as ImageIcon, ChevronDown } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { PageHeader } from '@/components/ui/PageHeader';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { TablePosterModal } from '@/components/tables/TablePosterModal';
import { createTable, updateTable, deleteTable } from '@/actions/tables';
import { Business } from '@/types';
import { toast } from 'sonner';
import {
  getTableQrUrl,
  getTableDisplayName,
  sanitizeFileName,
  buildZeroMarginQrCanvas,
  buildPosterCanvasFromQr,
  canvasToPngBytes,
  saveGeneratedFilesToFolderOrZip,
} from '@/lib/table-qr-export';

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

  // Exportación masiva de QRs / Carteles
  const [bulkMenuOpen, setBulkMenuOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const hiddenQrContainerRef = useRef<HTMLDivElement>(null);

  const handleBulkExport = async (type: 'qr' | 'poster') => {
    setBulkMenuOpen(false);
    if (tables.length === 0) {
      toast.info('No hay mesas para descargar.');
      return;
    }

    setIsExporting(true);
    const folderPrefix = type === 'qr' ? 'QRs-Mesas' : 'Carteles-Mesas';
    const folderName = `${folderPrefix}-${sanitizeFileName(business.slug || business.name)}`;

    try {
      const result = await saveGeneratedFilesToFolderOrZip(folderName, async () => {
        const container = hiddenQrContainerRef.current;
        if (!container) throw new Error('No se pudieron preparar los códigos QR');

        const files: { name: string; data: Uint8Array }[] = [];

        for (const table of tables) {
          const qrSourceCanvas = container.querySelector(
            `canvas[data-table-id="${table.id}"]`
          ) as HTMLCanvasElement | null;
          if (!qrSourceCanvas) continue;

          const displayName = getTableDisplayName(table);
          const safeName = sanitizeFileName(displayName);

          if (type === 'qr') {
            const qrCanvas = buildZeroMarginQrCanvas(qrSourceCanvas, 512);
            const data = await canvasToPngBytes(qrCanvas);
            files.push({ name: `QR-${safeName}.png`, data });
          } else {
            const posterCanvas = buildPosterCanvasFromQr(qrSourceCanvas, displayName, business);
            const data = await canvasToPngBytes(posterCanvas);
            files.push({ name: `Cartel-${safeName}.png`, data });
          }
        }

        if (files.length === 0) {
          throw new Error('No se generó ninguna imagen de mesa');
        }
        return files;
      });

      if (result.mode === 'cancelled') {
        toast.info('Descarga cancelada.');
      } else if (result.mode === 'folder') {
        toast.success(
          `¡Listo! Se guardaron ${result.count} imágenes en la carpeta "${result.folderName}".`,
          { duration: 5000 }
        );
      } else {
        toast.success(
          `¡Descarga lista! Se generó "${result.folderName}.zip" con ${result.count} imágenes.`,
          { duration: 5000 }
        );
      }
    } catch (err: any) {
      console.error('Error en descarga masiva de mesas:', err);
      toast.error(err?.message || 'Error al generar las imágenes de las mesas.');
    } finally {
      setIsExporting(false);
    }
  };

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
          <div className="flex flex-wrap items-center gap-2.5">
            {tables.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setBulkMenuOpen(prev => !prev)}
                  disabled={isExporting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                             bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30
                             transition-all cursor-pointer disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generando ({tables.length})...</span>
                    </>
                  ) : (
                    <>
                      <FolderDown className="w-4 h-4" />
                      <span>Descargar todas ({tables.length})</span>
                      <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                    </>
                  )}
                </button>

                {bulkMenuOpen && !isExporting && (
                  <>
                    <div
                      className="fixed inset-0 z-20"
                      onClick={() => setBulkMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-[#141414] border border-white/15 shadow-2xl p-2 z-30 space-y-1">
                      <button
                        type="button"
                        onClick={() => handleBulkExport('qr')}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <QrCode className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Solo QRs</div>
                          <div className="text-[11px] text-gray-400">
                            Guarda QR-Mesa-1.png, QR-Mesa-2.png... en una carpeta
                          </div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleBulkExport('poster')}
                        className="w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="text-xs font-bold text-white">Carteles completos (PNG)</div>
                          <div className="text-[11px] text-gray-400">
                            Guarda el diseño completo de todas las mesas en una carpeta
                          </div>
                        </div>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                         bg-indigo-500 hover:bg-indigo-600 text-white transition-all shadow-lg shadow-indigo-500/25 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Nueva Mesa
            </button>
          </div>
        }
      />

      {/* Canvases ocultos de QR con 0 margen para descarga masiva instantánea */}
      <div
        ref={hiddenQrContainerRef}
        aria-hidden="true"
        className="sr-only pointer-events-none"
      >
        {tables.map(table => (
          <QRCodeCanvas
            key={table.id}
            data-table-id={table.id}
            value={getTableQrUrl(table, business.slug, publicUrl)}
            size={512}
            level="M"
            marginSize={0}
            fgColor="#000000"
            bgColor="#ffffff"
          />
        ))}
      </div>

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
