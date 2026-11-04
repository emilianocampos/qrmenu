'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Product } from '@/types';
import { SearchBar } from './SearchBar';
import { ProductGrid } from './ProductGrid';
import { VintageMenuSection } from './VintageMenuSection';
import { TableInfoAndWaiterBar } from './TableInfoAndWaiterBar';

interface MenuSectionProps {
  businessId?: string;
  products: Product[];
  currencySymbol?: string;
  layoutStyle?: string;
  vintageColorMode?: string;
  vintageColor?: string;
  orderMode?: string;
  tableOrdersEnabled?: boolean;
  primaryColor?: string;
}

export function MenuSection({
  businessId,
  products,
  currencySymbol = '$',
  layoutStyle = 'grid',
  vintageColorMode = 'multicolor',
  vintageColor = '#ff4500',
  orderMode = 'menu_only',
  tableOrdersEnabled = false,
  primaryColor,
}: MenuSectionProps) {
  if (layoutStyle === 'vintage') {
    return (
      <VintageMenuSection
        products={products}
        currencySymbol={currencySymbol}
        vintageColorMode={vintageColorMode}
        vintageColor={vintageColor}
        orderMode={orderMode}
        businessId={businessId}
        primaryColor={primaryColor}
      />
    );
  }

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  // Safeguard: only show products with price > 0 on public menu
  const validProducts = useMemo(() => {
    return products.filter(p => Number(p.price) > 0);
  }, [products]);

  const categories = useMemo(() => {
    const map = new Map<string, { id: string, name: string, icon?: string | null, count: number }>();
    validProducts.forEach(p => {
      if (p.category) {
        if (!map.has(p.category.id)) {
          map.set(p.category.id, { id: p.category.id, name: p.category.name, icon: (p.category as any).icon, count: 0 });
        }
        map.get(p.category.id)!.count++;
      }
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [validProducts]);

  const filteredProducts = validProducts.filter(product => {
    const query = searchQuery.toLowerCase().trim();
    let matchSearch = true;
    if (query) {
      matchSearch =
        product.name.toLowerCase().includes(query) ||
        (product.description?.toLowerCase().includes(query) ?? false) ||
        (product.category?.name?.toLowerCase().includes(query) ?? false) ||
        (product.subcategory?.toLowerCase().includes(query) ?? false);
    }
    const matchCategory = selectedCategoryId ? product.category?.id === selectedCategoryId : true;
    return matchSearch && matchCategory;
  });

  const categoriesRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = categoriesRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  }, []);

  useEffect(() => {
    const el = categoriesRef.current;
    if (!el) return;

    checkScroll();
    const timer = setTimeout(checkScroll, 150);

    el.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll);

    return () => {
      clearTimeout(timer);
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll, categories]);

  const scrollCategories = (direction: 'left' | 'right') => {
    const el = categoriesRef.current;
    if (!el) return;
    const scrollAmount = Math.max(el.clientWidth * 0.9, 200);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const handleCategorySelect = (id: string | null, e: React.MouseEvent<HTMLButtonElement>) => {
    setSelectedCategoryId(id);
    e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <section
      id="menu"
      style={{
        scrollMarginTop: 80,
        padding: '2.5rem 0',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header row */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.75rem', margin: 0 }}>
              Nuestro Menú
            </h2>
            {businessId && (
              <TableInfoAndWaiterBar
                businessId={businessId}
                orderMode={orderMode}
                primaryColor={primaryColor}
              />
            )}
          </div>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Categories Carousel */}
        <div style={{ marginBottom: '24px' }}>
          <style>{`
            .category-slide-item {
              flex: 0 0 calc(50% - 6px);
              min-width: calc(50% - 6px);
              max-width: calc(50% - 6px);
              scroll-snap-align: start;
              min-height: 50px;
              padding: 6px 8px;
            }
            @media (min-width: 640px) {
              .category-slide-item {
                flex: 0 0 auto;
                min-width: auto;
                max-width: none;
                scroll-snap-align: none;
                min-height: 42px;
                padding: 8px 14px;
              }
            }
          `}</style>

          {/* Scrollable Categories List (2 per view on mobile) */}
          <div
            ref={categoriesRef}
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '6px',
              scrollbarWidth: 'none',
              scrollBehavior: 'smooth',
              WebkitOverflowScrolling: 'touch',
              scrollSnapType: 'x mandatory',
            }}
          >
            <button
              type="button"
              onClick={(e) => handleCategorySelect(null, e)}
              className="category-slide-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                borderRadius: '10px',
                border: 'none',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer',
                fontWeight: 600,
                backgroundColor: selectedCategoryId === null ? 'var(--primary-color)' : 'var(--bg-card)',
                color: selectedCategoryId === null ? '#fff' : 'var(--text-primary)',
                transition: 'background-color 0.2s, transform 0.1s ease',
              }}
            >
              <span style={{
                fontSize: 'clamp(0.76rem, 2.7vw, 0.88rem)',
                fontWeight: 600,
                lineHeight: 1.15,
                textAlign: 'center',
                whiteSpace: 'normal',
                wordBreak: 'break-word',
              }}>
                Todo
              </span>
              <span style={{
                backgroundColor: selectedCategoryId === null ? 'rgba(255,255,255,0.2)' : 'rgba(128, 128, 128, 0.15)',
                color: selectedCategoryId === null ? '#fff' : 'var(--text-primary)',
                padding: '2px 6px',
                borderRadius: '10px',
                fontSize: '0.7rem',
                fontWeight: 700,
                flexShrink: 0,
              }}>
                {products.length}
              </span>
            </button>

            {categories.map(cat => (
              <button
                type="button"
                key={cat.id}
                onClick={(e) => handleCategorySelect(cat.id, e)}
                className="category-slide-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  borderRadius: '10px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
                  cursor: 'pointer',
                  fontWeight: 600,
                  backgroundColor: selectedCategoryId === cat.id ? 'var(--primary-color)' : 'var(--bg-card)',
                  color: selectedCategoryId === cat.id ? '#fff' : 'var(--text-primary)',
                  transition: 'background-color 0.2s, transform 0.1s ease',
                }}
              >
                <span style={{
                  fontSize: 'clamp(0.74rem, 2.7vw, 0.88rem)',
                  fontWeight: 600,
                  lineHeight: 1.15,
                  textAlign: 'center',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {cat.icon ? `${cat.icon} ` : ''}{cat.name}
                </span>
                <span style={{
                  backgroundColor: selectedCategoryId === cat.id ? 'rgba(255,255,255,0.2)' : 'rgba(128, 128, 128, 0.15)',
                  color: selectedCategoryId === cat.id ? '#fff' : 'var(--text-primary)',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Navigation Arrows placed BELOW (never covering the categories) */}
          {(canScrollLeft || canScrollRight) && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px',
                marginTop: '10px',
              }}
            >
              <button
                type="button"
                onClick={() => scrollCategories('left')}
                disabled={!canScrollLeft}
                aria-label="Ver categorías anteriores"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-card)',
                  color: canScrollLeft ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  boxShadow: canScrollLeft ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                  cursor: canScrollLeft ? 'pointer' : 'default',
                  opacity: canScrollLeft ? 1 : 0.25,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronLeft style={{ width: 18, height: 18 }} />
              </button>

              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.02em',
                  userSelect: 'none',
                }}
              >
                Deslizá para ver más
              </span>

              <button
                type="button"
                onClick={() => scrollCategories('right')}
                disabled={!canScrollRight}
                aria-label="Ver más categorías"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--bg-card)',
                  color: canScrollRight ? 'var(--text-primary)' : 'var(--text-muted)',
                  border: '1px solid var(--border-color)',
                  boxShadow: canScrollRight ? '0 2px 8px rgba(0, 0, 0, 0.25)' : 'none',
                  cursor: canScrollRight ? 'pointer' : 'default',
                  opacity: canScrollRight ? 1 : 0.25,
                  transition: 'all 0.2s ease',
                }}
              >
                <ChevronRight style={{ width: 18, height: 18 }} />
              </button>
            </div>
          )}
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
          orderMode={orderMode}
          tableOrdersEnabled={tableOrdersEnabled}
          onResetSearch={() => {
            setSearchQuery('');
            setSelectedCategoryId(null);
          }}
        />
      </div>
    </section>
  );
}
