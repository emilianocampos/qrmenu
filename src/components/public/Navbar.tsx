'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Award, UtensilsCrossed, Info, Receipt, CalendarCheck, Star } from 'lucide-react';
import { toast } from 'sonner';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';
import { TourGuide } from './TourGuide';

import { LoyaltyCardModal } from './LoyaltyCardModal';
import { LoyaltySettings } from '@/actions/loyalty';

interface NavbarProps {
  businessId?: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  hasAbout: boolean;
  rating?: number;
  reviewCount?: number;
  loyaltyEnabled?: boolean;
  loyaltySettings?: LoyaltySettings;
  primaryColor?: string;
  orderStatusEnabled?: boolean;
}

export function Navbar({
  businessId,
  name,
  slug,
  description,
  logoUrl,
  hasAbout,
  rating = 5.0,
  reviewCount = 0,
  loyaltyEnabled = false,
  loyaltySettings,
  primaryColor,
  orderStatusEnabled = false,
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoyaltyModalOpen, setIsLoyaltyModalOpen] = useState(false);
  const [autoStampPending, setAutoStampPending] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === `/c/${slug}`;
  const [lastOrderId, setLastOrderId] = useState<string | null>(null);

  // Auto-abrir tarjeta de sellos si el cliente escaneó el QR fijo de caja con la cámara nativa
  React.useEffect(() => {
    if (typeof window === 'undefined' || !businessId || !loyaltyEnabled) return;
    const params = new URLSearchParams(window.location.search);
    const stampQr = params.get('stamp_qr');
    if (stampQr && stampQr === businessId) {
      setAutoStampPending(true);
      setIsLoyaltyModalOpen(true);
      params.delete('stamp_qr');
      const nextSearch = params.toString();
      const nextUrl = `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ''}${window.location.hash}`;
      window.history.replaceState({}, '', nextUrl);
    }
  }, [businessId, loyaltyEnabled]);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const id = localStorage.getItem(`last_order_${slug}`) ||
        (businessId ? localStorage.getItem(`last_order_${businessId}`) : null) ||
        localStorage.getItem('last_order_active');
      if (id && id.trim()) {
        setLastOrderId(id.trim());
      }
    }
  }, [slug, businessId]);


  // Evento global para cerrar el drawer si es necesario
  React.useEffect(() => {
    const handleClose = () => setMobileOpen(false);
    window.addEventListener('close-mobile-menu', handleClose);

    return () => {
      window.removeEventListener('close-mobile-menu', handleClose);
    };
  }, []);

  const navItems = [
    { label: 'Menú', id: 'menu', href: `/c/${slug}`, icon: UtensilsCrossed },
  ];

  if (hasAbout) {
    navItems.push({ label: 'Sobre Nosotros', id: 'about', href: `/c/${slug}/sobre-nosotros`, icon: Info });
  }

  if (orderStatusEnabled) {
    navItems.push({
      label: 'Mis Pedidos',
      id: 'mis-pedidos',
      href: lastOrderId ? `/c/${slug}/mis-pedidos?id=${lastOrderId}` : `/c/${slug}/mis-pedidos`,
      icon: Receipt,
    });
  }

  navItems.push(
    { label: 'Reservar Mesa', id: 'reservar-mesa', href: `/c/${slug}/reservar-mesa`, icon: CalendarCheck },
    { label: 'Reseñas', id: 'reviews', href: `/c/${slug}#reviews`, icon: Star }
  );

  if (loyaltyEnabled) {
    navItems.push({ label: 'Sellos', id: 'loyalty', href: '#', icon: Award });
  }

  const handleNav = (item: any) => {
    setMobileOpen(false);

    if (item.id === 'loyalty') {
      setIsLoyaltyModalOpen(true);
      return;
    }

    if (item.id === 'mis-pedidos') {
      let targetId: string | null = null;
      if (typeof window !== 'undefined') {
        targetId = localStorage.getItem(`last_order_${slug}`) ||
          (businessId ? localStorage.getItem(`last_order_${businessId}`) : null) ||
          localStorage.getItem('last_order_active');
        if (!targetId) {
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('last_order_') && !key.includes('time')) {
              const val = localStorage.getItem(key);
              if (val && val.trim()) {
                targetId = val.trim();
                break;
              }
            }
          }
        }
      }
      if (!targetId && lastOrderId) {
        targetId = lastOrderId;
      }
      router.push(targetId ? `/c/${slug}/mis-pedidos?id=${targetId}` : `/c/${slug}/mis-pedidos`);
      return;
    }

    // Cross-page navigation
    if (item.id === 'about' || item.id === 'reservar-mesa' || (item.id === 'menu' && !isHome) || (item.id === 'reviews' && !isHome)) {
      const currentSearch = typeof window !== 'undefined' ? window.location.search : '';
      router.push(`${item.href}${currentSearch}`);
      return;
    }

    // Same-page scrolling
    if (item.id === 'menu') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const element = document.getElementById(item.id);
    if (element) {
      const y = element.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const navStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    borderBottom: 'none',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
    backgroundColor: 'var(--bg-navbar)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <>
      <TourGuide
        loyaltyEnabled={loyaltyEnabled}
        rewardTitle={loyaltySettings?.loyalty_reward_title}
        onOpenLoyalty={() => setIsLoyaltyModalOpen(true)}
      />
      <nav style={navStyle}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo + Name */}
          <button
            onClick={() => handleNav({ id: 'menu', href: `/c/${slug}` })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }} />
            ) : (
              <span style={{ fontSize: 24 }}>🍽️</span>
            )}
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>{name}</div>
              {description && (
                <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', lineHeight: 1.2, marginTop: '2px', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {description}
                </div>
              )}
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center" style={{ gap: 4 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNav(item)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    padding: '8px 16px',
                    borderRadius: 8,
                    transition: 'color 0.2s, background 0.2s',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {reviewCount >= 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '16px', fontSize: '0.9rem', fontWeight: 600 }}>
                <svg style={{ width: 16, height: 16, color: '#facc15' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                <span style={{ color: '#facc15' }}>{rating.toFixed(1)}</span>
                <span style={{ color: 'var(--text-muted)' }}>
                  ({reviewCount > 1000 ? (reviewCount / 1000).toFixed(1) + 'k+' : reviewCount})
                </span>
              </div>
            )}
          </div>

          {/* Menu button */}
          <div className="flex items-center gap-1.5">
            <IconButton 
              id="hamburger-menu-btn" 
              onClick={() => setMobileOpen(true)} 
              style={{ color: 'var(--text-muted)' }} 
              className="transition-transform duration-300 hover:rotate-90 active:scale-90"
              title="Abrir menú"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </IconButton>
          </div>
        </div>
      </nav>

      {/* Spacer */}
      <div style={{ height: 68 }} />

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        slotProps={{
          paper: { style: { backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', width: 280 } }
        }}
      >
        <Box id="mobile-drawer-box" style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 32px' }}>
            <div>
              <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem', display: 'block' }}>{name}</span>
              {reviewCount >= 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px', fontSize: '0.85rem', fontWeight: 600 }}>
                  <svg style={{ width: 14, height: 14, color: '#facc15' }} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span style={{ color: '#facc15' }}>{rating.toFixed(1)}</span>
                  <span style={{ color: 'var(--text-muted)' }}>({reviewCount})</span>
                </div>
              )}
            </div>
            <IconButton onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-faint)' }}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>
          <List id="mobile-drawer-list" style={{ padding: 0 }}>
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <ListItem key={item.id} disablePadding>
                  <ListItemButton
                    id={`drawer-nav-${item.id}`}
                    onClick={() => handleNav(item)}
                    style={{ borderRadius: 12, marginBottom: 4, padding: '14px 16px' }}
                  >
                    <span className="flex items-center gap-2.5" style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem' }}>
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </span>
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <div style={{ marginTop: 'auto', paddingTop: '2rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-faint)', fontSize: '0.75rem' }}>
              &copy; {new Date().getFullYear()} {name} · Desarrollado con <span style={{ color: 'var(--primary-color)' }}>MambaQR</span>
            </p>
          </div>
        </Box>
      </Drawer>

      {/* Modal Tarjeta de Fidelidad / Sellos */}
      {businessId && loyaltySettings && (
        <LoyaltyCardModal
          businessId={businessId}
          businessName={name}
          isOpen={isLoyaltyModalOpen}
          onClose={() => {
            setIsLoyaltyModalOpen(false);
            setAutoStampPending(false);
          }}
          settings={loyaltySettings}
          primaryColor={primaryColor}
          autoRequestStamp={autoStampPending}
          onAutoRequestConsumed={() => setAutoStampPending(false)}
        />
      )}
    </>
  );
}
