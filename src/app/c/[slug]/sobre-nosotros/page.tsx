import React from 'react';
import { notFound } from 'next/navigation';
import { getBusinessBySlug, getReviews } from '@/actions/reviews';
import { Navbar } from '@/components/public/Navbar';
import { ViewTracker } from '@/components/public/ViewTracker';
import { MapPin, Phone, Mail, Clock, Award, Users } from 'lucide-react';

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

export default async function SobreNosotrosPage({ params }: PageProps) {
  const { slug } = await params;
  const { data: business, error } = await getBusinessBySlug(slug);
  
  if (error || !business) notFound();

  const { data: reviews = [] } = await getReviews(business.id);
  const reviewCount = reviews.length;
  const rating = reviewCount > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviewCount : 5.0;

  const primaryColor = business.color_primary || '#f97316';
  const primaryColorRgb = hexToRgb(primaryColor);
  const textColor = business.color_secondary || '#f1f5f9';
  const customBg = business.background_color;
  const theme = business.theme || 'dark';

  let defaultBg = '#0a0e1a';
  let defaultCard = '#111827';
  let defaultCardHover = '#151d2e';
  let defaultNav = 'rgba(10, 14, 26, 0.9)';
  let defaultBorder = '#1e2d45';
  let defaultText = textColor;
  let defaultTextMuted = `${textColor}b3`;
  let defaultTextFaint = `${textColor}80`;

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
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: var(--border-color);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(${primaryColorRgb}, 0.4);
        }
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

        <main className="max-w-5xl mx-auto px-6 py-16 space-y-16">
          
          {/* Header Title & Slogan */}
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-extrabold" style={{ color: 'var(--text-primary)' }}>
              {business.about_title || `Sobre ${business.name}`}
            </h1>
            {business.slogan && (
              <p className="text-lg md:text-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {business.slogan}
              </p>
            )}
          </div>

          {/* Our Story Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Image */}
            {business.cover_image ? (
              <div className="rounded-2xl overflow-hidden shadow-2xl relative aspect-[4/3] w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={business.cover_image} alt={business.name} className="absolute inset-0 w-full h-full object-cover" />
              </div>
            ) : (
              <div className="rounded-2xl bg-white/5 border border-white/10 aspect-[4/3] w-full flex items-center justify-center">
                <span className="text-4xl">🍽️</span>
              </div>
            )}

            {/* Story Text */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-4">Nuestra Historia</h2>
                {business.about_description ? (
                  <div className="space-y-4 text-sm md:text-base leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-muted)' }}>
                    {business.about_description}
                  </div>
                ) : (
                  <p className="text-sm md:text-base text-[var(--text-muted)] italic">Historia aún no agregada.</p>
                )}
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <Award className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <div className="font-bold text-lg">{rating.toFixed(1)}/5</div>
                    <div className="text-xs text-[var(--text-muted)]">{reviewCount}+ Reseñas</div>
                  </div>
                </div>
                <div className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-2" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                  <Users className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <div className="font-bold text-lg">5,000+</div>
                    <div className="text-xs text-[var(--text-muted)]">Clientes Felices</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Visit Us Section */}
          <div className="pt-8 space-y-8 border-t" style={{ borderColor: 'var(--border-color)' }}>
            <div className="text-center">
              <h2 className="text-2xl font-bold">Visítanos</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl p-8 flex flex-col items-center text-center space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <MapPin className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                <h3 className="font-bold text-lg">Dirección</h3>
                <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{business.address || 'No especificada'}</p>
              </div>
              
              <div className="rounded-2xl p-8 flex flex-col items-center text-center space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Phone className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                <h3 className="font-bold text-lg">Teléfono</h3>
                <p className="text-sm text-[var(--text-muted)] whitespace-pre-wrap">{business.phone || business.whatsapp || 'No especificado'}</p>
              </div>

              <div className="rounded-2xl p-8 flex flex-col items-center text-center space-y-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
                <Mail className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
                <h3 className="font-bold text-lg">Email</h3>
                <p className="text-sm text-[var(--text-muted)]">{business.email || 'No especificado'}</p>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="rounded-2xl p-8 md:p-12" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex flex-col items-center text-center space-y-6">
              <Clock className="w-8 h-8" style={{ color: 'var(--primary-color)' }} />
              <h3 className="text-xl font-bold">Horario de Atención</h3>
              <div className="w-full max-w-2xl text-center space-y-4 text-sm md:text-base" style={{ color: 'var(--text-muted)' }}>
                {business.schedule ? (
                  <p className="whitespace-pre-wrap">{business.schedule}</p>
                ) : (
                  <p className="italic" style={{ color: 'var(--text-faint)' }}>Horarios no especificados</p>
                )}
              </div>
              {business.schedule && (
                <div className="inline-block px-4 py-1.5 rounded-full text-xs font-bold mt-4" style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff' }}>
                  Abierto Hoy
                </div>
              )}
            </div>
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
