'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';

interface MenuSectionProps {
  products: Product[];
  currencySymbol?: string;
}

export function MenuSection({ products, currencySymbol = '$' }: MenuSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string, name: string, count: number }>();
    products.forEach(p => {
      if (p.category) {
        if (!map.has(p.category.id)) {
          map.set(p.category.id, { id: p.category.id, name: p.category.name, count: 0 });
        }
        map.get(p.category.id)!.count++;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredProducts = products.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      matchSearch = 
        product.name.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false) ||
        (product.category?.name?.toLowerCase().includes(query) ?? false);
    }
    const matchCategory = selectedCategoryId ? product.category?.id === selectedCategoryId : true;
    return matchSearch && matchCategory;
  });

  return (
    <section
      id="menu"
      style={{
        scrollMarginTop: 80,
        padding: '2.5rem 0',
        borderBottom: '1px solid #1e2d45',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header row */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: '#fff', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 16px' }}>
            Our Menu
          </h2>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Categories */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginBottom: '24px', 
          overflowX: 'auto', 
          paddingBottom: '8px',
          scrollbarWidth: 'none',
        }}>
          <button
            onClick={() => setSelectedCategoryId(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: selectedCategoryId === null ? 'var(--primary-color)' : '#1e283b',
              color: selectedCategoryId === null ? '#fff' : '#cbd5e1',
              transition: 'background-color 0.2s',
            }}
          >
            All
            <span style={{ 
              backgroundColor: selectedCategoryId === null ? 'rgba(255,255,255,0.2)' : '#334155', 
              padding: '2px 8px', 
              borderRadius: '12px', 
              fontSize: '0.75rem' 
            }}>
              {products.length}
            </span>
          </button>
          
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 16px',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                fontSize: '0.9rem',
                backgroundColor: selectedCategoryId === cat.id ? 'var(--primary-color)' : '#1e283b',
                color: selectedCategoryId === cat.id ? '#fff' : '#cbd5e1',
                transition: 'background-color 0.2s',
              }}
            >
              {cat.name}
              <span style={{ 
                backgroundColor: selectedCategoryId === cat.id ? 'rgba(255,255,255,0.2)' : '#334155', 
                padding: '2px 8px', 
                borderRadius: '12px', 
                fontSize: '0.75rem' 
              }}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>

        {/* Results info */}
        {searchQuery.trim() && (
          <p style={{ color: '#64748b', fontSize: '0.82rem', marginBottom: 20 }}>
            <span style={{ color: '#94a3b8', fontWeight: 600 }}>{filteredProducts.length}</span> resultado{filteredProducts.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        {/* Grid */}
        <ProductGrid
          products={filteredProducts}
          currencySymbol={currencySymbol}
          onResetSearch={() => {
            setSearchQuery('');
            setSelectedCategoryId(null);
          }}
        />
      </div>
    </section>
  );
}
