import React from 'react';
import { Business } from '@/types';

interface ThemePreviewProps {
  design: Partial<Business>;
  title?: string;
}

export function ThemePreview({ design, title = "Vista Previa" }: ThemePreviewProps) {
  const primaryColor = design.color_primary || '#4f46e5';
  const secondaryColor = design.color_secondary || '#ffffff';
  const bgColor = design.background_color || '#0a0e1a';
  const typography = design.typography || 'Inter';
  const surfaceColor = design.surface_color || '#111827';
  const textColor = design.text_color || secondaryColor;
  const layoutStyle = design.layout_style || 'grid';
  const borderRadius = design.border_radius !== undefined ? `${design.border_radius}px` : '8px';

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400 font-medium">{title}</span>
      <div 
        className="rounded-xl overflow-hidden border border-white/10 shadow-lg"
        style={{
          backgroundColor: bgColor,
          fontFamily: typography,
          color: textColor,
        }}
      >
        <div className="px-4 py-3 border-b text-xs flex justify-between items-center opacity-90" style={{ backgroundColor: surfaceColor, borderColor: 'rgba(255,255,255,0.1)' }}>
          <span className="font-semibold" style={{ color: primaryColor }}>Logo</span>
          <div className="flex gap-2 text-[10px]">
            <span>Menú</span>
          </div>
        </div>
        
        <div className="p-4 space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: primaryColor, textAlign: (design.title_alignment as any) || 'left' }}>
            Destacados
          </p>
          
          <div className={layoutStyle === 'list' ? 'flex flex-col gap-2' : 'grid grid-cols-2 gap-2'}>
            <div 
              className="overflow-hidden border flex flex-col"
              style={{
                backgroundColor: surfaceColor,
                borderColor: 'rgba(255,255,255,0.05)',
                borderRadius: borderRadius,
              }}
            >
              <div className="h-12 w-full bg-black/20" />
              <div className="p-2 flex flex-col flex-1">
                <p className="text-[9px] font-semibold" style={{ color: primaryColor }}>Producto Ejemplo</p>
                <p className="text-[8px] font-bold mt-1">$4.00</p>
              </div>
            </div>
            
            {layoutStyle !== 'list' && (
              <div 
                className="overflow-hidden border flex flex-col"
                style={{
                  backgroundColor: surfaceColor,
                  borderColor: 'rgba(255,255,255,0.05)',
                  borderRadius: borderRadius,
                }}
              >
                <div className="h-12 w-full bg-black/20" />
                <div className="p-2 flex flex-col flex-1">
                  <p className="text-[9px] font-semibold" style={{ color: primaryColor }}>Otro Producto</p>
                  <p className="text-[8px] font-bold mt-1">$3.50</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
