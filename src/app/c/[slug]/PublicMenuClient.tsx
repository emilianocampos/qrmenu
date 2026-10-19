'use client';

import React from 'react';
import { CartProvider } from '@/components/orders/CartContext';
import { Cart } from '@/components/orders/Cart';
import { CustomerInfoModal } from '@/components/orders/CustomerInfoModal';
import { CartButton } from '@/components/orders/CartButton';

interface PublicMenuClientProps {
  businessId: string;
  orderMode: string;
  tableOrdersEnabled?: boolean;
  businessSlug: string;
  layoutStyle?: string;
  initialTableFromUrl?: string;
  children: React.ReactNode;
}

export function PublicMenuClient({ 
  businessId, 
  orderMode, 
  tableOrdersEnabled = false,
  businessSlug, 
  layoutStyle = 'grid', 
  initialTableFromUrl,
  children 
}: PublicMenuClientProps) {
  const isOrderingAllowed = orderMode !== 'menu_only' && tableOrdersEnabled;

  return (
    <CartProvider businessId={businessId} initialTableFromUrl={initialTableFromUrl}>
      {children}
      {isOrderingAllowed && (
        <>
          <CartButton />
          <Cart businessId={businessId} orderMode={orderMode} businessSlug={businessSlug} layoutStyle={layoutStyle} />
          <CustomerInfoModal orderMode={orderMode} businessId={businessId} />
        </>
      )}
    </CartProvider>
  );
}

