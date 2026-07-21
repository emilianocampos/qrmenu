'use client';

import React, { useState, useTransition } from 'react';
import { Sparkles, Loader2, Check, Plus, Trash2, X, ChevronDown, ChevronUp } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { UploadDropzone } from '@/components/ui/UploadDropzone';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/types';
import { toast } from 'sonner';

interface AICategory {
  name: string;
  products: AIProduct[];
  icon?: string;
}

interface AIProduct {
  name: string;
  description: string;
  price: number;
}

interface ImportClientProps {
  business: Business;
}

export function ImportClient({ business }: ImportClientProps) {
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AICategory[] | null>(null);
  const [editableResult, setEditableResult] = useState<AICategory[] | null>(null);
  const [expandedCats, setExpandedCats] = useState<Set<number>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [importDone, setImportDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (f: File) => {
    setFile(f);
    setAiResult(null);
    setEditableResult(null);
    setImportDone(false);
    setError(null);

    if (f.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setFilePreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setFilePreview(f.name);
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);

    try {
      // Leer el archivo como Base64 directamente en el cliente
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remover prefijo "data:image/jpeg;base64,"
        };
        reader.onerror = error => reject(error);
      });

      const toastId = toast.loading('Analizando menú con IA...');

      // Call the AI import route directly with base64 instead of uploading to Supabase
      const response = await fetch('/api/ai/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ base64Data, fileName: file.name, mimeType: file.type }),
      });

      if (!response.ok) {
        toast.dismiss(toastId);
        if (response.status === 503) {
          throw new Error('El servicio de IA está temporalmente sobrecargado. Por favor, intente nuevamente.');
        }
        const err = await response.json();
        throw new Error(err.error ?? 'Error al analizar el archivo');
      }

      const data = await response.json();
      setAiResult(data.categories);
      setEditableResult(JSON.parse(JSON.stringify(data.categories)));
      // Expand all by default
      setExpandedCats(new Set(data.categories.map((_: unknown, i: number) => i)));
      toast.dismiss(toastId);
      toast.success('Análisis completado');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error desconocido';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleImport = () => {
    if (!editableResult) return;
    setError(null);

    startTransition(async () => {
      const toastId = toast.loading('Guardando categorías y productos...');
      try {
        const response = await fetch('/api/ai/import/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessId: business.id, categories: editableResult }),
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.error ?? 'Error al guardar');
        }

        toast.dismiss(toastId);
        toast.success('Menú importado exitosamente');
        setImportDone(true);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error al guardar';
        setError(msg);
        toast.dismiss(toastId);
        toast.error(msg);
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

  const updateCatName = (idx: number, name: string) => {
    setEditableResult(prev => {
      if (!prev) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], name };
      return next;
    });
  };

  const updateProduct = (catIdx: number, pIdx: number, field: keyof AIProduct, value: string | number) => {
    setEditableResult(prev => {
      if (!prev) return prev;
      const next = [...prev];
      const products = [...next[catIdx].products];
      products[pIdx] = { ...products[pIdx], [field]: value };
      next[catIdx] = { ...next[catIdx], products };
      return next;
    });
  };

  const removeProduct = (catIdx: number, pIdx: number) => {
    setEditableResult(prev => {
      if (!prev) return prev;
      const next = [...prev];
      const products = [...next[catIdx].products];
      products.splice(pIdx, 1);
      next[catIdx] = { ...next[catIdx], products };
      return next;
    });
  };

  const addProduct = (catIdx: number) => {
    setEditableResult(prev => {
      if (!prev) return prev;
      const next = [...prev];
      next[catIdx] = {
        ...next[catIdx],
        products: [...next[catIdx].products, { name: '', description: '', price: 0 }],
      };
      return next;
    });
  };

  const removeCategory = (catIdx: number) => {
    setEditableResult(prev => {
      if (!prev) return prev;
      return prev.filter((_, i) => i !== catIdx);
    });
  };

  if (importDone) {
    return (
      <div>
        <PageHeader title="Importar Carta" breadcrumb={[{ label: 'Dashboard' }, { label: 'Importar Carta' }]} />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">¡Carta importada!</h2>
          <p className="text-gray-400 mb-6">Las categorías y productos fueron creados correctamente.</p>
          <a
            href="/productos"
            className="px-6 py-3 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-600 text-white transition-all"
          >
            Ver productos →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Importar Carta con IA"
        description="Subí una imagen o PDF de tu menú y la IA extraerá categorías y productos automáticamente"
        breadcrumb={[{ label: 'Dashboard' }, { label: 'Importar Carta' }]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload */}
        <div className="space-y-5">
          <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-white mb-4">1. Subí tu menú</h3>
            <UploadDropzone
              accept="image/*,application/pdf"
              onFileSelect={handleFileSelect}
              preview={filePreview}
              onClear={() => { setFile(null); setFilePreview(null); setAiResult(null); setEditableResult(null); }}
              sublabel="PNG, JPG, PDF — hasta 10MB"
              loading={isAnalyzing}
            />
          </div>

          {file && !aiResult && (
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-sm font-semibold
                         bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600
                         text-white transition-all shadow-lg shadow-cyan-500/25 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Analizando con IA...</>
              ) : (
                <><Sparkles className="w-5 h-5" /> Analizar con IA</>
              )}
            </button>
          )}

          {/* Info */}
          <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-white mb-1">¿Cómo funciona?</p>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>1. Subí una foto o PDF de tu carta actual</li>
                  <li>2. La IA extrae categorías, platos y precios</li>
                  <li>3. Revisá y editá los datos antes de guardar</li>
                  <li>4. Confirmá para crear todo en tu dashboard</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Preview / Editor */}
        <div>
          {!editableResult && !isAnalyzing && (
            <div className="h-full flex items-center justify-center bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-10 text-center">
              <div>
                <Sparkles className="w-10 h-10 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 text-sm">El resultado aparecerá aquí después del análisis</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex items-center justify-center bg-gradient-to-br from-cyan-500/5 to-indigo-500/5 border border-cyan-500/20 rounded-2xl p-10 text-center">
              <div>
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full bg-cyan-500/10 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-cyan-400 animate-pulse" />
                  </div>
                </div>
                <p className="text-white font-medium mb-1">Analizando tu menú...</p>
                <p className="text-gray-400 text-sm">Esto puede tardar unos segundos</p>
              </div>
            </div>
          )}

          {editableResult && !isAnalyzing && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">
                  2. Revisá y editá el resultado ({editableResult.length} categorías)
                </p>
              </div>

              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {editableResult.map((cat, catIdx) => (
                  <div key={catIdx} className="bg-white/[0.03] border border-white/10 rounded-xl overflow-hidden">
                    <div
                      className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                      onClick={() => toggleCat(catIdx)}
                    >
                      <input
                        type="text"
                        value={cat.name}
                        onChange={e => { e.stopPropagation(); updateCatName(catIdx, e.target.value); }}
                        onClick={e => e.stopPropagation()}
                        className="flex-1 bg-transparent text-sm font-semibold text-white focus:outline-none"
                      />
                      <span className="text-xs text-gray-500">{cat.products.length} productos</span>
                      <button
                        onClick={e => { e.stopPropagation(); removeCategory(catIdx); }}
                        className="text-gray-600 hover:text-rose-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {expandedCats.has(catIdx) ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </div>

                    {expandedCats.has(catIdx) && (
                      <div className="border-t border-white/8 p-3 space-y-2">
                        {cat.products.map((p, pIdx) => (
                          <div key={pIdx} className="grid grid-cols-[1fr_80px_auto] gap-2 items-start bg-white/[0.02] rounded-lg p-3">
                            <div className="space-y-1.5">
                              <input
                                type="text"
                                value={p.name}
                                onChange={e => updateProduct(catIdx, pIdx, 'name', e.target.value)}
                                placeholder="Nombre"
                                className="w-full bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none border-b border-white/10 pb-1"
                              />
                              <input
                                type="text"
                                value={p.description}
                                onChange={e => updateProduct(catIdx, pIdx, 'description', e.target.value)}
                                placeholder="Descripción"
                                className="w-full bg-transparent text-xs text-gray-400 placeholder-gray-600 focus:outline-none"
                              />
                            </div>
                            <input
                              type="number"
                              value={p.price}
                              onChange={e => updateProduct(catIdx, pIdx, 'price', parseFloat(e.target.value) || 0)}
                              className="bg-white/5 border border-white/10 text-white text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 text-right"
                            />
                            <button
                              onClick={() => removeProduct(catIdx, pIdx)}
                              className="text-gray-600 hover:text-rose-400 transition-colors p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={() => addProduct(catIdx)}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-xs text-gray-500
                                     hover:text-white hover:bg-white/5 border border-dashed border-white/10 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                          Agregar producto
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {error && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">{error}</div>
              )}

              <button
                onClick={handleImport}
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold
                           bg-emerald-500 hover:bg-emerald-600 text-white transition-all shadow-lg shadow-emerald-500/25
                           disabled:opacity-50"
              >
                {isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Importando...</> : <><Check className="w-4 h-4" /> Confirmar e Importar</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
