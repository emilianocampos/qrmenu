'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  layoutStyle?: string;
  onResetSearch?: () => void;
}

export function ProductGrid({ products, currencySymbol = '$', layoutStyle = 'grid', onResetSearch }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 2rem',
        textAlign: 'center',
        borderRadius: 14,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        margin: '2rem 0',
      }}>
        <span style={{ fontSize: 40, marginBottom: 16 }}>🔍</span>
        <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>
          Sin resultados
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0 0 20px', maxWidth: 320 }}>
          No encontramos platos que coincidan con tu búsqueda.
        </p>
        {onResetSearch && (
          <button
            onClick={onResetSearch}
            style={{
              padding: '10px 24px',
              borderRadius: 8,
              backgroundColor: 'var(--primary-color, #f97316)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Ver todo el menú
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gap: '1.5rem',
      }}
      className="product-grid"
    >
      <style>{`
        .product-grid { grid-template-columns: repeat(1, minmax(0, 1fr)); }
        ${layoutStyle !== 'list' ? `
        @media (min-width: 640px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        @media (min-width: 1024px) { .product-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
        ` : `
        @media (min-width: 768px) { .product-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
        `}
      `}</style>
      {products.map(product => (
        <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} layoutStyle={layoutStyle} />
      ))}
    </div>
  );
}
