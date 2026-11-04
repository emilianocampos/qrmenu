'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  layoutStyle?: string;
  orderMode?: string;
  tableOrdersEnabled?: boolean;
  onResetSearch?: () => void;
}

export function ProductGrid({
  products,
  currencySymbol = '$',
  layoutStyle = 'grid',
  orderMode = 'menu_only',
  tableOrdersEnabled = false,
  onResetSearch
}: ProductGridProps) {
  // Check if any product has a subcategory
  const hasSubcategories = React.useMemo(() => {
    return products.some(p => !!p.subcategory?.trim());
  }, [products]);

  const groups = React.useMemo(() => {
    if (!hasSubcategories) return [{ subcategory: null, items: products }];
    const list: { subcategory: string | null; items: Product[] }[] = [];
    const map = new Map<string | null, Product[]>();

    products.forEach(p => {
      const sub = p.subcategory?.trim() || null;
      if (!map.has(sub)) {
        const arr: Product[] = [];
        map.set(sub, arr);
        list.push({ subcategory: sub, items: arr });
      }
      map.get(sub)!.push(p);
    });

    return list;
  }, [products, hasSubcategories]);

  if (products.length === 0) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 16,
        padding: '3rem 2rem',
        textAlign: 'center',
        border: '1px solid var(--border-color)',
        marginTop: 32
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>🍽️</div>
        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 600, marginBottom: 8 }}>
          No encontramos lo que buscas
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
          Intenta con otras palabras o selecciona una categoría diferente.
        </p>
        <button
          onClick={onResetSearch}
          style={{
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: 9999,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'opacity 0.2s'
          }}
        >
          Ver todo el menú
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group, gIdx) => (
        <div key={group.subcategory || `g-${gIdx}`} className="space-y-4">
          {group.subcategory && (
            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-lg border border-indigo-500/20">
                {group.subcategory}
              </span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gap: '1.5rem',
            }}
            className="product-grid"
          >
            {group.items.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                currencySymbol={currencySymbol}
                layoutStyle={layoutStyle}
                orderMode={orderMode}
                tableOrdersEnabled={tableOrdersEnabled}
                isFirst={gIdx === 0 && index === 0}
              />
            ))}
          </div>
        </div>
      ))}

      <style>{`
        .product-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        ${layoutStyle !== 'list' ? `
        @media (min-width: 640px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        ` : `
        @media (min-width: 768px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        `}
      `}</style>
    </div>
  );
}
