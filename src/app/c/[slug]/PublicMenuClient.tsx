'use client';

import React from 'react';
import { CartProvider } from '@/components/orders/CartContext';
import { Cart } from '@/components/orders/Cart';
import { CustomerInfoModal } from '@/components/orders/CustomerInfoModal';
import { CartButton } from '@/components/orders/CartButton';

interface PublicMenuClientProps {
  businessId: string;
  orderMode: string;
  businessSlug: string;
  layoutStyle?: string;
  children: React.ReactNode;
}

export function PublicMenuClient({ businessId, orderMode, businessSlug, layoutStyle = 'grid', children }: PublicMenuClientProps) {
  // Si el modo es solo carta, no inyectamos lógica de carrito ni modal
  if (orderMode === 'menu_only') {
    return <>{children}</>;
  }

  return (
    <CartProvider businessId={businessId}>
      {children}
      <CartButton />
      <Cart businessId={businessId} orderMode={orderMode} businessSlug={businessSlug} layoutStyle={layoutStyle} />
      <CustomerInfoModal orderMode={orderMode} businessId={businessId} />
    </CartProvider>
  );
}
