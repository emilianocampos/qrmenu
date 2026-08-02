'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  observations: string;
  image_url: string;
}

interface CartContextProps {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, observations: string) => void;
  updateQuantity: (productId: string, observations: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  customerInfo: any;
  setCustomerInfo: (info: any) => void;
  isHydrated: boolean;
  isCustomerModalOpen: boolean;
  setIsCustomerModalOpen: (isOpen: boolean) => void;
  lastOrderId: string | null;
  setLastOrderId: (id: string | null) => void;
}

const CartContext = createContext<CartContextProps>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  total: 0,
  isOpen: false,
  setIsOpen: () => {},
  customerInfo: {},
  setCustomerInfo: () => {},
  isHydrated: false,
  isCustomerModalOpen: false,
  setIsCustomerModalOpen: () => {},
  lastOrderId: null,
  setLastOrderId: () => {},
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children, businessId }: { children: React.ReactNode, businessId: string }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<any>({});
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  
  // Load from local storage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${businessId}`);
    const savedCustomer = localStorage.getItem(`customer_${businessId}`);
    const savedOrderId = localStorage.getItem(`last_order_${businessId}`);
    
    if (savedCart) setItems(JSON.parse(savedCart));
    if (savedCustomer) setCustomerInfo(JSON.parse(savedCustomer));
    if (savedOrderId) setLastOrderId(savedOrderId);
    
    setIsHydrated(true);
  }, [businessId]);

  // Save to local storage on change
  useEffect(() => {
    localStorage.setItem(`cart_${businessId}`, JSON.stringify(items));
  }, [items, businessId]);

  useEffect(() => {
    if (isHydrated && Object.keys(customerInfo).length > 0) {
      localStorage.setItem(`customer_${businessId}`, JSON.stringify(customerInfo));
    }
  }, [customerInfo, businessId, isHydrated]);

  useEffect(() => {
    if (isHydrated && lastOrderId) {
      localStorage.setItem(`last_order_${businessId}`, lastOrderId);
    }
  }, [lastOrderId, businessId, isHydrated]);

  const addItem = (newItem: CartItem) => {
    setItems(prev => {
      // Check if exact item exists (same id and same observations)
      const existing = prev.find(i => i.productId === newItem.productId && i.observations === newItem.observations);
      if (existing) {
        return prev.map(i => i === existing ? { ...i, quantity: i.quantity + newItem.quantity } : i);
      }
      return [...prev, newItem];
    });
    setIsOpen(true);
  };

  const removeItem = (productId: string, observations: string) => {
    setItems(prev => prev.filter(i => !(i.productId === productId && i.observations === observations)));
  };

  const updateQuantity = (productId: string, observations: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId, observations);
      return;
    }
    setItems(prev => prev.map(i => (i.productId === productId && i.observations === observations) ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, setIsOpen, customerInfo, setCustomerInfo, isHydrated, isCustomerModalOpen, setIsCustomerModalOpen, lastOrderId, setLastOrderId
    }}>
      {children}
    </CartContext.Provider>
  );
}
