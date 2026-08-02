'use client';

import React from 'react';
import { CartProvider } from '@/components/orders/CartContext';
import { Cart } from '@/components/orders/Cart';
import { CustomerInfoModal } from '@/components/orders/CustomerInfoModal';
import { CustomerInfoBadge } from '@/components/orders/CustomerInfoBadge';
import { CartButton } from '@/components/orders/CartButton';

interface PublicMenuClientProps {
  businessId: string;
  orderMode: string;
  businessSlug: string;
  children: React.ReactNode;
}

export function PublicMenuClient({ businessId, orderMode, businessSlug, children }: PublicMenuClientProps) {
  // Si el modo es solo carta, no inyectamos lógica de carrito
  if (orderMode === 'menu_only') {
    return <>{children}</>;
  }

  return (
    <CartProvider businessId={businessId}>
      {children}
      <CartButton />
      <CustomerInfoBadge orderMode={orderMode} />
      <Cart businessId={businessId} orderMode={orderMode} businessSlug={businessSlug} />
      <CustomerInfoModal orderMode={orderMode} businessId={businessId} />
    </CartProvider>
  );
}
