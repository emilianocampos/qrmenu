'use client';

import React from 'react';
import { Review } from '@/types';
import { StarRating } from './StarRating';

interface OverallRatingProps {
  reviews: Review[];
  googleReviewsEnabled?: boolean;
  googleReviewsUrl?: string | null;
  businessName?: string;
}

export function OverallRating({ reviews, googleReviewsEnabled, googleReviewsUrl, businessName }: OverallRatingProps) {
  const count = reviews.length;
  const average = count > 0
    ? parseFloat((reviews.reduce((acc, r) => acc + r.rating, 0) / count).toFixed(1))
    : 0;

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    if (distribution[r.rating] !== undefined) distribution[r.rating]++;
  });

  const getPercentage = (n: number) => count === 0 ? 0 : Math.round((n / count) * 100);

  const hasUrl = Boolean(googleReviewsUrl && googleReviewsUrl.trim() !== '');
  const isEnabled = googleReviewsEnabled === true || String(googleReviewsEnabled) === 'true';
  const showGoogleButton = isEnabled || hasUrl;

  const rawUrl = hasUrl
    ? googleReviewsUrl!.trim()
    : (businessName ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(businessName)}` : 'https://www.google.com/maps');

  const finalGoogleUrl = rawUrl.startsWith('http://') || rawUrl.startsWith('https://')
    ? rawUrl
    : `https://${rawUrl}`;

  return (
    <div style={{
      padding: '1.5rem',
      borderRadius: 14,
      backgroundColor: 'var(--bg-card)',
      border: 'none',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
      position: 'sticky',
      top: 90,
    }}>
      <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 700, margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Overall Rating
      </p>

      {/* Big average number */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: '3.5rem', fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1, marginBottom: 8 }}>
          {average > 0 ? average : '—'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <StarRating rating={Math.round(average)} size="md" />
        </div>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.8rem', margin: 0 }}>
          Basado en {count} {count === 1 ? 'reseña' : 'reseñas'}
        </p>
      </div>

      {/* Distribution bars */}
      <div style={{
        height: '1px',
        background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)',
        margin: '20px 0 16px',
      }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[5, 4, 3, 2, 1].map(star => {
          const pct = getPercentage(distribution[star]);
          return (
            <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
              <span style={{ color: 'var(--text-primary)', width: 20, textAlign: 'right', flexShrink: 0 }}>{star}★</span>
              <div style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: 'var(--bg-page)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%',
                  borderRadius: 3,
                  width: `${pct}%`,
                  backgroundColor: '#eab308',
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <span style={{ color: 'var(--text-primary)', width: 32, textAlign: 'right', flexShrink: 0 }}>{distribution[star]}</span>
            </div>
          );
        })}
      </div>

      {/* Botón de Google Reviews */}
      {showGoogleButton && (
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
          <a
            href={finalGoogleUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              width: '100%',
              padding: '12px 14px',
              borderRadius: 10,
              backgroundColor: 'var(--bg-page)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '0.85rem',
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card-hover)';
              (e.currentTarget as HTMLElement).style.borderColor = '#4285F4';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-page)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
              <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"/>
              <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
              <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </svg>
            <span>Dejar reseña en Google</span>
          </a>
        </div>
      )}
    </div>
  );
}
