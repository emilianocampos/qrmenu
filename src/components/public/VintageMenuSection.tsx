'use client';

import React, { useMemo } from 'react';
import { Product } from '@/types';

interface VintageMenuSectionProps {
  products: Product[];
  currencySymbol?: string;
}

const NEON_COLORS = [
  '#ff4500', // Orange red
  '#ffd700', // Gold/Yellow
  '#ff00ff', // Magenta/Pink
  '#00ffff', // Cyan
  '#00ff00', // Lime
];



export function VintageMenuSection({ products, currencySymbol = '$' }: VintageMenuSectionProps) {
  // Group products by category
  const categories = useMemo(() => {
    const map = new Map<string, { id: string, name: string, products: Product[] }>();
    products.forEach(p => {
      if (p.category) {
        if (!map.has(p.category.id)) {
          map.set(p.category.id, { id: p.category.id, name: p.category.name, products: [] });
        }
        map.get(p.category.id)!.products.push(p);
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // If no products, fallback to empty state
  if (products.length === 0) {
    return (
      <div className="py-20 text-center text-gray-400" style={{ backgroundColor: '#111' }}>
        <p>No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <section id="menu" className="relative py-16 px-4 md:px-8 overflow-hidden" style={{ backgroundColor: '#111', minHeight: '80vh' }}>
      {/* Subtle food doodle background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M54.627 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm-5.394 0l.83.83-1.66 1.66-.83-.83.83-.83zm13.167 60l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm-5.394 0l-.83-.83 1.66-1.66.83.83-.83.83zm18.56-46.833l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83zm-5.394 0l.83-.83 1.66 1.66-.83.83-.83-.83z' fill='%23ffffff' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          backgroundSize: '150px'
        }}
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-16 relative z-10">
        {categories.map((category, index) => {
          const color = NEON_COLORS[index % NEON_COLORS.length];

          return (
            <div key={category.id} className="space-y-6">
              {/* Category Header */}
              <div 
                className="flex items-center gap-4 py-3 px-6 rounded-xl border-2"
                style={{ 
                  borderColor: color, 
                  boxShadow: `0 0 15px ${color}30, inset 0 0 10px ${color}10`,
                  backgroundColor: 'rgba(0,0,0,0.4)'
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
              <div className="space-y-5 px-2">
                {category.products.map(product => {
                  const formattedPrice = new Intl.NumberFormat('es-AR', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  }).format(product.price);

                  return (
                    <div key={product.id} className="flex flex-col group">
                      <div className="flex items-end justify-between gap-3 w-full">
                        <span className="text-white font-bold text-sm md:text-base uppercase tracking-wide group-hover:text-gray-300 transition-colors shrink-0">
                          {product.name}
                        </span>
                        
                        <div className="flex-grow border-b-2 border-dotted border-gray-600 mb-[6px] opacity-40 shrink" />
                        
                        <span className="text-white font-bold text-sm md:text-base whitespace-nowrap shrink-0 pl-1">
                          {currencySymbol}{formattedPrice}
                        </span>
                      </div>
                      
                      {product.description && (
                        <p className="text-gray-400 text-[11px] md:text-xs mt-1 max-w-[85%] leading-snug">
                          {product.description}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
