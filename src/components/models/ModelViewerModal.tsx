'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { X, Maximize } from 'lucide-react';
import { Product } from '@/types';



const ModelViewer = 'model-viewer' as any;

interface ModelViewerModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export function ModelViewerModal({ product, isOpen, onClose }: ModelViewerModalProps) {
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Evitar scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !product.model_3d_url) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
      <Script
        type="module"
        src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js"
        onLoad={() => setIsScriptLoaded(true)}
      />
      
      <div className="relative w-full max-w-4xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-full">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <div>
            <h3 className="text-lg font-bold text-white">{product.name}</h3>
            {product.category && (
              <p className="text-sm text-gray-400">{product.category.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewer Area */}
        <div className="relative w-full aspect-square sm:aspect-video bg-gradient-to-b from-[#111] to-[#0a0a0a] flex items-center justify-center">
          {!isScriptLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
              Cargando visor 3D...
            </div>
          )}
          
          {/* model-viewer tag */}
          <ModelViewer
            src={product.model_3d_url}
            alt={product.name}
            auto-rotate
            camera-controls
            ar
            ar-modes="webxr scene-viewer quick-look"
            shadow-intensity="1"
            loading="lazy"
            poster={product.image_url || undefined}
            style={{ width: '100%', height: '100%', outline: 'none' }}
          >
            {/* Botón personalizado de AR que model-viewer inserta automáticamente si detecta AR, pero podemos estilizar el default */}
          </ModelViewer>
        </div>
        
        {/* Footer info */}
        <div className="p-4 bg-white/5 border-t border-white/10 text-center">
          <p className="text-sm text-gray-400">
            Puedes rotar el modelo arrastrando, hacer zoom, o verlo en Realidad Aumentada si estás en un dispositivo móvil compatible.
          </p>
        </div>
      </div>
    </div>
  );
}
