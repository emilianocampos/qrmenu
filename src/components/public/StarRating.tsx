'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  onChange?: (rating: number) => void;
  interactive?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const starSizes = { sm: 16, md: 20, lg: 28 };

export function StarRating({ rating, maxStars = 5, onChange, interactive = false, size = 'md' }: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null);
  const px = starSizes[size];
  const displayed = hover !== null ? hover : rating;

  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {Array.from({ length: maxStars }).map((_, i) => {
        const val = i + 1;
        const filled = val <= displayed;
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(val)}
            onMouseEnter={() => interactive && setHover(val)}
            onMouseLeave={() => interactive && setHover(null)}
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.1s',
              transform: interactive && hover === val ? 'scale(1.15)' : 'scale(1)',
            }}
          >
            <Star
              width={px}
              height={px}
              style={{
                fill: filled ? '#eab308' : 'transparent',
                color: filled ? '#eab308' : '#2a3a4a',
                transition: 'fill 0.15s, color 0.15s',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
