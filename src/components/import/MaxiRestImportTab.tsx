'use client';

import React, { useState, useTransition } from 'react';
import { Database, Loader2, Check, Plus, Trash2, ChevronDown, ChevronUp, Users, Utensils, TableProperties, Sparkles, FileCode } from 'lucide-react';
import { parseMaxiRestSQL, MaxiRestParsedData } from '@/lib/maxirest/parser';
import { Business } from '@/types';
import { toast } from 'sonner';

interface MaxiRestImportTabProps {
  business: Business;
  onSuccess?: () => void;
}

export function MaxiRestImportTab({ business, onSuccess }: MaxiRestImportTabProps) {
  const [file, setFile] = useState<File | null>(null);
  const [sqlContent, setSqlContent] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<MaxiRestParsedData | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [importTables, setImportTables] = useState(true);
  const [importWaiters, setImportWaiters] = useState(true);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [importDone, setImportDone] = useState(false);
  const [stats, setStats] = useState<{ categories: number; products: number; tables: number; waiters: number } | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParsedData(null);
    setImportDone(false);

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setSqlContent(text);
        
        try {
          const parsed = parseMaxiRestSQL(text);
          setParsedData(parsed);
          setExpandedCats(new Set(parsed.categories.map((_, i) => i)));
          
          if (parsed.categories.length === 0 && parsed.tables.length === 0 && parsed.waiters.length === 0) {
            toast.warning('No se detectaron productos, tablas ni mozos. Asegúrate de exportar desde HeidiSQL con "Datos: Insertar".');
          } else {
            toast.success(`Detectados: ${parsed.stats.totalProducts} productos, ${parsed.stats.totalCategories} categorías, ${parsed.stats.totalTables} mesas y ${parsed.stats.totalWaiters} mozos.`);
          }
        } catch (parseErr) {
          console.error(parseErr);
          toast.error('Error al analizar la estructura del archivo SQL');
        } finally {
          setIsParsing(false);
        }
      };

      reader.onerror = () => {
        toast.error('No se pudo leer el archivo seleccionado');
        setIsParsing(false);
      };

      // Read as text
      reader.readAsText(selectedFile, 'ISO-8859-1');
    } catch (err) {
      console.error(err);
      setIsParsing(false);
    }
  };

  const handleImport = () => {
    if (!sqlContent || !parsedData) return;

    startTransition(async () => {
      const toastId = toast.loading('Importando menú, mesas y mozos desde MaxiRest...');
      try {
        const res = await fetch('/api/maxirest/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            businessId: business.id,
            sqlContent,
            importTables,
            importWaiters,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Error al importar datos');
        }

        toast.dismiss(toastId);
        toast.success('¡Importación de MaxiRest completada con éxito!');
        setStats({
          categories: data.categoriesCreated,
          products: data.productsCreated,
          tables: data.tablesCreated,
          waiters: data.waitersCreated || 0,
        });
        setImportDone(true);
        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        toast.dismiss(toastId);
        toast.error(err instanceof Error ? err.message : 'Error en la importación');
      }
    });
  };

  const toggleCat = (idx: number) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (importDone && stats) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center bg-white/[0.02] border border-emerald-500/20 rounded-3xl p-8">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 ring-8 ring-emerald-500/5">
          <Check className="w-10 h-10 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">¡Menú de MaxiRest Importado!</h2>
        <p className="text-gray-400 mb-6 max-w-md">
          Se crearon exitosamente <strong className="text-emerald-400">{stats.categories} categorías</strong>,{' '}
          <strong className="text-emerald-400">{stats.products} productos</strong>
          {stats.tables > 0 && (
            <>, <strong className="text-emerald-400">{stats.tables} mesas</strong></>
          )}
          {stats.waiters > 0 && (
            <> y <strong className="text-purple-400">{stats.waiters} mozos</strong></>
          )}.
        </p>
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <a
            href="/productos"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/20"
          >
            Ver productos →
          </a>
          {stats.tables > 0 && (
            <a
              href="/mesas"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              Ver mesas y QRs →
            </a>
          )}
          {stats.waiters > 0 && (
            <a
              href="/configuracion"
              className="px-6 py-3 rounded-xl text-sm font-semibold bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 transition-all"
            >
              Ver mozos →
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Box Upload */}
      <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-white">Subir Dump SQL de MaxiRest</h3>
              <p className="text-xs text-gray-400">Exportado desde HeidiSQL (formato .sql)</p>
            </div>
          </div>
        </div>

        <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-dashed border-white/15 hover:border-blue-500/50 hover:bg-blue-500/[0.02] rounded-2xl cursor-pointer transition-all">
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
            <FileCode className="w-10 h-10 text-gray-400 mb-3" />
            <p className="text-sm font-medium text-white mb-1">
              {file ? file.name : 'Haz clic para seleccionar el archivo .sql'}
            </p>
            <p className="text-xs text-gray-400">
              {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : 'o arrastra y suelta el archivo aquí'}
            </p>
          </div>
          <input
            type="file"
            accept=".sql,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {isParsing && (
        <div className="flex items-center justify-center gap-3 py-10 text-blue-400 font-medium text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          Procesando tablas de MaxiRest (mxart, mxrua, mxmes, mxemp)...
        </div>
      )}

      {/* Preview if parsed */}
      {parsedData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Utensils className="w-4 h-4 text-emerald-400" />
                Categorías
              </div>
              <p className="text-2xl font-bold text-white">{parsedData.stats.totalCategories}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Productos
              </div>
              <p className="text-2xl font-bold text-white">{parsedData.stats.totalProducts}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <TableProperties className="w-4 h-4 text-amber-400" />
                Mesas
              </div>
              <p className="text-2xl font-bold text-white">{parsedData.stats.totalTables}</p>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Users className="w-4 h-4 text-purple-400" />
                Mozos
              </div>
              <p className="text-2xl font-bold text-white">{parsedData.stats.totalWaiters}</p>
            </div>
          </div>

          {/* Options */}
          {parsedData.tables.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <TableProperties className="w-5 h-5 text-amber-400" />
                <div>
                  <p className="text-sm font-medium text-white">Importar mesas automáticamente</p>
                  <p className="text-xs text-gray-400">Crea las {parsedData.tables.length} mesas en tu panel y genera sus códigos QR</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={importTables}
                onChange={(e) => setImportTables(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          )}

          {parsedData.waiters.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm font-medium text-white">Importar mozos automáticamente ({parsedData.waiters.length} detectados)</p>
                  <p className="text-xs text-gray-400">Activa la asignación de mozos y los sincroniza para la apertura de mesas</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={importWaiters}
                onChange={(e) => setImportWaiters(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/10 text-purple-500 focus:ring-purple-500 cursor-pointer"
              />
            </div>
          )}

          {/* Products List Preview */}
          {parsedData.categories.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-white">Vista previa del Menú</h4>
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {parsedData.categories.map((cat, catIdx) => (
                  <div
                    key={catIdx}
                    className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleCat(catIdx)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-white">{cat.name}</span>
                        <span className="text-xs text-gray-400 bg-white/10 px-2 py-0.5 rounded-full">
                          {cat.products.length} productos
                        </span>
                      </div>
                      {expandedCats.has(catIdx) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    {expandedCats.has(catIdx) && (
                      <div className="px-4 pb-3 space-y-2 border-t border-white/5 pt-2">
                        {cat.products.map((prod, pIdx) => (
                          <div
                            key={pIdx}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-white/5 last:border-0"
                          >
                            <div>
                              <span className="text-white font-medium">{prod.name}</span>
                              {prod.description && (
                                <p className="text-gray-400 text-[11px] truncate max-w-sm">{prod.description}</p>
                              )}
                            </div>
                            <span className="text-emerald-400 font-semibold font-mono">
                              ${prod.price.toLocaleString('es-AR')}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleImport}
            disabled={isPending || (parsedData.categories.length === 0 && parsedData.tables.length === 0)}
            className="w-full py-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isPending ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Guardando en Base de Datos...</>
            ) : (
              <><Check className="w-5 h-5" /> Confirmar e Importar a Carta QR</>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
