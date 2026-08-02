'use client';

import React from 'react';
import { Product } from '@/types';
import { ProductCard } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  currencySymbol?: string;
  layoutStyle?: string;
  orderMode?: string;
  onResetSearch?: () => void;
}

export function ProductGrid({ products, currencySymbol = '$', layoutStyle = 'grid', orderMode = 'menu_only', onResetSearch }: ProductGridProps) {
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
        <ProductCard 
          key={product.id} 
          product={product} 
          currencySymbol={currencySymbol} 
          layoutStyle={layoutStyle} 
          orderMode={orderMode}
        />
      ))}
    </div>
  );
}
