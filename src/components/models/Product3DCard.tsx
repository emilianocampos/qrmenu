'use client';

import React, { useState } from 'react';
import { Trash2, Box } from 'lucide-react';
import { Product } from '@/types';
import { StatusBadge } from './StatusBadge';
import { GenerateModelButton } from './GenerateModelButton';
import { ModelViewerModal } from './ModelViewerModal';
import { toast } from 'sonner';

interface Product3DCardProps {
  initialProduct: Product;
  onDelete: (productId: string) => Promise<void>;
  onRefresh: () => void;
}

export function Product3DCard({ initialProduct, onDelete, onRefresh }: Product3DCardProps) {
  const [product, setProduct] = useState(initialProduct);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm('¿Seguro que deseas eliminar el modelo 3D? Esta acción no se puede deshacer.')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(product.id);
      toast.success('Modelo 3D eliminado');
      onRefresh();
    } catch (error) {
      toast.error('Error al eliminar el modelo');
    } finally {
      setIsDeleting(false);
    }
  };

  const hasModel = !!product.model_3d_url;

  return (
    <>
      <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden flex flex-col md:flex-row gap-4 p-4 hover:border-white/20 transition-all">
        {/* Imagen del producto */}
        <div className="relative w-full md:w-40 h-40 rounded-xl overflow-hidden bg-white/5 flex-shrink-0">
          {product.image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500">
              <span className="text-xs">Sin imagen</span>
            </div>
          )}
        </div>

        {/* Detalles e interacción */}
        <div className="flex-1 flex flex-col justify-between py-1 gap-4">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-semibold text-lg text-white mb-1">{product.name}</h4>
                <p className="text-sm text-gray-400">{product.category?.name || 'Sin categoría'}</p>
              </div>
              <StatusBadge status={product.model_3d_status} />
            </div>
            
            {product.model_3d_generated_at && (
              <p className="text-xs text-gray-500">
                Generado: {new Date(product.model_3d_generated_at).toLocaleDateString()}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-3 mt-auto">
            <GenerateModelButton product={product} onGenerationComplete={onRefresh} />
            
            {hasModel && (
              <>
                <button
                  onClick={() => setIsViewerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-medium transition-all"
                >
                  <Box className="w-4 h-4" />
                  Ver Modelo
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-2 p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl transition-all disabled:opacity-50"
                  title="Eliminar modelo 3D"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <ModelViewerModal
        product={product}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
