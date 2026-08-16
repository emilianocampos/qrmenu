import React from 'react';
import { notFound } from 'next/navigation';
import { getBusinessBySlug, getProducts, getReviews } from '@/actions/reviews';
import { Navbar } from '@/components/public/Navbar';
import { MenuSection } from '@/components/public/MenuSection';
import { AboutSection } from '@/components/public/AboutSection';
import { ReviewSection } from '@/components/public/ReviewSection';
import { ViewTracker } from '@/components/public/ViewTracker';
import { VisitTracker } from '@/components/public/VisitTracker';
import { PromoModal } from '@/components/public/PromoModal';
import { PublicMenuClient } from './PublicMenuClient';

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

  // Verificación de acceso por módulo Super Admin (Trial)
  if (business.trial_enabled === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0e1a] text-white p-4">
        <div className="max-w-md w-full bg-[#111827] border border-white/10 rounded-2xl p-8 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50" />
          <h1 className="text-2xl font-bold mb-4">Esta carta ya no se encuentra disponible.</h1>
          <p className="text-gray-400 mb-8">
            Si sos el propietario del negocio, iniciá sesión para administrar tu cuenta y regularizar tu estado.
          </p>
          <a 
            href="/login" 
            className="inline-block bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            Iniciar sesión
          </a>
        </div>
      </div>
    );
  }

  const [{ data: products = [] }, { data: reviews = [] }, loyaltySettings] = await Promise.all([
    getProducts(business.id),
    getReviews(business.id),
    getLoyaltySettings(business.id),
  ]);

  const reviewCount = reviews.length;
  const rating = reviewCount > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount : 5.0;
  const primaryColor = business.color_primary || '#f97316';
  const primaryColorRgb = hexToRgb(primaryColor);
  const customBg = business.background_color;
  const theme = business.theme || 'dark';

  let defaultBg = '#0a0e1a';
  let defaultCard = '#111827';
  let defaultCardHover = '#151d2e';
  let defaultNav = 'rgba(10, 14, 26, 0.9)';
  let defaultBorder = 'rgba(255, 255, 255, 0.1)';
  let defaultText = '#f1f5f9';
  let defaultTextMuted = '#94a3b8';
  let defaultTextFaint = '#64748b';
  let defaultShadow = '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3)';
  let defaultModalShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.7)';

  if (theme === 'light') {
    defaultBg = '#f8fafc';
    defaultCard = '#ffffff';
    defaultCardHover = '#f1f5f9';
    defaultNav = 'rgba(248, 250, 252, 0.9)';
    defaultBorder = '#e2e8f0';
    defaultText = '#0f172a';
    defaultTextMuted = '#475569';
    defaultTextFaint = '#94a3b8';
    defaultShadow = '0 10px 30px -5px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)';
    defaultModalShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.15)';
  } else if (theme === 'custom' && customBg) {
    defaultBg = customBg;
    defaultCard = `${customBg}ee`;
    defaultCardHover = `${customBg}dd`;
    defaultNav = `${customBg}f0`;
  }

  // customBg applies only to the main background if theme is not light/dark explicitly overridden
  if (customBg && theme !== 'light') {
    defaultBg = customBg;
  }

  const fontName = business.typography || 'Inter';
  const hasAbout = business.show_about_us !== false && !!(
    business.about_title ||
    business.about_description ||
    business.cover_image ||
    business.slogan ||
    business.address ||
    business.phone ||
    business.schedule
  );

  return (
    <PublicMenuClient businessId={business.id} orderMode={business.order_mode || 'menu_only'} businessSlug={business.slug}>
      <link
        rel="stylesheet"
        href={`https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, '+')}:wght@300;400;500;600;700;800;900&display=swap`}
      />

      <style>{`
        :root {
          --primary-color: ${primaryColor};
          --primary-color-rgb: ${primaryColorRgb};
          --font-family: '${fontName}', 'Inter', sans-serif;
          --bg-page: ${defaultBg};
          --bg-card: ${defaultCard};
          --bg-card-hover: ${defaultCardHover};
          --bg-navbar: ${defaultNav};
          --border-color: ${defaultBorder};
          --text-primary: ${defaultText};
          --text-muted: ${defaultTextMuted};
          --text-faint: ${defaultTextFaint};
          --shadow-card: ${defaultShadow};
          --shadow-modal: ${defaultModalShadow};
        }
        body {
          font-family: var(--font-family);
          background-color: var(--bg-page);
          color: var(--text-primary);
          transition: background-color 0.3s, color 0.3s;
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
        <PromoModal
          businessId={business.id}
          active={business.promo_active || false}
          title={business.promo_title || null}
          description={business.promo_description || null}
          imageUrl={business.promo_image || null}
          primaryColor={primaryColor}
        />
        <ViewTracker businessId={business.id} />
        <VisitTracker businessId={business.id} />

        <Navbar
          businessId={business.id}
          name={business.name}
          slug={business.slug}
          description={business.description}
          logoUrl={business.logo_url}
          hasAbout={hasAbout}
          rating={rating}
          reviewCount={reviewCount}
          loyaltyEnabled={loyaltySettings.loyalty_enabled}
          loyaltySettings={loyaltySettings}
          primaryColor={primaryColor}
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
                  id="banner-logo"
                  src={business.logo_url}
                  alt={business.name}
                  className="transition-transform duration-500 hover:rotate-[360deg] hover:scale-105 cursor-pointer"
                  style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--primary-color)', backgroundColor: 'var(--bg-card)', flexShrink: 0 }}
                />
              ) : (
                <div 
                  id="banner-logo"
                  className="transition-transform duration-500 hover:rotate-[360deg] hover:scale-105 cursor-pointer"
                  style={{ width: 100, height: 100, borderRadius: '50%', backgroundColor: 'var(--bg-card)', border: '3px solid var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 40, flexShrink: 0 }}
                >
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
          <MenuSection businessId={business.id} products={products} currencySymbol="$" layoutStyle={business.layout_style || 'grid'} vintageColorMode={business.vintage_color_mode || 'multicolor'} vintageColor={business.vintage_color || '#ff4500'} orderMode={business.order_mode || 'menu_only'} />
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
      </div>
    </PublicMenuClient>
  );
}
