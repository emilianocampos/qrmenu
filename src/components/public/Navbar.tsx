'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import Box from '@mui/material/Box';

interface NavbarProps {
  name: string;
  logoUrl?: string | null;
  hasAbout: boolean;
}

export function Navbar({ name, logoUrl, hasAbout }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Menú', id: 'menu' },
    ...(hasAbout ? [{ label: 'Sobre Nosotros', id: 'about' }] : []),
    { label: 'Reviews', id: 'reviews' },
  ];

  const handleScroll = (id: string) => {
    setMobileOpen(false);
    const element = document.getElementById(id);
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
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex" style={{ gap: 4 }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => handleScroll(item.id)}
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
            <span style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '1.1rem' }}>{name}</span>
            <IconButton onClick={() => setMobileOpen(false)} style={{ color: 'var(--text-faint)' }}>
              <X className="w-5 h-5" />
            </IconButton>
          </div>
          <List style={{ padding: 0 }}>
            {navItems.map(item => (
              <ListItem key={item.id} disablePadding>
                <ListItemButton
                  onClick={() => handleScroll(item.id)}
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
