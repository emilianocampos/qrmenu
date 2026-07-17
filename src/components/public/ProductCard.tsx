'use client';

import React from 'react';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  currencySymbol?: string;
}

export function ProductCard({ product, currencySymbol = '$' }: ProductCardProps) {
  const formattedPrice = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(product.price);

  return (
    <div
      className="break-inside-avoid"
      style={{
        marginBottom: 16,
        borderRadius: 14,
        overflow: 'hidden',
        backgroundColor: '#151c2c', // matching image card color roughly
        border: '1px solid #1e2d45',
        transition: 'transform 0.2s, box-shadow 0.2s, background-color 0.2s',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      {/* Product Image */}
      {product.image_url && (
        <div style={{ position: 'relative', overflow: 'hidden', aspectRatio: '4/3' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image_url}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {product.category?.name && (
            <span style={{
              position: 'absolute',
              top: 12,
              right: 12,
              fontSize: '11px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: 6,
              backgroundColor: '#10b981', // green for now, could be dynamic
              color: '#fff',
            }}>
              {product.category.name}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Name & Price */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
          <h3 style={{
            color: '#f1f5f9',
            fontWeight: 700,
            fontSize: '1.05rem',
            margin: 0,
            lineHeight: 1.3,
          }}>
            {product.name}
          </h3>
          <span style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: 'var(--primary-color)',
            whiteSpace: 'nowrap',
          }}>
            {currencySymbol}{formattedPrice}
          </span>
        </div>

        {/* Description */}
        {product.description && (
          <p style={{
            color: '#94a3b8',
            fontSize: '0.85rem',
            lineHeight: 1.5,
            margin: '0 0 16px',
            flex: 1,
          }}>
            {product.description}
          </p>
        )}

        {/* Add to cart button */}
        <button
          style={{
            backgroundColor: 'var(--primary-color)',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '8px 16px',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
            alignSelf: 'flex-start',
            marginTop: 'auto',
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
