'use client';

import React from 'react';

interface AboutSectionProps {
  title?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  businessName: string;
}

export function AboutSection({ title, description, imageUrl, businessName }: AboutSectionProps) {
  const displayTitle = title || 'Sobre Nosotros';
  const displayDescription = description || `Bienvenido a ${businessName}. Nos dedicamos a ofrecer la mejor calidad en cada uno de nuestros platos.`;

  return (
    <section
      id="about"
      style={{
        scrollMarginTop: 80,
        padding: '3.5rem 0',
        borderBottom: '1px solid #1e2d45',
        backgroundColor: 'rgba(17, 24, 39, 0.3)',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '3rem',
          alignItems: 'center',
        }}
          className="about-grid"
        >
          <style>{`
            @media (min-width: 1024px) { .about-grid { grid-template-columns: 1fr 420px !important; } }
          `}</style>

          {/* Text */}
          <div>
            <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '2rem', margin: '0 0 8px', lineHeight: 1.2 }}>
              {displayTitle}
            </h2>
            <div style={{ width: 48, height: 4, borderRadius: 2, backgroundColor: 'var(--primary-color, #f97316)', marginBottom: 24 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.8, margin: 0, whiteSpace: 'pre-wrap' }}>
              {displayDescription}
            </p>
          </div>

          {/* Image */}
          <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #1e2d45', backgroundColor: '#111827' }}>
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={displayTitle}
                style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                aspectRatio: '4/3',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '2rem',
              }}>
                <span style={{ fontSize: 40 }}>🏡</span>
                <p style={{ color: '#4b6075', fontSize: '0.875rem', margin: 0, textAlign: 'center' }}>
                  {businessName}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
