'use client';

import React from 'react';
import { Product } from '@/types';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
  layoutStyle?: string;
}

export function ProductCard({ product, currencySymbol = '$', layoutStyle = 'grid' }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <div
      className="break-inside-avoid"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: layoutStyle === 'list' ? 'row' : 'column',
        height: '100%',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Product Image */}
      {layoutStyle !== 'list' && (
        product.image_url ? (
          <div style={{ position: 'relative', overflow: 'hidden', height: 180, width: '100%', flexShrink: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.image_url}
              alt={product.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        ) : (
          <div style={{ position: 'relative', overflow: 'hidden', height: 180, width: '100%', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
        )
      )}

      {/* Content */}
      <div style={{ padding: layoutStyle === 'list' ? '16px 20px' : '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
        {/* Name & Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
          <h3 style={{
            color: 'var(--primary-color)',
            fontWeight: 600,
            fontSize: '1.1rem',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {product.name}
          </h3>
          <span style={{
            fontSize: '0.95rem',
            fontWeight: 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
          }}>
            {currencySymbol}{formattedPrice}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.9rem',
            lineHeight: 1.5,
            margin: '0 0 24px',
            flex: 1,
          }}>
            {product.description}
          </p>
        )}

        {/* Footer: Category */}
        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginTop: product.description ? 'auto' : '24px' }}>
          {/* Category Pill */}
          {product.category?.name && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '6px 14px',
              borderRadius: 9999,
              backgroundColor: 'rgba(255,255,255,0.05)',
              color: 'var(--text-faint)',
            }}>
              {product.category.name}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
