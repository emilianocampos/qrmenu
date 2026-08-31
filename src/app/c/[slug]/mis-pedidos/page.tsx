import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getOrderById, markOrderAsPaid } from '@/actions/orders';
import { getBusinessBySlug } from '@/actions/reviews';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import { OrderCheckOrEmpty } from '@/components/orders/OrderCheckOrEmpty';
import Link from 'next/link';
import { ArrowLeft, ShoppingBag } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string; payment?: string }>;
}

function hexToRgb(hex: string): string {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241';
}

export default async function CustomerOrderPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { id: orderId, payment } = await searchParams;

  if (!orderId) {
    const { data: business } = await getBusinessBySlug(slug);
    return (
      <OrderCheckOrEmpty
        slug={slug}
        primaryColor={business?.color_primary || '#6366f1'}
        businessName={business?.name || 'el local'}
      />
    );
  }

  let order = await getOrderById(orderId);

  // Si regresa de Mercado Pago con pago exitoso, actualizar estado
  if (order && payment === 'success' && order.payment_status !== 'approved') {
    await markOrderAsPaid(order.id, order.business_id, 'mercadopago');
    order.status = 'paid';
    order.payment_status = 'approved';
  }

  const decodedSlug = decodeURIComponent(slug || '').toLowerCase().trim();
  const orderBusinessSlug = decodeURIComponent(order?.businesses?.slug || '').toLowerCase().trim();

  if (!order || !order.businesses || orderBusinessSlug !== decodedSlug) {
    const { data: business } = await getBusinessBySlug(slug);

    if (!business) {
      notFound();
    }

    const primaryColor = business.color_primary || '#6366f1';

    return (
      <div className="min-h-screen bg-[#0a0e1a] text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Pedido No Encontrado</h1>
        <p className="text-gray-400 text-sm max-w-xs mb-6">
          No encontramos este pedido. Es posible que haya sido completado o eliminado.
        </p>
        <Link
          href={`/c/${slug}`}
          className="px-6 py-3 font-bold text-white rounded-xl transition-all shadow-lg text-sm"
          style={{ backgroundColor: primaryColor }}
        >
          Volver al Menú
        </Link>
      </div>
    );
  }

  const business = order.businesses;
  const primaryColor = business.color_primary || '#6366f1';
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

  if (customBg && theme !== 'light') {
    defaultBg = customBg;
  }

  const fontName = business.typography || 'Inter';

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
          --shadow-card: ${defaultShadow};
          --shadow-modal: ${defaultModalShadow};
        }
        body {
          font-family: var(--font-family);
          background-color: var(--bg-page);
          color: var(--text-primary);
          transition: background-color 0.3s, color 0.3s;
        }
      `}</style>

      <div style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)', minHeight: '100vh' }}>
        {/* Header */}
        <div
          className="p-4 flex items-center sticky top-0 backdrop-blur-md z-10"
          style={{ backgroundColor: 'var(--bg-navbar)', borderBottom: '1px solid var(--border-color)' }}
        >
          <Link
            href={`/c/${slug}`}
            className="p-2 -ml-2 rounded-full transition-colors"
            style={{ backgroundColor: 'transparent' }}
          >
            <ArrowLeft className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
          </Link>
          <div className="flex-1 text-center font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            Seguimiento del Pedido
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>

        <div className="max-w-xl mx-auto p-4 sm:p-6 pb-24">
          {/* Business Header */}
          <div className="text-center mb-8">
            {business.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={business.logo_url}
                alt={business.name}
                className="w-20 h-20 rounded-full mx-auto object-cover border-4 mb-3"
                style={{ borderColor: primaryColor, boxShadow: 'var(--shadow-card)' }}
              />
            )}
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{business.name}</h1>
            <p className="mt-1 font-mono text-sm" style={{ color: 'var(--text-muted)' }}>
              Pedido #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>

          {/* Client Component Timeline */}
          <OrderTimeline initialOrder={order} primaryColor={primaryColor} />
        </div>
      </div>
    </>
  );
}
