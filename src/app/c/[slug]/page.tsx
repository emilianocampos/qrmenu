import React from 'react';
import { notFound } from 'next/navigation';
import { getBusinessBySlug, getProducts, getReviews } from '@/actions/reviews';
import { Navbar } from '@/components/public/Navbar';
import { MenuSection } from '@/components/public/MenuSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ReviewSection } from '@/components/public/ReviewSection';
import { ViewTracker } from '@/components/public/ViewTracker';

interface PageProps {
  params: Promise<{ slug: string }>;
}

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '249, 115, 22';
}

export default async function PublicMenuPage({ params }: PageProps) {
  const { slug } = await params;

  const { data: business, error } = await getBusinessBySlug(slug);
  if (error || !business) notFound();

  const { data: products = [] } = await getProducts(business.id);
  const { data: reviews = [] } = await getReviews(business.id);

  const reviewCount = reviews.length;
  const rating = reviewCount > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount : 5.0;

  const primaryColor = business.color_primary || '#f97316';
  const primaryColorRgb = hexToRgb(primaryColor);
  const textColor = business.color_secondary || '#f1f5f9';
  const fontName = business.typography || 'Inter';
  const hasAbout = !!(
    business.about_title ||
    business.about_description ||
    business.cover_image ||
    business.slogan ||
    business.address ||
    business.phone ||
    business.schedule
  );

  return (
    <>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`}
      />

      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --primary-color-rgb: ${primaryColorRgb};
          --font-family: '${fontName}', 'Inter', sans-serif;
          --bg-page: #0a0e1a;
          --bg-card: #111827;
          --bg-card-hover: #151d2e;
          --border-color: #1e2d45;
          --text-primary: ${textColor};
          --text-muted: ${textColor}b3;
          --text-faint: ${textColor}80;
        }
        body {
          font-family: var(--font-family);
          background-color: var(--bg-page);
          color: var(--text-primary);
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(${primaryColorRgb}, 0.4);
        }
        .card-hover:hover { background-color: var(--bg-card-hover); }
      `}</style>

      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)' }}>
        <ViewTracker businessId={business.id} />

        <Navbar
          name={business.name}
          slug={business.slug}
          description={business.description}
          logoUrl={business.logo_url}
          hasAbout={hasAbout}
          rating={rating}
          reviewCount={reviewCount}
        />

        {/* Header / Banner */}
        {business.banner_image !== 'none' && (
          <header
            className="w-full flex flex-col items-center justify-center py-12 relative"
            style={{
              backgroundColor: business.banner_image ? 'transparent' : 'var(--bg-page)',
              borderBottom: '1px solid var(--border-color)',
              minHeight: business.banner_image ? '300px' : 'auto'
            }}
          >
            {business.banner_image && (
              <div
                className="absolute inset-0 z-0"
                style={{
                  backgroundImage: `url(${business.banner_image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
              </div>
            )}

            {/* Header content */}
            <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center gap-4 relative z-10">
              {business.logo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={business.logo_url}
                  alt={business.name}
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', backgroundColor: 'var(--bg-card)', flexShrink: 0 }}
                />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '3px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}>
                  🍽️
                </div>
              )}
              <div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: business.banner_image ? '#ffffff' : 'var(--primary-color)', margin: 0, lineHeight: 1.2, textShadow: business.banner_image ? '0 2px 10px rgba(0,0,0,0.5)' : 'none' }}>
                  {business.name}
                </h1>
                {business.description && (
                  <p style={{ color: business.banner_image ? '#e2e8f0' : 'var(--text-muted)', fontSize: '1rem', margin: '8px 0 0', maxWidth: '600px', textShadow: business.banner_image ? '0 1px 5px rgba(0,0,0,0.5)' : 'none' }}>
                    {business.description}
                  </p>
                )}
              </div>
            </div>
          </header>
        )}

        <main>
          <MenuSection products={products} currencySymbol="$" layoutStyle={business.layout_style || 'grid'} />
          {/* {hasAbout && (
            <AboutSection
              title={business.about_title}
              description={business.about_description}
              imageUrl={business.cover_image}
              businessName={business.name}
            />
          )} */}
          <ReviewSection
            businessId={business.id}
            initialReviews={reviews}
            businessName={business.name}
          />
        </main>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid var(--border-color)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>
            &copy; {new Date().getFullYear()} {business.name} · Desarrollado con <span style={{ color: 'var(--primary-color)' }}>Carta QR</span>
          </p>
        </footer>
      </div>
    </>
  );
}
