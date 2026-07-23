'use client';

import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export function TourGuide() {
  useEffect(() => {
    const handleStartTour = () => {
      const hasSeenTour = localStorage.getItem('hasSeenReviewTour');
      
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

      if (!hasSeenTour) {
        // Pequeño timeout para asegurar que el DOM esté completamente listo
        const timer = setTimeout(() => {
          const isMobile = window.innerWidth < 768;
          const targetElement = isMobile ? '#hamburger-menu-btn' : '#nav-reviews';

          // Verificar si el elemento existe en el DOM
          if (document.querySelector(targetElement)) {
            const tourDriver = driver({
              showProgress: false,
              allowClose: true,
              doneBtnText: '¡Entendido!',
              onDestroyStarted: () => {
                tourDriver.destroy();
                localStorage.setItem('hasSeenReviewTour', 'true');
                triggerLogoSpin();
              }
            });

            tourDriver.highlight({
              element: targetElement,
              popover: {
                title: '¡Déjanos tu reseña!',
                description: isMobile 
                  ? 'Abre el menú y ve a la sección de Reseñas para dejarnos tu opinión sobre los platos. ¡Nos ayuda un montón!' 
                  : 'Haz clic aquí para ir a la sección de Reseñas y dejarnos tu opinión sobre los platos. ¡Nos ayuda un montón!',
                side: isMobile ? "left" : "bottom",
                align: 'start'
              }
            });
          } else {
            triggerLogoSpin();
          }
        }, 500);
      } else {
        triggerLogoSpin();
      }
    };

    window.addEventListener('start-tour', handleStartTour);
    return () => window.removeEventListener('start-tour', handleStartTour);
  }, []);

  return null;
}
