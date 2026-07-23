'use client';

import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { DesignUploader } from './DesignUploader';
import { LoadingAnalysis } from './LoadingAnalysis';
import { DesignComparison } from './DesignComparison';
import { analyzeMenuDesign, updateBusinessTheme } from '@/actions/ai-design';
import { createClient } from '@/lib/supabase/client';
import { Business } from '@/types';
import { toast } from 'sonner';

interface DesignAnalysisCardProps {
  business: Business;
  onDesignApplied: () => void;
}

export function DesignAnalysisCard({ business, onDesignApplied }: DesignAnalysisCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<Partial<Business> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!file) return;
    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);

    const supabase = createClient();
    try {
      // 1. Upload to temporary bucket
      const ext = file.name.split('.').pop();
      const path = `${business.id}/design_${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('design-analysis').upload(path, file, { upsert: true });
      
      if (uploadErr) {
        throw new Error('Error al subir imagen para análisis: ' + uploadErr.message);
      }

      const { data: { publicUrl } } = supabase.storage.from('design-analysis').getPublicUrl(path);

      // 2. Call AI action
      const result = await analyzeMenuDesign(business.id, publicUrl, file.type);
      
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        // Map data to business properties
        const designData: Partial<Business> = {
          theme: result.data.theme || business.theme,
          color_primary: result.data.primary_color || business.color_primary,
          color_secondary: result.data.secondary_color || business.color_secondary,
          background_color: result.data.background_color || business.background_color,
          surface_color: result.data.surface_color || business.surface_color,
          text_color: result.data.text_color || business.text_color,
          accent_color: result.data.accent_color || business.accent_color,
          typography: result.data.font_style || business.typography,
          font_weight: result.data.font_weight || business.font_weight,
          category_alignment: result.data.category_alignment || business.category_alignment,
          product_alignment: result.data.product_alignment || business.product_alignment,
          price_alignment: result.data.price_alignment || business.price_alignment,
          title_alignment: result.data.title_alignment || business.title_alignment,
          card_style: result.data.card_style || business.card_style,
          border_radius: result.data.border_radius || business.border_radius,
          shadow: result.data.shadow || business.shadow,
          spacing: result.data.spacing || business.spacing,
          separator_style: result.data.separator_style || business.separator_style,
          image_style: result.data.image_style || business.image_style,
          button_style: result.data.button_style || business.button_style,
          header_style: result.data.header_style || business.header_style,
          visual_density: result.data.visual_density || business.visual_density,
        };
        
        setAnalysisResult(designData);
      } else {
        throw new Error('La IA no devolvió resultados válidos.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error inesperado durante el análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApply = async () => {
    if (!analysisResult) return;
    setIsApplying(true);
    setError(null);
    try {
      const result = await updateBusinessTheme(business.id, analysisResult);
      if (result.error) {
        throw new Error(result.error);
      }
      toast.success('Diseño aplicado correctamente');
      setAnalysisResult(null);
      setFile(null);
      onDesignApplied(); // Trigger refresh or state update in parent
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Error al aplicar el diseño');
    } finally {
      setIsApplying(false);
    }
  };

  const handleCancel = () => {
    setAnalysisResult(null);
    setFile(null);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
      {/* Decorative element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Generar Diseño con IA</h2>
          <p className="text-xs text-indigo-300">Inteligencia Artificial</p>
        </div>
      </div>

      <div className="relative z-10">
        {!analysisResult && !isAnalyzing && (
          <div className="space-y-4">
            <DesignUploader onImageSelect={setFile} isLoading={isAnalyzing} />
            
            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                {error}
              </div>
            )}

            <button
              onClick={handleAnalyze}
              disabled={!file || isAnalyzing}
              className="w-full py-3 rounded-xl text-sm font-semibold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/10 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              Analizar Diseño
            </button>
          </div>
        )}

        {isAnalyzing && (
          <LoadingAnalysis />
        )}

        {analysisResult && !isAnalyzing && (
          <DesignComparison 
            currentDesign={business}
            newDesign={analysisResult}
            onApply={handleApply}
            onCancel={handleCancel}
            isApplying={isApplying}
          />
        )}
        
        {error && analysisResult && (
          <div className="mt-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
