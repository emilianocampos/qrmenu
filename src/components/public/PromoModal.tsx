'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';

interface PromoModalProps {
  businessId: string;
  active: boolean;
  title: string | null;
  description: string | null;
  imageUrl: string | null;
  primaryColor: string;
}

export function PromoModal({ businessId, active, title, description, imageUrl, primaryColor }: PromoModalProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!active || (!title && !imageUrl)) {
      setTimeout(() => window.dispatchEvent(new Event('start-tour')), 500);
      return;
    }
    
    // Check if the user has already seen the promo this session
    const seenKey = `promo_seen_${businessId}`;
    const hasSeen = sessionStorage.getItem(seenKey);
    
    if (!hasSeen) {
      // Delay opening slightly for a better user experience
      const timer = setTimeout(() => {
        setOpen(true);
        sessionStorage.setItem(seenKey, 'true');
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setTimeout(() => window.dispatchEvent(new Event('start-tour')), 500);
    }
  }, [active, businessId, title, imageUrl]);

  const handleClose = () => {
    setOpen(false);
    window.dispatchEvent(new Event('start-tour'));
  };

  if (!mounted || !active || (!title && !imageUrl)) return null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          style: {
            borderRadius: 20,
            backgroundColor: 'var(--bg-card)',
            backgroundImage: 'none',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
            overflow: 'hidden',
            margin: 16
          }
        }
      }}
    >
      {/* Close button inside the dialog */}
      <IconButton 
        onClick={handleClose}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          backgroundColor: 'rgba(0,0,0,0.4)',
          color: 'white',
          zIndex: 10
        }}
        size="small"
      >
        <X className="w-5 h-5" />
      </IconButton>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img 
            src={imageUrl} 
            alt={title || "Promoción"} 
            style={{ 
              width: '100%', 
              height: 'auto', 
              maxHeight: '280px',
              objectFit: 'cover' 
            }} 
          />
        )}
        
        {(title || description) && (
          <DialogContent style={{ padding: '24px' }}>
            {title && (
              <h2 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '1.5rem', 
                fontWeight: 800, 
                color: 'var(--text-primary)',
                textAlign: 'center'
              }}>
                {title}
              </h2>
            )}
            
            {description && (
              <p style={{ 
                margin: 0, 
                fontSize: '1rem', 
                color: 'var(--text-muted)',
                lineHeight: 1.6,
                textAlign: 'center'
              }}>
                {description}
              </p>
            )}
            
            <button
              onClick={handleClose}
              style={{
                width: '100%',
                marginTop: 24,
                padding: '12px',
                borderRadius: 12,
                backgroundColor: primaryColor,
                color: '#fff',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                transition: 'filter 0.2s'
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'none')}
            >
              ¡Entendido!
            </button>
          </DialogContent>
        )}
      </div>
    </Dialog>
  );
}
