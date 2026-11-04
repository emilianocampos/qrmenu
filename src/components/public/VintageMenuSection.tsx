'use client';

import React, { useMemo } from 'react';
import { Product } from '@/types';
import { TableInfoAndWaiterBar } from './TableInfoAndWaiterBar';

interface VintageMenuSectionProps {
  products: Product[];
  currencySymbol?: string;
  vintageColorMode?: string;
  vintageColor?: string;
  orderMode?: string;
  businessId?: string;
  primaryColor?: string;
}

const NEON_COLORS = [
  '#ff4500', // Orange red
  '#ffd700', // Gold/Yellow
  '#ff00ff', // Magenta/Pink
  '#00ffff', // Cyan
  '#00ff00', // Lime
];



export function VintageMenuSection({
  products,
  currencySymbol = '$',
  vintageColorMode = 'multicolor',
  vintageColor = '#ff4500',
  orderMode = 'menu_only',
  businessId,
  primaryColor
}: VintageMenuSectionProps) {
  // Filter products that have a valid price > 0
  const validProducts = useMemo(() => {
    return products.filter(p => Number(p.price) > 0);
  }, [products]);

  // Group products by category
  const categories = useMemo(() => {
    const map = new Map<string, { id: string, name: string, products: Product[] }>();
    validProducts.forEach(p => {
      if (p.category) {
        if (!map.has(p.category.id)) {
          map.set(p.category.id, { id: p.category.id, name: p.category.name, products: [] });
        }
        map.get(p.category.id)!.products.push(p);
      }
    });
    return Array.from(map.values())
      .filter(c => c.products.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [validProducts]);

  // If no products, fallback to empty state
  if (validProducts.length === 0) {
    return (
      <div className="py-20 text-center" style={{ color: 'var(--text-muted)', backgroundColor: 'transparent' }}>
        <p>No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <section id="menu" className="relative py-16 px-4 md:px-8 overflow-hidden" style={{ backgroundColor: 'transparent', minHeight: '80vh' }}>
      {/* Subtle food doodle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm13.167 60l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm18.56-46.833l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '150px'
        }}
      />

      {/* Mesa, Mozo y Pedido de Cuenta */}
      {businessId && (
        <div className="max-w-6xl mx-auto mb-8 flex justify-center sm:justify-end relative z-20">
          <TableInfoAndWaiterBar businessId={businessId} orderMode={orderMode} primaryColor={primaryColor} />
        </div>
      )}

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 relative z-10">
        {categories.map((category, index) => {
          const isSingle = vintageColorMode === 'single';
          const color = isSingle ? vintageColor : NEON_COLORS[index % NEON_COLORS.length];

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Header */}
              <div 
                className="flex items-center gap-4 py-3 px-6 rounded-xl border-2"
                style={{ 
                  borderColor: color, 
                  boxShadow: `0 0 15px ${color}30, inset 0 0 10px ${color}10`,
                  backgroundColor: 'var(--bg-card)'
                }}
              >
                <div 
                  className="w-6 h-6 rounded-full shrink-0"
                  style={{ backgroundColor: color, boxShadow: `0 0 10px ${color}80` }}
                />
                <h2 
                  className="text-xl md:text-2xl font-black uppercase tracking-wider m-0"
                  style={{ color: color, textShadow: `0 0 10px ${color}80` }}
                >
                  {category.name}
                </h2>
              </div>

              {/* Product List */}
              <div className="space-y-6 px-1 sm:px-2">
                {(() => {
                  // Group products by subcategory
                  const groups: { subcategory: string | null; items: Product[] }[] = [];
                  const map = new Map<string | null, Product[]>();
                  category.products.forEach(p => {
                    const sub = p.subcategory?.trim() || null;
                    if (!map.has(sub)) {
                      const arr: Product[] = [];
                      map.set(sub, arr);
                      groups.push({ subcategory: sub, items: arr });
                    }
                    map.get(sub)!.push(p);
                  });

                  return groups.map((group, gIdx) => (
                    <div key={group.subcategory || `g-${gIdx}`} className="space-y-4">
                      {group.subcategory && (
                        <div className="pt-2 pb-1 flex items-center gap-3">
                          <span
                            className="text-xs md:text-sm font-black uppercase tracking-widest px-2.5 py-0.5 rounded"
                            style={{
                              color: color,
                              backgroundColor: `${color}15`,
                              border: `1px solid ${color}40`,
                              letterSpacing: '0.1em',
                            }}
                          >
                            {group.subcategory}
                          </span>
                          <div className="flex-1 h-px opacity-30" style={{ backgroundColor: color }} />
                        </div>
                      )}

                      <div className="space-y-5">
                        {group.items.map(product => {
                          const formattedPrice = new Intl.NumberFormat('es-AR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          }).format(product.price);

                          return (
                            <div key={product.id} className="flex flex-col group w-full min-w-0">
                              <div className="flex items-end justify-between gap-2 w-full min-w-0">
                                <span 
                                  className="font-bold text-sm md:text-base uppercase tracking-wide transition-colors min-w-0 break-words leading-snug" 
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {product.name}
                                </span>
                                
                                <div 
                                  className="flex-grow border-b-2 border-dotted mb-[5px] opacity-40 shrink min-w-[14px]" 
                                  style={{ borderColor: 'var(--border-color)' }} 
                                />
                                
                                <span 
                                  className="font-bold text-sm md:text-base whitespace-nowrap shrink-0 pl-1 text-right tabular-nums" 
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {currencySymbol}{formattedPrice}
                                </span>
                              </div>
                              
                              {product.description && (
                                <p className="text-[11px] md:text-xs mt-1 max-w-[90%] leading-snug break-words" style={{ color: 'var(--text-muted)' }}>
                                  {product.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
