'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Sparkles, RotateCcw } from 'lucide-react';
import { Product } from '@/types';
import { client } from '@gradio/client';

interface GenerateModelButtonProps {
  product: Product;
  onGenerationComplete: () => void;
}

export function GenerateModelButton({ product, onGenerationComplete }: GenerateModelButtonProps) {
  const [isGenerating, setIsGenerating] = useState(product.model_3d_status === 'generating');

  const handleGenerateClick = async () => {
    if (isGenerating || product.model_3d_status === 'generating') {
      toast.warning('Ya hay una generación en progreso.');
      return;
    }

    if (product.model_3d_url) {
      const confirmReplace = window.confirm('Este producto ya tiene un modelo 3D. ¿Deseas reemplazarlo por uno nuevo?');
      if (!confirmReplace) return;
    }

    if (!product.image_url) {
      toast.error('El producto debe tener una imagen para generar el modelo 3D.');
      return;
    }

    setIsGenerating(true);
    toast.info('Iniciando generación con IA. Por favor, no cierres esta ventana. Puede tardar un par de minutos...');

    try {
      // 1. Marcar como generating en DB
      await fetch('/api/triposr/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      onGenerationComplete();

      // 2. Descargar la imagen
      const imgRes = await fetch(product.image_url);
      const imgBlob = await imgRes.blob();

      // 3. Conectar a TripoSR en Hugging Face
      const app = await client("stabilityai/TripoSR");
      
      // 4. Preprocesar imagen (Remover fondo)
      toast.info('Quitando fondo a la imagen (Paso 1/2)...');
      const preprocessResult = await app.predict("/preprocess", [
        imgBlob, // Input Image
        true,    // Remove Background
        0.85,    // Foreground Ratio
      ]) as { data: any[] };

      const processedImage = preprocessResult.data[0]; // FileData

      // 5. Generar Modelo
      toast.info('Generando modelo 3D, esto puede tardar un poco (Paso 2/2)...');
      const generateResult = await app.predict("/generate", [
        processedImage, // Processed Image
        256,           // Marching Cubes Resolution (default/recommended)
      ]) as { data: any[] };

      // data[0] = obj, data[1] = glb
      const glbFile = generateResult.data[1];
      const glbUrl = glbFile?.url;

      if (!glbUrl) throw new Error("No se pudo obtener el archivo GLB de la IA.");

      // 6. Guardar el modelo permanentemente
      toast.info('Modelo generado. Guardando en la base de datos...');
      const saveRes = await fetch('/api/triposr/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          glbUrl: glbUrl
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || 'Error al guardar el modelo');

      toast.success('¡Modelo 3D generado y guardado con éxito!');
      setIsGenerating(false);
      onGenerationComplete();

    } catch (error: any) {
      console.error('Error generando TripoSR:', error);
      toast.error(error.message || 'Error al generar el modelo 3D.');
      
      // En caso de fallo, intentamos restaurar estado failed
      try {
        await fetch('/api/triposr/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product.id }), // sin glbUrl para forzar failed
        });
        onGenerationComplete();
      } catch (e) {}

      setIsGenerating(false);
    }
  };

  const hasModel = !!product.model_3d_url;

  return (
    <button
      onClick={handleGenerateClick}
      disabled={isGenerating || product.model_3d_status === 'generating'}
      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full md:w-auto
        ${isGenerating || product.model_3d_status === 'generating'
          ? 'bg-white/5 text-gray-400 cursor-not-allowed border border-white/5'
          : hasModel
            ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
            : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
        }
      `}
    >
      {isGenerating || product.model_3d_status === 'generating' ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
          Generando con IA...
        </>
      ) : hasModel ? (
        <>
          <RotateCcw className="w-4 h-4" />
          Regenerar Modelo
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" />
          Generar Modelo 3D
        </>
      )}
    </button>
  );
}
