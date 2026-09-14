'use client';

import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TourGuideProps {
  loyaltyEnabled?: boolean;
  rewardTitle?: string;
  onOpenLoyalty?: () => void;
}

export function TourGuide({ loyaltyEnabled, rewardTitle, onOpenLoyalty }: TourGuideProps) {
  useEffect(() => {
    const handleStartTour = () => {
      const forceTour = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('tour');
      const hasSeenTour = localStorage.getItem('hasSeenOrderTour_v4');
      
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
        }, 500);
      };

      if (forceTour || !hasSeenTour) {
        // Esperar a que se cierren otros modales iniciales si los hay
        if (document.getElementById('customer-info-modal') || document.getElementById('promo-modal')) {
          return;
        }

        const timer = setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          const steps: any[] = [];

          if (isMobile) {
            // ==========================================
            // TOUR PARA CELULAR
            // ==========================================

            // 1. Menú hamburguesa abierto automáticamente
            if (document.querySelector('#mobile-drawer-box')) {
              steps.push({
                element: '#mobile-drawer-box',
                popover: {
                  title: '📱 Menú Principal',
                  description: '¡Acá tenés todas las opciones! Podés consultar la carta, ver tus pedidos anteriores, reservar mesa y ver opiniones.',
                  side: 'left',
                  align: 'center',
                },
                onDeselected: () => {
                  window.dispatchEvent(new CustomEvent('close-mobile-menu'));
                }
              });
            }

            // 2. Botón de Pedido en la carta
            if (document.querySelector('#tour-order-btn')) {
              steps.push({
                element: '#tour-order-btn',
                popover: {
                  title: '🛍️ ¡Hacé tu pedido desde acá!',
                  description: 'Podés hacer tu pedido directamente desde aquí haciendo clic en el botón "Pedir" en cualquier plato o bebida de la carta.',
                  side: 'top',
                  align: 'center',
                },
                onHighlightStarted: (element?: Element) => {
                  window.dispatchEvent(new CustomEvent('close-mobile-menu'));
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }
                }
              });
            }

            // 3. Sellos de Fidelización (si está activo)
            if (loyaltyEnabled && document.querySelector('#mobile-loyalty-btn')) {
              steps.push({
                element: '#mobile-loyalty-btn',
                popover: {
                  title: '🎟️ ¡Sumá sellos y ganá premios!',
                  description: `¡Unite gratis a nuestro Club de Clientes! Cada vez que venís acumulás sellos y desbloqueás: ${rewardTitle || 'premios exclusivos'}.`,
                  side: 'bottom',
                  align: 'end',
                },
                onHighlightStarted: () => {
                  window.dispatchEvent(new CustomEvent('close-mobile-menu'));
                }
              });
            }

            // 4. Reseñas
            if (document.querySelector('#hamburger-menu-btn')) {
              steps.push({
                element: '#hamburger-menu-btn',
                popover: {
                  title: '⭐ ¡Déjanos tu reseña!',
                  description: 'En el menú podés ingresar a Reseñas para dejarnos tu opinión sobre los platos. ¡Nos ayuda un montón!',
                  side: 'left',
                  align: 'start',
                },
                onHighlightStarted: () => {
                  window.dispatchEvent(new CustomEvent('close-mobile-menu'));
                }
              });
            }

          } else {
            // ==========================================
            // TOUR PARA COMPUTADORA / TABLET
            // ==========================================

            // 1. Botón de Pedido
            if (document.querySelector('#tour-order-btn')) {
              steps.push({
                element: '#tour-order-btn',
                popover: {
                  title: '🛍️ ¡Hacé tu pedido desde acá!',
                  description: 'Podés hacer tu pedido directamente desde aquí haciendo clic en el botón "Pedir" en cualquier plato o bebida de la carta.',
                  side: 'top',
                  align: 'center',
                }
              });
            }

            // 2. Sellos de Fidelización
            if (loyaltyEnabled && document.querySelector('#nav-loyalty')) {
              steps.push({
                element: '#nav-loyalty',
                popover: {
                  title: '🎟️ ¡Sumá sellos y ganá premios!',
                  description: `¡Unite gratis a nuestro Club de Clientes! Cada vez que venís acumulás sellos y desbloqueás: ${rewardTitle || 'premios y beneficios exclusivos'}.`,
                  side: 'bottom',
                  align: 'center',
                }
              });
            }

            // 3. Reseñas
            if (document.querySelector('#nav-reviews')) {
              steps.push({
                element: '#nav-reviews',
                popover: {
                  title: '⭐ ¡Déjanos tu reseña!',
                  description: 'Haz clic aquí para ir a la sección de Reseñas y dejarnos tu opinión sobre los platos. ¡Nos ayuda un montón!',
                  side: 'bottom',
                  align: 'center',
                }
              });
            }
          }

          if (steps.length > 0) {
            const tourDriver = driver({
              showProgress: steps.length > 1,
              allowClose: true,
              nextBtnText: 'Siguiente →',
              prevBtnText: '← Anterior',
              doneBtnText: '¡Entendido!',
              popoverClass: 'driverjs-theme',
              onDestroyStarted: () => {
                tourDriver.destroy();
                localStorage.setItem('hasSeenOrderTour_v4', 'true');
                window.dispatchEvent(new CustomEvent('close-mobile-menu'));
                triggerLogoSpin();
              }
            });

            if (steps.length === 1) {
              tourDriver.highlight(steps[0]);
            } else {
              tourDriver.setSteps(steps);
              tourDriver.drive();
            }
          } else {
            triggerLogoSpin();
          }
        }, 800);

        return () => clearTimeout(timer);
      } else {
        triggerLogoSpin();
      }
    };

    window.addEventListener('start-tour', handleStartTour);
    
    // Auto-trigger tras 1.2s
    const autoFallback = setTimeout(() => {
      handleStartTour();
    }, 1200);

    return () => {
      window.removeEventListener('start-tour', handleStartTour);
      clearTimeout(autoFallback);
    };
  }, [loyaltyEnabled, rewardTitle, onOpenLoyalty]);

  return null;
}
