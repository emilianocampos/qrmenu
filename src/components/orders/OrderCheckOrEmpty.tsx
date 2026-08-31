'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShoppingBag, Loader2, Utensils } from 'lucide-react';

interface OrderCheckOrEmptyProps {
  slug: string;
  primaryColor: string;
  businessName: string;
}

export function OrderCheckOrEmpty({ slug, primaryColor, businessName }: OrderCheckOrEmptyProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let foundId: string | null = null;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('last_order_')) {
          foundId = localStorage.getItem(key);
          if (foundId) break;
        }
      }

      if (foundId) {
        router.replace(`/c/${slug}/mis-pedidos?id=${foundId}`);
        return;
      }
      setChecking(false);
    }
  }, [slug, router]);

  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mb-4" />
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Buscando tus pedidos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)' }}>
        <ShoppingBag className="w-10 h-10 text-indigo-500 opacity-80" />
      </div>
      <h1 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>Aún no tenés pedidos activos</h1>
      <p className="text-sm max-w-sm mb-8" style={{ color: 'var(--text-muted)' }}>
        Cuando confirmes un pedido desde el carrito de <span className="font-bold text-white">{businessName}</span>, podrás seguir su preparación y pagarlo desde acá.
      </p>
      <Link
        href={`/c/${slug}`}
        className="px-8 py-3.5 font-black text-white rounded-2xl transition-all shadow-lg text-sm flex items-center gap-2 hover:opacity-90 active:scale-95"
        style={{ backgroundColor: primaryColor }}
      >
        <Utensils className="w-4 h-4" /> Ver la Carta Digital
      </Link>
    </div>
  );
}
