'use client';

import React, { useState } from 'react';
import { Review } from '@/types';
import { MessageSquarePlus } from 'lucide-react';
import { OverallRating } from './OverallRating';
import { ReviewCard } from './ReviewCard';
import { ReviewDialog } from './ReviewDialog';
import { getReviews } from '@/actions/reviews';

interface ReviewSectionProps {
  businessId: string;
  initialReviews: Review[];
  businessName: string;
}

export function ReviewSection({ businessId, initialReviews, businessName }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleReviewSuccess = async () => {
    const result = await getReviews(businessId);
    if (result.data) setReviews(result.data);
  };

  return (
    <section
      id="reviews"
      style={{ scrollMarginTop: 80, padding: '3.5rem 0' }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', margin: '0 0 12px' }}>
            Opiniones de Clientes
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: 560, margin: '0 auto 24px', lineHeight: 1.6 }}>
            Conocé la experiencia de nuestros clientes en {businessName}.
          </p>
          <button
            onClick={() => setDialogOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '12px 28px',
              borderRadius: 10,
              backgroundColor: 'var(--primary-color, #f97316)',
              border: 'none',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              transition: 'filter 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.filter = 'brightness(1.1)';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1.03)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = 'none';
              (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
            }}
          >
            <MessageSquarePlus className="w-5 h-5" />
            Escribir una reseña
          </button>
        </div>

        {/* Grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }} className="reviews-grid">
          <style>{`
            @media (min-width: 1024px) { .reviews-grid { grid-template-columns: 300px 1fr !important; } }
          `}</style>

          {/* Left: Overall Rating */}
          <OverallRating reviews={reviews} />

          {/* Right: List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {reviews.length === 0 ? (
              <div style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderRadius: 14,
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
              }}>
                <span style={{ fontSize: 36, display: 'block', marginBottom: 12 }}>💬</span>
                <h3 style={{ color: 'var(--text-primary)', fontWeight: 700, fontSize: '1rem', margin: '0 0 8px' }}>
                  Aún no hay reseñas
                </h3>
                <p style={{ color: 'var(--text-faint)', fontSize: '0.875rem', margin: '0 0 20px' }}>
                  ¡Sé el primero en opinar sobre {businessName}!
                </p>
                <button
                  onClick={() => setDialogOpen(true)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: 8,
                    backgroundColor: 'var(--primary-color, #f97316)',
                    border: 'none',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Escribir la primera reseña
                </button>
              </div>
            ) : (
              reviews.map(review => <ReviewCard key={review.id} review={review} />)
            )}
          </div>
        </div>
      </div>

      <ReviewDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        businessId={businessId}
        onSubmitSuccess={handleReviewSuccess}
      />
    </section>
  );
}
