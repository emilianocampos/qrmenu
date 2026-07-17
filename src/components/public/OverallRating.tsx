'use client';

import React from 'react';
import { Review } from '@/types';
import { StarRating } from './StarRating';

interface OverallRatingProps {
  reviews: Review[];
}

export function OverallRating({ reviews }: OverallRatingProps) {
  const count = reviews.length;
  const average = count > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
    : 0;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) distribution[r.rating]++;
  });

  const getPercentage = (n: number) => count === 0 ? 0 : Math.round((n / count) * 100);

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: 14,
      backgroundColor: '#111827',
      border: '1px solid #1e2d45',
      position: 'sticky',
      top: 90,
    }}>
      <p style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Overall Rating
      </p>

      {/* Big average number */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: '#f1f5f9', lineHeight: 1, marginBottom: 8 }}>
          {average > 0 ? average : '—'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <StarRating rating={Math.round(average)} size="md" />
        </div>
        <p style={{ color: '#4b6075', fontSize: '0.8rem', margin: 0 }}>
          Basado en {count} {count === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>

      {/* Distribution bars */}
      <div style={{ borderTop: '1px solid #1e2d45', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[5, 4, 3, 2, 1].map(star => {
          const pct = getPercentage(distribution[star]);
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
              <span style={{ color: '#64748b', width: 20, textAlign: 'right', flexShrink: 0 }}>{star}★</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: '#0a0e1a', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${pct}%`,
                  backgroundColor: 'var(--primary-color, #f97316)',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ color: '#4b6075', width: 32, textAlign: 'right', flexShrink: 0 }}>{distribution[star]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
