'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  detail?: string;
  addition?: string;
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
  isTableFromUrl: boolean;
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
  isTableFromUrl: false,
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ 
  children, 
  businessId, 
  initialTableFromUrl 
}: { 
  children: React.ReactNode; 
  businessId: string; 
  initialTableFromUrl?: string;
}) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerInfo, setCustomerInfoState] = useState<any>(() => {
    if (initialTableFromUrl) {
      return { tableNumber: initialTableFromUrl, isTableFromUrl: true };
    }
    return {};
  });
  const [isTableFromUrl, setIsTableFromUrl] = useState<boolean>(Boolean(initialTableFromUrl));
  const isTableFromUrlRef = useRef(isTableFromUrl);
  isTableFromUrlRef.current = isTableFromUrl;
  const initialTableFromUrlRef = useRef(initialTableFromUrl);
  initialTableFromUrlRef.current = initialTableFromUrl;

  const [isHydrated, setIsHydrated] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);
  
  // Load from local storage and URL query string on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(`cart_${businessId}`);
    const savedCustomer = localStorage.getItem(`customer_${businessId}`);
    const savedOrderId = localStorage.getItem(`last_order_${businessId}`);
    
    let parsedCustomer: any = {};
    if (savedCustomer) {
      try { parsedCustomer = JSON.parse(savedCustomer); } catch {}
    }

    // Auto-detectar número de mesa desde el QR (ej: ?table=1 o ?mesa=1)
    let urlTable: string | null = initialTableFromUrl || null;
    if (!urlTable && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      urlTable = urlParams.get('table') || urlParams.get('mesa');
    }

    if (urlTable) {
      parsedCustomer.tableNumber = urlTable;
      parsedCustomer.isTableFromUrl = true;
      setIsTableFromUrl(true);
    } else {
      parsedCustomer.isTableFromUrl = false;
      setIsTableFromUrl(false);
    }

    if (savedCart) setItems(JSON.parse(savedCart));
    setCustomerInfoState(parsedCustomer);
    if (savedOrderId) setLastOrderId(savedOrderId);
    
    setIsHydrated(true);
  }, [businessId, initialTableFromUrl]);

  // Si la mesa fue asignada por URL, evitar que se pueda sobreescribir
  const setCustomerInfo = useCallback((infoOrUpdater: any) => {
    setCustomerInfoState((prev: any) => {
      const next = typeof infoOrUpdater === 'function' ? infoOrUpdater(prev) : infoOrUpdater;
      if (isTableFromUrlRef.current) {
        let tableToKeep = prev?.tableNumber;
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const currentUrlTable = urlParams.get('table') || urlParams.get('mesa');
          if (currentUrlTable) tableToKeep = currentUrlTable;
        }
        if (!tableToKeep && initialTableFromUrlRef.current) tableToKeep = initialTableFromUrlRef.current;

        return {
          ...next,
          tableNumber: tableToKeep,
          isTableFromUrl: true,
        };
      }
      return next;
    });
  }, []);

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
      items, addItem, removeItem, updateQuantity, clearCart, total, isOpen, setIsOpen, customerInfo, setCustomerInfo, isHydrated, isCustomerModalOpen, setIsCustomerModalOpen, lastOrderId, setLastOrderId, isTableFromUrl
    }}>
      {children}
    </CartContext.Provider>
  );
}
