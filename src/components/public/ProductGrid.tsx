'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  onResetSearch?: () => void;
}

export function ProductGrid({ products, currencySymbol = '$', onResetSearch }: ProductGridProps) {
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
        backgroundColor: '#111827',
        border: '1px solid #1e2d45',
        margin: '2rem 0',
      }}>
        <span style={{ fontSize: 40, marginBottom: 16 }}>🔍</span>
        <h3 style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '1.1rem', margin: '0 0 8px' }}>
          Sin resultados
        </h3>
        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: '0 0 20px', maxWidth: 320 }}>
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
        columnCount: 1,
        columnGap: 16,
      }}
      className="product-grid"
    >
      <style>{`
        @media (min-width: 640px) { .product-grid { column-count: 2; } }
        @media (min-width: 1024px) { .product-grid { column-count: 3; } }
        @media (min-width: 1280px) { .product-grid { column-count: 4; } }
      `}</style>
      {products.map(product => (
        <ProductCard key={product.id} product={product} currencySymbol={currencySymbol} />
      ))}
    </div>
  );
}
