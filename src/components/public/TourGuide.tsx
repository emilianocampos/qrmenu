'use client';

import React, { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourGuideProps {
  loyaltyEnabled?: boolean;
  rewardTitle?: string;
  onOpenLoyalty?: () => void;
}

export function TourGuide({ loyaltyEnabled = false, rewardTitle = '' }: TourGuideProps) {
  const activeDriverRef = useRef<ReturnType<typeof driver> | null>(null);
  const scheduledTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isTourInitiatedRef = useRef(false);

  useEffect(() => {
    const triggerLogoSpin = () => {
      setTimeout(() => {
        const logo = document.getElementById('banner-logo');
        if (logo) {
          logo.style.transition = 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)';
          logo.style.transform = 'rotate(360deg) scale(1.05)';
          setTimeout(() => {
            logo.style.transition = 'transform 0.5s';
            logo.style.transform = '';
          }, 1000);
        }
      }, 300);
    };

    const handleStartTour = () => {
      if (typeof window === 'undefined') return;

      const urlParams = new URLSearchParams(window.location.search);
      const forceTour = urlParams.has('tour');
      const hasSeenInSession = sessionStorage.getItem('hasSeenOrderTour_session_v11');

      // Si ya está activo, no duplicar
      if (activeDriverRef.current?.isActive()) return;

      // Solo se muestra 1 vez por sesión (a menos que se fuerce con ?tour)
      if (!forceTour) {
        if (isTourInitiatedRef.current || hasSeenInSession) {
          return;
        }
      } else {
        sessionStorage.removeItem('hasSeenOrderTour_session_v11');
      }

      // Si hay un modal inicial abierto en pantalla, posponer tour
      if (
        document.getElementById('customer-info-modal') ||
        document.getElementById('promo-modal')
      ) {
        return;
      }

      // Marcar inmediatamente para esta sesión
      isTourInitiatedRef.current = true;
      sessionStorage.setItem('hasSeenOrderTour_session_v11', 'true');

      // Limpiar ?tour de la barra de direcciones para no ensuciar futuras navegaciones
      if (window.location.search.includes('tour')) {
        try {
          const cleanUrl = new URL(window.location.href);
          cleanUrl.searchParams.delete('tour');
          window.history.replaceState(null, '', cleanUrl.pathname + (cleanUrl.search ? cleanUrl.search : '') + cleanUrl.hash);
        } catch {}
      }

      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
      }

      // Esperar a que los elementos del navbar estén montados
      scheduledTimerRef.current = setTimeout(() => {
        // Limpiar overlays anteriores si los hubiera
        if (activeDriverRef.current) {
          try {
            activeDriverRef.current.destroy();
          } catch {}
          activeDriverRef.current = null;
        }
        document.querySelectorAll('.driver-popover, .driver-overlay, .driver-stage').forEach(el => el.remove());

        const hamburgerBtn = document.querySelector('#hamburger-menu-btn');
        if (!hamburgerBtn) {
          triggerLogoSpin();
          return;
        }

        const tourDriver = driver({
          showProgress: false,
          allowClose: true,
          stagePadding: 6,
          stageRadius: 12,
          doneBtnText: '¡Entendido!',
          popoverClass: 'driverjs-theme',
          onDestroyed: () => {
            activeDriverRef.current = null;
            triggerLogoSpin();
          },
          steps: [
            {
              element: '#hamburger-menu-btn',
              popover: {
                title: '📱 Menú y Opciones',
                description: 'Tocá acá para abrir el menú: podés consultar la carta, ver tus pedidos, reservar mesa, sumar sellos y dejar tu reseña.',
                side: 'bottom',
                align: 'end',
                showButtons: ['next'],
              }
            }
          ]
        });

        activeDriverRef.current = tourDriver;
        tourDriver.drive();
      }, 500);
    };

    window.addEventListener('start-tour', handleStartTour);

    // Auto-trigger al montar la página tras 1 segundo
    const autoFallback = setTimeout(() => {
      handleStartTour();
    }, 1000);

    return () => {
      window.removeEventListener('start-tour', handleStartTour);
      clearTimeout(autoFallback);
      if (scheduledTimerRef.current) {
        clearTimeout(scheduledTimerRef.current);
      }
      if (activeDriverRef.current) {
        try {
          activeDriverRef.current.destroy();
        } catch {}
        activeDriverRef.current = null;
      }
    };
  }, []);

  return null;
}
