'use client';

import React, { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';

interface NavbarProps {
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  hasAbout: boolean;
  rating?: number;
  reviewCount?: number;
}

export function Navbar({ name, slug, description, logoUrl, hasAbout, rating = 5.0, reviewCount = 0 }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === `/c/${slug}`;

  const navItems = [
    { label: 'Menú', id: 'menu', href: `/c/${slug}` },
    { label: 'Sobre Nosotros', id: 'about', href: `/c/${slug}/sobre-nosotros` },
    { label: 'Reservar Mesa', id: 'reservar-mesa', href: `/c/${slug}/reservar-mesa` },
    { label: 'Reseñas', id: 'reviews', href: `/c/${slug}#reviews` },
  ];

  const handleNav = (item: any) => {
    setMobileOpen(false);

    // Cross-page navigation
    if (item.id === 'about' || item.id === 'reservar-mesa' || (item.id === 'menu' && !isHome) || (item.id === 'reviews' && !isHome)) {
      router.push(item.href);
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
    zIndex: 50,
    borderBottom: '1px solid #1e2d45',
    backgroundColor: 'rgba(10, 14, 26, 0.9)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
  };

  return (
    <>
      <nav style={navStyle}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.5rem', height: 68, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo + Name */}
          <button
            onClick={() => handleNav({ id: 'menu', href: `/c/${slug}` })}
            style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl} alt={name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #1e2d45' }} />
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
          <div className="hidden md:flex" style={{ gap: 4 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleNav(item)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '8px 18px',
                  borderRadius: 8,
                  transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                  (e.target as HTMLElement).style.color = 'var(--text-primary)';
                  (e.target as HTMLElement).style.backgroundColor = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={e => {
                  (e.target as HTMLElement).style.color = 'var(--text-muted)';
                  (e.target as HTMLElement).style.backgroundColor = 'transparent';
                }}
              >
                {item.label}
              </button>
            ))}

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

          {/* Mobile menu button */}
          <div className="md:hidden">
            <IconButton onClick={() => setMobileOpen(true)} style={{ color: 'var(--text-muted)' }}>
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
          paper: { style: { backgroundColor: '#111827', borderLeft: '1px solid #1e2d45', width: 280 } }
        }}
      >
        <Box style={{ padding: '1.5rem', height: '100%', display: 'flex', flexDirection: 'column' }}>
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
          <List style={{ padding: 0 }}>
            {navItems.map(item => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleNav(item)}
                  style={{ borderRadius: 12, marginBottom: 4, padding: '14px 16px' }}
                >
                  <span style={{ color: 'var(--text-muted)', fontWeight: 700, fontSize: '1rem' }}>{item.label}</span>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
}
