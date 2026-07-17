'use client';

import React from 'react';
import { Review } from '@/types';
import { StarRating } from './StarRating';

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const initials = `${review.first_name.charAt(0)}${review.last_name.charAt(0)}`.toUpperCase();

  const now = new Date();
  const created = new Date(review.created_at);
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  let timeAgo: string;
  if (diffDays === 0) timeAgo = 'hoy';
  else if (diffDays === 1) timeAgo = 'hace 1 día';
  else if (diffDays < 7) timeAgo = `hace ${diffDays} días`;
  else if (diffDays < 14) timeAgo = 'hace 1 semana';
  else if (diffDays < 30) timeAgo = `hace ${Math.floor(diffDays / 7)} semanas`;
  else if (diffDays < 60) timeAgo = 'hace 1 mes';
  else timeAgo = `hace ${Math.floor(diffDays / 30)} meses`;

  return (
    <div
      style={{
        padding: '1.5rem',
        borderRadius: 14,
        backgroundColor: '#111827',
        border: '1px solid #1e2d45',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#2a3f5f'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#1e2d45'; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
        {/* Avatar + Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42,
            height: 42,
            borderRadius: '50%',
            backgroundColor: 'var(--primary-color, #f97316)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '0.875rem',
            color: '#fff',
            flexShrink: 0,
          }}>
            {initials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ color: '#f1f5f9', fontWeight: 700, fontSize: '0.9rem' }}>
                {review.first_name} {review.last_name}
              </span>
            </div>
            <p style={{ color: '#4b6075', fontSize: '0.78rem', margin: '2px 0 0' }}>
              📅 {timeAgo}
            </p>
          </div>
        </div>

        {/* Stars */}
        <StarRating rating={review.rating} size="sm" />
      </div>

      {/* Comment */}
      <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
        {review.comment}
      </p>
    </div>
  );
}
