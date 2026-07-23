'use client';

import React, { useState, useMemo } from 'react';
import { Product } from '@/types';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { VintageMenuSection } from './VintageMenuSection';

interface MenuSectionProps {
  products: Product[];
  currencySymbol?: string;
  layoutStyle?: string;
  vintageColorMode?: string;
  vintageColor?: string;
}

export function MenuSection({ products, currencySymbol = '$', layoutStyle = 'grid', vintageColorMode = 'multicolor', vintageColor = '#ff4500' }: MenuSectionProps) {
  if (layoutStyle === 'vintage') {
    return <VintageMenuSection products={products} currencySymbol={currencySymbol} vintageColorMode={vintageColorMode} vintageColor={vintageColor} />;
  }

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
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: '0 0 16px' }}>
            Nuestro Menú
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
              border: selectedCategoryId === null ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              fontWeight: 600,
              fontSize: '0.9rem',
              backgroundColor: selectedCategoryId === null ? 'var(--primary-color)' : 'var(--bg-card)',
              color: selectedCategoryId === null ? '#fff' : 'var(--text-muted)',
              transition: 'background-color 0.2s',
            }}
          >
            Todo
            <span style={{ 
              backgroundColor: selectedCategoryId === null ? 'rgba(255,255,255,0.2)' : 'var(--border-color)', 
              color: selectedCategoryId === null ? '#fff' : 'var(--text-primary)',
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
                border: selectedCategoryId === cat.id ? '1px solid var(--primary-color)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                fontSize: '0.9rem',
                backgroundColor: selectedCategoryId === cat.id ? 'var(--primary-color)' : 'var(--bg-card)',
                color: selectedCategoryId === cat.id ? '#fff' : 'var(--text-muted)',
                transition: 'background-color 0.2s',
              }}
            >
              {cat.name}
              <span style={{ 
                backgroundColor: selectedCategoryId === cat.id ? 'rgba(255,255,255,0.2)' : 'var(--border-color)', 
                color: selectedCategoryId === cat.id ? '#fff' : 'var(--text-primary)',
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
          <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem', marginBottom: 20 }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>{filteredProducts.length}</span> resultado{filteredProducts.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
          </p>
        )}

        <ProductGrid
          products={filteredProducts}
          currencySymbol={currencySymbol}
          layoutStyle={layoutStyle}
          onResetSearch={() => {
            setSearchQuery('');
            setSelectedCategoryId(null);
          }}
        />
      </div>
    </section>
  );
}
