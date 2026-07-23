import React from 'react';
import { notFound } from 'next/navigation';
import { getBusinessBySlug, getReviews } from '@/actions/reviews';
import { Navbar } from '@/components/public/Navbar';
import { ViewTracker } from '@/components/public/ViewTracker';
import { CalendarClock } from 'lucide-react';

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

export default async function ReservarMesaPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: business, error } = await getBusinessBySlug(slug);
  
  if (error || !business) notFound();

  const { data: reviews = [] } = await getReviews(business.id);
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
  let defaultBorder = '#000000';
  let defaultText = '#f1f5f9';
  let defaultTextMuted = '#94a3b8';
  let defaultTextFaint = '#64748b';

  if (theme === 'light') {
    defaultBg = '#f8fafc';
    defaultCard = '#ffffff';
    defaultCardHover = '#f1f5f9';
    defaultNav = 'rgba(248, 250, 252, 0.9)';
    defaultBorder = '#e2e8f0';
    defaultText = '#0f172a';
    defaultTextMuted = '#475569';
    defaultTextFaint = '#94a3b8';
  } else if (theme === 'custom' && customBg) {
    defaultBg = customBg;
    defaultCard = `${customBg}ee`;
    defaultCardHover = `${customBg}dd`;
    defaultNav = `${customBg}f0`;
  }

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
          --bg-page: ${defaultBg};
          --bg-card: ${defaultCard};
          --bg-card-hover: ${defaultCardHover};
          --bg-navbar: ${defaultNav};
          --border-color: ${defaultBorder};
          --text-primary: ${defaultText};
          --text-muted: ${defaultTextMuted};
          --text-faint: ${defaultTextFaint};
        }
        body {
          font-family: var(--font-family);
          background-color: var(--bg-page);
          color: var(--text-primary);
          transition: background-color 0.3s, color 0.3s;
        }
      `}</style>

      <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column' }}>
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

        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="p-12 rounded-3xl flex flex-col items-center max-w-lg w-full" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ color: 'var(--primary-color)', backgroundColor: 'var(--bg-page)' }}>
              <CalendarClock className="w-10 h-10" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-widest mb-4" style={{ color: 'var(--primary-color)' }}>
              Próximamente
            </h1>
            <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
              Muy pronto podrás reservar tu mesa de forma rápida y sencilla desde aquí.
            </p>
          </div>
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
