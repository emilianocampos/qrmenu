'use client';

import React, { useState } from 'react';
import { X, Upload, Link as LinkIcon, Loader2, Box, CheckCircle2 } from 'lucide-react';
import { Product } from '@/types';
import { uploadCustomGLBModel, setCustomGLBUrl } from '@/actions/models';
import { toast } from 'sonner';

interface UploadGLBModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadGLBModal({ product, isOpen, onClose, onSuccess }: UploadGLBModalProps) {
  const [activeTab, setActiveTab] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState(product.model_3d_url || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.glb')) {
        toast.error('El archivo seleccionado debe ser en formato .glb');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmitFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Por favor selecciona un archivo .glb');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await uploadCustomGLBModel(product.id, formData);
      if (res.error) {
        throw new Error(res.error);
      }

      toast.success('¡Modelo 3D (.glb) subido con éxito! 📦');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al subir el modelo 3D');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) {
      toast.error('Ingresa una URL válida');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await setCustomGLBUrl(product.id, urlInput.trim());
      if (res.error) {
        throw new Error(res.error);
      }

      toast.success('¡Enlace del modelo 3D guardado correctamente! 📦');
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Error al guardar el enlace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-[#121212] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Glow Header Accent */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-pulse" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Cargar Modelo 3D (.GLB)</h3>
            <p className="text-xs text-gray-400">Asignar modelo 3D a <span className="text-indigo-400 font-semibold">{product.name}</span></p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white/5 p-1 rounded-xl mb-6 border border-white/10">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'file' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Archivo .GLB</span>
          </button>
          <button
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'url' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>Enlace URL Directo</span>
          </button>
        </div>

        {/* Tab 1: File Upload Form */}
        {activeTab === 'file' && (
          <form onSubmit={handleSubmitFile} className="space-y-5">
            <div className="border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-2xl p-6 text-center transition-all bg-white/[0.02]">
              <input
                type="file"
                accept=".glb"
                id="glb-file-upload"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="glb-file-upload"
                className="cursor-pointer flex flex-col items-center justify-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-indigo-400 hover:scale-105 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-white">Haz clic para seleccionar tu archivo .glb</p>
                    <p className="text-xs text-gray-400 mt-1">Soporta archivos binarios 3D (.glb)</p>
                  </div>
                )}
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedFile}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Subiendo Modelo 3D...</>
              ) : (
                <><Upload className="w-4 h-4" /> Guardar Modelo 3D</>
              )}
            </button>
          </form>
        )}

        {/* Tab 2: URL Form */}
        {activeTab === 'url' && (
          <form onSubmit={handleSubmitUrl} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                URL del Archivo .GLB
              </label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://ejemplo.com/modelos/plato-3d.glb"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                Ingresa el enlace directo a tu archivo 3D hospedado en un CDN, Github o servidor.
              </p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !urlInput.trim()}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-xl transition-all shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Guardando URL...</>
              ) : (
                <><LinkIcon className="w-4 h-4" /> Asignar URL 3D</>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
