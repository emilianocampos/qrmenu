'use client';

import { useEffect, useRef } from 'react';
import { registerMenuVisit } from '@/actions/visits/register-visit';

interface VisitTrackerProps {
  businessId: string;
}

export function VisitTracker({ businessId }: VisitTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    // Evitar múltiples llamadas en React Strict Mode o si ya se registró
    if (trackedRef.current) return;
    trackedRef.current = true;

    try {
      let visitorId = localStorage.getItem('menu_visitor_id');
      
      if (!visitorId) {
        visitorId = crypto.randomUUID();
        localStorage.setItem('menu_visitor_id', visitorId);
      }

      // Llamar a la server action para registrar la visita de forma asíncrona y silenciosa
      registerMenuVisit(businessId, visitorId).catch(console.error);
    } catch (e) {
      // Ignorar errores de localStorage (ej. navegación privada estricta)
      console.warn('No se pudo acceder a localStorage para estadísticas de visita', e);
    }
  }, [businessId]);

  return null; // Componente invisible
}
