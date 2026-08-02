import React from 'react';
import { notFound, redirect } from 'next/navigation';
import { getOrderById } from '@/actions/orders';
import { OrderTimeline } from '@/components/orders/OrderTimeline';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ id?: string }>;
}

export default async function CustomerOrderPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { id: orderId } = await searchParams;

  if (!orderId) {
    redirect(`/c/${slug}`);
  }

  const order = await getOrderById(orderId);

  if (!order || order.businesses.slug !== slug) {
    notFound();
  }

  const primaryColor = order.businesses.color_primary || '#6366f1';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="p-4 flex items-center border-b border-white/10 sticky top-0 bg-[#0a0a0a]/80 backdrop-blur-md z-10">
        <Link 
          href={`/c/${slug}`}
          className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-300" />
        </Link>
        <div className="flex-1 text-center font-bold text-lg">
          Seguimiento del Pedido
        </div>
        <div className="w-9" /> {/* Spacer */}
      </div>

      <div className="max-w-xl mx-auto p-4 sm:p-6 pb-24">
        {/* Business Header */}
        <div className="text-center mb-8">
          {order.businesses.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img 
              src={order.businesses.logo_url} 
              alt={order.businesses.name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-4 mb-3"
              style={{ borderColor: primaryColor }}
            />
          )}
          <h1 className="text-2xl font-black">{order.businesses.name}</h1>
          <p className="text-gray-400 mt-1 font-mono text-sm">
            Pedido #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Client Component Timeline */}
        <OrderTimeline initialOrder={order} primaryColor={primaryColor} />
      </div>
    </div>
  );
}
